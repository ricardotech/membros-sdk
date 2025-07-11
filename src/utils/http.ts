// utils/http.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
} from 'axios';
import { EventEmitter } from 'events';
import {
  MembrosAuthenticationError,
} from '../errors/membros-error';
import type { MembrosClientOptions } from '../client';

/** Cabeçalhos devolvidos no wrapper */
export interface MembrosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HttpClient
 * ----------
 *  ‣ Wrapper fino sobre Axios
 *  ‣ Suporta retries, rate-limit backoff, eventos, telemetry e rotação de chave.
 */
export class HttpClient extends EventEmitter {
  private client: AxiosInstance;
  private readonly config: Readonly<MembrosClientOptions>;

  constructor(opts: MembrosClientOptions) {
    super();

    /** ---------- validações básicas ----------------------------- */
    if (!opts.secretKey?.startsWith('sk_')) {
      throw new MembrosAuthenticationError(
        'API key inválida (esperado formato sk_...).',
        'INVALID_API_KEY',
      );
    }
    if (!opts.publicKey?.startsWith('pk_')) {
      throw new MembrosAuthenticationError(
        'Public key inválida (esperado formato pk_...).',
        'INVALID_PUBLIC_KEY',
      );
    }

    /** ---------- normalização de opções -------------------------- */
    const configBase = {
      apiKey: opts.secretKey,
      publicKey: opts.publicKey,
      projectId: opts.projectId || '',
      apiUrl: opts.apiUrl || 'http://localhost:3000',
      version: opts.version || 'v2',
      timeout: opts.timeout || 80_000,
      maxNetworkRetries: opts.maxNetworkRetries || 1,
      host: opts.host || 'api.membros.app',
      port: opts.port || 443,
      telemetry: opts.telemetry !== false, // default true
      userAgent:
        opts.userAgent || `membros-node-sdk/1.0.0 (${process.version})`,
    };
    
    this.config = opts.httpAgent 
      ? { ...configBase, httpAgent: opts.httpAgent }
      : configBase as any;

    /** ---------- instancia Axios --------------------------------- */
    const axiosConfig: any = {
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.publicKey}:${this.config.secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        ...(this.config.projectId && { 'X-Project-ID': this.config.projectId }),
      },
    };

    if (this.config.httpAgent) {
      axiosConfig.httpAgent = this.config.httpAgent;
    }

    this.client = axios.create(axiosConfig);

    this.setupInterceptors();
  }

  /** --------------------------- public API ----------------------- */

  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    return this.request<T>('get', url, undefined, config);
  }

  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    return this.request<T>('post', url, data, config);
  }

  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    return this.request<T>('put', url, data, config);
  }

  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    return this.request<T>('patch', url, data, config);
  }

  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    return this.request<T>('delete', url, undefined, config);
  }

  /** Permite trocar a secret-key em tempo-de-execução (rotação) */
  public setApiKey(newKey: string): void {
    if (!newKey.startsWith('sk_')) {
      throw new MembrosAuthenticationError('Chave secreta inválida.', 'INVALID_API_KEY');
    }
    (this.config as any).apiKey = newKey;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.config.publicKey}:${newKey}`;
  }

  /** Config corrente (imutável) */
  public getConfig(): Readonly<MembrosClientOptions> {
    return { ...this.config };
  }

  /** --------------------- implementação interna ------------------ */

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    extra?: AxiosRequestConfig,
  ): Promise<MembrosResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      ...extra,
    };

    try {
      const response = await this.client.request<T>(config);
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new MembrosAuthenticationError(
          'Authentication failed. Please check your API key.',
          'AUTHENTICATION_FAILED',
        );
      }
      throw error;
    }
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        this.emit('request', config);
        return config;
      },
      (error) => {
        this.emit('requestError', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        this.emit('response', response);
        return response;
      },
      (error) => {
        this.emit('responseError', error);
        return Promise.reject(error);
      }
    );
  }
}
