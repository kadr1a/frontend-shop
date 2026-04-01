import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import UsersList from './components/UsersList';
import { api } from './api';

function PrivateRoute({ children }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" />;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') {
      return <Navigate to="/products" />;
    }
  } catch (e) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={
          <PrivateRoute>
            <ProductList />
          </PrivateRoute>
        } />
        <Route path="/products/:id" element={
          <PrivateRoute>
            <ProductDetail />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <AdminRoute>
            <UsersList />
          </AdminRoute>
        } />
        <Route path="/" element={<Navigate to="/products" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;