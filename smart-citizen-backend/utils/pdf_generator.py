import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime

# Ensure directory exists
PDF_DIR = "generated_certs"
if not os.path.exists(PDF_DIR):
    os.makedirs(PDF_DIR)

def generate_certificate(app_id, applicant_name, nic, service_type):
    filename = f"{app_id}.pdf"
    filepath = os.path.join(PDF_DIR, filename)
    
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # 1. Border
    c.setStrokeColor(colors.darkblue)
    c.setLineWidth(5)
    c.rect(30, 30, width-60, height-60)

    # 2. Header (Sri Lanka Emblem Placeholder)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 100, "DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA")
    
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width/2, height - 140, "OFFICIAL DIGITAL CERTIFICATE")

    # 3. Certificate Details
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, height - 180, "This is to certify that the following application has been approved.")

    # 4. Data Box
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 250, f"Certificate ID:")
    c.setFont("Helvetica", 14)
    c.drawString(250, height - 250, f"{app_id}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 280, f"Service Type:")
    c.setFont("Helvetica", 14)
    c.drawString(250, height - 280, f"{service_type}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 310, f"Issued To:")
    c.setFont("Helvetica", 14)
    c.drawString(250, height - 310, f"{applicant_name}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 340, f"NIC Number:")
    c.setFont("Helvetica", 14)
    c.drawString(250, height - 340, f"{nic}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, height - 370, f"Date of Issue:")
    c.setFont("Helvetica", 14)
    c.drawString(250, height - 370, f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # 5. Footer / Signature
    c.line(100, 150, 300, 150)
    c.setFont("Helvetica", 10)
    c.drawString(100, 135, "Digitally Signed by Divisional Secretary")
    
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width/2, 60, "This is a computer-generated document. No signature required.")

    c.save()
    return filepath