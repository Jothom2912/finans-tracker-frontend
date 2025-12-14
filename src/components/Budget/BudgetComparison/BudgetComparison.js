// frontend/src/components/BudgetComparison/BudgetComparison.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../../utils/apiClient';
import MessageDisplay from '../../MessageDisplay';
import BudgetItem from '../BudgetItem/BudgetItem';
import './BudgetComparison.css';

function BudgetComparison({ 
    categories, 
    refreshTrigger, 
    setError, 
    setSuccessMessage,
    onEditBudget 
}) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [localError, setLocalError] = useState(null);
    
    // CSV upload state
    const [csvFile, setCsvFile] = useState(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [csvUploadSuccess, setCsvUploadSuccess] = useState(null);

    // Filter state - Initialiser med nuværende måned/år
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(() => String(now.getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(() => String(now.getFullYear()));
    const [viewMode, setViewMode] = useState('comparison'); // 'comparison', 'budgets-only', 'expenses-only'

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

    // Fetch data når periode ændres
    const fetchData = useCallback(async () => {
        if (!selectedMonth || !selectedYear) return;

        // Konverter til integers - fjern eventuelle leading zeros
        const monthStr = String(selectedMonth).trim();
        const yearStr = String(selectedYear).trim();
        
        // Backend forventer month som int (1-12) og year som int
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);

        // Valider at month og year er gyldige heltal
        if (isNaN(month) || month < 1 || month > 12) {
            setLocalError(`Ugyldig måned: ${selectedMonth}`);
            return;
        }
        if (isNaN(year) || year < 2000 || year > 9999) {
            setLocalError(`Ugyldigt år: ${selectedYear}`);
            return;
        }

        // Sikrer at værdierne er gyldige heltal før API kald
        if (!Number.isInteger(month) || !Number.isInteger(year)) {
            setLocalError(`Ugyldige værdier: måned=${selectedMonth}, år=${selectedYear}`);
            return;
        }

        setLoading(true);
        setLocalError(null);
        setError?.(null);

        try {
            // Backend accepterer month og year som strings og konverterer dem til integers
            // Send dem direkte i URL'en - JavaScript konverterer automatisk til strings i URL
            const response = await apiClient.get(`/budgets/summary?month=${month}&year=${year}`);
            if (!response.ok) {
                let errorMessage = 'Ukendt fejl';
                try {
                    const errorData = await response.json();
                    // Håndter både string og object fejlbeskeder
                    if (typeof errorData === 'string') {
                        errorMessage = errorData;
                    } else if (errorData.detail) {
                        // Håndter både string og array af fejlbeskeder
                        if (Array.isArray(errorData.detail)) {
                            errorMessage = errorData.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
                        } else {
                            errorMessage = errorData.detail;
                        }
                    } else {
                        errorMessage = JSON.stringify(errorData);
                    }
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(`Kunne ikke hente budget oversigt: ${errorMessage}`);
            }
            const data = await response.json();
            console.log("BudgetComparison: Modtaget summary data:", data);
            console.log("BudgetComparison: Items count:", data?.items?.length || 0);
            console.log("BudgetComparison: Items:", data?.items);
            
            // Valider at data har den forventede struktur
            if (!data || typeof data !== 'object') {
                console.error("BudgetComparison: Ugyldig data struktur:", data);
                throw new Error("Ugyldig data modtaget fra serveren");
            }
            
            if (!Array.isArray(data.items)) {
                console.warn("BudgetComparison: data.items er ikke en array:", data.items);
                // Sæt items til tom array hvis den mangler
                data.items = [];
            }
            
            setSummary(data);

        } catch (err) {
            console.error("Fejl ved hentning af sammenligningsdata:", err);
            const errorMessage = err.message || "Der opstod en fejl ved hentning af data.";
            setLocalError(errorMessage);
            setError?.(errorMessage);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, setError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Beregn udgifter pr. kategori
    // **Bemærk**: Dette hook er her stadig, men bruges faktisk ikke længere i comparisonData, 
    // da summary.items indeholder spent_amount. Jeg har beholdt det af sikkerhedsgrunde.
    // const expensesByCategory = useMemo(() => {
    //     if (!summary || !summary.items) return {};
    //     const map = {};
    //     summary.items.forEach(i => {
    //         map[i.category_id] = i.spent_amount || 0;
    //     });
    //     return map;
    // }, [summary]);

    // Opret sammenligningsdata
    const comparisonData = useMemo(() => {
        const data = [];
        
        console.log("BudgetComparison: Opretter comparisonData, summary:", summary);
        console.log("BudgetComparison: summary.items:", summary?.items);
        console.log("BudgetComparison: summary.items type:", typeof summary?.items);
        console.log("BudgetComparison: summary.items isArray:", Array.isArray(summary?.items));
        
        // Budgetter med faktiske udgifter
        if (summary && summary.items && Array.isArray(summary.items)) {
            console.log("BudgetComparison: Processing", summary.items.length, "items");
            summary.items.forEach((item, index) => {
                console.log(`BudgetComparison: Processing item ${index}:`, item);
                console.log(`BudgetComparison: Item ${index} - budget_amount:`, item.budget_amount, "type:", typeof item.budget_amount);
                
                // Tjek om budget_amount er større end 0 (håndter både number og string)
                const budgetAmount = typeof item.budget_amount === 'string' 
                    ? parseFloat(item.budget_amount) 
                    : (item.budget_amount || 0);
                
                if (budgetAmount > 0) {
                    const categoryName = item.category_name || (categories.find(cat => cat.id === item.category_id)?.name) || 'Ukendt kategori';
                    const spentAmount = typeof item.spent_amount === 'string'
                        ? parseFloat(item.spent_amount)
                        : (item.spent_amount || 0);
                    
                    console.log(`BudgetComparison: Adding budget item for category ${item.category_id}, amount: ${budgetAmount}, spent: ${spentAmount}`);
                    
                    data.push({
                        id: `budget-${item.category_id}`,
                        type: 'budget',
                        budget: { id: null, amount: budgetAmount, category_id: item.category_id },
                        spent: spentAmount,
                        categoryName,
                        categoryId: item.category_id
                    });
                } else {
                    console.log(`BudgetComparison: Skipping item ${index} - budget_amount is 0 or invalid`);
                }
            });
        } else {
            console.warn("BudgetComparison: summary eller summary.items er ikke gyldig:", {
                hasSummary: !!summary,
                hasItems: !!summary?.items,
                isArray: Array.isArray(summary?.items)
            });
        }

        // Kategorier med udgifter men ingen budgetter (kun i 'comparison' mode)
        if ((viewMode === 'comparison' || viewMode === 'expenses-only') && summary && summary.items) {
            summary.items.forEach(item => {
                if (item.budget_amount === 0 && (item.spent_amount || 0) > 0) {
                    const category = categories.find(c => String(c.id) === String(item.category_id));
                    if (category && category.type === 'expense') {
                        data.push({
                            id: `no-budget-${item.category_id}`,
                            type: 'no-budget',
                            budget: { id: null, amount: 0, category_id: item.category_id },
                            spent: item.spent_amount,
                            categoryName: item.category_name || category.name,
                            categoryId: item.category_id
                        });
                    }
                }
            });
        }

        // Sorter efter prioritet: overskredet budget først, derefter mest brugte
        const sorted = data.sort((a, b) => {
            const aOverBudget = a.spent > a.budget.amount;
            const bOverBudget = b.spent > b.budget.amount;
            
            if (aOverBudget && !bOverBudget) return -1;
            if (!aOverBudget && bOverBudget) return 1;
            
            // Hvis begge er enten over eller under budget, sorter efter størst udgift
            return b.spent - a.spent;
        });
        
        console.log("BudgetComparison: Final comparisonData:", sorted);
        return sorted;
    }, [summary, categories, viewMode]); // <--- ROCKET FIX: 'budgets' erstattet med 'summary'

    // Filtrer data baseret på view mode
    const filteredData = useMemo(() => {
        switch (viewMode) {
            case 'budgets-only':
                return comparisonData.filter(item => item.type === 'budget');
            case 'expenses-only':
                return comparisonData.filter(item => item.type === 'no-budget');
            case 'comparison':
            default:
                return comparisonData;
        }
    }, [comparisonData, viewMode]);

    // Beregn samlet statistik
    const stats = useMemo(() => {
        const totalBudget = summary?.total_budget || 0;
        const totalSpent = summary?.total_spent || 0;
        const budgetSpent = (summary?.items || []).reduce((sum, i) => sum + (i.budget_amount > 0 ? (i.spent_amount || 0) : 0), 0);
        const unbudgetedSpent = totalSpent - budgetSpent;
        const overBudgetCount = (summary?.items || []).filter(i => (i.remaining_amount || 0) < 0).length;

        return {
            totalBudget,
            totalSpent,
            budgetSpent,
            unbudgetedSpent,
            remaining: totalBudget - budgetSpent,
            overBudgetCount,
            budgetCount: (summary?.items || []).filter(i => i.budget_amount > 0).length,
            categoriesWithoutBudget: (summary?.items || []).filter(i => i.budget_amount === 0 && (i.spent_amount || 0) > 0).length
        };
    }, [summary]); // <--- FIX: 'expensesByCategory' fjernet, da 'summary' er tilstrækkelig.

    // CSV upload funktionalitet
    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            setLocalError('Vælg en CSV fil først.');
            return;
        }

        setUploadingCsv(true);
        setCsvUploadSuccess(null);
        setLocalError(null);

        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('month', selectedMonth);
        formData.append('year', selectedYear);

        try {
            const response = await apiClient.fetch('/transactions/import-csv', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'CSV upload fejlede');
            }

            const result = await response.json();
            setCsvUploadSuccess(`CSV uploadet! ${result.imported_count} transaktioner importeret.`);
            setSuccessMessage?.(`CSV uploadet! ${result.imported_count} transaktioner importeret.`);
            
            // Genindlæs data efter upload
            await fetchData();
            
        } catch (err) {
            console.error("CSV upload fejl:", err);
            const errorMessage = err.message || "Der opstod en fejl ved CSV upload.";
            setLocalError(errorMessage);
            setError?.(errorMessage);
        } finally {
            setUploadingCsv(false);
            setCsvFile(null);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getCurrentPeriodLabel = () => {
        const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
        return `${monthLabel} ${selectedYear}`;
    };

    if (loading) {
        return (
            <div className="budget-comparison-container">
                <div className="loading-spinner"></div>
                <p>Indlæser budget sammenligning...</p>
            </div>
        );
    }

    return (
        <div className="budget-comparison-container">
            <div className="comparison-header">
                <h2>Budget Sammenligning - {getCurrentPeriodLabel()}</h2>
                
                <div className="controls-section">
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
                                <option key={year} value={String(year)}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="view-mode-selector">
                        <label>Visning:</label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="view-select"
                        >
                            <option value="comparison">Alle (Budget vs Faktisk)</option>
                            <option value="budgets-only">Kun budgetter</option>
                            <option value="expenses-only">Kun ikke-budgetterede udgifter</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* CSV Upload sektion */}
            <div className="csv-upload-section">
                <h3>Upload transaktioner (CSV)</h3>
                <form onSubmit={handleCsvUpload} className="csv-upload-form">
                    <div className="file-input-group">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            disabled={uploadingCsv}
                        />
                        <button 
                            type="submit" 
                            disabled={!csvFile || uploadingCsv}
                            className="upload-button"
                        >
                            {uploadingCsv ? 'Uploader...' : 'Upload CSV'}
                        </button>
                    </div>
                    <p className="upload-info">
                        Upload CSV fil med transaktioner for {getCurrentPeriodLabel()}
                    </p>
                </form>
                <MessageDisplay message={csvUploadSuccess} type="success" />
            </div>

            <MessageDisplay message={localError} type="error" />

            {/* Statistik oversigt */}
            {stats.budgetCount > 0 && (
                <div className="stats-summary">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{formatAmount(stats.totalBudget)}</div>
                            <div className="stat-label">Total Budget</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatAmount(stats.budgetSpent)}</div>
                            <div className="stat-label">Budgetteret Forbrug</div>
                        </div>
                        <div className="stat-card">
                            <div className={`stat-value ${stats.unbudgetedSpent > 0 ? 'warning' : ''}`}>
                                {formatAmount(stats.unbudgetedSpent)}
                            </div>
                            <div className="stat-label">Ikke-budgetteret Forbrug</div>
                        </div>
                        <div className="stat-card">
                            <div className={`stat-value ${stats.remaining < 0 ? 'negative' : 'positive'}`}>
                                {formatAmount(stats.remaining)}
                            </div>
                            <div className="stat-label">Budget Resterende</div>
                        </div>
                    </div>
                    
                    {(stats.overBudgetCount > 0 || stats.categoriesWithoutBudget > 0) && (
                        <div className="alerts-summary">
                            {stats.overBudgetCount > 0 && (
                                <div className="alert over-budget">
                                    🚨 {stats.overBudgetCount} af {stats.budgetCount} budgetter overskredet
                                </div>
                            )}
                            {stats.categoriesWithoutBudget > 0 && (
                                <div className="alert no-budget">
                                    ❌ {stats.categoriesWithoutBudget} kategorier uden budget
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Budget sammenligning */}
            <div className="comparison-content">
                {filteredData.length === 0 ? (
                    <div className="no-data-message">
                        <h3>Ingen data at vise</h3>
                        <p>
                            {viewMode === 'budgets-only' 
                                ? `Ingen budgetter fundet for ${getCurrentPeriodLabel()}`
                                : viewMode === 'expenses-only'
                                ? `Ingen ikke-budgetterede udgifter fundet for ${getCurrentPeriodLabel()}`
                                : `Ingen budgetter eller udgifter fundet for ${getCurrentPeriodLabel()}`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="comparison-list">
                        {filteredData.map(item => (
                            <div key={item.id} className="comparison-item">
                                {item.type === 'budget' ? (
                                    <BudgetItem
                                        budget={item.budget}
                                        spent={item.spent}
                                        categoryName={item.categoryName}
                                        onEdit={onEditBudget}
                                        showActions={true}
                                        showProgress={true}
                                    />
                                ) : (
                                    <div className="no-budget-item">
                                        <div className="no-budget-header">
                                            <span className="status-icon">❌</span>
                                            <span className="category-name">{item.categoryName}</span>
                                            <span className="no-budget-label">Ingen budget</span>
                                        </div>
                                        <div className="no-budget-details">
                                            <span className="spent-amount">Brugt: {formatAmount(item.spent)}</span>
                                            <button 
                                                className="create-budget-button"
                                                onClick={() => {
                                                    // Trigger oprettelse af budget for denne kategori
                                                    const newBudget = {
                                                        category_id: item.categoryId,
                                                        month: selectedMonth,
                                                        year: selectedYear,
                                                        amount: item.spent // Foreslå brugt beløb som budget
                                                    };
                                                    onEditBudget?.(newBudget);
                                                }}
                                            >
                                                Opret Budget
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BudgetComparison;