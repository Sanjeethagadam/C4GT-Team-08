export const getAvatarUrl = (urlOrId?: string | null): string => {
  if (!urlOrId) return '';
  if (urlOrId.startsWith('data:')) return urlOrId;
  if (urlOrId.startsWith('http')) return urlOrId;
  
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  
  // Legacy filesystem paths
  if (urlOrId.startsWith('/uploads')) {
    return `${baseURL.replace('/api/v1', '')}${urlOrId}`;
  }
  
  // New GridFS file IDs
  return `${baseURL.replace('/api/v1', '/api')}/auth/avatar/${urlOrId}`;
};
