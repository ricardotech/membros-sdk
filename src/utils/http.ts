import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MembrosConfig, MembrosResponse } from '../types/common';
import { 
  createMembrosError, 
  MembrosNetworkError,
  MembrosAuthenticationError 
} from '../errors/membros-error';

export class HttpClient {
  private client: AxiosInstance;
  private config: Required<MembrosConfig>;

  constructor(apiKey: string, config: MembrosConfig) {
    this.config = {
      apiUrl: config.apiUrl || 'https://api.membros.com',
      projectId: config.projectId,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      version: config.version || 'v1',
      userAgent: config.userAgent || `membros-node-sdk/1.0.0`
    };

    this.client = axios.create({
      baseURL: `${this.config.apiUrl}/${this.config.version}`,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        'X-Project-ID': this.config.projectId
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp for request tracking
        (config as any).metadata = { startTime: Date.now() };
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          throw new MembrosAuthenticationError(
            'Authentication failed. Please check your API key.',
            'INVALID_API_KEY',
            401
          );
        }

        // Handle rate limiting with retry
        if (error.response?.status === 429 && !originalRequest._retry) {
          const retryAfter = error.response.headers['retry-after'] || 1;
          await this.delay(retryAfter * 1000);
          originalRequest._retry = true;
          return this.client(originalRequest);
        }

        // Handle network errors with retry
        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          if (originalRequest._retryCount <= this.config.maxRetries) {
            await this.delay(this.getRetryDelay(originalRequest._retryCount));
            return this.client(originalRequest);
          }
        }

        throw this.handleError(error);
      }
    );
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      (error.response.status >= 500 && error.response.status <= 599)
    );
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || error.message;
      const code = data?.code || 'API_ERROR';
      
      return createMembrosError(status, message, code, data);
    } else if (error.request) {
      // Network error
      return new MembrosNetworkError(
        'Network request failed. Please check your internet connection.',
        'NETWORK_ERROR',
        0,
        { originalError: error.message }
      );
    } else {
      // Other error
      return createMembrosError(500, error.message, 'UNKNOWN_ERROR');
    }
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<MembrosResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return this.formatResponse(response);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<MembrosResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<MembrosResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<MembrosResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return this.formatResponse(response);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<MembrosResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse<T>): MembrosResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    };
  }

  public getConfig(): Required<MembrosConfig> {
    return { ...this.config };
  }
}