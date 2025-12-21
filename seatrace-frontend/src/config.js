const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:10000/api';
// Ensure API URL ends with /api, removing trailing slash if present before appending if needed
export const API_BASE_URL = rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : (rawBaseUrl.endsWith('/') ? rawBaseUrl + 'api' : rawBaseUrl + '/api');

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:10000';
