import axios, { type AxiosError } from 'axios';

// Shape of the error body returned by the API.
type ApiErrorResponse = {
  message?: string | string[];
};

// All requests made with this client start with /api.
// Vite proxies those calls to the NestJS backend during development.
const client = axios.create({
  baseURL: '/api',
});

client.interceptors.response.use(
  // Successful responses pass through unchanged.
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // NestJS often returns a message field in the response body.
    const message = error.response?.data?.message;
    // Validation errors may arrive as an array, so convert them to one readable string.
    const cleanMessage = Array.isArray(message) ? message.join(', ') : message;

    // Re-throw a plain Error so React Query/hooks receive a consistent error object.
    throw new Error(cleanMessage ?? error.message);
  },
);

export default client;
