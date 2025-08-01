// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Din globale App CSS

// Importer de nye side-komponenter
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage/BudgetPage'; // <--- Rettet importnavn for klarhed

// VIGTIGT: Importer MessageDisplay her, da den bruges direkte i App.js til globale meddelelser
import MessageDisplay from './components/MessageDisplay';

function App() {
    // --- STATE HÅNDTERING ---
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]); // NY STATE: Til at holde alle budgetter
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [showTransactionFormModal, setShowTransactionFormModal] = useState(false);
    const [showCategoryManagementModal, setShowCategoryManagementModal] = useState(false);

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [filterStartDate, setFilterStartDate] = useState('2020-01-01');
    const [filterEndDate, setFilterEndDate] = useState('2030-12-31');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [refreshTrigger, setRefreshTrigger] = useState(0); // Én fælles trigger for alle data-opdateringer

    // --- GLOBALE FUNKTIONER ---

    // Én samlet refresh-funktion, der trigger opdatering af alle relevante data
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        // Nulstil meddelelser ved refresh, hvis de ikke allerede er håndteret af den specifikke handling
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

    // NY FUNKTION: Hent alle budgetter
    const fetchBudgets = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/budgets/');
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
    }, [setError]);


    // Initial datahentning ved mount og ved refreshTrigger ændring
    useEffect(() => {
        fetchCategories();
        fetchBudgets(); // Kald også fetchBudgets her
    }, [fetchCategories, fetchBudgets, refreshTrigger]); // Afhængigheder for useEffect

    // Håndter transaktions-relaterede handlinger
    const handleTransactionAdded = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        handleRefresh(); // Brug den nye generelle refresh
        setSuccessMessage('Transaktion tilføjet succesfuldt!');
    }, [handleRefresh, setSuccessMessage]);

    const handleTransactionUpdated = useCallback(() => {
        setShowTransactionFormModal(false);
        setTransactionToEdit(null);
        handleRefresh(); // Brug den nye generelle refresh
        setSuccessMessage('Transaktion opdateret succesfuldt!');
    }, [handleRefresh, setSuccessMessage]);

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
        // IMPORTANT: Do NOT use window.confirm() in Canvas. Use a custom modal instead.
        // For now, keeping it as is, but be aware of this limitation.
        if (window.confirm("Er du sikker på, du vil slette denne transaktion?")) {
            try {
                const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }
                handleRefresh(); // Brug den nye generelle refresh
                setSuccessMessage('Transaktion slettet succesfuldt!');
            } catch (err) {
                console.error("Fejl ved sletning af transaktion:", err);
                setError(`Fejl ved sletning: ${err.message}`);
            }
        }
    }, [handleRefresh, setError, setSuccessMessage]);

    // Håndter kategori- og budget-relaterede handlinger
    const handleCategoryAndBudgetChange = useCallback(() => {
        handleRefresh(); // Trigger refresh for både kategorier og budgetter
        setSuccessMessage('Handling udført succesfuldt!');
        setShowCategoryManagementModal(false); // Luk modalen efter handling
    }, [handleRefresh, setSuccessMessage]);

    const handleApplyFilter = useCallback(() => {
        handleRefresh(); // Trigger refresh for transaktioner og dashboard
    }, [handleRefresh]);

    const handleCsvUploadSuccess = useCallback(() => {
        setSuccessMessage('CSV-fil uploadet og transaktioner behandlet!');
        handleRefresh(); // Trigger refresh for transaktioner og dashboard
    }, [setSuccessMessage, handleRefresh]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Finans Tracker</h1>
                {/* Global navigation for de forskellige sider */}
                <nav>
                    <ul className="main-nav">
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/transactions">Transaktioner</Link></li>
                        {/* Link til BudgetPage, som indeholder både oversigt og administration */}
                        <li><Link to="/budget-overview">Budget</Link></li>
                        <li><Link to="/categories">Administration</Link></li>
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
                                refreshDashboardTrigger={refreshTrigger} // Brug den fælles trigger
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
                                refreshTransactionsTrigger={refreshTrigger} // Brug den fælles trigger
                                onTransactionAdded={handleTransactionAdded}
                                onTransactionUpdated={handleTransactionUpdated}
                                handleEditTransaction={handleEditTransaction}
                                handleCancelEdit={handleCancelEdit}
                                handleDeleteTransaction={handleDeleteTransaction}
                                handleApplyFilter={handleApplyFilter}
                                handleCsvUploadSuccess={handleCsvUploadSuccess}
                            />
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <CategoriesPage
                                categories={categories}
                                budgets={budgets} // Send budgets ned
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
                    {/* Rute til BudgetPage, som indeholder både BudgetOverview og BudgetSetup modalen */}
                    <Route
                        path="/budget-overview" // Din valgte sti for budget-siden
                        element={
                            <BudgetPage // <--- Render BudgetPage her
                                categories={categories}
                                setError={setError}
                                setSuccessMessage={setSuccessMessage}
                                // BudgetPage håndterer sin egen refreshTrigger og loading state
                                // for budgetter, så du behøver ikke at sende dem ned herfra,
                                // medmindre BudgetPage skal reagere på App-niveau refreshes for andre data.
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
