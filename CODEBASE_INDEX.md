# Labubu Codebase Index

## Overview
Labubu is a full-stack commerce platform split into three apps:

- `api/`: NestJS backend on port `5001`
- `user/`: customer-facing Next.js app on port `5002`
- `admin/`: admin Next.js app on port `5003`

The repo mixes `npm` and `yarn` lockfiles, but each app defines its own scripts in `package.json`.

## Quick Start

### Root
- `README.md`: very short startup note
- `ecosystem.config.js`: PM2 process definitions
- `SEPAY_INTEGRATION.md`: payment integration notes

### App Commands
- API: `cd api && npm run dev`
- User app: `cd user && npm run dev`
- Admin app: `cd admin && npm run dev`

## High-Level Architecture

### Backend
- Framework: NestJS 10
- Database: MongoDB with Mongoose
- Caching / queue infra: Redis + BullMQ
- Realtime: Socket.io
- Static files: served from `api/public`
- Payments: wallet, PayPal, SePay, ZaloPay, GHN shipping support

### Frontend
- Framework: Next.js 15.3.6 with React 19
- Styling: Tailwind CSS
- State / UX libs: Zustand, React Hook Form, Framer Motion
- Transport: Axios + Socket.io client

## Repository Layout

```text
labubu/
  api/                    NestJS backend
    src/
      app.module.ts       Root module wiring
      main.ts             API bootstrap
      config/             Env-backed config loaders
      kernel/             Shared infra, queue, mongodb, helpers, exceptions
      modules/            Feature modules
    migrations/           Data and settings migrations
    scripts/              Seed and maintenance scripts
    public/               Uploaded and served assets

  user/                   Customer storefront
    pages/                Next.js pages router
    src/components/       UI building blocks
    src/services/         API client layer
    src/hooks/            Custom hooks
    public/lang/          i18n dictionaries (en, vi)

  admin/                  Admin dashboard
    pages/                Next.js pages router
    src/components/       Admin UI components
    src/services/         API client layer
    src/interfaces/       Shared admin types
```

## Backend Entry Points

### Core Files
- `api/src/main.ts`: Nest bootstrap
- `api/src/app.module.ts`: imports all feature modules and infra
- `api/src/config/*.ts`: app, file, email, image, queue, redis, sepay, ghn config
- `api/src/kernel/`: shared platform code

### Kernel Areas
- `api/src/kernel/infras/mongodb/`: Mongo wiring
- `api/src/kernel/infras/queue/`: queue registration and workers
- `api/src/kernel/logger/`: request and exception logging
- `api/src/kernel/common/`: pagination and search request helpers
- `api/src/kernel/exceptions/`: custom exception types

## Backend Modules

### Commerce Core
- `auth/`: login, registration, password reset, social auth, guards, decorators
- `user/`: user profiles, addresses, admin user management
- `products/`: product CRUD, public catalog, product search/filtering
- `category/`: category CRUD and related listeners/helpers
- `brand/`: brand CRUD and cleanup listeners
- `cart/`: cart retrieval and cart item mutations
- `orders/`: buyer/admin order flows, refund requests, GHN sync
- `voucher/`: voucher CRUD and customer voucher usage

### Payments and Wallet
- `payment/`: wallet, wallet deposits, transactions, PayPal, SePay, ZaloPay, GHN helper endpoints

### Engagement / Live Features
- `wishlist/`: wishlist APIs
- `chat/`: message persistence and websocket chat
- `websocket/`: socket module and Redis socket adapter
- `email/`: email orchestration
- `sendgrid/`: SendGrid integration service

### Game / Loyalty Features
- `member-rank/`: membership ranks and rank APIs
- `spin/`: spin-wheel configs and results
- `slot-machine/`: slot machine configs and results
- `pet/`: pet system, user pet progress, leaderboard-related APIs

### Platform Support
- `settings/`: admin-managed application settings
- `file/`: uploads, file DTOs, interceptors, thumbnail support

## Frontend: User App

### Main Route Areas
- `user/pages/index.tsx`: storefront home
- `user/pages/products/`: product listing and product detail
- `user/pages/cart/`: cart flow
- `user/pages/checkout/`: checkout flow
- `user/pages/orders/`: order list and order detail
- `user/pages/profile/`: profile, address, wallet, coupons, order history
- `user/pages/login/`: login, forgot password, reset password
- `user/pages/wishlist/`: wishlist page
- `user/pages/contact/`: contact page
- `user/pages/tracking.tsx`: order tracking
- `user/pages/spin/`: spin-wheel experience
- `user/pages/slot-machine/`: slot machine experience
- `user/pages/pet-farm/`: pet feature
- `user/pages/pet-leaderboard/`: pet ranking page

### Important Source Areas
- `user/src/components/layout/`: shared shell components
- `user/src/components/products/`: cards and filters
- `user/src/components/common/`: floating widgets, breadcrumb, popup, language switcher
- `user/src/services/`: one service file per backend domain
- `user/src/hooks/`: cart, wishlist, translation helpers
- `user/public/lang/`: English and Vietnamese copy dictionaries

## Frontend: Admin App

### Main Route Areas
- `admin/pages/index.tsx`: admin landing page
- `admin/pages/login.tsx`: admin auth
- `admin/pages/dashboard/`: dashboard
- `admin/pages/products/`: product create, update, list
- `admin/pages/categories/`: category management
- `admin/pages/orders/`: order management and detail
- `admin/pages/users/`: user management
- `admin/pages/vouchers/`: voucher management
- `admin/pages/settings/`: settings UI
- `admin/pages/chat/`: admin chat
- `admin/pages/refund-requests/`: refund workflow
- `admin/pages/memberships/`: membership rank management
- `admin/pages/spin/`: spin config and results
- `admin/pages/slot-machine/`: slot machine config and results
- `admin/pages/pet/`: pet settings and guide
- `admin/pages/notification/`: notification page

### Important Source Areas
- `admin/src/components/layout/`: admin shell and sidebar
- `admin/src/components/common/DataTable.tsx`: reusable table UI
- `admin/src/components/settings/`: settings form sections
- `admin/src/components/users/UserEditModal.tsx`: user editing modal
- `admin/src/services/`: backend domain service wrappers

## Migrations and Scripts

### Migrations
`api/migrations/` contains timestamped scripts for:
- seeded admin and site settings
- category and sample product data
- GHN sender/contact adjustments
- member rank seeding
- payment-related setting updates
- order payment status updates

### Scripts
`api/scripts/` includes operational helpers such as:
- seeding ranks and contact settings
- syncing user total spent
- updating user rank
- voucher/app-module fixes
- migration checks

## Practical Navigation Tips

- Start backend feature work in `api/src/modules/<feature>/`.
- For frontend screens, begin in `pages/` and then trace into `src/components/` and `src/services/`.
- API client files in both frontends are organized by backend domain name, which makes cross-referencing straightforward.
- Shared business rules often appear in backend `services/`, while request validation lives in `payloads/` or `dtos/`.

## Current Notes

- `admin/yarn.lock` and `user/yarn.lock` already have local modifications in the working tree.
- The previous index file was stale and did not reflect newer modules such as `member-rank`, `spin`, `slot-machine`, and `pet`.
