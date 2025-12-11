"""
Email Service Module
Handles sending booking confirmation emails with .ics calendar attachments
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
import os


def create_ics_content(booking_id, car_make, car_model, license_plate, start_datetime, end_datetime, user_name, user_email):
    """
    Create an iCalendar (.ics) file content for the booking
    
    Args:
        booking_id: Unique booking ID
        car_make: Car manufacturer
        car_model: Car model
        license_plate: Car license plate
        start_datetime: Booking start datetime string (YYYY-MM-DD HH:MM:SS)
        end_datetime: Booking end datetime string (YYYY-MM-DD HH:MM:SS)
        user_name: Name of the person who booked
        user_email: Email of the person who booked
    
    Returns:
        String containing .ics file content
    """
    
    # Parse datetime strings
    start = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M:%S')
    end = datetime.strptime(end_datetime, '%Y-%m-%d %H:%M:%S')
    
    # Format for iCalendar (YYYYMMDDTHHMMSS)
    start_ics = start.strftime('%Y%m%dT%H%M%S')
    end_ics = end.strftime('%Y%m%dT%H%M%S')
    dtstamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Atea Car Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:booking-{booking_id}@atea-carpool
DTSTAMP:{dtstamp}
DTSTART:{start_ics}
DTEND:{end_ics}
SUMMARY:Car Rental: {car_make} {car_model}
DESCRIPTION:Car Booking Confirmation\\n\\nVehicle: {car_make} {car_model}\\nLicense Plate: {license_plate}\\nBooked by: {user_name}\\nConfirmation #: {booking_id}
LOCATION:Atea
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Car booking reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR"""
    
    return ics_content


def send_booking_confirmation(user_email, user_name, booking_id, car_info, start_datetime, end_datetime):
    """
    Send booking confirmation email with .ics attachment
    
    Args:
        user_email: Recipient email address
        user_name: Recipient name
        booking_id: Booking confirmation number
        car_info: Dictionary with car details (make, model, license_plate)
        start_datetime: Start datetime string (YYYY-MM-DD HH:MM:SS)
        end_datetime: End datetime string (YYYY-MM-DD HH:MM:SS)
    
    Returns:
        Tuple (success: bool, message: str)
    """
    
    # Email configuration from environment variables
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    sender_email = os.getenv('SENDER_EMAIL', 'noreply@atea.com')
    sender_password = os.getenv('SENDER_PASSWORD', '')
    
    # If no SMTP credentials, return success (development mode)
    if not sender_password:
        print(f"[EMAIL] Would send confirmation to {user_email} for booking #{booking_id}")
        return True, "Email disabled in development mode"
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"Atea Car Booking <{sender_email}>"
        msg['To'] = user_email
        msg['Subject'] = f"Booking Confirmed - {car_info['make']} {car_info['model']} (#{booking_id})"
        
        # Format dates for email
        start = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M:%S')
        end = datetime.strptime(end_datetime, '%Y-%m-%d %H:%M:%S')
        start_formatted = start.strftime('%A, %B %d, %Y at %I:%M %p')
        end_formatted = end.strftime('%A, %B %d, %Y at %I:%M %p')
        
        # Email body (HTML)
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #00a82d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Booking Confirmed!</h1>
                </div>
                
                <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                    <p>Hi {user_name},</p>
                    
                    <p>Your car booking has been confirmed. Here are the details:</p>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #00a82d; margin-top: 0;">Vehicle Information</h3>
                        <p><strong>Car:</strong> {car_info['make']} {car_info['model']}</p>
                        <p><strong>License Plate:</strong> {car_info['license_plate']}</p>
                        <p><strong>Confirmation #:</strong> {booking_id}</p>
                        
                        <h3 style="color: #00a82d; margin-top: 30px;">Rental Period</h3>
                        <p><strong>Pickup:</strong> {start_formatted}</p>
                        <p><strong>Return:</strong> {end_formatted}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        A calendar event has been attached to this email. Add it to your calendar so you don't forget!
                    </p>
                    
                    <p style="margin-top: 30px;">
                        If you have any questions, please contact us.
                    </p>
                    
                    <p style="margin-top: 20px;">
                        Best regards,<br>
                        <strong>Atea Car Booking Team</strong>
                    </p>
                </div>
                
                <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Attach HTML body
        msg.attach(MIMEText(html_body, 'html'))
        
        # Create and attach .ics file
        ics_content = create_ics_content(
            booking_id,
            car_info['make'],
            car_info['model'],
            car_info['license_plate'],
            start_datetime,
            end_datetime,
            user_name,
            user_email
        )
        
        ics_attachment = MIMEBase('text', 'calendar', method='REQUEST', name='booking.ics')
        ics_attachment.set_payload(ics_content.encode('utf-8'))
        encoders.encode_base64(ics_attachment)
        ics_attachment.add_header('Content-Disposition', 'attachment', filename='booking.ics')
        msg.attach(ics_attachment)
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"[EMAIL] Confirmation sent to {user_email} for booking #{booking_id}")
        return True, "Email sent successfully"
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {user_email}: {str(e)}")
        return False, str(e)
