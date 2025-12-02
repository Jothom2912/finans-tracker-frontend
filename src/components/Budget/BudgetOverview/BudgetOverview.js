    // frontend/src/components/BudgetOverview/BudgetOverview.js
    import React, { useState, useEffect, useMemo } from 'react';
    import MessageDisplay from '../../MessageDisplay';
    import './BudgetOverview.css';

    function BudgetOverview({ categories, refreshTrigger, setError, setSuccessMessage }) {
        const [summary, setSummary] = useState(null);
        const [loading, setLoading] = useState(true);
        const [localError, setLocalError] = useState(null);

        // State for den valgte periode
        const [selectedMonth, setSelectedMonth] = useState('');
        const [selectedYear, setSelectedYear] = useState('');

        // Memoized optioner for bedre performance
        const monthOptions = useMemo(() => [
            { value: '01', label: 'Januar' }, { value: '02', label: 'Februar' },
            { value: '03', label: 'Marts' }, { value: '04', label: 'April' },
            { value: '05', label: 'Maj' }, { value: '06', label: 'Juni' },
            { value: '07', label: 'Juli' }, { value: '08', label: 'August' },
            { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
            { value: '11', label: 'November' }, { value: '12', label: 'December' }
        ], []);

        const yearOptions = useMemo(() => {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = currentYear - 2; i <= currentYear + 2; i++) {
                years.push(i);
            }
            return years;
        }, []);

        useEffect(() => {
            // Sæt default måned og år til nuværende, hvis ikke allerede valgt
            const now = new Date();
            if (!selectedMonth) setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
            if (!selectedYear) setSelectedYear(String(now.getFullYear()));
        }, [selectedMonth, selectedYear]);

        useEffect(() => {
            if (!selectedMonth || !selectedYear) {
                return; // Vent indtil måned og år er sat
            }

            async function fetchData() {
                setLoading(true);
                setLocalError(null);
                setError?.(null); // Ryd også ekstern fejlbesked

                try {
                    const response = await fetch(`http://localhost:8000/budgets/summary?month=${selectedMonth}&year=${selectedYear}`);
                    if (!response.ok) {
                        const errorDetail = await response.json();
                        throw new Error(`Kunne ikke hente budgetoversigt: ${errorDetail.detail || 'Ukendt fejl'}`);
                    }
                    const data = await response.json();
                    setSummary(data);

                } catch (err) {
                    console.error("Fejl under hentning af budgetdata:", err);
                    const errorMessage = err.message || "Der opstod en fejl under hentning af budgetdata.";
                    setLocalError(errorMessage);
                    setError?.(errorMessage);
                    setSummary(null);
                } finally {
                    setLoading(false);
                }
            }

            fetchData();
        }, [selectedMonth, selectedYear, refreshTrigger, setError]);

        // Beregn samlet budget-statistik
        const budgetStats = useMemo(() => {
            if (!summary) {
                return {
                    totalBudget: 0,
                    totalSpent: 0,
                    totalRemaining: 0,
                    overallPercentage: 0,
                    budgetCount: 0,
                    overBudgetCount: 0
                };
            }

            const totalBudget = summary.total_budget || 0;
            const totalSpent = summary.total_spent || 0;
            const totalRemaining = summary.total_remaining || 0;
            const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

            const budgetCount = (summary.items || []).filter(i => i.budget_amount > 0).length;
            const overBudgetCount = (summary.items || []).filter(i => i.remaining_amount < 0).length;

            return {
                totalBudget,
                totalSpent,
                totalRemaining,
                overallPercentage,
                budgetCount,
                overBudgetCount
            };
        }, [summary]);

        // Forbered budgetoversigten
        const budgetSummary = useMemo(() => {
            if (!summary || !summary.items) return [];
            const items = summary.items.map((item, idx) => {
                const categoryName = item.category_name || (categories.find(c => c.id === item.category_id)?.name) || 'Ukendt kategori';
                let status = 'within-budget';
                if (item.budget_amount === 0 && item.spent_amount > 0) {
                    status = 'no-budget';
                } else if (item.remaining_amount < 0) {
                    status = 'over-budget';
                } else if (item.percentage_used >= 90) {
                    status = 'close-to-limit';
                } else if (item.percentage_used >= 75) {
                    status = 'approaching-limit';
                }
                return {
                    id: `${item.category_id}-${idx}`,
                    category_id: item.category_id,
                    amount: item.budget_amount,
                    spent: item.spent_amount,
                    remaining: item.remaining_amount,
                    percentageUsed: item.percentage_used,
                    categoryName,
                    status
                };
            }).sort((a, b) => {
                const statusOrder = {
                    'over-budget': 0,
                    'close-to-limit': 1,
                    'approaching-limit': 2,
                    'within-budget': 3,
                    'no-budget': 4
                };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                return b.percentageUsed - a.percentageUsed;
            });
            return items;
        }, [summary, categories]);

        const formatAmount = (amount) => {
            return new Intl.NumberFormat('da-DK', {
                style: 'currency',
                currency: 'DKK',
                minimumFractionDigits: 2
            }).format(amount);
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'over-budget':
                    return '🚨';
                case 'close-to-limit':
                    return '⚠️';
                case 'approaching-limit':
                    return '🟡';
                case 'within-budget':
                    return '✅';
                case 'no-budget':
                    return '❌';
                default:
                    return '';
            }
        };

        const getStatusText = (status) => {
            switch (status) {
                case 'over-budget':
                    return 'Overskredet!';
                case 'close-to-limit':
                    return 'Tæt på grænsen';
                case 'approaching-limit':
                    return 'Nærmer sig grænsen';
                case 'within-budget':
                    return 'Inden for budget';
                case 'no-budget':
                    return 'Ingen budget!';
                default:
                    return '';
            }
        };

        const getCurrentPeriodLabel = () => {
            const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
            return `${monthLabel} ${selectedYear}`;
        };

        if (loading) {
            return (
                <div className="budget-overview-container">
                    <div className="budget-overview-loading">
                        <div className="loading-spinner"></div>
                        <p>Henter budgetoversigt...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="budget-overview-container">
                <div className="budget-overview-header">
                    <h2 className="budget-overview-title">Budgetoversigt</h2>
                    <div className="period-selector">
                        <label htmlFor="month-select">Måned:</label>
                        <select
                            id="month-select"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="period-select"
                        >
                            {monthOptions.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>

                        <label htmlFor="year-select">År:</label>
                        <select
                            id="year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="period-select"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <MessageDisplay message={localError} type="error" />

                {budgetStats.budgetCount > 0 && (
                    <div className="budget-stats-summary">
                        <h3>Oversigt for {getCurrentPeriodLabel()}</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Budget</span>
                                <span className="stat-value">{formatAmount(budgetStats.totalBudget)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Total Brugt</span>
                                <span className="stat-value">{formatAmount(budgetStats.totalSpent)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Total Resterende</span>
                                <span className={`stat-value ${budgetStats.totalRemaining < 0 ? 'negative' : 'positive'}`}>
                                    {formatAmount(budgetStats.totalRemaining)}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Samlet Forbrug</span>
                                <span className="stat-value">{budgetStats.overallPercentage.toFixed(1)}%</span>
                            </div>
                        </div>
                        {budgetStats.overBudgetCount > 0 && (
                            <div className="alert-summary">
                                🚨 {budgetStats.overBudgetCount} af {budgetStats.budgetCount} budgetter er overskredet
                            </div>
                        )}
                    </div>
                )}

                {budgetSummary.length === 0 && !loading && !localError ? (
                    <div className="no-budgets-message">
                        <p>Ingen budgetter eller udgifter fundet for {getCurrentPeriodLabel()}.</p>
                        <p>Opret et budget for at komme i gang!</p>
                    </div>
                ) : (
                    <div className="budget-list-container">
                        {budgetSummary.map(item => (
                            <div key={item.id} className={`budget-item ${item.status}`}>
                                <div className="budget-item-header">
                                    <div className="category-info">
                                        <span className="status-icon">{getStatusIcon(item.status)}</span>
                                        <span className="category-name">{item.categoryName}</span>
                                    </div>
                                    {item.amount > 0 && (
                                        <span className="budget-amount">Budget: {formatAmount(item.amount)}</span>
                                    )}
                                </div>
                                
                                <div className="budget-item-progress">
                                    <div className="progress-bar-background">
                                        <div 
                                            className="progress-bar-fill" 
                                            style={{ width: `${Math.min(100, item.percentageUsed)}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-info">
                                        <span className="percentage-text">{item.percentageUsed.toFixed(1)}% brugt</span>
                                        <span className="status-text">{getStatusText(item.status)}</span>
                                    </div>
                                </div>
                                
                                <div className="budget-item-details">
                                    <div className="amount-info">
                                        <span className="spent-amount">Brugt: {formatAmount(item.spent)}</span>
                                        <span className={`remaining-amount ${item.remaining < 0 ? 'negative' : 'positive'}`}>
                                            Resterende: {formatAmount(item.remaining)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    export default BudgetOverview;