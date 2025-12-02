    // frontend/src/components/BudgetForm/BudgetForm.js
    import React, { useState, useEffect } from 'react';
    // import './BudgetForm.css'; // Husk at oprette denne CSS-fil

    function BudgetForm({
        categories,
        onBudgetAdded,
        onBudgetUpdated,
        budgetToEdit,
        onCancelEdit,
        setError,
        setSuccessMessage
    }) {
        const [amount, setAmount] = useState('');
        const [categoryId, setCategoryId] = useState('');
        const [month, setMonth] = useState('');
        const [year, setYear] = useState('');

        // Hent aktuelle måned og år som standardværdier
        useEffect(() => {
            const now = new Date();
            const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
            const currentYear = String(now.getFullYear());

            if (budgetToEdit) {
                setAmount(budgetToEdit.amount);
                setCategoryId(budgetToEdit.category_id);
                setMonth(String(budgetToEdit.month).padStart(2, '0')); // Sørg for to cifre
                setYear(budgetToEdit.year);
            } else {
                // Nulstil form for nyt budget
                setAmount('');
                setCategoryId('');
                setMonth(currentMonth);
                setYear(currentYear);
            }
        }, [budgetToEdit]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError(null);
            setSuccessMessage(null);

            // Validering
            if (!amount || !categoryId || !month || !year) {
                setError('Alle felter skal udfyldes.');
                return;
            }

            const budgetData = {
                amount: parseFloat(amount),
                category_id: parseInt(categoryId),
                month: String(month).padStart(2, '0'),
                year: String(year),
            };

            const url = budgetToEdit
                ? `http://localhost:8000/budgets/${budgetToEdit.id}`
                : 'http://localhost:8000/budgets/';
            const method = budgetToEdit ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(budgetData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                }

                if (budgetToEdit) {
                    setSuccessMessage('Budget opdateret!');
                    onBudgetUpdated();
                } else {
                    setSuccessMessage('Budget tilføjet!');
                    onBudgetAdded();
                }
                // Ryd formen efter succesfuld tilføjelse/opdatering, medmindre vi redigerer
                if (!budgetToEdit) {
                    setAmount('');
                    setCategoryId('');
                    // Måned og år forbliver som valgte for nemheds skyld ved flere budgetter til samme periode
                }

            } catch (err) {
                console.error("Fejl ved håndtering af budget:", err);
                setError(`Fejl: ${err.message}`);
            }
        };

        // Filter kategorier til kun at vise 'expense' typer, da budgetter typisk er for udgifter
        const expenseCategories = categories.filter(cat => cat.type === 'expense');

        // Måned og år optioner (kan genbruges fra BudgetOverview eller laves her)
        const monthOptions = [
            { value: '01', label: 'Januar' }, { value: '02', label: 'Februar' },
            { value: '03', label: 'Marts' }, { value: '04', label: 'April' },
            { value: '05', label: 'Maj' }, { value: '06', label: 'Juni' },
            { value: '07', label: 'Juli' }, { value: '08', label: 'August' },
            { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
            { value: '11', label: 'November' }, { value: '12', label: 'December' }
        ];

        const yearOptions = (() => {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = currentYear - 2; i <= currentYear + 2; i++) {
                years.push(i);
            }
            return years;
        })();

        return (
            <div className="budget-form-container">
                <h3>{budgetToEdit ? 'Rediger Budget' : 'Opret Nyt Budget'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">Kategori:</label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Vælg Kategori</option>
                            {expenseCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Budgetbeløb:</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0" // Budget bør ikke være negativt
                            step="0.01" // Tillad decimaler
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="month">Måned:</label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                        >
                            {monthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="year">År:</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="button">
                            {budgetToEdit ? 'Opdater Budget' : 'Opret Budget'}
                        </button>
                        {budgetToEdit && (
                            <button type="button" className="button secondary" onClick={onCancelEdit}>
                                Annuller Redigering
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    export default BudgetForm;