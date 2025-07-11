// client.ts
import { HttpClient } from './utils/http';
import { CustomersResource } from './resources/customers';
import { OrdersResource } from './resources/orders';
import { UsersResource } from './resources/users';
import { MembrosAuthenticationError } from './errors/membros-error';
import type { Agent as HttpAgent } from 'http';

/**
 * Todas as opções aceitas pelo SDK.
 * (Não dependemos mais de HttpClientConfig)
 */
export interface MembrosClientOptions {
  /** Chave secreta Membros (sk_...) – obrigatória */
  secretKey: string;
  /** Chave pública Membros (pk_...) – obrigatória para API v2 */
  publicKey: string;
  /** ID do projeto – opcional */
  projectId?: string;

  /*–– opções de rede ––*/
  apiUrl?: string;              // default: https://api.membros.app
  version?: string;             // default: v2
  host?: string;                // default: api.membros.com
  port?: number;                // default: 443
  timeout?: number;             // default: 80 000 ms
  maxNetworkRetries?: number;   // default: 1
  httpAgent?: HttpAgent;        // proxy/keep-alive
  telemetry?: boolean;          // default: true
  userAgent?: string;           // override UA header
}

export class MembrosClient {
  private readonly http: HttpClient;

  /** Recursos disponíveis */
  public readonly customers: CustomersResource;
  public readonly orders: OrdersResource;
  public readonly users: UsersResource;

  constructor(options: MembrosClientOptions) {
    const { secretKey, publicKey } = options ?? {};

    if (!secretKey || !secretKey.startsWith('sk_')) {
      throw new MembrosAuthenticationError(
        'API key inválida ou ausente (esperado formato sk_...).',
        'MISSING_API_KEY',
      );
    }
    if (!publicKey || !publicKey.startsWith('pk_')) {
      throw new MembrosAuthenticationError(
        'Public key inválida ou ausente (esperado formato pk_...).',
        'MISSING_PUBLIC_KEY',
      );
    }

    // Passa todas as opções direto para o HttpClient
    this.http = new HttpClient(options);

    // Instancia os recursos
    this.customers = new CustomersResource(this.http);
    this.orders = new OrdersResource(this.http);
    this.users = new UsersResource(this.http);
  }

  /** Cópia imutável da configuração atual */
  getConfig(): Readonly<MembrosClientOptions> {
    return this.http.getConfig() as Readonly<MembrosClientOptions>;
  }

  /** Health-check */
  async ping(): Promise<{ status: string; timestamp: string }> {
    const { data } =
      await this.http.get<{ status: string; timestamp: string }>('/ping');
    return data;                   // agora `data` tem o tipo correto
  }

  /** Rotaciona a secret-key sem recriar o cliente */
  setApiKey(newKey: string): void {
    if (!newKey.startsWith('sk_')) {
      throw new MembrosAuthenticationError('Chave secreta inválida.', 'INVALID_API_KEY');
    }
    this.http.setApiKey(newKey);
  }
}

/** Factory helper à la Stripe */
export function Membros(
  apiKey: string,
  options: Omit<MembrosClientOptions, 'apiKey'> & { publicKey: string },
): MembrosClient;
export function Membros(options: MembrosClientOptions): MembrosClient;
export function Membros(
  apiKeyOrOptions: string | MembrosClientOptions,
  maybeOpts?: Omit<MembrosClientOptions, 'apiKey'>,
): MembrosClient {
  if (typeof apiKeyOrOptions === 'string') {
    return new MembrosClient({
      apiKey: apiKeyOrOptions,
      ...maybeOpts,
    } as MembrosClientOptions);
  }
  return new MembrosClient(apiKeyOrOptions);
}

export default MembrosClient;
