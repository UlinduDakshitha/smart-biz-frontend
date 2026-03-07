# SmartBiz Frontend

> React + Vite + Tailwind CSS — AI-Powered Business Management Suite

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Running the Application](#running-the-application)
7. [Environment & Proxy Config](#environment--proxy-config)
8. [Authentication Flow](#authentication-flow)
9. [Forgot Password — 3-Step OTP Flow](#forgot-password--3-step-otp-flow)
10. [Routing Architecture](#routing-architecture)
11. [Pages Reference](#pages-reference)
12. [Components Reference](#components-reference)
13. [API Service Layer](#api-service-layer)
14. [Styling System](#styling-system)
15. [State Management](#state-management)
16. [Production Build](#production-build)
17. [Deployment](#deployment)

---

## Overview

SmartBiz Frontend is a single-page application (SPA) built with React 18 and Vite. It provides a clean, professional interface for two types of users:

- **Business Owners** — Manage customers, suppliers, products, invoices, and expenses. Use the AI assistant for insights, emails, and marketing content.
- **Administrators** — Manage all registered businesses, subscription plans, and view AI usage logs across the platform.

Both roles use the **same login page** — the frontend reads the `role` field from the JWT response and redirects automatically to the appropriate dashboard.

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| Vite | 5.1.3 | Build tool and dev server |
| React Router DOM | 6.22.0 | Client-side routing |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| Axios | 1.6.7 | HTTP client for API calls |
| React Hot Toast | 2.4.1 | Toast notifications |
| Lucide React | 0.344.0 | Icon library |
| Recharts | 2.12.2 | Dashboard charts |
| date-fns | 3.3.1 | Date formatting |
| Google Fonts | — | DM Sans, Syne, JetBrains Mono |

---

## Project Structure

```
frontend/
├── index.html                        ← Entry HTML (loads Google Fonts)
├── vite.config.js                    ← Vite config + API proxy to :8080
├── tailwind.config.js                ← Custom colours, fonts, shadows
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                      ← React DOM root mount
    ├── App.jsx                       ← Router, route guards, all routes defined here
    ├── index.css                     ← Tailwind directives + custom component classes
    │
    ├── context/
    │   └── AuthContext.jsx           ← Global auth state (user, login, logout)
    │
    ├── services/
    │   └── api.js                    ← All Axios calls grouped by resource
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx            ← Business sidebar + <Outlet>
    │   │   └── AdminLayout.jsx       ← Admin sidebar + <Outlet>
    │   └── ui/
    │       ├── CrudTable.jsx         ← Reusable search + paginated table
    │       └── Modal.jsx             ← Overlay modal with backdrop
    │
    └── pages/
        ├── auth/
        │   ├── Login.jsx             ← Unified login (admin + business)
        │   ├── Register.jsx          ← Business registration
        │   └── ForgotPassword.jsx    ← 3-step OTP flow
        │
        ├── dashboard/
        │   └── Dashboard.jsx         ← KPIs, charts, recent invoices
        │
        ├── customers/
        │   └── Customers.jsx
        │
        ├── suppliers/
        │   └── Suppliers.jsx
        │
        ├── products/
        │   └── Products.jsx          ← Includes low-stock badge
        │
        ├── expenses/
        │   └── Expenses.jsx          ← Running total card
        │
        ├── invoices/
        │   ├── Invoices.jsx          ← List + create invoice modal
        │   └── InvoiceDetail.jsx     ← Printable invoice view
        │
        ├── ai/
        │   └── AiAssistant.jsx       ← 4 AI features with real-time generation
        │
        └── admin/
            ├── AdminDashboard.jsx    ← Platform-wide stats
            ├── AdminBusinesses.jsx   ← List and delete businesses
            ├── AdminSubscriptions.jsx← CRUD for subscription plans
            └── AdminAiUsage.jsx      ← AI request logs across all businesses
```

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm 9+** (bundled with Node.js) or **yarn**
- The **SmartBiz Backend** running on `http://localhost:8080`

---

## Installation & Setup

```bash
# Navigate to frontend directory
cd smartbiz/frontend

# Install all dependencies
npm install
```

No `.env` file is needed for development — the Vite proxy handles API routing automatically (see [Environment & Proxy Config](#environment--proxy-config)).

---

## Running the Application

### Development server

```bash
npm run dev
```

The app runs on **http://localhost:3000** and hot-reloads on every file save.

All `/api/...` requests are automatically proxied to `http://localhost:8080` by the Vite dev server, so there are no CORS issues during development.

### Other scripts

```bash
npm run build      # Production build → dist/
npm run preview    # Preview production build locally at :4173
```

---

## Environment & Proxy Config

### `vite.config.js`

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',   // ← Backend address
        changeOrigin: true,
      }
    }
  }
})
```

If your backend runs on a different port or host, update `target` here.

### Production API URL

For production, the app expects the backend API to be accessible at the **same origin** under `/api/` (handled by Nginx reverse proxy). If your backend is on a different domain, update `baseURL` in `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'https://api.yourdomain.com/api',  // production
});
```

---

## Authentication Flow

### How it works

1. User visits `/login` (the only login page — no separate admin login).
2. Submits email + password.
3. Frontend calls `POST /api/auth/login`.
4. Backend checks email against `admins` table first, then `businesses`. Returns a JWT with the `role` field.
5. Frontend stores the token in `localStorage` and user data in `AuthContext`.
6. Based on `role`:
   - `"ADMIN"` → navigates to `/admin`
   - `"BUSINESS"` → navigates to `/dashboard`

### AuthContext (`src/context/AuthContext.jsx`)

```jsx
// Available everywhere via useAuth()
const { user, login, logout, loading, isAdmin } = useAuth();

// user object shape:
{
  id: 1,
  name: "Acme Store",
  email: "acme@example.com",
  role: "BUSINESS"  // or "ADMIN"
}
```

`login(userData, token)` — saves to `localStorage` and updates state.
`logout()` — clears `localStorage` and state, user is redirected to `/login`.

### Route Guards

Two wrapper components protect routes in `App.jsx`:

**`ProtectedRoute`** — Redirects to `/login` if not authenticated. If `adminOnly={true}`, also redirects non-admins.

**`PublicRoute`** — Redirects already-authenticated users to their dashboard (prevents back-navigation to login after signing in).

### Token Expiry & 401 Handling

The Axios interceptor in `api.js` catches `401 Unauthorized` responses, clears `localStorage`, and redirects to `/login` automatically:

```js
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

## Forgot Password — 3-Step OTP Flow

The Forgot Password page (`/forgot-password`) is a multi-step form contained in a single component (`ForgotPassword.jsx`) using local state to track the current step.

### Step 1 — Email Input

- User enters their registered email address.
- Calls `POST /api/auth/forgot-password`.
- Backend sends a 6-digit OTP to the email (5-minute expiry).
- Frontend advances to Step 2.

### Step 2 — OTP Verification

- 6 individual input boxes, one per digit.
- **Auto-focus**: moves to the next box as each digit is typed.
- **Backspace**: moves focus to the previous box.
- **Paste support**: pasting a 6-digit number fills all boxes instantly.
- **Keyboard navigation**: Arrow Left / Arrow Right between boxes.
- **Resend OTP**: available after a 60-second countdown timer.
- **Change email**: link to go back to Step 1.
- Calls `POST /api/auth/verify-otp` on submit.
- On success → advances to Step 3.
- On failure → clears all boxes, focuses first box, shows error toast.

### Step 3 — New Password

- Two password fields (new + confirm).
- **Real-time password strength bar** — 4-segment colour indicator (red → amber → yellow → green) based on password length.
- **Match validation** — inline message shows if passwords match or don't match as the user types.
- Calls `POST /api/auth/reset-password` (re-sends OTP + new password for double verification on backend).
- On success → advances to Step 4.

### Step 4 — Success

- Confirmation screen with a green checkmark.
- "Back to Login" button → navigates to `/login`.

### Progress Indicator

A 3-segment progress bar at the top of the card fills as the user moves through steps 1 → 2 → 3.

---

## Routing Architecture

All routes are defined in `App.jsx`. Here is the complete route map:

```
/                          → redirects to /login
/login                     → Login (public, redirects if already logged in)
/register                  → Register (public)
/forgot-password           → Forgot Password OTP flow (public)

/dashboard                 → Business Dashboard      ─┐
/customers                 → Customer Management      │  All wrapped in
/suppliers                 → Supplier Management      │  <ProtectedRoute>
/products                  → Product & Inventory      │  + <Layout>
/expenses                  → Expense Tracking         │  (Business only)
/invoices                  → Invoice List             │
/invoices/:id              → Invoice Detail & Print  ─┘

/admin                     → Admin Dashboard          ─┐
/admin/businesses          → Manage Businesses         │  All wrapped in
/admin/subscriptions       → Subscription Plans        │  <ProtectedRoute adminOnly>
/admin/ai-usage            → AI Usage Logs            ─┘  + <AdminLayout>

*                          → redirects to /login
```

---

## Pages Reference

### Login (`/login`)

**Two-column layout** (left: branded panel, right: form) on desktop. Collapses to single-column on mobile.

- Single form for all users — admins and businesses.
- Informational tip panel explains the unified sign-in.
- "Forgot password?" link in the password field label.
- "Register your business" link for new users.
- After login, the role from the API response determines the redirect destination.

---

### Register (`/register`)

Standard registration form for new business accounts:
- Business name, email, password, phone, address.
- On success → logs in automatically and redirects to `/dashboard`.

---

### Forgot Password (`/forgot-password`)

Four-step flow in a single card. See [Forgot Password section](#forgot-password--3-step-otp-flow) above.

---

### Dashboard (`/dashboard`)

Displays a real-time overview using data from `GET /api/dashboard`:

**KPI Cards:**
- Sales This Month (green)
- Expenses This Month (red)
- Net Profit (indigo)
- Total Invoices (amber)
- Total Customers (blue)
- Low Stock Count (orange — products ≤ 5 units)

**Charts (Recharts):**
- Top Selling Products — horizontal BarChart
- Recent Invoices — list of last 5 invoices with customer and amount

---

### Customers, Suppliers, Products, Expenses (`/customers`, etc.)

All four pages follow the same CRUD pattern:

1. Table listing via `CrudTable` component (search + pagination).
2. "Add" button opens a `Modal` with a form.
3. Edit pencil icon populates the modal with existing data.
4. Delete trash icon shows a `confirm()` dialog before calling DELETE.
5. All changes call `load()` to refresh data from the API.

**Products** additionally shows low-stock badges (red badge for ≤ 5 units, green for normal) and a supplier dropdown.

**Expenses** shows a running total card at the top of the page.

---

### Invoices (`/invoices`)

**List view** — Shows invoice number, customer, total, date, item count. Actions: view and delete.

**Create modal** — Dynamic line-item builder:
- Customer selector
- Add/remove rows (product + quantity)
- Real-time subtotal per line (price × quantity)
- Grand total updates as items are added
- Validation: checks stock is sufficient before submitting

On create, the backend deducts stock quantities atomically.

---

### Invoice Detail (`/invoices/:id`)

Printable invoice view:
- Business name and invoice number header
- Bill To section (customer details)
- Line items table (product, unit price, qty, subtotal)
- Grand total
- "Print" button calls `window.print()`
- "Back to Invoices" link

---

### AI Assistant (`/ai`)

Four AI feature cards to select from:

| Feature | Icon | System Role |
|---|---|---|
| Business Insights | BarChart3 | Business analyst |
| Email Composer | Mail | Professional email writer |
| Invoice Summary | FileText | Financial assistant |
| Social Media Post | ShoppingBag | Marketing expert |

- Textarea prompt input with context-specific placeholder text.
- Submit calls `POST /api/ai/generate`.
- Response displayed in a monospace pre-wrapped panel.
- "Copy Response" button copies to clipboard.
- Loading state shows animated spinner with "AI is thinking…" text.

---

### Admin Dashboard (`/admin`)

Four stat cards using `GET /api/admin/stats`:
- Total Businesses
- Total AI Requests
- Total Invoices
- Total Subscription Plans

---

### Admin Businesses (`/admin/businesses`)

Table of all registered businesses with:
- Business ID, name, email, phone, subscription plan badge.
- Delete button with confirmation (permanent — cascades to all business data).

---

### Admin Subscriptions (`/admin/subscriptions`)

Card-based layout (one card per plan) instead of a table, showing:
- Plan name, price, duration.
- Edit pencil + delete trash on each card.
- "New Plan" opens a modal for name, price, and duration.

---

### Admin AI Usage (`/admin/ai-usage`)

Full log table of every AI request across all businesses:
- AI ID, business name, feature badge (colour-coded), prompt preview (truncated), timestamp.
- Sorted newest-first.
- Feature badges:
  - INSIGHTS → blue
  - EMAIL → emerald
  - INVOICE_SUMMARY → amber
  - SOCIAL_MEDIA → pink

---

## Components Reference

### `CrudTable` (`src/components/ui/CrudTable.jsx`)

A reusable, self-contained table component used by all CRUD pages.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Page title and used in "Add" button label |
| `data` | `array` | Array of objects to display |
| `columns` | `array` | Column definitions (see below) |
| `onAdd` | `function` | Called when "Add" button is clicked |
| `onEdit` | `function` | Called with row object when edit icon clicked |
| `onDelete` | `function` | Called with row object when delete icon clicked |
| `loading` | `boolean` | Shows loading text in table body |
| `searchKeys` | `array` | Which keys to search across (e.g. `['name','email']`) |

**Column definition:**

```js
{
  key: 'name',          // Object key to read
  label: 'Customer',    // Column header text
  render: (row) => ..., // Optional: custom render function
}
```

**Built-in features:**
- Search bar with live filtering across `searchKeys`
- Server-independent client-side pagination (10 rows per page)
- Previous/next page buttons with row count indicator

---

### `Modal` (`src/components/ui/Modal.jsx`)

An accessible overlay modal.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Whether modal is visible |
| `onClose` | `function` | Called when ✕ or backdrop is clicked |
| `title` | `string` | Modal header title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | Width preset |
| `children` | `ReactNode` | Modal body content |

- Locks body scroll when open (`overflow: hidden`).
- Animated entry (`fade-in` CSS animation).
- Click outside (backdrop) closes the modal.

---

### `Layout` (`src/components/layout/Layout.jsx`)

The sidebar layout for business users. Wraps all business pages via `<Outlet />`.

Sidebar includes:
- SmartBiz logo + tagline
- Current user avatar (initial) + name + email
- Navigation links (all using `NavLink` for active state)
- Logout button (redirects to `/login`)

---

### `AdminLayout` (`src/components/layout/AdminLayout.jsx`)

Same structure as `Layout` but styled with a dark (`#1a1a2e`) theme and amber accent colours for the admin panel. Navigation links styled with amber active state.

---

## API Service Layer

All API calls are centralised in `src/services/api.js`. An Axios instance is created once with the base URL and interceptors applied globally.

### Auth API

```js
authAPI.login(data)                // POST /auth/login — unified
authAPI.register(data)             // POST /auth/register
authAPI.forgotPassword(data)       // POST /auth/forgot-password
authAPI.verifyOtp(data)            // POST /auth/verify-otp
authAPI.resetPassword(data)        // POST /auth/reset-password
```

### Business API

```js
dashboardAPI.get()                 // GET /dashboard
customerAPI.getAll()               // GET /customers
customerAPI.getById(id)            // GET /customers/:id
customerAPI.create(data)           // POST /customers
customerAPI.update(id, data)       // PUT /customers/:id
customerAPI.delete(id)             // DELETE /customers/:id

// Same pattern for supplierAPI, productAPI, expenseAPI, invoiceAPI
productAPI.getLowStock()           // GET /products/low-stock
```

### AI API

```js
aiAPI.generate({ feature, prompt }) // POST /ai/generate
aiAPI.getHistory()                   // GET /ai/history
```

### Admin API

```js
adminAPI.getStats()                        // GET /admin/stats
adminAPI.getBusinesses()                   // GET /admin/businesses
adminAPI.deleteBusiness(id)                // DELETE /admin/businesses/:id
adminAPI.getSubscriptions()                // GET /admin/subscriptions
adminAPI.createSubscription(data)          // POST /admin/subscriptions
adminAPI.updateSubscription(id, data)      // PUT /admin/subscriptions/:id
adminAPI.deleteSubscription(id)            // DELETE /admin/subscriptions/:id
adminAPI.getAiUsage()                      // GET /admin/ai-usage
```

---

## Styling System

### Fonts

Loaded from Google Fonts (no local files needed):

| Font | Usage |
|---|---|
| **DM Sans** | Body text, UI labels, all general text |
| **Syne** | Headings (`font-display`), page titles, card numbers |
| **JetBrains Mono** | Invoice numbers, OTP code display, AI response output |

### Color Palette

```js
// tailwind.config.js
primary: {
  50:  '#f0f4ff',
  500: '#6366f1',   // Main indigo
  600: '#4f46e5',   // Buttons
  700: '#4338ca',   // Hover
  900: '#312e81',   // Sidebar gradient
}
accent: {
  500: '#f97316',   // Orange (admin theme)
}
```

### Custom Utility Classes (`index.css`)

The following shorthand classes are defined and usable anywhere:

| Class | Description |
|---|---|
| `.btn-primary` | Indigo filled button |
| `.btn-secondary` | White outlined button |
| `.btn-danger` | Red filled button |
| `.card` | White rounded card with indigo border + shadow |
| `.input` | Styled text input field |
| `.label` | Small uppercase label for form fields |
| `.table-header` | `<th>` style for data tables |
| `.badge-green` | Emerald pill badge |
| `.badge-yellow` | Amber pill badge |
| `.badge-red` | Red pill badge |
| `.badge-blue` | Blue pill badge |
| `.sidebar-link` | Navigation link style (active state: `.active`) |
| `.fade-in` | CSS keyframe animation (fadeIn, 0.3s ease) |
| `.slide-in` | CSS keyframe animation (slideIn, 0.25s ease) |

### Custom Scrollbar

A thin indigo scrollbar is applied globally via `::-webkit-scrollbar` rules.

---

## State Management

SmartBiz Frontend uses **React's built-in state** — no external state management library (no Redux, no Zustand).

| State Layer | Implementation |
|---|---|
| Global auth state | `AuthContext` (React Context + `useState`) |
| Page-level data | Local `useState` per page component |
| Form state | Local `useState` objects per form |
| Loading/saving flags | Local `useState` booleans |

Data fetching is done with plain `useEffect` + `async/await` calls to the API service. This keeps the codebase lean and easy to follow without abstractions.

---

## Production Build

```bash
# Build optimised static files
npm run build
```

Output is in `dist/` — a set of static HTML, CSS, and JS files that can be served by any web server.

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

## Deployment

### Option 1 — Nginx on EC2

```bash
# Copy dist to server
scp -r dist/ ec2-user@your-ec2-ip:/var/www/smartbiz/

# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/smartbiz;
    index index.html;

    # SPA: all paths → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Spring Boot backend
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2 — AWS S3 + CloudFront

```bash
# Install AWS CLI, configure credentials
aws s3 sync dist/ s3://your-smartbiz-bucket --delete

# Enable static website hosting on the bucket
# Create CloudFront distribution pointing to the bucket
# Add error page rule: 403/404 → /index.html (for SPA routing)
```

### Option 3 — Vercel / Netlify (easiest)

```bash
# Vercel
npm i -g vercel
vercel --prod

# Or connect GitHub repo to Vercel/Netlify dashboard
# Set build command: npm run build
# Set output directory: dist
```

For Netlify, add a `_redirects` file in `public/`:

```
/* /index.html 200
```

This ensures the SPA router handles all paths correctly.

---

### Production Checklist

- [ ] Update `baseURL` in `api.js` if backend is on a different domain
- [ ] Set up HTTPS on your domain (Let's Encrypt via Certbot)
- [ ] Configure Nginx to serve `index.html` for all routes (SPA routing)
- [ ] Set up the Nginx proxy for `/api/` calls to the backend
- [ ] Test the forgot password email flow in production
- [ ] Verify the admin login works (same `/login` page)

---

*SmartBiz Frontend — Built with React 18 · Vite 5 · Tailwind CSS 3*
