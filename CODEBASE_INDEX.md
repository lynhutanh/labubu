# Labubu Cosmetics Platform - Codebase Index

## Project Overview
A full-stack e-commerce platform for cosmetics with three main applications:
- **User App**: Customer-facing Next.js frontend (Port 5002)
- **Admin App**: Admin dashboard Next.js frontend (Port 5003)
- **API**: NestJS backend (Port 5001)

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.6, React 19, TypeScript, Tailwind CSS, Zustand
- **Backend**: NestJS 10, MongoDB, Redis, Socket.io
- **Package Manager**: Yarn/npm
- **Build Tools**: TypeScript, ESLint, Prettier

### Key Dependencies
- **API**: Mongoose, BullMQ, SendGrid, Passport, Socket.io, Sharp, FFmpeg
- **Frontend**: Axios, React Hook Form, Socket.io-client, Framer Motion, Lucide React
- **Auth**: Google OAuth, Facebook Login, JWT

---

## Directory Structure

```
labubu/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── kernel/              # Core infrastructure
│   │   ├── lib/                 # Utilities & helpers
│   │   ├── modules/             # Feature modules
│   │   ├── app.module.ts        # Root module
│   │   └── main.ts              # Entry point
│   ├── migrations/              # Database migrations
│   ├── scripts/                 # Build & seed scripts
│   └── dist/                    # Compiled output
│
├── admin/                        # Admin Dashboard (Next.js)
│   ├── pages/                   # Page routes
│   │   ├── login.tsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── users/
│   │   ├── settings/
│   │   ├── chat/
│   │   └── refund-requests/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── interfaces/          # TypeScript interfaces
│   │   └── utils/
│   └── style/
│
├── user/                         # User App (Next.js)
│   ├── pages/                   # Page routes
│   │   ├── login/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── profile/
│   │   ├── wishlist/
│   │   ├── tracking/
│   │   └── contact/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom React hooks
│   │   ├── interfaces/          # TypeScript interfaces
│   │   ├── lib/                 # Utilities
│   │   └── utils/
│   ├── public/
│   │   └── lang/                # i18n translations (en, vi)
│   └── style/
│
└── ecosystem.config.js          # PM2 configuration
```

---

## API Modules (`api/src/modules/`)

### 1. **Auth Module** (`auth/`)
- **Purpose**: Authentication & authorization
- **Key Files**:
  - `controllers/`: Login, Google OAuth, Facebook OAuth, Forgot Password
  - `services/auth.service.ts`: Core auth logic
  - `guards/`: JWT authentication guards
  - `decorators/`: Custom decorators (@Auth, @CurrentUser)
  - `schemas/`: User schema definition
- **Features**: JWT tokens, OAuth integration, password reset

### 2. **User Module** (`user/`)
- **Purpose**: User management & profiles
- **Key Files**:
  - `controllers/`: User CRUD, Address management
  - `services/user.service.ts`, `address.service.ts`
  - `schemas/`: User & Address schemas
  - `validators/username.validator.ts`
- **Features**: Profile management, address book, user validation

### 3. **Products Module** (`products/`)
- **Purpose**: Product catalog management
- **Key Files**:
  - Controllers for product CRUD operations
  - Product schema & models
  - Image processing with Sharp
- **Features**: Product listings, filtering, image optimization

### 4. **Category Module** (`category/`)
- **Purpose**: Product categories
- **Features**: Category CRUD, hierarchical organization

### 5. **Brand Module** (`brand/`)
- **Purpose**: Brand management
- **Key Files**:
  - Controllers, services, schemas
  - Event listeners for brand updates
- **Features**: Brand CRUD, brand-product relationships

### 6. **Orders Module** (`orders/`)
- **Purpose**: Order management & fulfillment
- **Key Files**:
  - `services/`:
    - `admin-order.service.ts`: Admin order operations
    - `buyer-order.service.ts`: Customer order operations
    - `refund-request.service.ts`: Refund handling
    - `ghn-order-sync.service.ts`: GHN shipping integration
  - `controllers/`: Admin & buyer order endpoints
  - `schemas/`: Order & Refund Request schemas
- **Features**: Order creation, tracking, refunds, GHN shipping sync

### 7. **Payment Module** (`payment/`)
- **Purpose**: Payment processing & wallet management
- **Key Files**:
  - `services/`:
    - `paypal.service.ts`: PayPal integration
    - `sepay.service.ts`: SePay integration
    - `wallet.service.ts`: Wallet management
    - `wallet-deposit.service.ts`: Deposit handling
    - `ghn.service.ts`: GHN shipping costs
  - `controllers/`: Payment endpoints, webhooks
  - `helpers/paypal.helper.ts`
