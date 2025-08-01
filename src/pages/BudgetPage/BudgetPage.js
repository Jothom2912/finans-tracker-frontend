// src/pages/BudgetPage.js
import React, { useState, useEffect } from 'react';
import BudgetOverview from '../../components/Budget/BudgetOverview/BudgetOverview';
import BudgetSetup from '../../components/Budget/BudgetSetup/BudgetSetup';
import './BudgetPage.js'; // Husk at oprette denne CSS-fil

function BudgetPage({ categories, setError, setSuccessMessage }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'setup', 'combined'
  const [loading, setLoading] = useState(false);

  // Callback funktioner til at håndtere budget ændringer
  const handleBudgetChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setError?.(null);
    setSuccessMessage?.(null);
  };

  return (
    <div className="budget-page">
      <div className="budget-page-header">
        <h1>Budget Administration</h1>
        <div className="view-toggle">
          <button
            className={`toggle-button ${activeView === 'combined' ? 'active' : ''}`}
            onClick={() => handleViewChange('combined')}
            title="Samlet visning - se både oversigt og administration"
          >
            📊 Komplet Oversigt
          </button>
          <button
            className={`toggle-button ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => handleViewChange('overview')}
            title="Kun budgetoversigt"
          >
            📈 Kun Oversigt
          </button>
          <button
            className={`toggle-button ${activeView === 'setup' ? 'active' : ''}`}
            onClick={() => handleViewChange('setup')}
            title="Kun budgetadministration"
          >
            ⚙️ Administration
          </button>
        </div>
      </div>

      <div className={`budget-content ${activeView}`}>
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
      />
    </div>
  );
}

// Lille komponent til at vise hurtige stats nederst
function QuickStatsFooter({ categories, refreshTrigger, setError }) {
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuickStats = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = String(now.getFullYear());
        
        const [budgetResponse, expensesResponse] = await Promise.all([
          fetch(`http://localhost:8000/budgets/?month=${currentMonth}&year=${currentYear}`),
          fetch(`http://localhost:8000/transactions/?type=expense&month=${currentMonth}&year=${currentYear}`)
        ]);

        if (budgetResponse.ok && expensesResponse.ok) {
          const budgets = await budgetResponse.json();
          const expenses = await expensesResponse.json();
          
          const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
          const totalSpent = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
          const remaining = totalBudget - totalSpent;
          
          setQuickStats({
            totalBudget,
            totalSpent,
            remaining,
            budgetCount: budgets.length,
            overBudgetCount: budgets.filter(budget => {
              const categorySpent = expenses
                .filter(e => e.category_id === budget.category_id)
                .reduce((sum, e) => sum + Math.abs(e.amount), 0);
              return categorySpent > budget.amount;
            }).length
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

  if (loading || !quickStats) {
    return (
      <div className="quick-stats-footer loading">
        <div className="loading-spinner small"></div>
        <span>Henter hurtige statistikker...</span>
      </div>
    );
  }

  return (
    <div className="quick-stats-footer">
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
    </div>
  );
}

export default BudgetPage;