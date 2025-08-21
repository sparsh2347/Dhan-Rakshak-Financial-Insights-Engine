from google.cloud import documentai_v1beta3 as documentai
import os
import json,re
from dotenv import load_dotenv
import google.generativeai as genai
load_dotenv()
import re,sys
import json
# Processor details
PROJECT_ID ="dhan-466614"
LOCATION = "us"  # or "eu"
YOUR_PROCESSOR_ID="699343063f4ad8b"  # from Document AI console

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
def parse_form16_with_docai(file_path):
    client = documentai.DocumentProcessorServiceClient()

    # Full resource name
    name = f"projects/{PROJECT_ID}/locations/{LOCATION}/processors/{YOUR_PROCESSOR_ID}"

    with open(file_path, "rb") as f:
        file_content = f.read()

    document = {
        "content": file_content,
        "mime_type": "application/pdf"
    }

    request = {
        "name": name,
        "raw_document": document
    }

    result = client.process_document(request=request)
    document = result.document

    # # Extract key-value pairs
    # extracted_data = {}
    # for entity in document.entities:
    #     key = entity.type_.replace("_", " ").title()
    #     value = entity.mention_text
    #     extracted_data[key] = value

    return document.text.strip()

def get_form16(doc_text):

    prompt=f"""
You are an expert tax assistant. Below is raw OCR text from a user's Form 16. Your task is to extract all relevant tax-related data and return it as a clean, structured JSON object.

⚠️ Important instructions:
- Only extract actual values present in the text. Do not fill 0 or blank if the value doesn't exist — just omit the field.
- Use regex or pattern recognition where necessary to extract PAN numbers, names, income heads, etc.
- All monetary values should be integers (remove commas, ₹ signs, and decimals).
- Do not explain anything, just return JSON.
- If sections like 80C, HRA, or TDS are mentioned, extract their corresponding values even if they are embedded in sentences.

Below is the OCR text from the uploaded Form 16:

--- FORM 16 TEXT START ---
{doc_text}
--- FORM 16 TEXT END ---

Return the output as valid JSON in the following format only even if the values are 0 output them:

{{
  "personal_info": {{
    "employee_name": "John Doe",
    "pan": "ABCDE1234F",
    "employer_name": "ABC Pvt Ltd",
    "employer_pan": "AAACA1234B",
    "assessment_year": "2024-25",
    "period_from": "01-04-2023",
    "period_to": "31-03-2024"
  }},
  "salary_details": {{
    "gross_salary": 1234567,
    "basic_salary": 1000000,
    "perquisites": 20000,
    "profits_in_lieu": 10000,
    "total_salary": 1250000,
    "exemptions_under_section_10": {{
      "hra": 150000,
      "others": 30000,
      "total": 180000
    }},
    "standard_deduction": 50000,
    "net_salary": 1070000
  }},
  "other_income": {{
    "house_property": 0,
    "other_sources": 0
  }},
  "deductions": {{
    "80C": 150000,
    "80D": 25000,
    "80E": 0,
    "80TTA": 0,
    "80G": 5000,
    "other": 0,
    "total": 180000
  }},
  "tax_computation": {{
    "taxable_income": 920000,
    "tax_liability": 80000,
    "rebate_87A": 0,
    "surcharge": 0,
    "cess": 3200,
    "total_tax_payable": 83200,
    "relief_u_s_89": 0,
    "tds": 85000,
    "net_tax_payable": 0
  }},
  "regime": "old"
}}

✅ Extract real values from the text. ✅ Do not echo this template. ✅ Return only actual values you find.
"""
    
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)
    return response.text.strip()

def extract_json(text: str):
    import re
    import json

    match = re.search(r"\{[\s\S]+\}", text)
    if match:
        json_block = match.group(0)

        # Fix inner unescaped double quotes (e.g. You"ve → You've)
        json_block = re.sub(r'(?<=\w)"(?=\w)', "'", json_block)

        # Remove trailing commas before closing brackets
        json_block = re.sub(r",\s*([\]}])", r"\1", json_block)

        try:
            return json.loads(json_block)
        except json.JSONDecodeError as e:
            print("⚠️ JSON decode failed:", e)
            print("Gemini response:\n", json_block)
            return {}
    else:
        print("❌ No JSON block found in Gemini response")
        return {}

