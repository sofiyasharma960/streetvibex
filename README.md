# 🖤 StreetVibeX — Full Stack E-Commerce Platform

> **Born in BLR. Designed for the bold.**  
> A production-grade streetwear e-commerce platform built from scratch in 10 days.

🔗 **Live Demo:** [streetvibex.vercel.app](https://streetvibex.vercel.app)  
👤 **Author:** [@sofiyasharma960](https://github.com/sofiyasharma960)


---

## ✨ Features

### 🛍️ Shopping Experience
- Browse products with category filters (All, Graphic Tee, Shirt)
- Real-time search across the product catalog
- Smooth animations powered by Framer Motion + Lenis scroll
- Product detail pages with image gallery
- Size selection and stock availability display

### 🛒 Cart & Checkout
- Persistent cart with drawer UI
- Wishlist functionality
- Full checkout flow with address and order summary
- **Razorpay payment gateway** integration (real payments)
- Razorpay webhook for secure payment verification

### 🔐 Authentication
- JWT-based user authentication
- Signup / Login with protected routes
- Admin role with separate middleware protection

### 👑 Admin Panel
- Add, edit, and delete products
- Upload product images
- Manage inventory and stock count
- View and manage all orders

### 📦 Orders
- Order confirmation page
- Order history per user
- Email notifications via Nodemailer

### 🛡️ Security
- Helmet.js for HTTP security headers
- Rate limiting (100 req / 15 min per IP)
- CORS protection with whitelist
- Trust proxy configuration for Render deployment
- Raw body parsing for Razorpay webhook signature verification

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| Lenis | Smooth scroll |
| React Router v6 | Client-side routing |
| Context API | Global state (auth, cart) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database and ODM |
| JWT | Authentication tokens |
| Razorpay SDK | Payment processing |
| Nodemailer | Email notifications |
| Helmet | Security headers |
| express-rate-limit | DDoS protection |

### DevOps & Deployment
| Service | Usage |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 📁 Project Structure

```
streetvibex/
├── frontend/
│   ├── public/
│   │   └── sw.js                  # Service worker
│   └── src/
│       ├── components/
│       │   ├── CartDrawer.jsx
│       │   ├── Marquee.jsx
│       │   ├── Navbar.jsx
│       │   ├── WhatsAppButton.jsx
│       │   └── WishlistButton.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── OrderConfirmPage.jsx
│       │   ├── OrderHistoryPage.jsx
│       │   ├── AdminPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── config/
    │   └── razorpay.js
    ├── controllers/
    │   └── productController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── adminAuth.js
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── Review.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   └── reviewRoutes.js
    ├── utils/
    │   └── sendEmail.js
    ├── app.js
    ├── server.js
    └── seed.js
```

---

## 🔌 API Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login and get JWT | ❌ |
| GET | `/me` | Get current user profile | ✅ |

### Product Routes — `/api/products`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all products | ❌ |
| GET | `/:id` | Get single product | ❌ |
| POST | `/` | Create product | ✅ Admin |
| PUT | `/:id` | Update product | ✅ Admin |
| DELETE | `/:id` | Delete product | ✅ Admin |

### Order Routes — `/api/orders`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create new order | ✅ |
| GET | `/myorders` | Get user's orders | ✅ |
| POST | `/webhook` | Razorpay webhook | ❌ (signature verified) |

### Review Routes — `/api/reviews`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/:productId` | Add review | ✅ |
| GET | `/:productId` | Get product reviews | ❌ |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server + DB status |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test mode)

### 1. Clone the repo

```bash
git clone https://github.com/sofiyasharma960/streetvibex.git
cd streetvibex
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_SECRET_KEY=your_admin_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_ADMIN_KEY=your_admin_key
```

```bash
npm run dev
```

### 4. Seed the database (optional)

```bash
cd backend
node seed.js
```

---

## 🚀 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variables in Vercel project settings:
   - `VITE_API_URL`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_ADMIN_KEY`

### Backend → Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Set environment variables in Render dashboard
4. Add `FRONTEND_URL=https://your-vercel-url.vercel.app`

---

## 🔒 Security Notes

- All admin routes are protected via `adminAuth` middleware
- Razorpay webhook uses raw body + signature verification
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Rate limiting applied globally to `/api/` routes
- CORS restricted to known frontend origins only

---

## 🛣️ Roadmap

- [ ] Product image upload via Cloudinary
- [ ] Size chart modal
- [ ] Coupon/discount code system
- [ ] Admin dashboard with sales analytics
- [ ] Instagram feed integration
- [ ] PWA offline support

---

## 📄 License

This project is for portfolio and educational purposes.  
© 2026 StreetVibeX • Bengaluru • All Rights Reserved

---

<p align="center">Built with 🖤 in Bengaluru</p>
