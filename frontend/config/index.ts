const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  env: process.env.NODE_ENV,
  apiUrl: isDevelopment 
    ? process.env.NEXT_PUBLIC_API_URL        // Development URL from .env.development
    : process.env.NEXT_PUBLIC_BACKEND_URL,   // Production URL from .env.production
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      google: '/api/auth/google'
    }
  }
};

console.log('Current Environment:', config.env);
console.log('API URL being used:', config.apiUrl);

export const getApiUrl = (endpoint: string) => `${config.apiUrl}${endpoint}`;
export const getAuthUrl = (type: keyof typeof config.endpoints.auth) => getApiUrl(config.endpoints.auth[type]);

export default config; 