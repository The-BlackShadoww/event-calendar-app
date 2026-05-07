import axios, { type AxiosError } from 'axios';

type ApiErrorResponse = {
  message?: string | string[];
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message;
    const cleanMessage = Array.isArray(message) ? message.join(', ') : message;

    throw new Error(cleanMessage ?? error.message);
  },
);

export default client;
