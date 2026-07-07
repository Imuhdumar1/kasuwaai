export type SaleStatus = "paid" | "partially_paid" | "unpaid";
/** UI-only statuses derived from base status + due date. */
export type DebtStatus = SaleStatus | "overdue" | "scheduled";
export type RecordStatus = "active" | "archived";

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  business_category: string | null;
  market_location: string | null;
  state: string | null;
  lga: string | null;
  language: string;
  currency: string;
  notification_settings: Record<string, unknown>;
  logo_url: string | null;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  full_name: string;
  nickname: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  market: string | null;
  business_type: string | null;
  preferred_language: string | null;
  credit_limit: number;
  notes: string | null;
  photo_url: string | null;
  status: RecordStatus;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  category: string | null;
  sku: string | null;
  barcode: string | null;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  description: string | null;
  image_url: string | null;
  status: RecordStatus;
  created_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  customer_id: string | null;
  sale_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  profit: number;
  payment_method: string | null;
  due_date: string | null;
  notes: string | null;
  status: SaleStatus;
  source: "manual" | "voice";
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  line_total: number;
}

export interface Expense {
  id: string;
  business_id: string;
  amount: number;
  category: string | null;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  sale_id: string;
  customer_id: string | null;
  amount: number;
  method: string | null;
  reference_number: string | null;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

/** Sale joined with its customer + items (common read shape). */
export interface SaleWithRelations extends Sale {
  customer: Pick<Customer, "id" | "full_name" | "phone" | "whatsapp"> | null;
  sale_items: SaleItem[];
}

export const PAYMENT_METHODS = [
  "Cash",
  "Bank transfer",
  "POS",
  "Mobile money",
  "Bank deposit",
] as const;

export const BUSINESS_CATEGORIES = [
  "Foodstuff & Provisions",
  "Fashion & Clothing",
  "Electronics",
  "Cosmetics & Beauty",
  "Building Materials",
  "Pharmacy",
  "Agriculture",
  "Services",
  "Wholesale",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Restocking / Inventory",
  "Rent",
  "Transport / Fuel",
  "Salaries / Wages",
  "Electricity / Power",
  "Airtime / Data",
  "Utilities",
  "Repairs & Maintenance",
  "Taxes & Levies",
  "Other",
] as const;

export const PRODUCT_UNITS = [
  "unit",
  "piece",
  "bag",
  "carton",
  "dozen",
  "kg",
  "litre",
  "pack",
  "roll",
  "yard",
] as const;
