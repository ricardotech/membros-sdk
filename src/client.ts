import { HttpClient } from './utils/http';
import { MembrosConfig } from './types/common';
import { CustomersResource } from './resources/customers';
import { OrdersResource } from './resources/orders';
import { MembrosAuthenticationError } from './errors/membros-error';

export class MembrosClient {
  private http: HttpClient;
  
  public readonly customers: CustomersResource;
  public readonly orders: OrdersResource;

  constructor(apiKey: string, config: MembrosConfig) {
    if (!apiKey) {
      throw new MembrosAuthenticationError(
        'API key is required. Please provide a valid Membros API key.',
        'MISSING_API_KEY'
      );
    }

    if (!config.projectId) {
      throw new MembrosAuthenticationError(
        'Project ID is required. Please provide a valid project ID.',
        'MISSING_PROJECT_ID'
      );
    }

    this.http = new HttpClient(apiKey, config);
    
    // Initialize resource classes
    this.customers = new CustomersResource(this.http);
    this.orders = new OrdersResource(this.http);
  }

  /**
   * Get the current configuration
   */
  public getConfig(): Required<MembrosConfig> {
    return this.http.getConfig();
  }

  /**
   * Test the connection to the Membros API
   */
  public async ping(): Promise<{ status: string; timestamp: string }> {
    const response = await this.http.get('/ping');
    return response.data;
  }
}

/**
 * Main entry point - creates a new Membros client instance
 */
export function Membros(apiKey: string, config: MembrosConfig): MembrosClient {
  return new MembrosClient(apiKey, config);
}

// Also support 'new Membros()' pattern
export { MembrosClient as default };