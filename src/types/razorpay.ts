export interface RazorpayError {
  code?: string;
  message?: string;
  description?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  notes?: Record<string, string>;
}

export interface RazorpayTestOrderData {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    test: string;
    timestamp: string;
  };
}

export interface RazorpayTestOrder {
  id: string;
  [key: string]: unknown;
}