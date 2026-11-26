import { config } from '../config';

export interface SendSmsResult {
  sent: boolean;
  provider: 'sms_gateway' | 'demo' | 'console';
  error?: string;
  response?: any;
}

export function isSmsGatewayConfigured(): boolean {
  return !!(config.smsGatewayUrl && config.smsGatewayApiKey);
}

/**
 * Format Indian mobile number to E.164 standard (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

/**
 * Send an SMS message through the self-hosted Android SMS Gateway
 * (Compatible with https://github.com/mdakashhossain1/SMS-Gateway-Free)
 */
export async function sendSmsViaGateway(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  if (!isSmsGatewayConfigured()) {
    return {
      sent: false,
      provider: 'demo',
      error: 'SMS Gateway is not configured in environment variables (SMS_GATEWAY_URL / SMS_GATEWAY_API_KEY)',
    };
  }

  const endpoint = `${config.smsGatewayUrl.replace(/\/$/, '')}/api/send`;
  const formattedPhone = formatPhoneNumber(phone);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.smsGatewayApiKey,
      },
      body: JSON.stringify({
        phone_number: formattedPhone,
        message,
        request_id: `ks-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[SmsGateway] HTTP ${res.status} from ${endpoint}:`, errorText);
      return {
        sent: false,
        provider: 'sms_gateway',
        error: `Gateway responded with HTTP ${res.status}: ${errorText}`,
      };
    }

    const data = await res.json();
    console.log(`[SmsGateway] ✅ SMS dispatched successfully to ${formattedPhone}:`, data);
    return {
      sent: true,
      provider: 'sms_gateway',
      response: data,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError' ? 'Gateway request timed out (8s)' : err.message;
    console.error(`[SmsGateway] ❌ Failed to dispatch SMS to ${formattedPhone}:`, msg);
    return {
      sent: false,
      provider: 'sms_gateway',
      error: msg,
    };
  }
}

/**
 * Send verification OTP SMS with fallback to console in local/demo mode
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
  purpose: 'login' | 'register' = 'login'
): Promise<SendSmsResult> {
  const actionWord = purpose === 'register' ? 'Registration' : 'Login';
  const message = `[Krushi Sathi] Your ${actionWord} OTP is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  if (isSmsGatewayConfigured()) {
    const result = await sendSmsViaGateway(phone, message);
    if (result.sent) {
      return result;
    }
    console.warn(`[SmsGateway] Falling back to console OTP logging due to error: ${result.error}`);
  }

  // Graceful local/demo console logging
  console.log(`\n======================================================`);
  console.log(`🌾 [KRUSHI SATHI OTP] ${actionWord} Code for ${phone}: ${otp}`);
  console.log(`🌾 Message: "${message}"`);
  console.log(`======================================================\n`);

  return {
    sent: false,
    provider: 'console',
  };
}
