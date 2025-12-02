// frontend/finans-tracker-frontend/src/App.js - UPDATED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage/BudgetPage';

// Import Components
import MessageDisplay from './components/MessageDisplay';
import Navigation from './components/Navigation';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // --- State Management (samme som før) ---
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [showTransactionFormModal, setShowTransactionFormModal] = useState(false);
  const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('2020-01-01');
  const [filterEndDate, setFilterEndDate] = useState('2030-12-31');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Rest af din eksisterende App logik kan komme her...

  return (
    <div className="app">
      {/* Vis navigation kun hvis bruger er logget ind */}
      {isAuthenticated() && <Navigation />}

      {/* Message display */}
      {error && <MessageDisplay message={error} type="error" onClose={() => setError(null)} />}
      {successMessage && <MessageDisplay message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private Routes (kræver login) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage 
              categories={categories}
              budgets={budgets}
              refreshTrigger={refreshTrigger}
            />
          </PrivateRoute>
        } />

        <Route path="/transactions" element={
          <PrivateRoute>
            <TransactionsPage 
              categories={categories}
              onRefresh={handleRefresh}
              refreshTrigger={refreshTrigger}
            />
          </PrivateRoute>
        } />

        <Route path="/categories" element={
          <PrivateRoute>
            <CategoriesPage 
              categories={categories}
              onRefresh={handleRefresh}
            />
          </PrivateRoute>
        } />

        <Route path="/budget" element={
          <PrivateRoute>
            <BudgetPage 
              budgets={budgets}
              categories={categories}
              onRefresh={handleRefresh}
              refreshTrigger={refreshTrigger}
            />
          </PrivateRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
