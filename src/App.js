import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; 

// Import af auth komponenter
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountSelector from './pages/AccountSelector';

// Import af sidekomponenter
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage/BudgetPage';
import GoalPage from './pages/GoalPage/GoalPage';
import MessageDisplay from './components/MessageDisplay';

// Import apiClient
import apiClient from './utils/apiClient';

// Indre App komponent som holder alle siden (kun hvis logget ind)
function AppContent() {
    // --- State Management ---
    // Globale states for data
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    
    // States til UI-håndtering
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [showTransactionFormModal, setShowTransactionFormModal] = useState(false);
    const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);
    
    // States til beskeder og fejl
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // States til filtrering
    const [filterStartDate, setFilterStartDate] = useState('2020-01-01');
    const [filterEndDate, setFilterEndDate] = useState('2030-12-31');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Fælles trigger for dataopdateringer på tværs af komponenter
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Get auth context
    // const { user } = useAuth(); // Not currently used

    // --- Global Functions ---
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        setError(null);
        setSuccessMessage(null);
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await apiClient.get('/categories/');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("Fejl ved hentning af kategorier:", err);
            setError(err.message || "Kunne ikke hente kategorier.");
        }
    }, []);

    const fetchBudgets = useCallback(async () => {
        try {
            const response = await apiClient.get('/budgets/');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Kunne ikke hente budgetter');
            }
            const data = await response.json();
            setBudgets(data);
        } catch (err) {
            console.error("Fejl ved hentning af budgetter:", err);
            setError(err.message || "Kunne ikke hente budgetter.");
            setBudgets([]);
        }
    }, []);

    // --- Initial Data Fetching ---
    useEffect(() => {
        fetchCategories();
        fetchBudgets();
    }, [fetchCategories, fetchBudgets, refreshTrigger]);

    // --- Transaction Handlers ---
    const handleTransactionAdded = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        handleRefresh();
        setSuccessMessage('Transaktion tilføjet succesfuldt!');
    }, [handleRefresh]);

    const handleTransactionUpdated = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        handleRefresh();
        setSuccessMessage('Transaktion opdateret succesfuldt!');
    }, [handleRefresh]);

    const handleEditTransaction = useCallback((transaction) => {
        setTransactionToEdit(transaction);
        setShowTransactionFormModal(true);
        setError(null);
        setSuccessMessage(null);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setTransactionToEdit(null);
        setShowTransactionFormModal(false);
        setError(null);
        setSuccessMessage(null);
    }, []);

    const handleDeleteTransaction = useCallback(async (transactionId) => {
        if (window.confirm("Er du sikker på, du vil slette denne transaktion?")) {
            try {
                const response = await apiClient.delete(`/transactions/${transactionId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }
                handleRefresh();
                setSuccessMessage('Transaktion slettet succesfuldt!');
            } catch (err) {
                console.error("Fejl ved sletning af transaktion:", err);
                setError(`Fejl ved sletning: ${err.message}`);
            }
        }
    }, [handleRefresh]);

    // --- General Handlers ---
    const handleCategoryAndBudgetChange = useCallback(() => {
        handleRefresh();
        setSuccessMessage('Handling udført succesfuldt!');
        setShowCategoryManagementModal(false);
    }, [handleRefresh]);

    const handleApplyFilter = useCallback(() => {
        handleRefresh();
    }, [handleRefresh]);

    const handleCsvUploadSuccess = useCallback(() => {
        setSuccessMessage('CSV-fil uploadet og transaktioner behandlet!');
        handleRefresh();
    }, [handleRefresh]);

    return (
        <div className="App">
            <Navigation />
            {error && <MessageDisplay message={error} type="error" />}
            {successMessage && <MessageDisplay message={successMessage} type="success" />}

            <main>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <DashboardPage
                                filterStartDate={filterStartDate}
                                setFilterStartDate={setFilterStartDate}
                                filterEndDate={filterEndDate}
                                setFilterEndDate={setFilterEndDate}
                                refreshDashboardTrigger={refreshTrigger}
                            />
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route
                        path="/transactions"
                        element={
                            <TransactionsPage
                                categories={categories}
                                transactionToEdit={transactionToEdit}
                                showTransactionFormModal={showTransactionFormModal}
                                setShowTransactionFormModal={setShowTransactionFormModal}
                                filterStartDate={filterStartDate}
                                setFilterStartDate={setFilterStartDate}
                                filterEndDate={filterEndDate}
                                setFilterEndDate={setFilterEndDate}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                refreshTransactionsTrigger={refreshTrigger}
                                onTransactionAdded={handleTransactionAdded}
                                onTransactionUpdated={handleTransactionUpdated}
                                handleEditTransaction={handleEditTransaction}
                                handleCancelEdit={handleCancelEdit}
                                handleDeleteTransaction={handleDeleteTransaction}
                                handleApplyFilter={handleApplyFilter}
                                handleCsvUploadSuccess={handleCsvUploadSuccess}
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                            />
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <CategoriesPage
                                categories={categories}
                                budgets={budgets}
                                showCategoryManagementModal={showCategoryManagementModal}
                                setShowCategoryManagementModal={setShowCategoryManagementModal}
                                handleCategoryChange={handleCategoryAndBudgetChange}
                                onBudgetAdded={handleCategoryAndBudgetChange}
                                onBudgetUpdated={handleCategoryAndBudgetChange}
                                onBudgetDeleted={handleCategoryAndBudgetChange}
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                            />
                        }
                    />
                    <Route
                        path="/budget"
                        element={
                            <BudgetPage
                                categories={categories}
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                            />
                        }
                    />
                    <Route
                        path="/goals"
                        element={
                            <GoalPage
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

// Hovedkomponent som håndterer routing (login vs sikret indhold)
function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loader...</div>;
    }

    return (
        <Routes>
            {/* Offentlige ruter (login og register) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Account selector (efter login, før dashboard) */}
            <Route 
              path="/account-selector" 
              element={isAuthenticated() ? <AccountSelector /> : <Navigate to="/login" replace />}
            />

            {/* Sikret ruter */}
            <Route
                path="/*"
                element={
                    isAuthenticated() ? <AppContent /> : <Navigate to="/login" replace />
                }
            />
        </Routes>
    );
}

// Wrapper komponent som gør AuthProvider tilgængelig
function AppWithAuth() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

export default AppWithAuth;