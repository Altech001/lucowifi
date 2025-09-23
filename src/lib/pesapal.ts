

// The consumer key and secret are sensitive and should be stored in environment variables.
interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
}

// This interface defines the structure for a payment request to Pesapal's API.
export interface PaymentRequest {
  id: string; // Your unique merchant reference for the transaction.
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  notification_id?: string; // This will be added by the service.
  billing_address: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
}

// This interface represents the response from Pesapal after submitting an order.
export interface PaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: {
    code: string;
    message: string;
    error_data: any;
  };
  status: string;
}

// This interface describes the status of a transaction returned by Pesapal.
export interface PaymentStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: 'Completed' | 'Pending' | 'Failed' | 'Cancelled';
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  account_number: string;
  status: string;
  error?: any;
}


// This class encapsulates all interactions with the Pesapal V3 API.
class PesapalService {
  private config: PesapalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private ipnId: string | null = null;

  constructor() {
    this.config = {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
      environment: (process.env.NODE_ENV as 'sandbox' | 'production') === 'production' ? 'production' : 'sandbox'
    };
    
    this.baseUrl = this.config.environment === 'production' 
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3';

    if (!this.config.consumerKey || !this.config.consumerSecret) {
        console.error("CRITICAL: Pesapal Consumer Key or Secret is not configured in environment variables.");
    }
  }

  // Authenticates with Pesapal to get a short-lived access token.
  private async getAccessToken(): Promise<string> {
    // Reuse the token if it's still valid.
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error("Pesapal Auth Error Response:", data);
        throw new Error(`Failed to get access token: ${data.error?.message || response.statusText}`);
      }

      this.accessToken = data.token;
      // Set the token to expire 5 minutes before its actual expiry time for safety.
      this.tokenExpiry = Date.parse(data.expiryDate) - (5 * 60 * 1000); 
      
      return this.accessToken!;
    } catch (error) {
      console.error('Error getting Pesapal access token:', error);
      throw new Error('Failed to authenticate with payment gateway');
    }
  }

  // Registers the IPN (Instant Payment Notification) URL and caches the ID.
  private async getIpnId(): Promise<string> {
    if (this.ipnId) {
      return this.ipnId;
    }

    try {
      const ipnUrlToRegister = `${process.env.NEXT_PUBLIC_BASE_URL}/api/pesapal/ipn`;
      
      const response = await this.registerIPN(ipnUrlToRegister, 'POST');
      
      if (!response.ipn_id) {
        console.error("IPN Registration Error Response:", response);
        throw new Error('IPN ID not found in Pesapal response.');
      }

      this.ipnId = response.ipn_id;
      return this.ipnId;
      
    } catch (error) {
      console.error('Error getting/registering IPN ID:', error);
      throw new Error('Failed to configure payment notifications');
    }
  }

  // Submits a payment order to Pesapal.
  async submitOrderRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      const notification_id = await this.getIpnId();

      const endpoint = `${this.baseUrl}/api/Transactions/SubmitOrderRequest`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...paymentData,
          notification_id: notification_id,
        })
      });

      const result: PaymentResponse = await response.json();

      if (!response.ok || result.error) {
        console.error('Payment submission failed response:', result);
        throw new Error(result.error?.message || `Payment request failed with status ${response.status}`);
      }

      if (!result.redirect_url) {
        console.error('Full response (missing redirect_url):', result);
        throw new Error('Payment gateway did not return redirect URL');
      }

      return result;
    } catch (error) {
      console.error('Payment submission error:', error);
      throw new Error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Retrieves the status of a specific transaction.
  async getTransactionStatus(orderTrackingId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result: PaymentStatus = await response.json();
      
      if (result.error && result.error.code) {
        console.error("Pesapal Get Transaction Status Error:", result);
        throw new Error(`Pesapal API Error: ${result.error.message || 'Unknown error'}`);
      }

      if (!response.ok) {
        throw new Error(`Network error checking status: ${response.statusText}`);
      }

      return result;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check payment status');
    }
  }

  // Registers a new IPN URL with Pesapal.
  async registerIPN(url: string, ipn_notification_type: 'GET' | 'POST' = 'POST'): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          ipn_notification_type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("IPN Registration Failed Response:", data);
        throw new Error(`IPN registration failed: ${data.error?.message || response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error registering IPN:', error);
      throw new Error('Failed to register payment notifications');
    }
  }
}

export const pesapalService = new PesapalService();
