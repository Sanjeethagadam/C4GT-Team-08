import sys
import json
import re
import pdfplumber


def extract_result_from_pdf(pdf_path):
    """
    Extract student result data from a JNTUK result PDF.

    The PDF path is received as an argument.
    No PDF filename is hard-coded here.
    """

    extracted_data = []

    # Open the uploaded PDF
    with pdfplumber.open(pdf_path) as pdf:

        current_student = None

        # Process every page
        for page in pdf.pages:

            text = page.extract_text()

            if not text:
                continue

            lines = text.split("\n")

            for line in lines:

                line = line.strip()

                if not line:
                    continue

                # -------------------------------------------------
                # 1. Detect Student HTNO
                # Example:
                # 23JN1A4205
                # 24JN1A4201
                # -------------------------------------------------

                student_match = re.search(
                    r"\b\d{2}JN1A\d{4}\b",
                    line
                )

                if student_match:

                    htno = student_match.group()

                    current_student = {
                        "htno": htno,
                        "subjects": []
                    }

                    extracted_data.append(current_student)

                    continue

                # -------------------------------------------------
                # 2. Detect Subject Result Row
                #
                # Example:
                # 1 R2322052 PROBABILITY & STATISTICS 24 F F 0.0
                #
                # Format:
                # SlNo
                # SubCode
                # SubName
                # IM
                # Res
                # Grade
                # Credits
                # -------------------------------------------------

                subject_match = re.match(
                    r"(\d+)\s+"
                    r"(R\d+)\s+"
                    r"(.+?)\s+"
                    r"(\d+)\s+"
                    r"([PF])\s+"
                    r"([A-Z])\s+"
                    r"([\d.]+)$",
                    line
                )

                if subject_match and current_student:

                    subject_code = subject_match.group(2)

                    subject_name = subject_match.group(3).strip()

                    internal_marks = int(
                        subject_match.group(4)
                    )

                    result_status = subject_match.group(5)

                    grade = subject_match.group(6)

                    credits = float(
                        subject_match.group(7)
                    )

                    # Convert P/F into readable status
                    if result_status == "P":
                        status = "PASS"
                    else:
                        status = "FAIL"

                    subject_data = {
                        "subjectCode": subject_code,
                        "subjectName": subject_name,
                        "internalMarks": internal_marks,
                        "resultStatus": status,
                        "grade": grade,
                        "credits": credits
                    }

                    current_student["subjects"].append(
                        subject_data
                    )

    return extracted_data


def main():

    # -------------------------------------------------
    # Check whether PDF path was provided
    # -------------------------------------------------

    if len(sys.argv) < 2:

        print(json.dumps({
            "success": False,
            "message": "PDF file path is required"
        }))

        sys.exit(1)

    # PDF path comes from the upload controller
    pdf_path = sys.argv[1]

    try:

        # Extract result
        data = extract_result_from_pdf(pdf_path)

        # Count failed subjects
        total_failures = 0

        for student in data:

            for subject in student["subjects"]:

                if subject["resultStatus"] == "FAIL":
                    total_failures += 1

        # Return JSON
        print(json.dumps({
            "success": True,
            "studentCount": len(data),
            "failedSubjectCount": total_failures,
            "data": data
        }, indent=2))

    except Exception as error:

        print(json.dumps({
            "success": False,
            "message": str(error)
        }))

        sys.exit(1)


if __name__ == "__main__":
    main()