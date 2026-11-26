import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatPhoneNumber,
  isSmsGatewayConfigured,
  sendSmsViaGateway,
  sendOtpSms,
} from '../src/services/smsService';
import { config } from '../src/config';

describe('SMS Service & Gateway Integration', () => {
  const originalUrl = config.smsGatewayUrl;
  const originalKey = config.smsGatewayApiKey;

  afterEach(() => {
    config.smsGatewayUrl = originalUrl;
    config.smsGatewayApiKey = originalKey;
    vi.restoreAllMocks();
  });

  describe('formatPhoneNumber', () => {
    it('formats a 10-digit Indian number with +91 country prefix', () => {
      expect(formatPhoneNumber('9876543210')).toBe('+919876543210');
    });

    it('formats a 12-digit Indian number starting with 91 cleanly', () => {
      expect(formatPhoneNumber('919876543210')).toBe('+919876543210');
    });

    it('preserves existing + prefix', () => {
      expect(formatPhoneNumber('+919876543210')).toBe('+919876543210');
    });
  });

  describe('Gateway configuration & delivery', () => {
    it('detects when gateway is not configured', () => {
      config.smsGatewayUrl = '';
      config.smsGatewayApiKey = '';
      expect(isSmsGatewayConfigured()).toBe(false);
    });

    it('falls back gracefully to demo provider when gateway unconfigured', async () => {
      config.smsGatewayUrl = '';
      config.smsGatewayApiKey = '';
      const result = await sendSmsViaGateway('9876543210', 'Test message');
      expect(result.sent).toBe(false);
      expect(result.provider).toBe('demo');
    });

    it('sends POST request to gateway API when configured', async () => {
      config.smsGatewayUrl = 'http://192.168.1.50:8080';
      config.smsGatewayApiKey = 'test-secret-key-123';

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'SMS queued for sending', sms_id: 101 }),
      });
      global.fetch = mockFetch as any;

      const result = await sendSmsViaGateway('9876543210', 'Your OTP is 482910');
      expect(result.sent).toBe(true);
      expect(result.provider).toBe('sms_gateway');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://192.168.1.50:8080/api/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-API-Key': 'test-secret-key-123',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('logs OTP to console and returns console provider in local/demo mode', async () => {
      config.smsGatewayUrl = '';
      config.smsGatewayApiKey = '';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await sendOtpSms('9876543210', '654321', 'login');
      expect(result.sent).toBe(false);
      expect(result.provider).toBe('console');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
