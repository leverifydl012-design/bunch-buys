// Core Types for FBA Wholesale Management

export type UserRole = 'admin' | 'manager' | 'purchasing' | 'warehouse' | 'accounting' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  user?: User;
}

export interface Warehouse {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactEmail: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  title: string;
  brand: string;
  createdAt: string;
}

export interface SKU {
  id: string;
  productId: string;
  sku: string;
  asin?: string;
  fnsku?: string;
  cost: number;
  createdAt: string;
  product?: Product;
}

export interface Inventory {
  id: string;
  skuId: string;
  warehouseId: string;
  quantity: number;
  updatedAt: string;
  sku?: SKU;
  warehouse?: Warehouse;
}

export type POStatus = 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  supplierId: string;
  status: POStatus;
  totalCost: number;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  skuId: string;
  quantity: number;
  unitCost: number;
  sku?: SKU;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  approvedBy?: string;
  status: ApprovalStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodEnd: string;
}
