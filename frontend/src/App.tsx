import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/customer/Home';
import { Menu } from './pages/customer/Menu';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { OrderTracking } from './pages/customer/OrderTracking';
import { OrderHistory } from './pages/customer/OrderHistory';
import { Profile } from './pages/customer/Profile';
import { Login } from './pages/common/Login';
import { Register } from './pages/common/Register';
import { Unauthorized } from './pages/common/Unauthorized';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              
              <main style={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Customer Guarded Routes */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER']}>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'SUPERADMIN']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared Guarded Tracking Route */}
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'SUPERADMIN']}>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />

                  {/* Staff Guarded Routes */}
                  <Route
                    path="/staff/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['STAFF']}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Superadmin Guarded Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback to Home */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
