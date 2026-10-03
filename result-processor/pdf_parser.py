import sys
import json
import re
import os
import traceback

def safe_float(s):
    try:
        # replace any non-numeric/dot characters (e.g., OCR artifacts)
        clean = re.sub(r'[^\d.]', '', s)
        if clean:
            return float(clean)
    except:
        pass
    return 0.0

def safe_int(s):
    try:
        clean = re.sub(r'[^\d]', '', s)
        if clean:
            return int(clean)
    except:
        pass
    return 0

def parse_jntuk_text(text):
    records = []
    
    # HTNO pattern: e.g. 21B21A0501
    htno_pattern = re.compile(r'([0-9]{2}[A-Z0-9]{2}[A-Z0-9]{2}[0-9A-Z]{4})')
    
    current_htno = None
    lines = text.split('\n')
    
    valid_grades = ['O', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'AB', 'ABSENT', 'CM', 'COMPLETED']
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Attempt to normalize common OCR errors in HTNO (e.g. spaces)
        clean_line = line.replace(' ', '')
        htno_match = htno_pattern.search(clean_line)
        if htno_match:
            current_htno = htno_match.group(1)
            # Find the original HTNO string to remove it from the line safely
            # We just do a naive regex search on the line with spaces optional
            # Actually, simpler: if we found a HTNO, we keep it in state.
            
        if not current_htno:
            continue
            
        # Tokens
        # We need to split by spaces, but OCR might have multiple spaces or missing spaces
        tokens = line.split()
        if len(tokens) >= 4:
            # Let's see if the last token is credits (digit or float)
            credits_str = tokens[-1]
            if re.match(r'^[\d.]+$', credits_str):
                # Grade should be near the end
                grade_idx = -1
                for i in range(len(tokens)-2, max(0, len(tokens)-5), -1):
                    if tokens[i].upper() in valid_grades:
                        grade_idx = i
                        break
                        
                if grade_idx != -1:
                    grade = tokens[grade_idx].upper()
                    credits = safe_float(credits_str)
                    
                    sub_code = tokens[0]
                    # Sometimes subject code is mixed with HTNO if they were on the same line
                    if sub_code == current_htno and len(tokens) > 1:
                        sub_code = tokens[1]
                        name_start = 2
                    else:
                        name_start = 1
                        
                    # Filter out HTNO if it was accidentally parsed as sub_code
                    if len(sub_code) > 8 and sub_code == current_htno:
                        continue
                        
                    middle_tokens = tokens[name_start:grade_idx]
                    
                    # Marks and Result
                    # Result is usually just P or F or AB or ABSENT, near grade
                    result_status = 'P'
                    if grade in ['F', 'AB', 'ABSENT']:
                        result_status = grade if grade != 'F' else 'F'
                    
                    # Try to get internal marks (usually the first number after subject name)
                    name_tokens = []
                    marks_tokens = []
                    for t in middle_tokens:
                        if re.match(r'^\d+$', t) or t.upper() in ['P', 'F', 'COMPLETED']:
                            marks_tokens.append(t)
                        else:
                            name_tokens.append(t)
                            
                    internal = 0
                    if marks_tokens and marks_tokens[0].isdigit():
                        internal = marks_tokens[0]
                        
                    sub_name = " ".join(name_tokens).strip()
                    if not sub_name:
                        sub_name = sub_code
                        
                    records.append({
                        "htno": current_htno,
                        "subjectCode": sub_code,
                        "subjectName": sub_name,
                        "internalMarks": str(internal),
                        "result": result_status,
                        "grade": grade,
                        "credits": credits
                    })
    return records

def process_pdf(pdf_path):
    all_text = ""
    
    # 1. Native Extraction
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text += text + "\n"
    except Exception:
        pass
        
    # 2. OCR Fallback
    if len(all_text.strip()) < 200:
        try:
            import fitz
            import pytesseract
            from PIL import Image
            
            import shutil
            
            # Resolve Tesseract path: 1. Env Var, 2. PATH, 3. Windows Fallback
            tesseract_cmd = os.environ.get('TESSERACT_CMD')
            if not tesseract_cmd:
                tesseract_cmd = shutil.which('tesseract')
                
            if not tesseract_cmd and os.name == 'nt':
                win_paths = [
                    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
                ]
                for wp in win_paths:
                    if os.path.exists(wp):
                        tesseract_cmd = wp
                        break
                        
            if not tesseract_cmd:
                return {"status": "error", "message": "Tesseract OCR executable not found. Please install Tesseract or set TESSERACT_CMD environment variable."}
                
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
                    
            doc = fitz.open(pdf_path)
            for i, page in enumerate(doc):
                pix = page.get_pixmap(dpi=200) # 200 DPI for better OCR
                img_path = f"temp_ocr_page_{i}.png"
                pix.save(img_path)
                
                # Preprocess? Usually pytesseract handles basic images well
                text = pytesseract.image_to_string(Image.open(img_path))
                all_text += text + "\n"
                
                if os.path.exists(img_path):
                    os.remove(img_path)
        except ImportError:
            return {"status": "error", "message": "OCR fallback requires pytesseract and PyMuPDF. Run pip install -r requirements.txt"}
        except Exception as e:
            # If tesseract is not installed, it will throw an error
            if "tesseract is not installed" in str(e).lower() or "not found" in str(e).lower():
                return {"status": "error", "message": "Tesseract OCR is not installed. Please install Tesseract OCR and ensure it is in PATH, or set the TESSERACT_CMD environment variable."}
            return {"status": "error", "message": f"OCR failed: {str(e)}"}
            
    if not all_text.strip():
        return {"status": "error", "message": "Could not extract text. If it is an image PDF, ensure Tesseract OCR is installed."}
        
    # 3. Parse Records
    records = parse_jntuk_text(all_text)
    
    # Dedup just in case
    unique_records = []
    seen = set()
    for r in records:
        key = f"{r['htno']}_{r['subjectCode']}"
        if key not in seen:
            seen.add(key)
            unique_records.append(r)
            
    records = unique_records
    
    # 4. Semester Detection
    detected = None
    upper_text = all_text.upper()
    if " I SEMESTER" in upper_text and " I B.TECH" in upper_text: detected = "1-1"
    elif " II SEMESTER" in upper_text and " I B.TECH" in upper_text: detected = "1-2"
    elif " I SEMESTER" in upper_text and " II B.TECH" in upper_text: detected = "2-1"
    elif " II SEMESTER" in upper_text and " II B.TECH" in upper_text: detected = "2-2"
    elif " I SEMESTER" in upper_text and " III B.TECH" in upper_text: detected = "3-1"
    elif " II SEMESTER" in upper_text and " III B.TECH" in upper_text: detected = "3-2"
    elif " I SEMESTER" in upper_text and " IV B.TECH" in upper_text: detected = "4-1"
    elif " II SEMESTER" in upper_text and " IV B.TECH" in upper_text: detected = "4-2"
    
    return {
        "status": "success",
        "detectedSemester": detected,
        "data": records
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No PDF path provided"}))
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(json.dumps({"status": "error", "message": "PDF file not found"}))
        sys.exit(1)
        
    try:
        result = process_pdf(pdf_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "trace": traceback.format_exc()}))
