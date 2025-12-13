/**
 * API Service
 * 
 * Axios-based HTTP client with i18n headers
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as RNLocalize from 'react-native-localize';

import { getCurrentLanguage } from '../i18n';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

class ApiService {
    private client: AxiosInstance;
    private authToken: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - add auth and locale headers
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token
                if (this.authToken) {
                    config.headers.Authorization = `Bearer ${this.authToken}`;
                }

                // Add locale header
                config.headers['X-Locale'] = getCurrentLanguage();

                // Add timezone header
                const timezones = RNLocalize.getTimeZone();
                if (timezones) {
                    config.headers['X-Timezone'] = timezones;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // Server responded with error
                    const { status, data } = error.response;

                    // Handle 401 - unauthorized
                    if (status === 401) {
                        // Could trigger logout here
                        console.warn('Unauthorized - token may be expired');
                    }

                    // Return the error data for handling
                    return Promise.reject({
                        status,
                        message: data?.error?.message || 'An error occurred',
                        code: data?.error?.code,
                    });
                } else if (error.request) {
                    // Network error
                    return Promise.reject({
                        status: 0,
                        message: 'Network error. Please check your connection.',
                        code: 'NETWORK_ERROR',
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    setAuthToken(token: string) {
        this.authToken = token;
    }

    clearAuthToken() {
        this.authToken = null;
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.put<T>(url, data, config);
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.patch<T>(url, data, config);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.delete<T>(url, config);
    }
}

export const api = new ApiService();

export default api;