def get_tax_analysis(parsed_json):
    model=genai.GenerativeModel("gemini-1.5-pro")
    prompt= f"""
You are an expert Indian tax advisor. The user has uploaded their Form 16 and the structured extracted JSON is below.

Your task:
1. Calculate and compare tax payable under **both regimes** using actual values.
2. For each regime, return:
   - Total tax payable
   - List of **pros** based on data (e.g., deductions, exemptions, house property loss)
   - List of **cons** (e.g., no deductions in new regime)
   - Back each pro/con with reference to the actual numbers from Form 16.
3. Provide a **final_advice** field that clearly recommends which regime is better, why, and what to consider in future.
4. Suggest **investment tips** under available sections like 80C, 80D, 80CCD(1B) (NPS), HRA, etc., with exact improvement suggestions.

Return the result as **only JSON** in this format:

{{
  "old_regime": {{
    "tax": 0,
    "pros": [
      "You claimed ₹250000 in deductions which lowered your tax by ₹XXXX.",
      "Loss from house property ₹154477 reduced taxable income."
    ],
    "cons": [
      "Requires tracking and submitting proofs for deductions.",
      "Slightly higher compliance effort."
    ]
  }},
  "new_regime": {{
    "tax": 0,
    "pros": [
      "No documentation needed.",
      "Simpler slab structure with fewer calculations."
    ],
    "cons": [
      "You miss out on ₹250000 in deductions.",
      "No benefit from house property loss ₹154477."
    ]
  }},
  "final_advice": "Based on current deductions and exemptions, OLD regime saves you ₹XXXX. Consider switching only if your deductions drop significantly in future.",
  "investment_tips": [
    {{
      "section": "80C",
      "current": 150000,
      "max_limit": 150000,
      "tip": "You're utilizing full limit. Consider diversifying within PPF, ELSS, or Tax-saving FD."
    }},
    {{
      "section": "80CCD(1B)",
      "current": 0,
      "max_limit": 50000,
      "tip": "Investing in NPS can give you an additional ₹50,000 deduction."
    }},
    {{
      "section": "80D",
      "current": 25000,
      "max_limit": 25000,
      "tip": "You've used the full limit. Ensure you're covering family/family parents if eligible."
    }}
  ]
}}

Only use actual numbers from the JSON below. Do not add imaginary values. If a section is missing, ignore it.

--- PARSED FORM 16 JSON START ---
{parsed_json}
--- PARSED FORM 16 JSON END ---

🔁 Output strictly in JSON. Do not echo this template. No extra explanation or formatting.
"""
    response = model.generate_content(prompt)
    return response.text.strip()

def tax_analyzer(filepath):
    data=parse_form16_with_docai(filepath)
    result=get_form16(data)
    clean_result=extract_json(result)
    tax_comparison=get_tax_analysis(json.dumps(clean_result,indent=2))
    tax_comparison_result=extract_json(tax_comparison)
    return tax_comparison_result


# Example usage
if __name__ == "__main__":
    # data = parse_form16_with_docai("sample_form16.pdf")
    # # print(data)
    # result=get_form16(data)
    # # print(result)
    # clean_result=extract_json(result)
    # # print(clean_result)
    # # print(clean_result['personal_info'])
    # # parsed_json = json.loads(clean_result)

    # # tax_comparison = get_tax_analysis(clean_result)
    # tax_comparison = get_tax_analysis(json.dumps(result, indent=2))

    # print(tax_comparison)
    # tax_comparison_result=extract_json(tax_comparison)
    # print(tax_comparison_result)
    form16path=sys.argv[1]
    result=tax_analyzer(form16path)
    print(json.dumps(result),flush=True)