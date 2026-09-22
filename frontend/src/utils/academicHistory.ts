export const getAllowedSemesters = (year: number): string[] => {
  switch (year) {
    case 1:
      return []; // Year 1 is currently running 1-1, so no completed history
    case 2:
      return ['1-1'];
    case 3:
      return ['1-1', '1-2', '2-1', '2-2'];
    case 4:
      return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    default:
      return [];
  }
};