- **Features**: Multiple payment gateways, wallet system, shipping cost calculation

### 8. **Chat Module** (`chat/`)
- **Purpose**: Real-time messaging
- **Key Files**:
  - `gateways/chat.gateway.ts`: WebSocket gateway
  - `services/message.service.ts`
  - `schemas/message.schema.ts`
- **Features**: Real-time chat, message persistence

### 9. **Email Module** (`email/`)
- **Purpose**: Email notifications
- **Key Files**:
  - `services/email.service.ts`
  - `services/sendgrid.service.ts`: SendGrid integration
- **Features**: Transactional emails, SendGrid integration

### 10. **Settings Module** (`settings/`)
- **Purpose**: Application configuration
- **Features**: Admin settings management

### 11. **File Module** (`file/`)
- **Purpose**: File upload & management
- **Features**: Multer integration, file storage

### 12. **Cart Module** (`cart/`)
- **Purpose**: Shopping cart management
- **Features**: Cart operations (add, remove, update)

### 13. **Wishlist Module** (`wishlist/`)
- **Purpose**: User wishlists
- **Features**: Wishlist CRUD operations

### 14. **WebSocket Module** (`websocket/`)
- **Purpose**: Real-time communication
- **Key Files**:
  - `socket.module.ts`: Socket.io setup
  - `redis-io.adapter.ts`: Redis adapter for scaling
- **Features**: Real-time notifications, chat

### 15. **SendGrid Module** (`sendgrid/`)
- **Purpose**: Email service provider
- **Features**: Email sending via SendGrid

### 16. **Voucher Module** (`voucher/`)
- **Purpose**: Discount vouchers & promotions
- **Key Files**:
  - `controllers/`: Voucher CRUD, validation
  - `services/voucher.service.ts`: Core voucher logic
  - `schemas/`: Voucher schema definition
- **Features**: Create/update vouchers, apply discount codes, validity checks

---

## Kernel Infrastructure (`api/src/kernel/`)

### Common
- `pageable-data.ts`: Pagination utilities
- `search-request.ts`: Search request handling

### Events
- `event.ts`: Base event class
- `queue-event.ts`: Queue event handling

### Exceptions
- Custom exception classes (EntityNotFound, Forbidden, MissingServerConfig, RuntimeException)

### Helpers
- `multer.helper.ts`: File upload configuration
- `string.helper.ts`: String utilities
- `view.helper.ts`: View rendering

### Infrastructure
- `mongodb/`: MongoDB connection setup
- `queue/`: BullMQ queue configuration

### Logger
- Request/response logging
- HTTP exception logging

### Models
- `data-response.model.ts`: Standard API response format

---

## Frontend Applications

### Admin App (`admin/`)

**Pages**:
- `login.tsx`: Admin authentication
- `dashboard/`: Dashboard overview
- `products/create.tsx`: Product creation
- `categories/update/[id].tsx`: Category management
- `orders/[id].tsx`: Order details
- `users/`: User management
- `settings/`: Application settings
- `chat/`: Admin chat interface
- `refund-requests/`: Refund management

**Components**:
- `layout/`: AdminLayout, Sidebar
- `common/`: DataTable, shared components
- `settings/`: GhnSenderAddress, SettingFormItem
- `users/`: UserEditModal

**Services**:
- `auth.service.ts`: Authentication
- `api-request.ts`: HTTP client
- `user.service.ts`: User operations
- `order.service.ts`: Order operations
- `product.service.ts`: Product operations
- `wallet.service.ts`: Wallet operations
- `ghn.service.ts`: GHN shipping
- `chat.service.ts`: Chat operations
- `refund-request.service.ts`: Refund handling

### User App (`user/`)

**Pages**:
- `login/`: User authentication
- `products/`: Product listing & detail
- `cart/`: Shopping cart
- `checkout/`: Checkout process
- `profile/`: User profile, orders, wallet, addresses, coupons
- `wishlist/`: Saved items
- `tracking/`: Order tracking
- `contact/`: Contact form

**Components**:
- `layout/`: Header, Footer, Layout, ProfileLayout
- `products/`: ProductCard, ProductFilters (Brand, Category, PriceRange)
- `chat/`: ChatBubble
- `order/`: TrackingModal
- `common/`: LanguageSwitcher

