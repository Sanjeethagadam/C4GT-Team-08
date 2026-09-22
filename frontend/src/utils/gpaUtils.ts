export const getGradePoint = (grade: string | undefined | null, existingGp: any): number | null => {
  if (grade) {
    const g = grade.toUpperCase().trim();
    const mapping: Record<string, number> = {
      'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'AB': 0, 'ABSENT': 0
    };
    if (mapping[g] !== undefined) {
      return mapping[g];
    }
  }
  
  if (existingGp !== undefined && existingGp !== null && existingGp !== '-' && existingGp !== '') {
    const num = Number(existingGp);
    if (!isNaN(num)) return num;
  }
  
  return null;
};

export const calculateGPA = (results: any[]) => {
  let totalPoints = 0;
  let includedCredits = 0;
  
  results.forEach(r => {
    const grade = (r.grade || '').toUpperCase().trim();
    if (grade === 'CM' || grade === 'COMPLETED' || grade === '-') return;

    // The user strictly requested: "using the EXISTING displayed Credits and Grade Points"
    // and "Required mapping: S = 10, A = 9, B = 8, C = 7, D = 6, E = 5, F = 0"
    const gp = getGradePoint(r.grade, r.gradePoint);
    const c = Number(r.credits);

    if (gp !== null && !isNaN(c) && !isNaN(gp) && c > 0) {
      totalPoints += (c * gp);
      includedCredits += c;
    }
  });

  const gpa = includedCredits > 0 ? (totalPoints / includedCredits).toFixed(2) : '-';
  const percentage = includedCredits > 0 ? ((Number(gpa) - 0.75) * 10).toFixed(2) : '-';

  return { 
    points: totalPoints, 
    credits: includedCredits, 
    gpa,
    percentage
  };
};


