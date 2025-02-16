export interface BaoKimOrder {
    id: number;
    user_id: number;
    mrc_order_id: string;
    txn_id: number;
    ref_no: string | null;
    merchant_id: number;
    total_amount: number;
    description: string;
    items: any | null;
    url_success: string;
    url_detail: string;
    stat: 'c' | 'd' | 'p';  // complete, destroy, pending
    lang: string;
    type: string;
    bpm_id: string;
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
    auth_code: number | null;
    auth_time: string;
    ref_no: string | null;
    bpm_id: string;
    bank_ref_no: string;
    stat: 0 | 1 | 2;  // 0: pending, 1: success, 2: fail
    description: string;
    customer_email: string;
    customer_phone: string;
    created_at: string;
    updated_at: string;
    completed_at: string;
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
    dataToken?: BaoKimDataToken[];
    sign: string;
} 