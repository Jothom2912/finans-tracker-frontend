// src/pages/GoalPage.js
import React, { useState } from 'react';
import GoalOverview from '../../components/Goal/GoalOverview/GoalOverview';
import GoalSetup from '../../components/Goal/GoalSetup/GoalSetup';
import './GoalPage.css';

function GoalPage({ setError, setSuccessMessage }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState('overview'); // Default til oversigt
  
  // Modal state til goal redigering
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Callback funktioner til at håndtere goal ændringer
  const handleGoalChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setError?.(null);
    setSuccessMessage?.(null);
  };

  // Goal CRUD handlers
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleGoalAdded = () => {
    handleGoalChange();
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const handleGoalUpdated = () => {
    handleGoalChange();
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const handleGoalDeleted = () => {
    handleGoalChange();
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setShowGoalModal(false);
  };

  // View configuration - Simplificeret til 2 hovedviews
  const views = [
    {
      id: 'overview',
      label: 'Mål Oversigt',
      icon: '🎯',
      description: 'Se alle dine mål og fremgang'
    },
    {
      id: 'setup',
      label: 'Administrer',
      icon: '⚙️',
      description: 'Opret og rediger mål'
    }
  ];

  return (
    <div className="goal-page">
      <div className="goal-page-header">
        <div className="header-content">
          <h1>🎯 Mål</h1>
          <p className="header-subtitle">
            Sæt og opnå dine sparemål
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

      <div className={`goal-content ${activeView}`}>
        {/* Goal Oversigt - Default view */}
        {activeView === 'overview' && (
          <div className="single-panel">
            <GoalOverview
              refreshTrigger={refreshTrigger}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
              onEditGoal={handleEditGoal}
            />
          </div>
        )}

        {/* Administration */}
        {activeView === 'setup' && (
          <div className="single-panel">
            <GoalSetup
              onGoalAdded={handleGoalChange}
              onGoalUpdated={handleGoalChange}
              onGoalDeleted={handleGoalChange}
              setError={setError}
              setSuccessMessage={setSuccessMessage}
            />
          </div>
        )}
      </div>

      {/* Goal Modal for redigering */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingGoal?.idGoal ? 'Rediger Mål' : 'Opret Nyt Mål'}
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
              <GoalSetup
                onGoalAdded={handleGoalAdded}
                onGoalUpdated={handleGoalUpdated}
                onGoalDeleted={handleGoalDeleted}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                onCloseModal={handleCancelEdit}
                initialGoal={editingGoal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalPage;

