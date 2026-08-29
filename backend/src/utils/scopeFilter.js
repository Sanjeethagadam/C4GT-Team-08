exports.getScopeFilter = (user) => {
  if (!user || !user.role) return {};
  const { role, scope = {}, id } = user;
  const filter = {};

  if (role === 'ADMIN') {
    return filter;
  }
  
  if (role === 'STUDENT') {
    return { userId: id };
  }

  if (role === 'PRINCIPAL' && scope.campusId) {
    filter.campusId = scope.campusId;
  }
  
  if (role === 'HOD') {
    if (scope.year) filter.year = scope.year;
    if (scope.campusIds && scope.campusIds.length > 0) {
      filter.campusId = { $in: scope.campusIds };
    } else if (scope.campusId) {
      filter.campusId = scope.campusId;
    }
  }

  if (role === 'CTPO') {
    if (scope.sectionId) filter.sectionId = scope.sectionId;
  }

  if (role === 'COORDINATOR') {
    if (scope.campusId) filter.campusId = scope.campusId;
    if (scope.branchId) filter.branchId = scope.branchId;
  }

  return filter;
};

exports.getStudentQueryScope = (user) => {
  if (!user || !user.role) return {};
  const { role, scope = {}, id } = user;
  const filter = {};

  if (role === 'ADMIN') return filter;
  
  if (role === 'STUDENT') return { userId: id };

  if (role === 'PRINCIPAL' && scope.campusId) filter.campusId = scope.campusId;
  
  if (role === 'HOD') {
    if (scope.year) filter.year = scope.year;
    if (scope.campusIds && scope.campusIds.length > 0) {
      filter.campusId = { $in: scope.campusIds };
    } else if (scope.campusId) {
      filter.campusId = scope.campusId;
    }
  }

  if (role === 'CTPO') {
    if (scope.sectionId) filter.sectionId = scope.sectionId;
  }

  if (role === 'COORDINATOR') {
    if (scope.campusId) filter.campusId = scope.campusId;
    if (scope.branchId) filter.branchId = scope.branchId;
  }

  return filter;
};

exports.isStudentInScope = (user, student) => {
  if (!user || !user.role || !student) return false;
  const { role, scope = {}, id } = user;

  if (role === 'ADMIN') return true;
  if (role === 'STUDENT') return student.userId && student.userId.toString() === id.toString();
  
  if (role === 'PRINCIPAL' && scope.campusId) {
    return student.campusId && student.campusId.toString() === scope.campusId.toString();
  }
  
  if (role === 'HOD') {
    if (scope.year && student.year !== scope.year) return false;
    
    if (scope.campusIds && scope.campusIds.length > 0) {
      return student.campusId && scope.campusIds.some(c => c.toString() === student.campusId.toString());
    } else if (scope.campusId) {
      return student.campusId && student.campusId.toString() === scope.campusId.toString();
    }
    return true; // Unrestricted HOD? Usually scoped.
  }
  
  if (role === 'CTPO' && scope.sectionId) {
    return student.sectionId && student.sectionId.toString() === scope.sectionId.toString();
  }
  
  if (role === 'COORDINATOR') {
      if (scope.campusId && student.campusId && student.campusId.toString() !== scope.campusId.toString()) return false;
      if (scope.branchId && student.branchId && student.branchId.toString() !== scope.branchId.toString()) return false;
      return true;
  }

  return false;
};
