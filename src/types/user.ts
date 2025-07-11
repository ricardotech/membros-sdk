export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  creatorId?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UserCreateParams {
  email: string;
  name?: string;
  creatorId?: string;
}

export interface UserUpdateParams {
  name?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UserListParams {
  limit?: number;
  offset?: number;
  creatorId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_after?: string;
  created_before?: string;
}

export interface MerchantBalance {
  availableAmount: number;
  pendingAmount: number;
  currency: string;
  lastUpdated: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export interface WithdrawResponse {
  id: string;
  amount: number;
  description?: string;
  status: 'pending' | 'processed' | 'failed';
  requestedAt: string;
  processedAt?: string;
}