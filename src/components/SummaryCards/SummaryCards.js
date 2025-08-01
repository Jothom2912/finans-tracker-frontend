// frontend/src/components/SummaryCards.js
import React from 'react';
import './SummaryCards.css'; // Opret denne CSS-fil

function SummaryCards({ totalIncome, totalExpenses, netChange, currentBalance, formatAmount }) {
  return (
    <div className="dashboard-summary-cards">
      <div className="summary-card income-card">
        <h3>Total Income</h3>
        <p className="amount income-amount">{formatAmount(totalIncome)}</p>
      </div>
      <div className="summary-card expenses-card">
        <h3>Total Expenses</h3>
        <p className="amount expenses-amount">{formatAmount(totalExpenses)}</p>
      </div>
      <div className="summary-card net-change-card">
        <h3>Net Change</h3>
        <p className={`amount net-change-amount ${netChange >= 0 ? 'positive' : 'negative'}`}>
          {formatAmount(netChange)}
        </p>
      </div>
      <div className="summary-card balance-card">
        <h3>Current Balance</h3>
        <p className={`amount balance-amount ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
          {formatAmount(currentBalance)}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;