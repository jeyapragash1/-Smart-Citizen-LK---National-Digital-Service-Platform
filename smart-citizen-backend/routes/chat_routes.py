from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_bot(request: ChatRequest):
    user_msg = request.message.lower()
    response = ""

    # Simple Keyword Logic (Rule-based AI)
    if "passport" in user_msg:
        response = "To apply for a Passport, go to 'E-Services' -> 'Travel & Visa'. The fee is LKR 20,000 for normal service."
    elif "nic" in user_msg or "identity" in user_msg:
        response = "National Identity Cards (NIC) are issued by the DRP. You need your Birth Certificate and a GS Character Certificate to apply."
    elif "birth" in user_msg and "certificate" in user_msg:
        response = "You can request a copy of a Birth Certificate instantly via this portal. Go to 'E-Services' -> 'Personal Identity'."
    elif "police" in user_msg:
        response = "Police Clearance Reports take approximately 14 days. You can apply online and track the status in your Dashboard."
    elif "driver" in user_msg or "license" in user_msg:
        response = "Driving Licenses are handled by the Dept of Motor Traffic. We currently offer Revenue License renewals."
    elif "grama" in user_msg or "gs" in user_msg:
        response = "Your Grama Niladhari (GS) must verify all residency and character certificate requests before they are issued."
    elif "payment" in user_msg or "fee" in user_msg:
        response = "We accept VISA, MasterCard, and LankaQR. All payments are secured via PayHere."
    elif "hello" in user_msg or "hi" in user_msg:
        response = "Ayubowan! I am the Smart Citizen Virtual Assistant. How can I help you today?"
    else:
        response = "I am sorry, I didn't quite understand that. Try asking about 'Passports', 'NIC', 'Birth Certificates', or 'Payments'."

    return {"response": response}