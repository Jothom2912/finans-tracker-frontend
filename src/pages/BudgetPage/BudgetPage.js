import React, { useState } from 'react';
import BudgetSetup from '../../components/Budget/BudgetSetup/BudgetSetup';
import BudgetComparison from '../../components/Budget/BudgetComparison/BudgetComparison';
import MessageDisplay from '../../components/MessageDisplay';
import { useCategories } from '../../hooks/useCategories';
import { useNotifications } from '../../hooks/useNotifications';
import './BudgetPage.css';

function BudgetPage() {
  const { categories } = useCategories();
  const { error, successMessage, showError, showSuccess } = useNotifications();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState('comparison');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const handleBudgetChange = () => setRefreshTrigger((prev) => prev + 1);

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleBudgetSaved = () => {
    handleBudgetChange();
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setShowBudgetModal(false);
  };

  const views = [
    { id: 'comparison', label: 'Budget Oversigt', icon: '📊', description: 'Se budget sammenligning med faktiske udgifter' },
    { id: 'setup', label: 'Administrer', icon: '⚙️', description: 'Opret og rediger budgetter' },
  ];

  return (
    <div className="budget-page">
      <div className="budget-page-header">
        <div className="header-content">
          <h1>Budget</h1>
          <p className="header-subtitle">Hold styr på dine budgetter og udgifter</p>
        </div>
      </div>

      {error && <MessageDisplay message={error} type="error" />}
      {successMessage && <MessageDisplay message={successMessage} type="success" />}

      <div className="view-toggle">
        {views.map((view) => (
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
        {activeView === 'comparison' && (
          <div className="single-panel">
            <BudgetComparison
              categories={categories}
              refreshTrigger={refreshTrigger}
              setError={showError}
              setSuccessMessage={showSuccess}
              onEditBudget={handleEditBudget}
            />
          </div>
        )}
        {activeView === 'setup' && (
          <div className="single-panel">
            <BudgetSetup
              categories={categories}
              onBudgetAdded={handleBudgetChange}
              onBudgetUpdated={handleBudgetChange}
              onBudgetDeleted={handleBudgetChange}
              setError={showError}
              setSuccessMessage={showSuccess}
            />
          </div>
        )}
      </div>

      {showBudgetModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBudget?.id ? 'Rediger Budget' : 'Opret Nyt Budget'}</h2>
              <button className="modal-close-btn" onClick={handleCancelEdit} title="Luk">✕</button>
            </div>
            <div className="modal-body">
              <BudgetSetup
                categories={categories}
                onBudgetAdded={handleBudgetSaved}
                onBudgetUpdated={handleBudgetSaved}
                onBudgetDeleted={handleBudgetChange}
                setError={showError}
                setSuccessMessage={showSuccess}
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
