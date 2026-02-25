import React from 'react';
import CategoryPieChart from '../../Charts/PieChart';
import { Link } from 'react-router-dom';
import SummaryCards from '../SummaryCards/SummaryCards';
import CategoryExpensesList from '../CategoryExpensesList/CategoryExpensesList';
import { useDashboardData } from '../../hooks/useDashboardData/useDashboardData';
import './DashboardOverview.css';

function DashboardOverview({ startDate, endDate }) {
  const {
    overviewData,
    loading,
    error,
    chartError,
    processedCategoryData,
    categoryDataWithPercentages,
    formatAmount,
    formatDate,
  } = useDashboardData(startDate, endDate);

  const renderChart = () => {
    if (chartError) {
      return (
        <div className="chart-error">
          <h3>Diagramfejl</h3>
          <p>{chartError}</p>
        </div>
      );
    }

    if (!processedCategoryData || processedCategoryData.length === 0) {
      return (
        <div className="no-chart-data">
          <h3>Ingen udgiftsdata at vise</h3>
          <p>Ingen udgifter registreret i denne periode.</p>
          <Link to="/transactions" className="empty-state-link">
            Tilføj din første transaktion
          </Link>
        </div>
      );
    }

    const validData = processedCategoryData.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.value === 'number' &&
        !Number.isNaN(item.value) &&
        item.value > 0,
    );

    if (!validData) {
      return (
        <div className="chart-error">
          <h3>Fejl i diagramdata</h3>
          <p>Ugyldig datastruktur registreret.</p>
        </div>
      );
    }

    return (
      <div className="pie-chart-container">
        <CategoryPieChart
          data={processedCategoryData}
          colors={categoryDataWithPercentages.map((item) => item.color)}
        />
      </div>
    );
  };

  if (loading) return <div className="dashboard-loading">Indlæser økonomisk overblik...</div>;
  if (error) return <div className="dashboard-error">Fejl: {error}</div>;
  if (!overviewData || Object.keys(overviewData).length === 0) {
    return (
      <div className="dashboard-no-data">
        <p>Ingen oversigtsdata tilgængelige for den valgte periode.</p>
        <Link to="/transactions" className="empty-state-link">
          Tilføj din første transaktion
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-overview-container">
      <h2 className="dashboard-title">Økonomisk overblik</h2>
      <p className="dashboard-period">
        <strong>Periode:</strong> {formatDate(overviewData.start_date)} til {formatDate(overviewData.end_date)}
      </p>

      <SummaryCards
        totalIncome={overviewData.total_income}
        totalExpenses={overviewData.total_expenses}
        netChange={overviewData.net_change_in_period}
        currentBalance={overviewData.current_account_balance}
        formatAmount={formatAmount}
      />

      <div className="average-monthly-expenses-card card">
        <h3>Gennemsnitlige Månedlige Udgifter</h3>
        <p className="amount">{formatAmount(overviewData.average_monthly_expenses)} DKK</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-charts-section">{renderChart()}</div>
        <div className="dashboard-category-expenses">
          <h3>Udgifter pr. kategori</h3>
          <CategoryExpensesList
            data={categoryDataWithPercentages}
            totalExpenses={overviewData.total_expenses}
            formatAmount={formatAmount}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
