import { MembrosClient, Membros } from '../src/client';
import { MembrosAuthenticationError } from '../src/errors/membros-error';

describe('MembrosClient', () => {
  const validConfig = {
    projectId: 'test-project-id'
  };

  describe('Initialization', () => {
    test('should initialize with valid API key and config', () => {
      const client = new MembrosClient('sk_test_123', validConfig);
      expect(client).toBeInstanceOf(MembrosClient);
      expect(client.customers).toBeDefined();
      expect(client.orders).toBeDefined();
    });

    test('should throw error with missing API key', () => {
      expect(() => {
        new MembrosClient('', validConfig);
      }).toThrow(MembrosAuthenticationError);
    });

    test('should throw error with missing project ID', () => {
      expect(() => {
        new MembrosClient('sk_test_123', { projectId: '' });
      }).toThrow(MembrosAuthenticationError);
    });
  });

  describe('Factory Function', () => {
    test('should create client instance using factory function', () => {
      const client = Membros('sk_test_123', validConfig);
      expect(client).toBeInstanceOf(MembrosClient);
    });
  });

  describe('Configuration', () => {
    test('should return configuration', () => {
      const client = new MembrosClient('sk_test_123', {
        projectId: 'test-project',
        timeout: 5000
      });
      
      const config = client.getConfig();
      expect(config.projectId).toBe('test-project');
      expect(config.timeout).toBe(5000);
      expect(config.apiUrl).toBeDefined();
      expect(config.maxRetries).toBeDefined();
    });

    test('should use default values', () => {
      const client = new MembrosClient('sk_test_123', validConfig);
      const config = client.getConfig();
      
      expect(config.timeout).toBe(30000); // default
      expect(config.maxRetries).toBe(3); // default
      expect(config.apiUrl).toBe('https://api.membros.com'); // default
    });
  });
});