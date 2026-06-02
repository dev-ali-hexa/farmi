export type UserRole = 'admin' | 'designer' | 'customer';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  isBlocked?: boolean;
}

export interface DbUser extends User {
  passwordHash: string;
}

export type ProductCategory = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Office' | 'Outdoor' | 'Decor';

export interface Product extends BaseEntity {
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  images: string[];
  stock: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order extends BaseEntity {
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  updatedAt: string;
}

export type ProjectStatus = 'Requested' | 'Assigned' | 'Planning' | 'In Progress' | 'Completed';

export interface Project extends BaseEntity {
  customerId: string;
  customerName: string;
  email: string;
  requestDetails: string;
  preferredStyle: string;
  status: ProjectStatus;
  designerId?: string;
  designerName?: string;
  planTitle?: string;
  planDescription?: string;
  estimatedCost?: number;
  notes?: string;
  designUrls?: string[];
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AnalyticsDataPoint {
  date: string;
  sales: number;
  projects: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalProjects: number;
  totalRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  projectsByStatus: Record<ProjectStatus, number>;
  analyticsData: AnalyticsDataPoint[];
}
