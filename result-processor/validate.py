import pandas as pd
from pymongo import MongoClient
import json
import re
import sys

target_file = r"C:\Users\ravit\Downloads\K&K+ BACKLOGS DATA.xlsx"

try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['academic_engagement_db']
    
    # Load DB state
    branches = {b['branchName']: str(b['_id']) for b in db.branches.find()}
    campuses = {c['campusCode']: str(c['_id']) for c in db.campuses.find()}
    subjects = {s['subjectCode'].upper(): str(s['_id']) for s in db.subjects.find()}
    semesters = {s['semesterCode']: str(s['_id']) for s in db.semesters.find()}
    subject_branch_mappings = list(db.subjectbranchmappings.find())
    
    # Valid branch mapping from user prompt
    branch_map = {
        'A42': 'CSM',
        'A43': 'CAI',
        'A44': 'CSD',
        'A45': 'AI&DS',
        'A46': 'CSC'
    }

    report = {
        'total_rows': 0,
        'valid_rows': 0,
        'invalid_rows': 0,
        'count_mismatches': [],
        'unknown_subject_codes': set(),
        'branch_subject_mismatches': [],
        'invalid_htnos': [],
        'duplicate_htnos': [],
        'cross_sheet_duplicates': [],
        'examples': {
            'count_mismatch': None,
            'unknown_subject': None,
            'branch_mismatch': None,
            'invalid_htno': None,
            'duplicate_htno': None
        }
    }
    
    all_htnos = set()
    sheet_htnos = {'2': set(), '3': set(), '4': set()}
    
    xl = pd.ExcelFile(target_file)
    sheets_to_process = ['2', '3', '4']
    
    for sheet in sheets_to_process:
        if sheet not in xl.sheet_names:
            continue
            
        df = xl.parse(sheet, dtype=str)
        
        columns = list(df.columns)
        roll_col = next((c for c in columns if 'ROLL' in str(c).upper() or 'HTNO' in str(c).upper()), None)
        name_col = next((c for c in columns if 'NAME' in str(c).upper()), None)
        campus_col = 'COL'
        backlog_col = next((c for c in columns if 'BACKLOG' in str(c).upper()), None)
        sem_cols = [c for c in columns if any(str(i) in str(c) for i in range(1, 9)) and 'BACKLOG' not in str(c).upper()]
        
        for idx, row in df.iterrows():
            report['total_rows'] += 1
            is_valid = True
            
            # Normalize HTNO
            htno = str(row[roll_col]).strip().upper() if pd.notnull(row[roll_col]) else ""
            if htno == "" or htno == "NAN":
                report['invalid_htnos'].append(htno)
                if not report['examples']['invalid_htno']: report['examples']['invalid_htno'] = f"Row {idx+2} in sheet {sheet} has empty HTNO"
                is_valid = False
                report['invalid_rows'] += 1
                continue
                
            # Check duplicates
            if htno in sheet_htnos[sheet]:
                report['duplicate_htnos'].append(htno)
                if not report['examples']['duplicate_htno']: report['examples']['duplicate_htno'] = htno
                is_valid = False
            sheet_htnos[sheet].add(htno)
            
            for other_sheet, h_set in sheet_htnos.items():
                if other_sheet != sheet and htno in h_set:
                    report['cross_sheet_duplicates'].append(htno)
                    is_valid = False
            
            # Branch extraction
            branch_code = None
            if len(htno) >= 8:
                branch_code_segment = htno[5:8] # e.g. A42 in 25B21A4201
                if branch_code_segment in branch_map:
                    branch_code = branch_map[branch_code_segment]
                else:
                    report['invalid_htnos'].append(htno)
                    if not report['examples']['invalid_htno']: report['examples']['invalid_htno'] = f"HTNO {htno} has unrecognized branch segment {branch_code_segment}"
                    is_valid = False
            else:
                report['invalid_htnos'].append(htno)
                if not report['examples']['invalid_htno']: report['examples']['invalid_htno'] = f"HTNO {htno} is too short"
                is_valid = False

            # Campus
            campus = str(row[campus_col]).strip().upper() if pd.notnull(row[campus_col]) else ""
            
            # Count mismatches & Semesters
            reported_bl = 0
            if backlog_col:
                try:
                    reported_bl = int(float(str(row[backlog_col]).strip())) if pd.notnull(row[backlog_col]) and str(row[backlog_col]).strip().lower() != 'nan' else 0
                except:
                    reported_bl = 0
            
            calc_bl = 0
            for sc in sem_cols:
                val = str(row[sc])
                if pd.notnull(row[sc]) and val.strip().lower() not in ['', 'nan', 'null', '0']:
                    # Split on commas, remove empty
                    subs = [s.strip().upper() for s in val.split(',') if s.strip()]
                    calc_bl += len(subs)
                    
                    sem_str = str(sc)
                    formatted_sem = f"{sem_str[0]}-{sem_str[1]}" # e.g. 11 -> 1-1
                    sem_id = semesters.get(formatted_sem)
                    
                    for sub in subs:
                        if sub not in subjects:
                            report['unknown_subject_codes'].add(sub)
                            if not report['examples']['unknown_subject']: report['examples']['unknown_subject'] = sub
                            is_valid = False
                        else:
                            sub_id = subjects[sub]
                            # Check mapping
                            if branch_code and branch_code in branches and sem_id:
                                b_id = branches[branch_code]
                                has_mapping = any(str(m['subjectId']) == sub_id and str(m['branchId']) == b_id and str(m['semesterId']) == sem_id for m in subject_branch_mappings)
                                if not has_mapping:
                                    mismatch = f"Subject {sub} not mapped to branch {branch_code} in semester {formatted_sem}"
                                    report['branch_subject_mismatches'].append(mismatch)
                                    if not report['examples']['branch_mismatch']: report['examples']['branch_mismatch'] = mismatch
                                    is_valid = False
                            
            if reported_bl != calc_bl:
                mismatch_info = f"HTNO {htno}: reported {reported_bl}, parsed {calc_bl}"
                report['count_mismatches'].append(mismatch_info)
                if not report['examples']['count_mismatch']: report['examples']['count_mismatch'] = mismatch_info
                is_valid = False
                
            if is_valid:
                report['valid_rows'] += 1
            else:
                report['invalid_rows'] += 1

    summary = {
        'A. Total rows analyzed': report['total_rows'],
        'B. Valid rows': report['valid_rows'],
        'C. Invalid rows': report['invalid_rows'],
        'D. Count mismatches': len(report['count_mismatches']),
        'E. Unknown subject codes': len(report['unknown_subject_codes']),
        'F. Branch-subject mismatches': len(report['branch_subject_mismatches']),
        'G. Invalid HTNOs': len(set(report['invalid_htnos'])),
        'H. Duplicate HTNOs': len(set(report['duplicate_htnos'])),
        'I. Cross-sheet duplicates': len(set(report['cross_sheet_duplicates'])),
        'J. Examples': report['examples']
    }
    
    print(json.dumps(summary, indent=2))

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
