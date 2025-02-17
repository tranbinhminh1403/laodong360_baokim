export interface BaoKimOrder {
    id: number;
    user_id: number;
    mrc_order_id: string;
    txn_id: number;
    ref_no: string | null;
    merchant_id: number;
    total_amount: number;
    description: string;
    items: string;
    url_success: string;
    url_cancel: string | null;
    url_detail: string;
    stat: 'c' | 'd' | 'p';  // complete, destroy, pending
    lang: string;
    type: number;
    bpm_id: string;
    accept_qrpay: number;
    accept_bank: number;
    accept_cc: number;
    accept_ib: number;
    accept_ewallet: number;
    accept_installments: number;
    email: string;
    name: string;
    webhooks: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    created_at: string;
    updated_at: string;
}

export interface BaoKimTransaction {
    id: number;
    reference_id: string;
    user_id: number;
    merchant_id: number;
    order_id: number;
    mrc_order_id: string;
    total_amount: number;
    amount: number;
    fee_amount: number;
    bank_fee_amount: number;
    bank_fix_fee_amount: number;
    fee_payer: number;
    bank_fee_payer: number;
    auth_code: string | null;
    auth_time: string;
    ref_no: string | null;
    bpm_id: string;
    bank_ref_no: string;
    bpm_type: number;
    gateway: string;
    stat: number;
    init_token: string | null;
    description: string;
    customer_email: string;
    customer_phone: string;
    completed_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface BaoKimDataToken {
    card_number: string;
    card_holder: string;
    issue_date: string;
    token: string;
    card_type: string;
    bank_code: string;
}

export interface WebhookPayload {
    order: BaoKimOrder;
    txn: BaoKimTransaction;
    dataToken: BaoKimDataToken;
    sign: string;
}

export interface IOrderRequest {
  price: number;
  lang?: string;
  email: string;
  age: number;
  fullName: string;
  gender: string;
  phoneNumber: string;
  note: string;
  title: string;
  period: string;
  time: string;
}

export interface IOrderResponse {
  success: boolean;
  data?: {
    order_id: number;
    redirect_url: string;
    payment_url: string;
  };
  error?: string;
  error_response?: any;
} 