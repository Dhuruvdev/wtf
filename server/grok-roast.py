"""Grok API integration for intelligent roast responses"""
import os
import json
from openai import OpenAI

# Initialize Grok client (xAI API)
client = OpenAI(
    base_url="https://api.x.ai/v1",
    api_key=os.environ.get("XAI_API_KEY", "")
)

async def generate_roast(target_username: str, opponent_roast: str = None, match_context: str = "") -> str:
    """Generate a brutal intelligent roast using Grok API"""
    try:
        prompt = f"""You are a legendary roast battle participant in a Discord game called WTF Land. 
Generate a BRUTAL, WITTY, and HILARIOUS roast response. Keep it under 150 characters.
Make it personal, clever, and absolutely savage - but not mean-spirited.

Target: @{target_username}
{f'They said: "{opponent_roast}"' if opponent_roast else ''}
{f'Context: {match_context}' if match_context else ''}

Roast (short, brutal, witty):"""

        response = client.chat.completions.create(
            model="grok-2-1212",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legendary roast battle master. Generate SHORT (max 150 chars), BRUTAL, WITTY roasts that will make people laugh. Be creative, reference pop culture, wordplay, anything goes. Make it SAVAGE.",
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.9,
            max_tokens=100
        )
        
        roast = response.choices[0].message.content.strip()
        # Ensure it's under 150 chars
        if len(roast) > 150:
            roast = roast[:147] + "..."
        
        return roast
        
    except Exception as e:
        # Fallback brutal roasts if API fails
        fallback_roasts = [
            f"I'd roast you harder but your internet connection already did the job, {target_username}",
            f"Your roasts are like your gameplay - non-existent, {target_username}",
            f"{target_username}? More like {target_username}-DESTROYED",
            f"I heard you practice your roasts in the mirror... they still need work",
            f"That roast was as weak as your connection speed",
            f"{target_username} walked so you could run... directly into a wall"
        ]
        import random
        return random.choice(fallback_roasts)


async def generate_vote_comment(winner_username: str) -> str:
    """Generate a comment when voting for winner"""
    try:
        response = client.chat.completions.create(
            model="grok-2-1212",
            messages=[
                {
                    "role": "system",
                    "content": "You are voting in a roast battle Discord game. Generate a SHORT (max 50 chars) reaction/comment explaining why you voted for someone."
                },
                {
                    "role": "user",
                    "content": f"Generate a short voting comment for why {winner_username} won the roast battle."
                }
            ],
            max_tokens=30
        )
        
        return response.choices[0].message.content.strip()[:50]
        
    except Exception as e:
        return "That roast was 🔥"
