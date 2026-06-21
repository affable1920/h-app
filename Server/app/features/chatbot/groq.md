# Optimal Prompt Structure

"""
Place static content like instructions and examples at the beginning of your prompt,
and put variable content, such as user-specific information, at the end.
This maximizes the length of the reusable prefix across different requests.

If you put variable information (like timestamps or user IDs) at the beginning,
even identical system instructions later in the prompt
won't benefit from caching because the prefixes won't match.
"""

Place static content first:

    System prompts and instructions
    Few-shot examples
    Tool definitions
    Schema definitions
    Common context or background information

Place dynamic content last:

    User-specific queries
    Variable data
    Timestamps
    Session-specific information
    Unique identifiers

Example Structure

[SYSTEM PROMPT - Static]
[TOOL DEFINITIONS - Static]  
[FEW-SHOT EXAMPLES - Static]
[COMMON INSTRUCTIONS - Static]
[USER QUERY - Dynamic]
[SESSION DATA - Dynamic]
