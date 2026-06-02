import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DbUser, Product, Order, Project, UserRole, ProductCategory, OrderStatus, ProjectStatus } from '../src/types.js';

// --- MongoDB Connection setup ---
export const connectDB = async () => {
  try {
    // Default to local mongodb if MONGODB_URI is not set
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/furnidesign';
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Exit process with failure
  }
};

// --- Mongoose Schemas ---

// User Schema
const userSchema = new mongoose.Schema<DbUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'designer', 'customer'], default: 'customer', required: true },
  phone: String,
  address: String,
  createdAt: { type: String, required: true },
  updatedAt: String,
  passwordHash: { type: String, required: true },
  isBlocked: { type: Boolean, default: false }
});

// Product Schema
const productSchema = new mongoose.Schema<Product>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Outdoor', 'Decor'], required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [String],
  stock: { type: Number, required: true },
  createdAt: { type: String, required: true },
  updatedAt: String
});

// Order Item Schema (sub-document for Order)
const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false }); // Do not create a separate _id for sub-documents

// Order Schema
const orderSchema = new mongoose.Schema<Order>({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending', required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
});

// Project Schema
const projectSchema = new mongoose.Schema<Project>({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  requestDetails: { type: String, required: true },
  preferredStyle: { type: String, required: true },
  status: { type: String, enum: ['Requested', 'Assigned', 'Planning', 'In Progress', 'Completed'], default: 'Requested', required: true },
  designerId: String,
  designerName: String,
  planTitle: String,
  planDescription: String,
  estimatedCost: Number,
  notes: String,
  designUrls: [String],
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
});

// --- Models ---
export const UserModel = mongoose.model<DbUser>('User', userSchema);
export const ProductModel = mongoose.model<Product>('Product', productSchema);
export const OrderModel = mongoose.model<Order>('Order', orderSchema);
export const ProjectModel = mongoose.model<Project>('Project', projectSchema);

export const seedDB = async () => {
  const count = await UserModel.countDocuments();
  if (count === 0) {
    console.log('Seeding initial Admin account in MongoDB...');
    const salt = bcrypt.genSaltSync(10);
    await UserModel.create([
      {
        id: 'usr_admin', email: 'admin@gmail.com', name: 'System Admin',
        role: 'admin', phone: '+1 (555) 0199', address: 'Corporate Headquarters, NY',
        createdAt: new Date().toISOString(), passwordHash: bcrypt.hashSync('admin123', salt),
      }
    ]);
    console.log('MongoDB successfully seeded!');
  }
};
