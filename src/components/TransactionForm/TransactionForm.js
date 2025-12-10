// src/components/TransactionForm/TransactionForm.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
// import './TransactionForm.css'; // Opret denne fil for specifik styling

function TransactionForm({
    categories,
    onTransactionAdded,
    transactionToEdit,
    onTransactionUpdated,
    onCancelEdit,
    setError,
    setSuccessMessage
}) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isExpense, setIsExpense] = useState(true);

    useEffect(() => {
        if (transactionToEdit) {
            setAmount(transactionToEdit.amount);
            setCategory(transactionToEdit.category_id);
            setDate(transactionToEdit.date);
            setDescription(transactionToEdit.description);
            setIsExpense(transactionToEdit.transaction_type === 'expense');
        } else {
            // Reset form for new transaction
            setAmount('');
            setCategory('');
            setDate('');
            setDescription('');
            setIsExpense(true); // Default to expense
        }
    }, [transactionToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!amount || !category || !date || !description) {
            setError('Alle felter skal udfyldes.');
            return;
        }

        const transactionData = {
            amount: parseFloat(amount),
            category_id: parseInt(category),
            date: date,
            description: description,
            transaction_type: isExpense ? 'expense' : 'income'
        };

        try {
            const response = transactionToEdit
                ? await apiClient.put(`/transactions/${transactionToEdit.id}`, transactionData)
                : await apiClient.post('/transactions/', transactionData);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            if (transactionToEdit) {
                onTransactionUpdated();
            } else {
                onTransactionAdded();
            }
            setSuccessMessage(transactionToEdit ? 'Transaktion opdateret!' : 'Transaktion tilføjet!');
        } catch (err) {
            console.error("Fejl ved håndtering af transaktion:", err);
            setError(`Fejl: ${err.message}`);
        }
    };

    return (
        <div className="transaction-form-container"> {/* Ny container klasse for formularen */}
            <h3>{transactionToEdit ? 'Rediger Transaktion' : 'Tilføj Ny Transaktion'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"> {/* Generel gruppe for input felter */}
                    <label htmlFor="amount">Beløb:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Kategori:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Vælg Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="date">Dato:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Beskrivelse:</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group radio-group"> {/* Specifik klasse for radio knapper */}
                    <label>
                        <input
                            type="radio"
                            value="expense"
                            checked={isExpense}
                            onChange={() => setIsExpense(true)}
                        />
                        Udgift
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="income"
                            checked={!isExpense}
                            onChange={() => setIsExpense(false)}
                        />
                        Indkomst
                    </label>
                </div>

                <div className="form-actions"> {/* Gruppe for formular knapper */}
                    <button type="submit" className="button">
                        {transactionToEdit ? 'Opdater Transaktion' : 'Tilføj Transaktion'}
                    </button>
                    {transactionToEdit && (
                        <button type="button" className="button secondary" onClick={onCancelEdit}>
                            Annuller Redigering
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default TransactionForm;