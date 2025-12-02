// src/pages/BudgetPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BudgetOverview from '../../components/Budget/BudgetOverview/BudgetOverview';
import BudgetSetup from '../../components/Budget/BudgetSetup/BudgetSetup';
import BudgetComparison from '../../components/Budget/BudgetComparison/BudgetComparison';
import BudgetList from '../../components/Budget/BudgetList/BudgetList';
import './BudgetPage.css'; // Opdateret CSS fil

function BudgetPage({ categories, setError, setSuccessMessage }) {
  const { getAuthHeader } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState('comparison'); // Tilføjet 'comparison' som standard
  const [loading, setLoading] = useState(false);
  
  // Modal state til budget redigering
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Callback funktioner til at håndtere budget ændringer
  const handleBudgetChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setError?.(null);
    setSuccessMessage?.(null);
  };

  // Budget CRUD handlers for ny funktionalitet
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleBudgetAdded = () => {
    handleBudgetChange();
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleBudgetUpdated = () => {
    handleBudgetChange();
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleBudgetDeleted = () => {
    handleBudgetChange();
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setShowBudgetModal(false);
  };

  // View configuration
  const views = [
    {
      id: 'comparison',
      label: 'Budget Sammenligning',
      icon: '🔍',
      description: 'Sammenlign budget med faktiske udgifter og upload CSV'
    },
    {
      id: 'combined',
      label: 'Komplet Oversigt',
      icon: '📊',
      description: 'Se både oversigt og administration side om side'
    },
    {
      id: 'overview',
      label: 'Kun Oversigt',
      icon: '📈',
      description: 'Visuelt overblik over dine budgetter'
    },
    {
      id: 'setup',
      label: 'Administration',
      icon: '⚙️',
      description: 'Opret og administrer budgetter'
    },
    {
      id: 'list',
      label: 'Budget Liste',
      icon: '📋',
      description: 'Tabelvisning af alle budgetter'
    }
  ];

  return (
    <div className="budget-page">
      <div className="budget-page-header">
        <div className="header-content">
          <h1>💰 Budget Administration</h1>
          <p className="header-subtitle">
            Administrer dine budgetter og hold styr på dine finanser
          </p>
        </div>
      </div>

      <div className="view-toggle">
        {views.map(view => (
          <button
            key={view.id}
            className={`toggle-button ${activeView === view.id ? 'active' : ''}`}
            onClick={() => handleViewChange(view.id)}
            title={view.description}
          >
            <span className="button-icon">{view.icon}</span>
            <span className="button-label">{view.label}</span>
          </button>
        ))}
      </div>

      <div className={`budget-content ${activeView}`}>
        {/* Ny Budget Sammenligning visning */}
        {activeView === 'comparison' && (
          <div className="single-panel">
            <BudgetComparison
              categories={categories}
              refreshTrigger={refreshTrigger}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
              onEditBudget={handleEditBudget}
            />
          </div>
        )}

        {/* Budget Liste visning */}
        {activeView === 'list' && (
          <div className="single-panel">
            <BudgetList
              categories={categories}
              refreshTrigger={refreshTrigger}
              onEditBudget={handleEditBudget}
              onBudgetDeleted={handleBudgetDeleted}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          </div>
        )}

        {/* Kombineret visning - Side om side layout */}
        {activeView === 'combined' && (
          <div className="combined-layout">
            <div className="overview-panel">
              <div className="panel-header">
                <h2>💰 Aktuel Status</h2>
              </div>
              <BudgetOverview
                categories={categories}
                refreshTrigger={refreshTrigger}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
              />
            </div>
            
            <div className="setup-panel">
              <div className="panel-header">
                <h2>🎯 Administrer Budgetter</h2>
              </div>
              <BudgetSetup
                categories={categories}
                onBudgetAdded={handleBudgetChange}
                onBudgetUpdated={handleBudgetChange}
                onBudgetDeleted={handleBudgetChange}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
              />
            </div>
          </div>
        )}

        {/* Kun oversigt */}
        {activeView === 'overview' && (
          <div className="single-panel">
            <BudgetOverview
              categories={categories}
              refreshTrigger={refreshTrigger}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          </div>
        )}

        {/* Kun administration */}
        {activeView === 'setup' && (
          <div className="single-panel">
            <BudgetSetup
              categories={categories}
              onBudgetAdded={handleBudgetChange}
              onBudgetUpdated={handleBudgetChange}
              onBudgetDeleted={handleBudgetChange}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          </div>
        )}
      </div>

      {/* Quick Stats Footer - Vises altid */}
      <QuickStatsFooter 
        categories={categories} 
        refreshTrigger={refreshTrigger}
        setError={setError}
        activeView={activeView}
      />

      {/* Budget Modal for redigering fra BudgetComparison */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingBudget?.id ? 'Rediger Budget' : 'Opret Nyt Budget'}
              </h2>
              <button 
                className="modal-close-btn"
                onClick={handleCancelEdit}
                title="Luk"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <BudgetSetup
                categories={categories}
                onBudgetAdded={handleBudgetAdded}
                onBudgetUpdated={handleBudgetUpdated}
                onBudgetDeleted={handleBudgetDeleted}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                onCloseModal={handleCancelEdit}
                initialBudget={editingBudget}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Opdateret QuickStatsFooter med flere informationer
function QuickStatsFooter({ categories, refreshTrigger, setError, activeView }) {
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const fetchQuickStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = String(now.getFullYear());
        
        const [budgetResponse, expensesResponse] = await Promise.all([
          fetch(`http://localhost:8001/budgets/?month=${currentMonth}&year=${currentYear}`, {
            headers: getAuthHeader()
          }),
          fetch(`http://localhost:8001/transactions/?type=expense&month=${currentMonth}&year=${currentYear}`, {
            headers: getAuthHeader()
          })
        ]);

        if (budgetResponse.ok && expensesResponse.ok) {
          const budgets = await budgetResponse.json();
          const expenses = await expensesResponse.json();
          
          const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
          const totalSpent = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
          const remaining = totalBudget - totalSpent;
          
          // Beregn udgifter pr. kategori
          const expensesByCategory = {};
          expenses.forEach(exp => {
            if (exp.category_id) {
              expensesByCategory[exp.category_id] = (expensesByCategory[exp.category_id] || 0) + Math.abs(exp.amount);
            }
          });

          // Find kategorier uden budgetter
          const categoriesWithExpensesButNoBudget = Object.keys(expensesByCategory)
            .filter(catId => !budgets.some(b => String(b.category_id) === String(catId)))
            .length;
          
          setQuickStats({
            totalBudget,
            totalSpent,
            remaining,
            budgetCount: budgets.length,
            overBudgetCount: budgets.filter(budget => {
              const categorySpent = expensesByCategory[budget.category_id] || 0;
              return categorySpent > budget.amount;
            }).length,
            categoriesWithoutBudget: categoriesWithExpensesButNoBudget,
            totalTransactions: expenses.length
          });
        }
      } catch (err) {
        console.error("Fejl ved hentning af hurtige stats:", err);
        setError?.("Kunne ikke hente hurtige statistikker");
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, [refreshTrigger, setError]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentMonthName = () => {
    const months = [
      'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };

  if (loading || !quickStats) {
    return (
      <div className="quick-stats-footer loading">
        <div className="loading-spinner small"></div>
        <span>Henter statistikker for {getCurrentMonthName()}...</span>
      </div>
    );
  }

  return (
    <div className="quick-stats-footer">
      <div className="stats-section">
        <div className="section-title">{getCurrentMonthName()} Oversigt</div>
        <div className="stats-grid">
          <div className="quick-stat">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-label">Total Budget</span>
              <span className="stat-value">{formatAmount(quickStats.totalBudget)}</span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">💸</span>
            <div className="stat-info">
              <span className="stat-label">Brugt</span>
              <span className="stat-value">{formatAmount(quickStats.totalSpent)}</span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">💵</span>
            <div className="stat-info">
              <span className="stat-label">Tilbage</span>
              <span className={`stat-value ${quickStats.remaining < 0 ? 'negative' : 'positive'}`}>
                {formatAmount(quickStats.remaining)}
              </span>
            </div>
          </div>
          
          <div className="quick-stat">
            <span className="stat-icon">📊</span>
            <div className="stat-info">
              <span className="stat-label">Budgetter</span>
              <span className="stat-value">
                {quickStats.budgetCount}
                {quickStats.overBudgetCount > 0 && (
                  <span className="alert-badge">{quickStats.overBudgetCount} over!</span>
                )}
              </span>
            </div>
          </div>

          {quickStats.categoriesWithoutBudget > 0 && (
            <div className="quick-stat warning">
              <span className="stat-icon">⚠️</span>
              <div className="stat-info">
                <span className="stat-label">Mangler Budget</span>
                <span className="stat-value">{quickStats.categoriesWithoutBudget} kategorier</span>
              </div>
            </div>
          )}

          <div className="quick-stat info">
            <span className="stat-icon">📈</span>
            <div className="stat-info">
              <span className="stat-label">Aktiv Visning</span>
              <span className="stat-value">{activeView}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetPage;