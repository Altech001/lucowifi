
const APP_ENVIRONMENT = process.env.NEXT_PUBLIC_PESAPAL_ENV || 'sandbox';
const BASE_API_URL = APP_ENVIRONMENT === 'sandbox'
  ? 'https://cybqa.pesapal.com/pesapalv3/api'
  : 'https://pay.pesapal.com/v3/api';

export const CONFIG = {
  TOKEN_URL: `${BASE_API_URL}/Auth/RequestToken`,
  IPN_REGISTER_URL: `${BASE_API_URL}/URLSetup/RegisterIPN`,
  SUBMIT_ORDER_URL: `${BASE_API_URL}/Transactions/SubmitOrderRequest`,
  TRANSACTION_STATUS_URL: `${BASE_API_URL}/Transactions/GetTransactionStatus`,
  CALLBACK_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
};
