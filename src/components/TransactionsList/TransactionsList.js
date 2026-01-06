// src/components/TransactionsList/TransactionsList.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/apiClient';
import './TransactionsList.css';

function TransactionsList({ startDate, endDate, categoryId, refreshTrigger, onEdit, onDelete, categories }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        let url = `/transactions/?start_date=${startDate}&end_date=${endDate}`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }
        try {
            const response = await apiClient.get(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTransactions(data);
        } catch (err) {
            console.error("Fejl ved hentning af transaktioner:", err);
            setError(err.message || "Kunne ikke hente transaktioner.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, categoryId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions, refreshTrigger]); // Afhængighed af refreshTrigger

    const getCategoryName = (id) => {
        if (!id) return 'Ukendt';
        const category = categories.find(cat => cat.id === id || cat.idCategory === id);
        return category ? category.name : 'Ukendt';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Ingen dato';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('da-DK', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) return <p>Indlæser transaktioner...</p>;
    if (error) return <p className="message-display error">Fejl: {error}</p>;

    return (
        <div className="transactions-list-container" data-cy="transaction-list"> {/* Ny container klasse */}
            {transactions.length === 0 ? (
                <p>Ingen transaktioner fundet for de valgte filtre.</p>
            ) : (
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Dato</th>
                            <th>Beskrivelse</th>
                            <th>Beløb</th>
                            <th>Type</th>
                            <th>Kategori</th>
                            <th>Handlinger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => {
                            const transactionId = transaction.idTransaction || transaction.id;
                            return (
                                <tr key={transactionId} className={transaction.type === 'expense' ? 'expense-row' : 'income-row'}>
                                    <td>{formatDate(transaction.date)}</td>
                                    <td>{transaction.description}</td>
                                    <td className={transaction.type === 'expense' ? 'expense-amount' : 'income-amount'}>
                                        {transaction.type === 'expense' ? '-' : '+'}{Math.abs(transaction.amount).toFixed(2)} DKK
                                    </td>
                                    <td>{transaction.type === 'expense' ? 'Udgift' : 'Indkomst'}</td>
                                    <td>{getCategoryName(transaction.category_id || transaction.Category_idCategory)}</td>
                                    <td className="transaction-actions">
                                        <button className="button secondary small-button" onClick={() => onEdit(transaction)}>Rediger</button>
                                        <button className="button danger small-button" onClick={() => onDelete(transactionId)}>Slet</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TransactionsList;