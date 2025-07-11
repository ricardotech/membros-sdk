import { BaseResource } from './base';
import { HttpClient } from '../utils/http';
import { 
  User, 
  UserListParams, 
  MerchantBalance, 
  WithdrawRequest, 
  WithdrawResponse 
} from '../types/user';
import { MembrosListResponse } from '../types/common';

export class UsersResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http, '/api/v2/users');
  }

  /**
   * Retrieve a user by ID
   */
  async retrieve(id: string): Promise<User> {
    return this.retrieveResource<User>(id);
  }

  /**
   * Retrieve a user by email address
   */
  async retrieveByEmail(email: string): Promise<User> {
    const response = await this.http.get<User>(`${this.basePath}/email/${email}`);
    return response.data;
  }

  /**
   * List users by creator ID
   */
  async listByCreator(creatorId: string): Promise<User[]> {
    const response = await this.http.get<User[]>(`${this.basePath}/creator/${creatorId}`);
    return response.data;
  }

  /**
   * Get merchant balance information
   */
  async getBalance(): Promise<MerchantBalance> {
    const response = await this.http.get<MerchantBalance>(`${this.basePath}/balance`);
    return response.data;
  }

  /**
   * Request a merchant withdrawal
   */
  async requestWithdraw(params: WithdrawRequest): Promise<WithdrawResponse> {
    const response = await this.http.post<WithdrawResponse>(`${this.basePath}/withdraw`, params);
    return response.data;
  }

  /**
   * List users with pagination and filters
   */
  async list(params?: UserListParams): Promise<MembrosListResponse<User>> {
    return this.listResources<User>(undefined, params);
  }
}