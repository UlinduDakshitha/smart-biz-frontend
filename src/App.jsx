import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/dashboard/Dashboard';
import Customers from './pages/customers/Customers';
import Suppliers from './pages/suppliers/Suppliers';
import Products from './pages/products/Products';
import Expenses from './pages/expenses/Expenses';
import Invoices from './pages/invoices/Invoices';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import AiAssistant from './pages/ai/AiAssistant';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminAiUsage from './pages/admin/AdminAiUsage';
import BusinessProfile
  from './pages/profile/BusinessProfile';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f8f9ff]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-indigo-300 text-sm">Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{
            top: 24,
            right: 24,
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 4000,
            className: 'smartbiz-toast',
            style: {
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '16px',
              padding: '12px 18px',
              color: '#0f172a',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                '0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
            },
            success: {
              duration: 3500,
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
              style: {
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 244, 0.96) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#065f46',
                boxShadow:
                  '0 20px 35px -10px rgba(16, 185, 129, 0.22), 0 0 0 1px rgba(16, 185, 129, 0.12)',
              },
            },
            error: {
              duration: 4500,
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
              style: {
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 241, 242, 0.96) 100%)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#9f1239',
                boxShadow:
                  '0 20px 35px -10px rgba(244, 63, 94, 0.22), 0 0 0 1px rgba(244, 63, 94, 0.12)',
              },
            },
            loading: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#ffffff',
              },
              style: {
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(238, 242, 255, 0.96) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#3730a3',
                boxShadow:
                  '0 20px 35px -10px rgba(99, 102, 241, 0.22), 0 0 0 1px rgba(99, 102, 241, 0.12)',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public ── */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
         <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Business ── */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/ai" element={<AiAssistant />} />
            <Route
  path="/profile"
  element={<BusinessProfile />}
/>
          </Route>

          {/* ── Admin ── */}
          <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/businesses" element={<AdminBusinesses />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/ai-usage" element={<AdminAiUsage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
