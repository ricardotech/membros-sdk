import { HttpClient } from '../utils/http';
import { MembrosListResponse, MembrosListParams } from '../types/common';

export abstract class BaseResource {
  protected http: HttpClient;
  protected basePath: string;

  constructor(http: HttpClient, basePath: string) {
    this.http = http;
    this.basePath = basePath;
  }

  /**
   * Constructs the full URL path for a resource
   */
  protected buildPath(path?: string): string {
    const fullPath = path ? `${this.basePath}/${path}` : this.basePath;
    return fullPath.replace(/\/+/g, '/'); // Remove duplicate slashes
  }

  /**
   * Builds query parameters for list requests
   */
  protected buildListParams(params?: MembrosListParams): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (params?.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }

    if (params?.offset !== undefined) {
      queryParams.offset = params.offset.toString();
    }

    if (params?.created_after) {
      queryParams.created_after = params.created_after;
    }

    if (params?.created_before) {
      queryParams.created_before = params.created_before;
    }

    return queryParams;
  }

  /**
   * Generic list method for resources
   */
  protected async listResources<T>(
    path?: string,
    params?: MembrosListParams & Record<string, any>
  ): Promise<MembrosListResponse<T>> {
    const url = this.buildPath(path);
    const queryParams = { ...this.buildListParams(params), ...params };
    
    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const response = await this.http.get<MembrosListResponse<T>>(url, {
      params: queryParams
    });

    return response.data;
  }

  /**
   * Generic create method for resources
   */
  protected async createResource<T, P = any>(
    data: P,
    path?: string
  ): Promise<T> {
    const url = this.buildPath(path);
    const response = await this.http.post<T>(url, data);
    return response.data;
  }

  /**
   * Generic retrieve method for resources
   */
  protected async retrieveResource<T>(
    id: string,
    path?: string
  ): Promise<T> {
    const url = this.buildPath(path ? `${path}/${id}` : id);
    const response = await this.http.get<T>(url);
    return response.data;
  }

  /**
   * Generic update method for resources
   */
  protected async updateResource<T, P = any>(
    id: string,
    data: P,
    path?: string
  ): Promise<T> {
    const url = this.buildPath(path ? `${path}/${id}` : id);
    const response = await this.http.patch<T>(url, data);
    return response.data;
  }

  /**
   * Generic delete method for resources
   */
  protected async deleteResource<T = any>(
    id: string,
    path?: string
  ): Promise<T> {
    const url = this.buildPath(path ? `${path}/${id}` : id);
    const response = await this.http.delete<T>(url);
    return response.data;
  }
}