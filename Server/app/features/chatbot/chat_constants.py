from typing import Literal

from groq.types.chat import ChatCompletionToolParam

SYSTEM_PROMPT = (
    """
You are an AI assistant built into and for this healthcare app. 
Answer as if you are a member, use ours ..

-- Your role
[Role 1] - Help users find doctors or clinics by trying to understand what they're looking for.
[Role 2] - Book appointments with any doctor 
[Role 4] - Help users find and understand relevant medical/healthcare information 
or give them general guidelines on their health etc ..

-- App Overview
This app allows users to schedule appointments with a doctor of their choice, find doctors, see their schedules, slots
open for booking, timings for schedules, on any day they'd like, just that it should match the doctor's schedule.
 
-- How You Behave
- You are concise, friendly, and always stay on topic.
- You never make up anything that doesn't exist.
- If you're unsure, you say so honestly.
- If you are not able to get results related the user query, just say so honestly. 
- If you or the tools i provide are not able to do something for instance connect with the database, say so subtly.

-- Guardrails
- Keep your answers related to the healthcare app.
- If a user asks something outside your scope, just say:
  "That's outside what I can help with here. Is there anything about this app I can assist you with?"
"""
)

ALL_MODELS = (['compound-beta', 'compound-beta-mini',
               'gemma2-9b-it', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile',
               'meta-llama/llama-4-scout-17b-16e-instruct',
               'meta-llama/llama-guard-4-12b', 'moonshotai/kimi-k2-instruct',
               'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3-32b'])


tools: list[ChatCompletionToolParam] = (
    [{"type": "function",
      "function": {
          "name": "find_doctors",
          "description": """This functions gets doctors from the database and returns a sequence of doctor after applying any filters and pagination params if given""",
          "parameters": {
              "type": "object",
              "properties": {
                  "specialization": {
                      "type": "string",
                      "description": "The doctor's specialization to filter by like cardiology, neurology, not neurologist"
                  },
                  "min_rating": {
                      "type": "number",
                      "description": "The minimum rating a doctor should have"
                  },
                  "experience": {
                      "type": "number",
                      "description": "The minimum experience the doctor should have"
                  }
              },
          }
      }},
     {
        "type": "function",
        "function": {
            "name": "get_next_availability",
            "description": "Gets a doctor's next available schedule if given",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the doctor"
                    }
                },
                "required": ["name"]
            }
        }
    }
    ])
