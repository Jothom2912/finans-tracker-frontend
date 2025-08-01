import './DashboardOverview.css';
import React from 'react';  
import CategoryPieChart from '../../Charts/PieChart';
import SummaryCards from '../SummaryCards/SummaryCards';
import CategoryExpensesList from '../CategoryExpensesList/CategoryExpensesList';
import { useDashboardData } from '../../hooks/useDashboardData/useDashboardData' ;

function DashboardOverview({ startDate, endDate, refreshTrigger }) {
  const {
    overviewData,
    loading,
    error,
    chartError,
    processedCategoryData,
    categoryDataWithPercentages,
    formatAmount,
    formatDate
  } = useDashboardData(startDate, endDate, refreshTrigger);

  // Error boundary for chart rendering
  const renderChart = () => {
    try {
      if (chartError) {
        return (
          <div className="chart-error">
            <h3>Chart Error</h3>
            <p>{chartError}</p>
          </div>
        );
      }

      if (!processedCategoryData || processedCategoryData.length === 0) {
        return (
          <div className="no-chart-data">
            <h3>No expense data to display</h3>
            <p>No expenses recorded for this period.</p>
          </div>
        );
      }

      const validData = processedCategoryData.every(item => 
        item && 
        typeof item === 'object' && 
        typeof item.name === 'string' && 
        typeof item.value === 'number' && 
        !isNaN(item.value) && 
        item.value > 0
      );

      if (!validData) {
        console.error('Invalid data structure for chart:', processedCategoryData);
        return (
          <div className="chart-error">
            <h3>Chart Data Error</h3>
            <p>Invalid data structure detected. Please check the console for details.</p>
          </div>
        );
      }

      return (
        <div className="pie-chart-container">
          <CategoryPieChart data={processedCategoryData} colors={categoryDataWithPercentages.map(item => item.color)} />
        </div>
      );
    } catch (error) {
      console.error('Error rendering chart:', error);
      return (
        <div className="chart-error">
          <h3>Chart Rendering Error</h3>
          <p>An error occurred while rendering the chart: {error.message}</p>
        </div>
      );
    }
  };

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
    <div className="dashboard-overview-container">
      <h2 className="dashboard-title">Financial Overview</h2>
      <p className="dashboard-period">
        <strong>Period:</strong> {formatDate(overviewData.start_date)} to {formatDate(overviewData.end_date)}
      </p>

      <SummaryCards
        totalIncome={overviewData.total_income}
        totalExpenses={overviewData.total_expenses}
        netChange={overviewData.net_change_in_period}
        currentBalance={overviewData.current_account_balance}
        formatAmount={formatAmount}
      />

      {/* --- NY KORT TIL GENNEMSNITLIGE MÅNEDLIGE UDGIFTER --- */}
      <div className="average-monthly-expenses-card card">
        <h3>Gennemsnitlige Månedlige Udgifter</h3>
        <p className="amount">{formatAmount(overviewData.average_monthly_expenses)} DKK</p>
      </div>
      {/* --- SLUT NY KORT --- */}

      <div className="dashboard-content">
        <div className="dashboard-charts-section">
          {renderChart()}
        </div>

        <div className="dashboard-category-expenses">
          <h3>Expenses by Category</h3>
          <CategoryExpensesList
            data={categoryDataWithPercentages}
            totalExpenses={overviewData.total_expenses} // Consider if you want total or average here
            formatAmount={formatAmount}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;