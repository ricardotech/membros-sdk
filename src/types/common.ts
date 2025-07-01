export interface MembrosConfig {
  /** Membros API URL (defaults to production) */
  apiUrl?: string;
  /** Project ID for multi-tenant organization */
  projectId: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retries for failed requests (default: 3) */
  maxRetries?: number;
  /** API version to use */
  version?: string;
  /** Custom user agent string */
  userAgent?: string;
}

export interface MembrosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface MembrosListResponse<T = any> {
  data: T[];
  has_more: boolean;
  total_count?: number;
}

export interface MembrosListParams {
  limit?: number;
  offset?: number;
  created_after?: string;
  created_before?: string;
}

export interface MembrosMetadata {
  [key: string]: string | number | boolean;
}

export type DocumentType = 'CPF' | 'CNPJ';

export interface Phone {
  country_code: string;
  area_code: string;
  number: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
}