exports.buildScopeFilter = (user, studentPathPrefix = '') => {
  const { role, scope, id: userId } = user;
  const filter = {};
  
  // Prefix helps when the filter needs to be applied after a $lookup
  // e.g., if student is populated as 'studentData', prefix would be 'studentData.'
  
  if (role === 'STUDENT') {
    filter[studentPathPrefix + 'userId'] = userId;
  } else if (['CTPO', 'HOD', 'PRINCIPAL'].includes(role)) {
    if (role === 'CTPO' && scope.sectionId) filter[studentPathPrefix + 'sectionId'] = scope.sectionId;
    if (role === 'PRINCIPAL' && scope.campusId) filter[studentPathPrefix + 'campusId'] = scope.campusId;
    if (role === 'HOD') {
      if (scope.year) filter[studentPathPrefix + 'year'] = scope.year;
      if (scope.campusIds && scope.campusIds.length > 0) {
        filter[studentPathPrefix + 'campusId'] = { $in: scope.campusIds };
      } else if (scope.campusId) {
        filter[studentPathPrefix + 'campusId'] = scope.campusId;
      }
    }
  }

  // COORDINATOR and ADMIN can potentially see everything, or whatever they are scoped to
  if (role === 'COORDINATOR' && scope.campusId) {
    filter[studentPathPrefix + 'campusId'] = scope.campusId;
  }

  return filter;
};
