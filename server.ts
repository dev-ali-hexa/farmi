import 'dotenv/config';
import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { connectDB, seedDB, UserModel, ProductModel, OrderModel, ProjectModel } from './server/db.js';
import { DbUser, User, UserRole, ProductCategory, OrderStatus, ProjectStatus } from './src/types.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'furniture-rendering-secret';

interface CustomRequest extends express.Request {
  user?: User;
}

async function startServer() {
  await connectDB();
  await seedDB();

  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- Auth Middleware ---
  const requireAuth = async (req: CustomRequest, res: express.Response, next: express.NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Auth token required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User;
      const latestUser = await UserModel.findOne({ id: decoded.id }).lean();
      if (!latestUser) {
        res.status(401).json({ error: 'User registration not found' });
        return;
      }
      if (latestUser.isBlocked) {
        res.status(403).json({ error: 'This user account has been blocked by an administrator' });
        return;
      }
      req.user = {
        id: latestUser.id,
        email: latestUser.email,
        name: latestUser.name,
        role: latestUser.role,
        phone: latestUser.phone,
        address: latestUser.address,
        createdAt: latestUser.createdAt,
        isBlocked: !!latestUser.isBlocked,
      };
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid or expired auth token' });
    }
  };

  const requireRole = (roles: UserRole[]) => {
    return (req: CustomRequest, res: express.Response, next: express.NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: `Access forbidden for role: ${req.user.role}` });
        return;
      }
      next();
    };
  };

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // --- PHASE 1: AUTHENTICATION API ---
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role, phone, address } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const selectedRole: UserRole = role || 'customer';

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role: selectedRole,
      phone,
      address,
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    await UserModel.create(newUser);

    const publicUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      createdAt: newUser.createdAt,
    };

    const token = jwt.sign(publicUser, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: publicUser });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({ error: 'This user account has been blocked by an administrator.' });
      return;
    }

    const publicUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      isBlocked: !!user.isBlocked,
    };

    const token = jwt.sign(publicUser, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: publicUser });
  });

  app.get('/api/auth/me', requireAuth, (req: CustomRequest, res) => {
    res.json(req.user);
  });

  // --- PHASE 2: PRODUCT MANAGEMENT API ---
  app.get('/api/products', async (req, res) => {
    res.json(await ProductModel.find().lean());
  });

  app.post('/api/products', requireAuth, requireRole(['admin']), async (req, res) => {
    const { name, category, price, originalPrice, isOffer, description, images, stock } = req.body;
    if (!name || !category || price === undefined || price === null || !description || stock === undefined) {
      res.status(400).json({ error: 'All product fields are required' });
      return;
    }

    const newProd = {
      id: 'prod_' + Math.random().toString(36).substr(2, 9),
      name,
      category: category as ProductCategory,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      isOffer: !!isOffer,
      description,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600'],
      stock: Number(stock),
      createdAt: new Date().toISOString(),
    };

    await ProductModel.create(newProd);
    res.status(201).json(newProd);
  });

  app.put('/api/products/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    const { name, category, price, originalPrice, isOffer, description, images, stock } = req.body;
    const existing = await ProductModel.findOne({ id: req.params.id }).lean();

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updatedProd = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      category: category !== undefined ? category as ProductCategory : existing.category,
      price: price !== undefined ? Number(price) : existing.price,
      originalPrice: originalPrice !== undefined ? (originalPrice === null ? null : Number(originalPrice)) : existing.originalPrice,
      isOffer: isOffer !== undefined ? !!isOffer : existing.isOffer,
      description: description !== undefined ? description : existing.description,
      images: Array.isArray(images) ? images : existing.images,
      stock: stock !== undefined ? Number(stock) : existing.stock,
    };

    const saved = await ProductModel.findOneAndUpdate({ id: req.params.id }, updatedProd, { new: true }).lean();
    res.json(saved);
  });

  app.delete('/api/products/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    const deleted = await ProductModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted' });
  });

  // --- PHASE 3: CUSTOMER MANAGEMENT API ---
  app.get('/api/customers', requireAuth, requireRole(['admin']), async (req, res) => {
    const users = await UserModel.find().lean();
    const orders = await OrderModel.find().lean();
    // Return all users (customers, designers, admins) without password hashes, so admin can manage all of them
    const allUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      role: u.role,
      isBlocked: !!u.isBlocked,
      createdAt: u.createdAt,
      orderCount: orders.filter(o => o.customerId === u.id).length,
    }));
    res.json(allUsers);
  });

  // Customer Profile & Details
  app.get('/api/customers/:id', requireAuth, async (req: CustomRequest, res) => {
    if (req.user!.role !== 'admin' && req.user!.id !== req.params.id) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    const user = await UserModel.findOne({ id: req.params.id }).lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get order history as well
    const orders = await OrderModel.find({ customerId: req.params.id }).lean();
    const { passwordHash, ...safeUser } = user as any;

    res.json({
      user: safeUser,
      orders,
    });
  });

  app.put('/api/customers/:id', requireAuth, async (req: CustomRequest, res) => {
    if (req.user!.role !== 'admin' && req.user!.id !== req.params.id) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    const existingUser = await UserModel.findOne({ id: req.params.id }).lean();
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, phone, address, email, isBlocked, role } = req.body;

    const updatedUser: any = {
      ...existingUser,
      name: name !== undefined ? name : existingUser.name,
      phone: phone !== undefined ? phone : existingUser.phone,
      address: address !== undefined ? address : existingUser.address,
      email: email !== undefined ? email.toLowerCase() : existingUser.email,
    };

    if (req.user!.role === 'admin') {
      if (isBlocked !== undefined) {
        updatedUser.isBlocked = !!isBlocked;
      }
      if (role !== undefined) {
        updatedUser.role = role;
      }
    }

    await UserModel.findOneAndUpdate({ id: req.params.id }, updatedUser);
    const { passwordHash, ...publicUser } = updatedUser as any;
    res.json(publicUser);
  });

  // --- PHASE 4: ORDER MANAGEMENT API ---
  app.get('/api/orders', requireAuth, async (req: CustomRequest, res) => {
    if (req.user!.role === 'admin') {
      res.json(await OrderModel.find().lean());
    } else {
      // Customers retrieve their own orders
      res.json(await OrderModel.find({ customerId: req.user!.id }).lean());
    }
  });

  app.post('/api/orders', requireAuth, requireRole(['customer']), async (req: CustomRequest, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      res.status(400).json({ error: 'Order items and shipping address are required' });
      return;
    }

    const orderedItems = [];
    let totalAmount = 0;

    // Verify stock and fetch correct prices
    for (const reqItem of items) {
      const prod = await ProductModel.findOne({ id: reqItem.productId });
      if (!prod) {
        res.status(400).json({ error: `Product with ID ${reqItem.productId} not found` });
        return;
      }
      if ((prod.stock as number) < reqItem.quantity) {
        res.status(400).json({ error: `Insufficient stock for product "${prod.name}". Available: ${prod.stock}` });
        return;
      }

      orderedItems.push({
        productId: prod.id,
        name: prod.name,
        quantity: Number(reqItem.quantity),
        price: prod.price,
      });

      totalAmount += (prod.price as number) * Number(reqItem.quantity);

      // Decrement product stock
      prod.stock = (prod.stock as number) - Number(reqItem.quantity);
      await prod.save();
    }

    const newOrder = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      customerId: req.user!.id,
      customerName: req.user!.name,
      items: orderedItems,
      totalAmount,
      status: 'Pending' as OrderStatus,
      shippingAddress,
      paymentMethod: paymentMethod || 'Payment on Delivery',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await OrderModel.create(newOrder);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Order status is required' });
      return;
    }

    const updated = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      { status: status as OrderStatus, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(updated);
  });

  // --- PHASE 5: INTERIOR DESIGN PROJECTS API ---
  app.get('/api/projects', requireAuth, async (req: CustomRequest, res) => {
    if (req.user!.role === 'admin' || req.user!.role === 'designer') {
      res.json(await ProjectModel.find().lean());
    } else {
      // Customer sees only their projects
      res.json(await ProjectModel.find({ customerId: req.user!.id }).lean());
    }
  });

  app.post('/api/projects', requireAuth, requireRole(['customer']), async (req: CustomRequest, res) => {
    const { requestDetails, preferredStyle } = req.body;
    if (!requestDetails || !preferredStyle) {
      res.status(400).json({ error: 'Request details and preferred style are required' });
      return;
    }

    const newProject = {
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      customerId: req.user!.id,
      customerName: req.user!.name,
      email: req.user!.email,
      requestDetails,
      preferredStyle,
      status: 'Requested' as ProjectStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ProjectModel.create(newProject);
    res.status(201).json(newProject);
  });

  // Designer and admin update plans, status, upload links, etc
  app.put('/api/projects/:id', requireAuth, requireRole(['admin', 'designer']), async (req: CustomRequest, res) => {
    const project = await ProjectModel.findOne({ id: req.params.id }).lean();
    if (!project) {
      res.status(404).json({ error: 'Design project not found' });
      return;
    }

    const {
      status,
      planTitle,
      planDescription,
      estimatedCost,
      notes,
      designUrls,
    } = req.body;

    const updatedProject: any = {
      ...project,
      status: status !== undefined ? status as ProjectStatus : project.status,
      planTitle: planTitle !== undefined ? planTitle : project.planTitle,
      planDescription: planDescription !== undefined ? planDescription : project.planDescription,
      estimatedCost: estimatedCost !== undefined ? Number(estimatedCost) : project.estimatedCost,
      notes: notes !== undefined ? notes : project.notes,
      designUrls: Array.isArray(designUrls) ? designUrls : project.designUrls,
      updatedAt: new Date().toISOString(),
    };

    // If designer assigns themselves
    if (req.user!.role === 'designer') {
      updatedProject.designerId = req.user!.id;
      updatedProject.designerName = req.user!.name;
    }

    await ProjectModel.findOneAndUpdate({ id: req.params.id }, updatedProject);
    res.json(updatedProject);
  });

  // --- DASHBOARD ANALYTICS API ---
  app.get('/api/dashboard/stats', requireAuth, async (req: CustomRequest, res) => {
    const totalCustomers = await UserModel.countDocuments({ role: 'customer' });
    const orders = await OrderModel.find().lean();
    const totalProducts = await ProductModel.countDocuments();
    const projects = await ProjectModel.find().lean();

    const stats = {
      totalCustomers,
      totalOrders: orders.length,
      totalProducts,
      totalProjects: projects.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount as number), 0),
      ordersByStatus: {
        Pending: orders.filter(o => o.status === 'Pending').length,
        Processing: orders.filter(o => o.status === 'Processing').length,
        Shipped: orders.filter(o => o.status === 'Shipped').length,
        Delivered: orders.filter(o => o.status === 'Delivered').length,
      },
      projectsByStatus: {
        Requested: projects.filter(p => p.status === 'Requested').length,
        Assigned: projects.filter(p => p.status === 'Assigned').length,
        Planning: projects.filter(p => p.status === 'Planning').length,
        'In Progress': projects.filter(p => p.status === 'In Progress').length,
        Completed: projects.filter(p => p.status === 'Completed').length,
      },
      analyticsData: [
        { date: 'Mon', sales: 400, projects: 1 },
        { date: 'Tue', sales: 700, projects: 1 },
        { date: 'Wed', sales: 500, projects: 2 },
        { date: 'Thu', sales: 900, projects: 1 },
        { date: 'Fri', sales: 1300, projects: 3 },
        { date: 'Sat', sales: 1600, projects: 2 },
        { date: 'Sun', sales: 1200, projects: 2 },
      ]
    };

    res.json(stats);
  });

  // --- Vite Middleware integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
