import { MembrosClient } from '../src/client';
import { UsersResource } from '../src/resources/users';
import { User, MerchantBalance, WithdrawResponse } from '../src/types/user';

describe('UsersResource', () => {
  let client: MembrosClient;
  let users: UsersResource;

  beforeEach(() => {
    client = new MembrosClient({
      apiKey: 'sk_test_123',
      publicKey: 'pk_test_123',
      projectId: 'proj_123',
      apiUrl: 'https://api.membros.app',
      version: 'v2'
    });
    users = client.users;
  });

  describe('retrieve', () => {
    it('should retrieve a user by ID', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'active'
      };

      jest.spyOn(client['http'], 'get').mockResolvedValue({
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {}
      });

      const result = await users.retrieve('user_123');
      expect(result).toEqual(mockUser);
      expect(client['http'].get).toHaveBeenCalledWith('/api/v2/users/user_123');
    });
  });

  describe('retrieveByEmail', () => {
    it('should retrieve a user by email', async () => {
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'active'
      };

      jest.spyOn(client['http'], 'get').mockResolvedValue({
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {}
      });

      const result = await users.retrieveByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(client['http'].get).toHaveBeenCalledWith('/api/v2/users/email/test@example.com');
    });
  });

  describe('listByCreator', () => {
    it('should list users by creator ID', async () => {
      const mockUsers: User[] = [{
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        status: 'active',
        creatorId: 'creator_123'
      }];

      jest.spyOn(client['http'], 'get').mockResolvedValue({
        data: mockUsers,
        status: 200,
        statusText: 'OK',
        headers: {}
      });

      const result = await users.listByCreator('creator_123');
      expect(result).toEqual(mockUsers);
      expect(client['http'].get).toHaveBeenCalledWith('/api/v2/users/creator/creator_123');
    });
  });

  describe('getBalance', () => {
    it('should get merchant balance', async () => {
      const mockBalance: MerchantBalance = {
        availableAmount: 1000,
        pendingAmount: 200,
        currency: 'BRL',
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      jest.spyOn(client['http'], 'get').mockResolvedValue({
        data: mockBalance,
        status: 200,
        statusText: 'OK',
        headers: {}
      });

      const result = await users.getBalance();
      expect(result).toEqual(mockBalance);
      expect(client['http'].get).toHaveBeenCalledWith('/api/v2/users/balance');
    });
  });

  describe('requestWithdraw', () => {
    it('should request a withdrawal', async () => {
      const withdrawRequest = {
        amount: 1000,
        description: 'Monthly withdraw'
      };

      const mockResponse: WithdrawResponse = {
        id: 'withdraw_123',
        amount: 1000,
        description: 'Monthly withdraw',
        status: 'pending',
        requestedAt: '2024-01-01T00:00:00Z'
      };

      jest.spyOn(client['http'], 'post').mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {}
      });

      const result = await users.requestWithdraw(withdrawRequest);
      expect(result).toEqual(mockResponse);
      expect(client['http'].post).toHaveBeenCalledWith('/api/v2/users/withdraw', withdrawRequest);
    });
  });
});