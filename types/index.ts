// Enums
export enum Customer {
  GreenTech = 'GreenTech Solutions',
  EarthMover = 'EarthMover Equipment',
  PowerTools = 'PowerTools Pro'
}

export enum ProductCategory {
  WoodChipper = 'Wood Chipper',
  Bucket = 'Bucket',
  StumpGrinder = 'Stump Grinder',
  Backhoe = 'Backhoe',
  Excavator = 'Excavator',
  SpareParts = 'Spare Parts'
}

export enum Carrier {
  FedEx = 'FedEx',
  UPS = 'UPS',
  USPS = 'USPS',
  DHL = 'DHL',
  XPO = 'XPO',
  YRC = 'YRC',
  OldDominion = 'Old Dominion',
  RoadRunner = 'Road Runner',
  Custom = 'Custom'
}

// Base interfaces with Supabase timestamps
interface BaseModel {
  created_at: string;
  updated_at: string;
}

// Customer related types
export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploaded_at: string;
}

export interface Customer extends BaseModel {
  id: string;
  name: string;
  code: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  documents: CustomerDocument[];
  active: boolean;
}

// Product related types
export interface ProductCategory extends BaseModel {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  primary: boolean;
}

export interface Product extends BaseModel {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  customer_id: string;
  description?: string;
  dimensions?: string;
  weight?: number;
  images: ProductImage[];
  active: boolean;
}

// Storage and location types
export interface StorageLocation extends BaseModel {
  id: string;
  name: string;
  code: string;
  type: string;
  capacity: number;
  occupied: number;
  active: boolean;
}

export interface InventoryItem extends BaseModel {
  id: string;
  product_id: string;
  location_id?: string;
  qty_on_hand: number;
  qty_allocated: number;
  qty_received: number;
  date_received?: string;
  qty_shipped: number;
  date_shipped?: string;
  storage_rate: number;
  last_audit_date?: string;
}

// Movement and attachment types
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  upload_date: string;
}

export interface InventoryMovement extends BaseModel {
  id: string;
  inventory_item_id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantity: number;
  reference_number?: string;
  carrier?: string;
  tracking_number?: string;
  date: string;
  notes?: string;
  attachments: Attachment[];
  created_by: string;
}

// Rate and billing types
export interface StorageRate extends BaseModel {
  id: string;
  product_id: string;
  rate: number;
  effective_date: string;
  end_date?: string;
}

export interface RateSchedule extends BaseModel {
  id: string;
  customer_id: string;
  name: string;
  description?: string;
  active: boolean;
  effective_date: string;
  end_date?: string;
  rates: Record<string, number>;
}

export interface BillingCycle extends BaseModel {
  id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'processed' | 'paid';
  total_amount: number;
  storage_charges: number;
  outbound_charges: number;
  additional_charges: number;
  notes?: string;
}

// Audit related types
export interface AuditItem {
  id: string;
  audit_id: string;
  product_id: string;
  expected_qty: number;
  actual_qty: number;
  notes?: string;
}

export interface Audit extends BaseModel {
  id: string;
  customer_id?: string;
  status: 'in_progress' | 'completed';
  date: string;
  performed_by: string;
  notes?: string;
  items_count: number;
  discrepancies_count: number;
  items?: AuditItem[];
}

// Report and notification types
export interface ReportTemplate extends BaseModel {
  id: string;
  name: string;
  description?: string;
  type: string;
  template: any;
}

export interface GeneratedReport extends BaseModel {
  id: string;
  template_id?: string;
  customer_id?: string;
  name: string;
  type: string;
  parameters?: any;
  file_path?: string;
  status: 'pending' | 'completed' | 'failed';
  generated_by: string;
}

export interface NotificationSetting extends BaseModel {
  id: string;
  customer_id?: string;
  type: string;
  enabled: boolean;
  recipients: string[];
}

// System settings
export interface SystemSetting extends BaseModel {
  id: string;
  key: string;
  value: any;
  description?: string;
}