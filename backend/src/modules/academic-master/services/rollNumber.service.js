class RollNumberService {
  /**
   * Parse a roll number to extract information.
   * Example (hypothetical): 21X01A0501
   * - 21: Year of joining (2021)
   * - 05: Branch code (e.g., CSE)
   */
  static parse(rollNo) {
    if (!rollNo || rollNo.length < 10) {
      throw new Error('Invalid roll number format');
    }
    
    const yearPrefix = rollNo.substring(0, 2);
    const branchCode = rollNo.substring(6, 8);
    
    return {
      joiningYear: parseInt(`20${yearPrefix}`, 10),
      branchCode,
      // Add more parsing logic as required
    };
  }
}

module.exports = RollNumberService;
