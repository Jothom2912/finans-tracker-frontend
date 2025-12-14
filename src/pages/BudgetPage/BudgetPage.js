// src/pages/BudgetPage.js
import React, { useState } from 'react';
import BudgetSetup from '../../components/Budget/BudgetSetup/BudgetSetup';
import BudgetComparison from '../../components/Budget/BudgetComparison/BudgetComparison';
import './BudgetPage.css';

function BudgetPage({ categories, setError, setSuccessMessage }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState('comparison'); // Default til oversigt
  
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

  // Budget CRUD handlers
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

  // View configuration - Simplificeret til 2 hovedviews
  const views = [
    {
      id: 'comparison',
      label: 'Budget Oversigt',
      icon: '📊',
      description: 'Se budget sammenligning med faktiske udgifter'
    },
    {
      id: 'setup',
      label: 'Administrer',
      icon: '⚙️',
      description: 'Opret og rediger budgetter'
    }
  ];

  return (
    <div className="budget-page">
      <div className="budget-page-header">
        <div className="header-content">
          <h1>💰 Budget</h1>
          <p className="header-subtitle">
            Hold styr på dine budgetter og udgifter
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
        {/* Budget Oversigt - Default view */}
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

        {/* Administration */}
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

      {/* Budget Modal for redigering */}
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

export default BudgetPage;