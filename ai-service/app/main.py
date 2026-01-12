from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime

# For content moderation
from transformers import pipeline
import re

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI models (simplified - in production, load Mistral 7B)
# For development, we'll use Hugging Face pipelines
try:
    sentiment_analyzer = pipeline("sentiment-analysis")
    text_classifier = pipeline("zero-shot-classification")
except:
    print("Warning: Could not load AI models. Running in simulation mode.")
    sentiment_analyzer = None
    text_classifier = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    user_id: Optional[str] = None

class ModerationRequest(BaseModel):
    text: str
    content_type: str = "post"  # post, comment, message

class ModerationResponse(BaseModel):
    is_approved: bool
    flags: List[str]
    confidence: float
    suggestion: Optional[str] = None

@app.post("/api/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """AI advice bot for pet care"""
    
    # In production, integrate with Mistral 7B GGUF via llama-cpp-python
    # For now, use a rule-based system with Hugging Face
    
    pet_keywords = ["dog", "cat", "pet", "feed", "walk", "vet", "health", "training"]
    
    if any(keyword in request.message.lower() for keyword in pet_keywords):
        # Simulate AI response
        responses = [
            "Based on your query about pet care, I recommend consulting with a veterinarian for specific medical advice.",
            "For behavioral issues, positive reinforcement training is usually the most effective approach.",
            "Make sure your pet has access to fresh water at all times and gets regular exercise.",
            "A balanced diet is crucial for your pet's health. Consider high-quality pet food appropriate for their age and breed."
        ]
        
        # Simple response selection
        response_index = hash(request.message) % len(responses)
        
        return {
            "response": responses[response_index],
            "is_ai_generated": True,
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "response": "I'm specialized in pet care advice. Please ask me questions about your pets!",
        "is_ai_generated": True,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/ai/moderate")
async def moderate_content(request: ModerationRequest):
    """AI content moderation"""
    
    if not text_classifier:
        # Simulation mode
        inappropriate_words = ["hate", "attack", "violence", "abuse"]
        
        flags = []
        for word in inappropriate_words:
            if word in request.text.lower():
                flags.append("inappropriate")
                break
        
        return ModerationResponse(
            is_approved=len(flags) == 0,
            flags=flags,
            confidence=0.8 if flags else 0.9,
            suggestion="Keep the conversation friendly and pet-focused!" if not flags else None
        )
    
    # Real moderation with AI
    categories = ["harassment", "spam", "inappropriate", "safe"]
    
    result = text_classifier(
        request.text,
        candidate_labels=categories,
        multi_label=True
    )
    
    flags = []
    for label, score in zip(result['labels'], result['scores']):
        if score > 0.7 and label != "safe":
            flags.append(label)
    
    is_approved = len(flags) == 0 or "safe" in flags
    
    return ModerationResponse(
        is_approved=is_approved,
        flags=flags,
        confidence=max(result['scores']),
        suggestion="Please keep the community pet-friendly!" if not is_approved else None
    )

@app.get("/api/ai/health")
async def health_check():
    return {"status": "healthy", "ai_models_loaded": sentiment_analyzer is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)