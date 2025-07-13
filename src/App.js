// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Din globale App CSS

// Importer de nye side-komponenter
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';

// VIGTIGT: Importer MessageDisplay her, da den bruges direkte i App.js til globale meddelelser
import MessageDisplay from './components/MessageDisplay'; 

// "Modal" importeres stadig her, fordi den stadig kan bruges til globale modaler, 
// selvom du har flyttet logikken for visning af specifikke modaler ind i de enkelte pages.
// Hvis du har fjernet alle direkte Modal-kald fra App.js, behøver denne ikke at være her.
// Men for at være sikker og undgå fremtidige fejl, beholder vi den.
import Modal from './components/Modal/Modal';


function App() {
    // --- STATE HÅNDTERING ---
    const [categories, setCategories] = useState([]);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [showTransactionFormModal, setShowTransactionFormModal] = useState(false);
    const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [filterStartDate, setFilterStartDate] = useState('2020-01-01');
    const [filterEndDate, setFilterEndDate] = useState('2030-12-31');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [refreshTransactionsTrigger, setRefreshTransactionsTrigger] = useState(0);
    const [refreshDashboardTrigger, setRefreshDashboardTrigger] = useState(0);

    // --- GLOBALE FUNKTIONER ---
    const triggerTransactionsAndDashboardRefresh = useCallback(() => {
        setRefreshTransactionsTrigger(prev => prev + 1);
        setRefreshDashboardTrigger(prev => prev + 1);
        setError(null);
        setSuccessMessage(null);
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/categories/');
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
    }, [setError]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleTransactionAdded = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        triggerTransactionsAndDashboardRefresh();
        setSuccessMessage('Transaktion tilføjet succesfuldt!');
    }, [triggerTransactionsAndDashboardRefresh, setSuccessMessage]);

    const handleTransactionUpdated = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        triggerTransactionsAndDashboardRefresh();
        setSuccessMessage('Transaktion opdateret succesfuldt!');
    }, [triggerTransactionsAndDashboardRefresh, setSuccessMessage]);

    const handleEditTransaction = useCallback((transaction) => {
        setTransactionToEdit(transaction);
        setShowTransactionFormModal(true);
        setError(null);
        setSuccessMessage(null);
    }, [setError, setSuccessMessage]);

    const handleCancelEdit = useCallback(() => {
        setTransactionToEdit(null);
        setShowTransactionFormModal(false);
        setError(null);
        setSuccessMessage(null);
    }, [setError, setSuccessMessage]);

    const handleDeleteTransaction = useCallback(async (transactionId) => {
        if (window.confirm("Er du sikker på, du vil slette denne transaktion?")) {
            try {
                const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }
                triggerTransactionsAndDashboardRefresh();
                setSuccessMessage('Transaktion slettet succesfuldt!');
            } catch (err) {
                console.error("Fejl ved sletning af transaktion:", err);
                setError(`Fejl ved sletning: ${err.message}`);
            }
        }
    }, [triggerTransactionsAndDashboardRefresh, setError, setSuccessMessage]);

    const handleCategoryChange = useCallback(() => {
        fetchCategories();
        triggerTransactionsAndDashboardRefresh();
        setSuccessMessage('Kategori handling udført succesfuldt!');
        setShowCategoryManagementModal(false);
    }, [fetchCategories, triggerTransactionsAndDashboardRefresh, setSuccessMessage]);

    const handleApplyFilter = useCallback(() => {
        triggerTransactionsAndDashboardRefresh();
    }, [triggerTransactionsAndDashboardRefresh]);

    const handleCsvUploadSuccess = useCallback(() => {
        setSuccessMessage('CSV-fil uploadet og transaktioner behandlet!');
        triggerTransactionsAndDashboardRefresh();
    }, [setSuccessMessage, triggerTransactionsAndDashboardRefresh]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Finans Tracker</h1>
                {/* Global navigation for de forskellige sider */}
                <nav>
                    <ul className="main-nav">
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/transactions">Transaktioner</Link></li>
                        <li><Link to="/categories">Kategorier</Link></li>
                    </ul>
                </nav>
                {/* Globale fejl- og succesmeddelelser, der vises øverst */}
                {error && <MessageDisplay message={error} type="error" />}
                {successMessage && <MessageDisplay message={successMessage} type="success" />}
            </header>

            <main>
                {/* React Router håndterer, hvilken side der skal vises baseret på URL'en */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            <DashboardPage
                                filterStartDate={filterStartDate}
                                setFilterStartDate={setFilterStartDate}
                                filterEndDate={filterEndDate}
                                setFilterEndDate={setFilterEndDate}
                                refreshDashboardTrigger={refreshDashboardTrigger}
                            />
                        }
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
                                refreshTransactionsTrigger={refreshTransactionsTrigger}
                                onTransactionAdded={handleTransactionAdded}
                                onTransactionUpdated={handleTransactionUpdated}
                                handleEditTransaction={handleEditTransaction}
                                handleCancelEdit={handleCancelEdit}
                                handleDeleteTransaction={handleDeleteTransaction}
                                handleApplyFilter={handleApplyFilter}
                                handleCsvUploadSuccess={handleCsvUploadSuccess}
                                error={error}
                                successMessage={successMessage}
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                                triggerTransactionsAndDashboardRefresh={triggerTransactionsAndDashboardRefresh}
                            />
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <CategoriesPage
                                categories={categories}
                                showCategoryManagementModal={showCategoryManagementModal}
                                setShowCategoryManagementModal={setShowCategoryManagementModal}
                                handleCategoryChange={handleCategoryChange}
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

export default App;