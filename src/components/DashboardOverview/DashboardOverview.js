// frontend/src/components/DashboardOverview.js

import './DashboardOverview.css'; // Importer CSS for styling

import React, { useState, useEffect } from 'react';
// Importér en specifik CSS-fil, hvis du ønsker at isolere stilarter for Dashboardet
// import './DashboardOverview.css'; // Opret denne fil, hvis du vil!

function DashboardOverview({ startDate, endDate, refreshTrigger }) {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      setError(null);

      let url = 'http://localhost:8000/dashboard/overview/';
      const params = new URLSearchParams();

      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        const response = await fetch(url);

        if (!response.ok) {
          const errorDetail = await response.json();
          throw new Error(`HTTP error! status: ${response.status} - ${errorDetail.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        setOverviewData(data);
      } catch (e) {
        console.error("Error fetching dashboard overview:", e);
        setError(e.message || "Could not fetch dashboard data.");
        setOverviewData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [startDate, endDate, refreshTrigger]);

  if (loading) {
    return <div className="dashboard-loading">Loading financial overview...</div>;
  }

  if (error) {
    return <div className="dashboard-error" style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!overviewData || Object.keys(overviewData).length === 0) {
    return <div className="dashboard-no-data">No overview data available for the selected period.</div>;
  }

  return (
    <div className="dashboard-overview-container"> {/* Container for hele dashboardet */}
      <h2 className="dashboard-title">Financial Overview</h2>
      <p className="dashboard-period"><strong>Period:</strong> {overviewData.start_date} to {overviewData.end_date}</p>

      <div className="dashboard-summary-cards"> {/* Flex container for summary cards */}
        <div className="summary-card income-card">
          <h3>Total Income</h3>
          <p className="amount income-amount">{(overviewData.total_income ?? 0).toFixed(2)} DKK</p>
        </div>
        <div className="summary-card expenses-card">
          <h3>Total Expenses</h3>
          <p className="amount expenses-amount">{(overviewData.total_expenses ?? 0).toFixed(2)} DKK</p>
        </div>
        <div className="summary-card net-change-card">
          <h3>Net Change</h3>
          <p className="amount net-change-amount">{(overviewData.net_change_in_period ?? 0).toFixed(2)} DKK</p>
        </div>
        <div className="summary-card balance-card">
          <h3>Current Balance</h3>
          <p className="amount balance-amount">{(overviewData.current_account_balance ?? 0).toFixed(2)} DKK</p>
        </div>
      </div>

      <div className="dashboard-category-expenses">
        <h3>Expenses by Category:</h3>
        {overviewData.expenses_by_category && Object.keys(overviewData.expenses_by_category).length > 0 ? (
          <ul className="category-list">
            {Object.entries(overviewData.expenses_by_category).map(([category, amount]) => (
              <li key={category} className="category-item">
                <span className="category-name">{category}:</span> <span className="category-amount">{(amount ?? 0).toFixed(2)} DKK</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No expenses recorded for this period.</p>
        )}
      </div>
      {/* Her kunne du nemt integrere et Pie Chart for udgifter fordelt på kategorier */}
    </div>
  );
}

export default DashboardOverview;