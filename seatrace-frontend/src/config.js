const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
// Remove one or more trailing slashes
let url = rawBaseUrl.replace(/\/+$/, '');
// Append /api if not present
if (!url.endsWith('/api')) {
    url += '/api';
}
export const API_BASE_URL = url;

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