**Services**:
- `auth.service.ts`: Authentication
- `api-request.ts`: HTTP client
- `user.service.ts`: User profile
- `product.service.ts`: Product data
- `cart.service.ts`: Cart operations
- `order.service.ts`: Order management
- `wishlist.service.ts`: Wishlist operations
- `wallet.service.ts`: Wallet operations
- `wallet-deposit.service.ts`: Deposit handling
- `address.service.ts`: Address management
- `category.service.ts`: Category data
- `brand.service.ts`: Brand data
- `chat.service.ts`: Chat operations
- `ghn.service.ts`: Shipping operations
- `setting.service.ts`: Settings

**Hooks**:
- `useAddToCart.ts`: Add to cart logic
- `useWishlist.ts`: Wishlist operations
- `useTrans.ts`: Translation/i18n

**Internationalization** (`public/lang/`):
- English (`en/`): checkout, contact, footer, home, login, order, productDetail, products, profile, wishlist, cart
- Vietnamese (`vi/`): Same structure

---

## Configuration Files

### API Config (`api/src/config/`)
- `app.ts`: Application settings
- `email.ts`: Email configuration
- `file.ts`: File upload settings
- `ghn.ts`: GHN shipping API config
- `image.ts`: Image processing settings
- `queue.ts`: BullMQ queue config
- `redis.ts`: Redis connection config
- `sepay.ts`: SePay payment config

### Build & Scripts
- `api/migrate.js`: Database migration runner
- `api/scripts/`:
  - `check-migrate.js`: Migration status check
  - `copy-public.js`: Copy public assets
  - `seed-contact-settings.js`: Seed initial settings

### Database Migrations (`api/migrations/`)
- `1735800000000-site-settings.js`: Initial settings
- `1767111863549-create-categories.js`: Category schema
- `1768097821936-create-sample-products.js`: Sample data
- `1769001000000-delete-contact-ghn-address.js`
- `1769002000000-add-ghn-sender-settings.js`
- `1769003000000-fix-ghn-sender-settings-and-delete-contact-district.js`
- `1769004000000-delete-all-categories.js`
- `1770000000000-add-admin-change-password-settings.js`
- `1780000000010-add-sepay-second-account-settings.js`
- `1780000000030-update-order-payment-status.js`

---

## Key Features

### E-Commerce
- Product catalog with filtering (category, brand, price)
- Shopping cart & checkout
- Multiple payment methods (PayPal, SePay)
- Order management & tracking
- Refund requests

### User Management
- User registration & authentication (Email, Google, Facebook)
- Profile management
- Address book
- Wishlist
- Wallet system with deposits

### Admin Features
- Dashboard
- Product management
- Category management
- Order management & fulfillment
- User management
- Refund request handling
- Settings configuration
- Chat with users

### Shipping Integration
- GHN (Giao Hàng Nhanh) integration
- Real-time shipping cost calculation
- Order sync with GHN

### Payment Integration
- PayPal
- SePay
- Wallet system

### Communication
- Real-time chat (WebSocket)
- Email notifications (SendGrid)

### Localization
- English & Vietnamese support
- i18n implementation

---

## Development Commands

### API
```bash
yarn dev              # Start dev server (port 5001)
yarn build            # Build for production
yarn start:prod       # Run production build
yarn migrate          # Run database migrations
yarn seed:contact     # Seed contact settings
yarn lint             # Fix linting issues
yarn format           # Format code
```

### Admin App
```bash
yarn dev              # Start dev server (port 5003)
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Fix linting issues
yarn format           # Format code
yarn type-check       # Check TypeScript types
```

### User App
```bash
yarn dev              # Start dev server (port 5002)
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Fix linting issues
yarn format           # Format code
yarn type-check       # Check TypeScript types
```

---

## Database Schema Overview

### Core Collections
- **Users**: User profiles, authentication
- **Products**: Product catalog
- **Categories**: Product categories
- **Brands**: Product brands
- **Orders**: Customer orders
- **Refund Requests**: Refund management
- **Messages**: Chat messages
- **Addresses**: User addresses
- **Wallet Transactions**: Payment wallet history
- **Settings**: Application configuration

---

## Integration Points

### External Services
1. **PayPal**: Payment processing
2. **SePay**: Vietnamese payment gateway
3. **GHN**: Vietnamese shipping provider
4. **SendGrid**: Email service
5. **Google OAuth**: Social authentication
6. **Facebook OAuth**: Social authentication

### Internal Services
- Redis: Caching, session management, queue
- MongoDB: Primary database
- Socket.io: Real-time communication
- BullMQ: Job queue processing

---

## Notes
- Platform supports Vietnamese & English languages
- Real-time features via WebSocket (chat, notifications)
- Scalable architecture with Redis adapter for Socket.io
- Image optimization with Sharp
- Video processing with FFmpeg
- PM2 ecosystem configuration for deployment

