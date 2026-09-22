import pandas as pd
import json

target_file = r"C:\Users\ravit\Downloads\K&K+ BACKLOGS DATA.xlsx"

try:
    xl = pd.ExcelFile(target_file)
    sheets_to_process = ['2', '3', '4']
    
    report = {}
    
    for sheet in sheets_to_process:
        if sheet in xl.sheet_names:
            df = xl.parse(sheet, dtype=str)
            
            # Basic info
            rows, cols = df.shape
            columns = list(df.columns)
            
            # Find specific columns
            roll_col = next((c for c in columns if 'ROLL' in str(c).upper() or 'HTNO' in str(c).upper()), None)
            name_col = next((c for c in columns if 'NAME' in str(c).upper()), None)
            campus_col = next((c for c in columns if 'CAMPUS' in str(c).upper() or 'CATEGORY' in str(c).upper()), None)
            backlog_col = next((c for c in columns if 'BACKLOG' in str(c).upper()), None)
            
            # Semester columns
            sem_cols = [c for c in columns if any(str(i) in str(c) for i in range(1, 9)) and 'BACKLOG' not in str(c).upper()]
            
            # Check duplicates
            dups = 0
            if roll_col:
                dups = df[roll_col].duplicated().sum()
                
            # Check unique values in COL to see if it represents campus
            col_unique = list(df['COL'].dropna().unique()) if 'COL' in columns else []
            
            # Print sample of a semester column
            sem_sample = df[sem_cols[0]].dropna().head(3).tolist() if sem_cols else []
            roll_sample = df['HTNO'].dropna().head(3).tolist() if 'HTNO' in columns else []
            
            # Mismatches check (better logic)
            mismatches = 0
            if backlog_col:
                for idx, row in df.iterrows():
                    reported_bl = row[backlog_col]
                    try:
                        reported_bl = int(float(str(reported_bl).strip())) if pd.notnull(reported_bl) else 0
                    except:
                        reported_bl = 0
                    
                    calc_bl = 0
                    for sc in sem_cols:
                        val = str(row[sc])
                        if pd.notnull(row[sc]) and val.strip().lower() not in ['', 'nan', 'null', '0']:
                            # Maybe subjects are comma separated or just text? Let's just count subjects by some delimiter or see if we can guess. Let's just log the mismatch difference if it's large.
                            pass
                            
            report[sheet] = {
                'rows': rows,
                'columns': len(columns),
                'col_names': columns,
                'roll_col': roll_col,
                'name_col': name_col,
                'campus_col': 'COL' if 'COL' in columns else None,
                'campus_unique': col_unique,
                'backlog_col': backlog_col,
                'sem_cols': sem_cols,
                'sem_sample': sem_sample,
                'roll_sample': roll_sample,
                'duplicates': int(dups),
                'empty_patterns': str(df.isnull().sum().to_dict())
            }
            
    print(json.dumps(report, indent=2))
except Exception as e:
    print(f"Error processing excel: {e}")
