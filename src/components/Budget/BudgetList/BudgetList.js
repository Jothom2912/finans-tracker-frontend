// frontend/src/components/BudgetList/BudgetList.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MessageDisplay from '../../MessageDisplay';
import apiClient from '../../../utils/apiClient';
// import './BudgetList.css'; // Husk at oprette denne CSS-fil

function BudgetList({ categories, refreshTrigger, onEditBudget, onBudgetDeleted, setError, setSuccessMessage }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localError, setLocalError] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

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
        const now = new Date();
        if (!selectedMonth) setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
        if (!selectedYear) setSelectedYear(String(now.getFullYear()));
    }, [selectedMonth, selectedYear]);

    const fetchBudgets = useCallback(async () => {
        if (!selectedMonth || !selectedYear) return;

        setLoading(true);
        setLocalError(null);
        setError?.(null);

        try {
            const response = await apiClient.get(`/budgets/?month=${selectedMonth}&year=${selectedYear}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBudgets(data);
        } catch (err) {
            console.error("Fejl ved hentning af budgetter:", err);
            setLocalError(err.message || "Kunne ikke hente budgetter.");
            setError?.(err.message || "Kunne ikke hente budgetter.");
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, setError]); // refreshTrigger til at genindlæse efter CRUD

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : 'Ukendt';
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Er du sikker på, at du vil slette dette budget?")) {
            return;
        }
        setSuccessMessage(null);
        setError(null);
        try {
            const response = await apiClient.delete(`/budgets/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            setSuccessMessage('Budget slettet!');
            onBudgetDeleted(); // Trigger genindlæsning i forældrekomponenten og denne liste
        } catch (err) {
            console.error("Fejl ved sletning af budget:", err);
            setError(`Fejl: ${err.message}`);
        }
    };

    const getCurrentPeriodLabel = () => {
        const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
        return `${monthLabel} ${selectedYear}`;
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('da-DK', {
            style: 'currency',
            currency: 'DKK',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="budget-list-container">
                <div className="loading-spinner"></div>
                <p>Indlæser budgetter...</p>
            </div>
        );
    }

    return (
        <div className="budget-list-container">
            <h3>Budgetter for {getCurrentPeriodLabel()}</h3>
            <div className="period-selector">
                <label htmlFor="month-select-list">Måned:</label>
                <select
                    id="month-select-list"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="period-select"
                >
                    {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                </select>

                <label htmlFor="year-select-list">År:</label>
                <select
                    id="year-select-list"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="period-select"
                >
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <MessageDisplay message={localError} type="error" />

            {budgets.length === 0 ? (
                <p>Ingen budgetter fundet for {getCurrentPeriodLabel()}.</p>
            ) : (
                <table className="budgets-table">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Beløb</th>
                            <th>Måned</th>
                            <th>År</th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map(budget => (
                            <tr key={budget.id}>
                                <td>{getCategoryName(budget.category_id)}</td>
                                <td>{formatAmount(budget.amount)}</td>
                                <td>{monthOptions.find(m => m.value === String(budget.month).padStart(2, '0'))?.label}</td>
                                <td>{budget.year}</td>
                                <td className="budget-actions">
                                    <button className="button secondary small-button" onClick={() => onEditBudget(budget)}>Rediger</button>
                                    <button className="button danger small-button" onClick={() => handleDelete(budget.id)}>Slet</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BudgetList;