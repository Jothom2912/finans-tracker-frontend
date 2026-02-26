import React, { useMemo } from 'react';
import CategoryPieChart from '../../Charts/PieChart';
import { formatAmount } from '../../lib/formatters';
import './CategorySpendingOverview.css';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF197C',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384', '#9966FF', '#C9CB3D',
  '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
];

function CategorySpendingOverview({
  expensesByCategory,
  budgetSummary,
  selectedCategoryIds,
  categories,
  loading,
}) {
  const categoryData = useMemo(() => {
    if (!expensesByCategory || Object.keys(expensesByCategory).length === 0) return [];

    const categoryIdToName = {};
    const categoryNameToId = {};
    categories.forEach((cat) => {
      const id = cat.idCategory ?? cat.id;
      categoryIdToName[id] = cat.name;
      categoryNameToId[cat.name] = id;
    });

    return Object.entries(expensesByCategory)
      .map(([name, value]) => {
        const numValue = Math.abs(Number(value));
        if (!name || Number.isNaN(numValue) || numValue <= 0) return null;
        const catId = categoryNameToId[name.trim()];
        return { name: name.trim(), value: numValue, categoryId: catId };
      })
      .filter((item) => {
        if (!item) return false;
        if (selectedCategoryIds.length === 0) return true;
        return selectedCategoryIds.includes(item.categoryId);
      })
      .sort((a, b) => b.value - a.value);
  }, [expensesByCategory, selectedCategoryIds, categories]);

  const totalExpenses = useMemo(
    () => categoryData.reduce((sum, item) => sum + item.value, 0),
    [categoryData],
  );

  const categoryDataWithMeta = useMemo(() => {
    if (totalExpenses === 0) return [];
    return categoryData.map((item, index) => ({
      ...item,
      percentage: ((item.value / totalExpenses) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }));
  }, [categoryData, totalExpenses]);

  const budgetItems = useMemo(() => {
    if (!budgetSummary?.items) return [];
    return budgetSummary.items
      .filter((item) => {
        if (selectedCategoryIds.length === 0) return true;
        return selectedCategoryIds.includes(item.category_id);
      })
      .filter((item) => item.budget_amount > 0 || item.spent_amount > 0);
  }, [budgetSummary, selectedCategoryIds]);

  const stats = useMemo(() => {
    const totalBudget = budgetItems.reduce((sum, i) => sum + (i.budget_amount || 0), 0);
    const budgetedSpent = budgetItems
      .filter((i) => i.budget_amount > 0)
      .reduce((sum, i) => sum + (i.spent_amount || 0), 0);
    const overBudgetCount = budgetItems.filter((i) => i.remaining_amount < 0).length;
    const withinBudgetCount = budgetItems.filter(
      (i) => i.budget_amount > 0 && i.remaining_amount >= 0,
    ).length;

    return {
      totalExpenses,
      totalBudget,
      budgetedSpent,
      overBudgetCount,
      withinBudgetCount,
      categoryCount: categoryData.length,
    };
  }, [totalExpenses, budgetItems, categoryData.length]);

  if (loading) {
    return (
      <div className="spending-overview loading-state">
        <div className="loading-spinner" />
        <p>Indlæser kategori-overblik...</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="spending-overview empty-state">
        <h3>Ingen udgifter fundet</h3>
        <p>Der er ingen transaktioner i den valgte periode og filtrering.</p>
      </div>
    );
  }

  return (
    <div className="spending-overview">
      {/* Summary stats */}
      <div className="spending-stats-grid">
        <div className="spending-stat-card">
          <div className="spending-stat-value expense">
            {formatAmount(stats.totalExpenses)}
          </div>
          <div className="spending-stat-label">Samlet forbrug</div>
        </div>
        <div className="spending-stat-card">
          <div className="spending-stat-value">{stats.categoryCount}</div>
          <div className="spending-stat-label">Kategorier</div>
        </div>
        {stats.totalBudget > 0 && (
          <>
            <div className="spending-stat-card">
              <div className="spending-stat-value">
                {formatAmount(stats.totalBudget)}
              </div>
              <div className="spending-stat-label">Samlet budget</div>
            </div>
            <div className="spending-stat-card">
              <div className={`spending-stat-value ${stats.overBudgetCount > 0 ? 'over-budget' : 'within-budget'}`}>
                {stats.withinBudgetCount} / {stats.withinBudgetCount + stats.overBudgetCount}
              </div>
              <div className="spending-stat-label">Budgetter overholdt</div>
            </div>
          </>
        )}
      </div>

      {/* Chart + list layout */}
      <div className="spending-content">
        <div className="spending-chart-section">
          <h3>Fordeling</h3>
          <CategoryPieChart
            data={categoryDataWithMeta.map(({ name, value }) => ({ name, value }))}
            colors={categoryDataWithMeta.map((item) => item.color)}
          />
        </div>

        <div className="spending-list-section">
          <h3>Udgifter pr. kategori</h3>
          <div className="spending-category-list">
            {categoryDataWithMeta.map((item) => {
              const budgetInfo = budgetItems.find(
                (b) => b.category_id === item.categoryId,
              );
              return (
                <div key={item.name} className="spending-category-row">
                  <div className="spending-category-main">
                    <span
                      className="spending-color-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="spending-category-name">{item.name}</span>
                    <span className="spending-category-pct">({item.percentage}%)</span>
                  </div>
                  <div className="spending-category-amounts">
                    <span className="spending-category-amount">
                      {formatAmount(item.value)}
                    </span>
                    {budgetInfo && budgetInfo.budget_amount > 0 && (
                      <BudgetMiniBar
                        spent={budgetInfo.spent_amount}
                        budget={budgetInfo.budget_amount}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="spending-total-row">
            <strong>I alt: {formatAmount(totalExpenses)}</strong>
          </div>
        </div>
      </div>

      {/* Budget compliance section */}
      {budgetItems.length > 0 && (
        <div className="budget-compliance-section">
          <h3>Budget-overholdelse</h3>
          <div className="budget-compliance-list">
            {budgetItems
              .filter((item) => item.budget_amount > 0)
              .sort((a, b) => (b.percentage_used || 0) - (a.percentage_used || 0))
              .map((item) => (
                <BudgetComplianceRow key={item.category_id} item={item} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetMiniBar({ spent, budget }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isOver = spent > budget;

  return (
    <div className="budget-mini-bar-wrapper">
      <div className="budget-mini-bar">
        <div
          className={`budget-mini-fill ${isOver ? 'over' : pct >= 80 ? 'warning' : 'ok'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`budget-mini-label ${isOver ? 'over' : ''}`}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function BudgetComplianceRow({ item }) {
  const pct = item.percentage_used || 0;
  const isOver = item.remaining_amount < 0;
  const isClose = pct >= 80 && !isOver;

  let statusClass = 'ok';
  let statusText = 'Inden for budget';
  if (isOver) {
    statusClass = 'over';
    statusText = 'Overskredet';
  } else if (isClose) {
    statusClass = 'warning';
    statusText = 'Tæt på grænsen';
  }

  return (
    <div className={`compliance-row ${statusClass}`}>
      <div className="compliance-info">
        <span className="compliance-name">{item.category_name}</span>
        <span className={`compliance-status ${statusClass}`}>{statusText}</span>
      </div>
      <div className="compliance-bar-wrapper">
        <div className="compliance-bar">
          <div
            className={`compliance-fill ${statusClass}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
      <div className="compliance-amounts">
        <span className="compliance-spent">{formatAmount(item.spent_amount)}</span>
        <span className="compliance-divider">/</span>
        <span className="compliance-budget">{formatAmount(item.budget_amount)}</span>
        <span className={`compliance-remaining ${isOver ? 'over' : ''}`}>
          ({isOver ? '' : '+'}{formatAmount(item.remaining_amount)})
        </span>
      </div>
    </div>
  );
}

export default CategorySpendingOverview;
