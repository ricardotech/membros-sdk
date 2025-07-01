import { 
  validateCPF, 
  validateCNPJ, 
  formatDocument, 
  validateDocument,
  formatBrazilianPhone,
  validateEmail 
} from '../src/utils/validation';

describe('Brazilian Document Validation', () => {
  describe('CPF Validation', () => {
    test('should validate correct CPF', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    test('should reject invalid CPF', () => {
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('12345678')).toBe(false);
    });
  });

  describe('CNPJ Validation', () => {
    test('should validate correct CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    test('should reject invalid CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-00')).toBe(false);
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('123456789')).toBe(false);
    });
  });

  describe('Document Formatting', () => {
    test('should format CPF correctly', () => {
      expect(formatDocument('12345678909', 'CPF')).toBe('123.456.789-09');
      expect(formatDocument('12345678909')).toBe('123.456.789-09');
    });

    test('should format CNPJ correctly', () => {
      expect(formatDocument('11222333000181', 'CNPJ')).toBe('11.222.333/0001-81');
      expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81');
    });
  });

  describe('Generic Document Validation', () => {
    test('should validate documents correctly', () => {
      expect(validateDocument('123.456.789-09')).toBe(true);
      expect(validateDocument('11.222.333/0001-81')).toBe(true);
      expect(validateDocument('123.456.789-00')).toBe(false);
    });
  });
});

describe('Email Validation', () => {
  test('should validate correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  test('should reject invalid emails', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });
});

describe('Brazilian Phone Validation', () => {
  test('should format phone numbers correctly', () => {
    const result = formatBrazilianPhone('11999888777');
    expect(result).toEqual({
      country_code: '55',
      area_code: '11',
      number: '999888777'
    });
  });

  test('should format landline numbers correctly', () => {
    const result = formatBrazilianPhone('1133334444');
    expect(result).toEqual({
      country_code: '55',
      area_code: '11',
      number: '33334444'
    });
  });

  test('should handle formatted phone numbers', () => {
    const result = formatBrazilianPhone('(11) 99988-8777');
    expect(result).toEqual({
      country_code: '55',
      area_code: '11',
      number: '999888777'
    });
  });
});