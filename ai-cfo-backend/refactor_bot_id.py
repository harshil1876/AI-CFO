import re

with open("api/views.py", "r", encoding="utf-8") as f:
    code = f.read()

# Class Based Views
code = re.sub(
    r"bot_id = self\.request\.query_params\.get\(['\"]bot_id['\"]\)",
    r"bot_id = get_verified_bot_id(self.request, self.request.query_params.get('bot_id'))",
    code
)

# Function Based Views - Data
code = re.sub(
    r"bot_id = request\.data\.get\(['\"]bot_id['\"]\)",
    r"bot_id = get_verified_bot_id(request, request.data.get('bot_id'))",
    code
)

# Function Based Views - Query Params
code = re.sub(
    r"bot_id = request\.query_params\.get\(['\"]bot_id['\"]\)",
    r"bot_id = get_verified_bot_id(request, request.query_params.get('bot_id'))",
    code
)

# Combined (Query or Data)
code = re.sub(
    r"bot_id = request\.query_params\.get\(['\"]bot_id['\"]\) or request\.data\.get\(['\"]bot_id['\"]\)",
    r"bot_id = get_verified_bot_id(request, request.query_params.get('bot_id') or request.data.get('bot_id'))",
    code
)

with open("api/views.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Replaced bot_id extractions in api/views.py to use get_verified_bot_id")
