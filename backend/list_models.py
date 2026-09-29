from groq import Groq
import os
import json

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
models = client.models.list()
for m in models.data:
    print(m.id)
