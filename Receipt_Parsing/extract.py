import os
import io
from dotenv import load_dotenv
# from pdf2image import convert_from_path
from google.cloud import vision
import google.generativeai as genai
import matplotlib.pyplot as plt
from collections import defaultdict
import json
import re
import json
import os
import plotly.express as px
import pandas as pd
from google.cloud import translate_v2 as translate
from google.cloud import documentai_v1 as documentai

# Load API keys and credentials
load_dotenv()
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
YOUR_PROCESSOR_ID="699343063f4ad8b"
# Configure Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

# Vision API client
vision_client = vision.ImageAnnotatorClient()
translate_client = translate.Client()

def translate_text(text: str, target_language: str = "en") -> str:
    result = translate_client.translate(text, target_language=target_language)
    return result["translatedText"]

def extract_receipt_data(filepath):
    if filepath.endswith('.pdf'):
        return extract_text_from_pdf(filepath, project_id="dhan-466614")
    
    elif filepath.endswith(('.jpg', '.jpeg', '.png','webp')):
        with open(filepath, "rb") as f:
            return extract_text_from_image_bytes(f.read())
    else:
        raise ValueError("Unsupported file type")

def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    image = vision.Image(content=image_bytes)
    image_context = vision.ImageContext(language_hints=["en", "hi", "fr", "de", "ar", "ta", "zh"])  # Add any languages you expect

    response = vision_client.text_detection(image=image,image_context=image_context)
    texts = response.text_annotations
    return texts[0].description if texts else ""

def extract_text_from_pdf(pdf_path: str, project_id: str, location: str = "us") -> str:
    client = documentai.DocumentProcessorServiceClient()

    # Your full processor resource name
    name = f"projects/{project_id}/locations/{location}/processors/{YOUR_PROCESSOR_ID}"

    with open(pdf_path, "rb") as file:
        document = documentai.RawDocument(content=file.read(), mime_type="application/pdf")

    request = documentai.ProcessRequest(
        name=name,
        raw_document=document
    )

    result = client.process_document(request=request)
    # console.log("hello text data")
    # print(result.document.text.strip())
    return result.document.text.strip()

def parse_with_gemini(text: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-pro")

    prompt = f"""
You are a powerful receipt parsing assistant designed to extract structured data with high accuracy. From the receipt text below, extract key fields and **categorize each item meaningfully**.

🧠 Use detailed, diverse categories such as:
- food, beverages, groceries, household, electronics, clothing, cosmetics,perosnal care, medicine, travel, transport, stationery, dining, utility, subscriptions, entertainment, etc.

🎯 Return only strict valid JSON. The structure should be:
{{
  "vendor": string,
  "date": string (ISO or DD-MM-YYYY format),
  "total_amount": float,
  "items": [
    {{
      "name": string,
      "quantity": int or float,
      "price": float,
      "category": string (one of the above or best inferred)
    }},
    ...
  ]
}}

📌 Rules:
- Do not return markdown or explanation.
- Infer item categories from name and context.
- If uncertain, assign category as "other".

Receipt Text:
{text}
"""


    # print(prompt,flush=True)
    response = model.generate_content(prompt)
    # print(response.text,flush=True)
    return response.text.strip()

INSIGHT_DIR = "insights"

def load_all_receipt_data():
    all_data = []
    for file in os.listdir(INSIGHT_DIR):
        if file.endswith(".json"):
            path = os.path.join(INSIGHT_DIR, file)
            with open(path, "r") as f:
                try:
                    parsed = json.load(f)
                    all_data.append(parsed)
                except json.JSONDecodeError:
                    pass
    return all_data

def answer_query_on_receipts(receipts_data: list, user_query: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-pro")
    combined_json = json.dumps(receipts_data, indent=2)

    full_prompt = f"""
You are a smart financial assistant. A user has shared parsed receipt data with you. You can answer queries about:
- their past expenses
- category breakdowns
- vendor-specific totals
- time-based trends (weekly/monthly)
- financial planning advice

You can also ask counter-questions if something looks interesting.

You need to respond based on the data you've been given but not just based on the given item catgeories you need to analyze the statemnt the given receipts text and then respond accordingly.
For certain queries where user is aking for any other alternatives or any other information avaible publicly you can use the web information and provide necessary details.

Receipt Data:
{combined_json}

Now answer the user's question: "{user_query}"
"""
    response = model.generate_content(full_prompt)
    return response.text.strip()

def plot_expense_pie(items):
    import plotly.io as pio
    pio.renderers.default = "browser"
    # Convert items into DataFrame
    df = pd.DataFrame(items)

    # If category isn't provided, fallback to "Other"
    df["category"] = df.get("category", "Other").fillna("Other")
    df["quantity"] = df.get("quantity", 1)
    df["price"] = df.get("price", 0)

    df["total"] = df["quantity"] * df["price"]

    # Group by category for pie values
    category_totals = df.groupby("category")["total"].sum().reset_index()

    # Tooltip with actual items
    def tooltip_text(cat):
        filtered = df[df["category"] == cat]
        lines = [f"{row['name']} (x{row['quantity']} @ ₹{row['price']})" for _, row in filtered.iterrows()]
        return "<br>".join(lines)

    category_totals["tooltip"] = category_totals["category"].apply(tooltip_text)

    fig = px.pie(
        category_totals,
        values="total",
        names="category",
        hover_data=["tooltip"],
        title="💸 Expense Breakdown by Category",
    )
    # Clean hover label
    fig.update_traces(
        hovertemplate="<b>%{label}</b><br>Total: ₹%{value}<br>%{customdata[0]}<extra></extra>"
    )
    # print(fig)
    return fig

def extract_json(text: str) -> str:
    # Try to extract first JSON block from text using regex
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return match.group(0) if match else None

import sys

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({ "error": "No file path provided" }), flush=True)
        sys.exit(1)

    receipt_path = sys.argv[1]

    try:
        ocr_text = extract_receipt_data(receipt_path)

        if not ocr_text:
            print(json.dumps({ "error": "OCR failed or returned empty" }), flush=True)
            sys.exit(1)
        translated_text=translate_text(ocr_text)
        parsed = parse_with_gemini(translated_text)
        clean_json_str = extract_json(parsed)
        # return clean_json_str;
        if clean_json_str:
            parsed_json = json.loads(clean_json_str)
            print(json.dumps(parsed_json), flush=True)
            sys.exit(0)  # ✅ Success
        else:
            print(json.dumps({ "error": "Invalid JSON from Gemini" }), flush=True)
            sys.exit(1)
    except Exception as e:
        print(json.dumps({ "error": f"Exception: {str(e)}" }), flush=True)
        sys.exit(1)
    # import json
    # import sys

    # receipt_data = {
    #     "vendor": "APOORVA DELICACIES",
    #     "date": "16-01-2022",
    #     "total_amount": 635.0,
    #     "items": [
    #         {"name": "MEDU WADA", "quantity": 1, "price": 65.0, "category": "food"},
    #         {"name": "SADA DOSA", "quantity": 1, "price": 70.0, "category": "food"}
    #     ]
    # }

    # print(json.dumps(receipt_data), flush=True)
    # sys.exit(0)

