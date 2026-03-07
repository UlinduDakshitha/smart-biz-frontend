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
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px', fontSize: '14px' },
        }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public ── */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

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
