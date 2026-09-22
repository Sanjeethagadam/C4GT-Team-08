import fitz  # PyMuPDF
import re

pdf_path = r'C:\Users\ravit\Desktop\Student Academic Management System\source-data\SUBJECTS (1).pdf'
doc = fitz.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()

codes_to_check = {
    'R2332426': 'SOFT SKILLS',
    'R2332616': 'SOFT SKILLS',
    'R2332626': 'SOFT SKILLS',
    'R2332128': 'SOFT SKILLS OR IELTS'
}

for code, name in codes_to_check.items():
    print(f"\n--- Checking {code} : {name} ---")
    if code in text:
        print(f"FOUND EXACT CODE: {code}")
        # Extract the line containing the code
        for line in text.split('\n'):
            if code in line:
                print(f"Line match: {line.strip()}")
    else:
        print(f"CODE NOT FOUND: {code}")

print("\n--- Checking 'SOFT SKILLS' in text ---")
for line in text.split('\n'):
    if 'SOFT SKILLS' in line.upper():
        print(line.strip())

