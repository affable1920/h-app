from groq.types.chat import ChatCompletionToolParam
from pathlib import Path

system_prompt = (Path(__file__).resolve().parent /
                 "system-prompt.txt").read_text(encoding="utf-8")


ALL_MODELS = (['compound-beta', 'compound-beta-mini',
               'gemma2-9b-it', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile',
               'meta-llama/llama-4-scout-17b-16e-instruct',
               'meta-llama/llama-guard-4-12b', 'moonshotai/kimi-k2-instruct',
               'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3-32b'])


tools: list[ChatCompletionToolParam] = (
    [{"type": "function",
      "function": {
          "name": "find_drs_many",
          "description": """Use to make sql query to our doctor's table in our database, and return those doctors""",
          "parameters": {
              "type": "object",
              "properties": {
                  "specialization": {
                      "type": "string",
                      "description": "The doctor's specialization to filter by, for example cardiology, neurology"
                  },
                  "min_rating": {
                      "type": "number",
                      "description": "The minimum rating a doctor should have"
                  },
                  "experience": {
                      "type": "number",
                      "description": "The minimum experience a doctor should have"
                  },
                  "fee": {
                      "type": "number",
                      "description": "The max fee the doctor should have"
                  },
                  "gender": {
                      "type": "string",
                      "enum": ["Male", "Female"]
                  }
              },
          }
      }},
     {
        "type": "function",
        "function": {
            "name": "get_drprofile_single",
            "description": "Use when a single doctor's profile is requested by a user."
            "Only to be used when querying for a single doctor",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The doctor's unique ID. Prefer this when available over other "
                        "adjacent parameters when available from previous results."
                    },
                    "name": {
                        "type": "string",
                        "description": "The doctor's name. Use only if ID is not available."
                    }
                },
            }
        }
    }
    ])
