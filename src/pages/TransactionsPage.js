// src/pages/TransactionsPage.js
import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm/TransactionForm';
import TransactionsList from '../components/TransactionsList/TransactionsList';
import FilterComponent from '../components/FilterComponent/FilterComponent';
import MessageDisplay from '../components/MessageDisplay';
import Modal from '../components/Modal/Modal';
import apiClient from '../utils/apiClient';

// Importer komponent-specifik CSS
import '../components/FilterComponent/FilterComponent.css';
import './TransactionsPage.css';

function TransactionsPage({
    categories,
    transactionToEdit,
    showTransactionFormModal,
    setShowTransactionFormModal,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    selectedCategory,
    setSelectedCategory,
    refreshTransactionsTrigger,
    onTransactionAdded,
    onTransactionUpdated,
    handleEditTransaction,
    handleCancelEdit,
    handleDeleteTransaction,
    handleApplyFilter,
    handleCsvUploadSuccess,
    setError,
    setSuccessMessage,
    triggerTransactionsAndDashboardRefresh // Tilføjet for CSVUpload
}) {
    // CSV upload state
    const [csvFile, setCsvFile] = useState(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [csvUploadSuccess, setCsvUploadSuccess] = useState(null);
    const [localError, setLocalError] = useState(null);

    // Get current period label for CSV upload info
    const getCurrentPeriodLabel = () => {
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate);
            const end = new Date(filterEndDate);
            const months = [
                'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
                'Juli', 'August', 'September', 'Oktober', 'November', 'December'
            ];
            
            // Hvis det er samme måned
            if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
                return `${months[start.getMonth()]} ${start.getFullYear()}`;
            }
            // Hvis det er et datointerval
            return `${start.toLocaleDateString('da-DK')} - ${end.toLocaleDateString('da-DK')}`;
        }
        return 'valgt periode';
    };

    // CSV upload funktionalitet
    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            setLocalError('Vælg en CSV fil først.');
            setError?.('Vælg en CSV fil først.');
            return;
        }

        setUploadingCsv(true);
        setCsvUploadSuccess(null);
        setLocalError(null);
        setError?.(null);
        setSuccessMessage?.(null);

        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const response = await apiClient.fetch('/transactions/upload-csv/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = typeof errorData.detail === 'string' 
                    ? errorData.detail 
                    : JSON.stringify(errorData.detail || errorData);
                throw new Error(errorMsg || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const successMsg = result.message || `CSV uploadet! ${result.imported_count || ''} transaktioner importeret.`;
            setCsvUploadSuccess(successMsg);
            setSuccessMessage?.(successMsg);
            
            // Trigger opdatering
            if (handleCsvUploadSuccess) {
                handleCsvUploadSuccess();
            }
            
        } catch (err) {
            console.error("CSV upload fejl:", err);
            const errorMessage = err.message || "Der opstod en fejl ved CSV upload.";
            setLocalError(errorMessage);
            setError?.(errorMessage);
        } finally {
            setUploadingCsv(false);
            setCsvFile(null);
            // Ryd filinputfeltet
            const fileInput = document.querySelector('.csv-upload-section input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
        }
    };

    return (
        <div className="transactions-page-container">
            <div className="transactions-page-header">
                <div className="header-content">
                    <h1>💳 Transaktioner</h1>
                    <p className="header-subtitle">
                        Administrer dine indtægter og udgifter
                    </p>
                </div>
            </div>

            {/* Controls sektion - Filter og CSV Upload */}
            <div className="controls-section">
                <div className="filter-wrapper">
                    <FilterComponent
                        filterStartDate={filterStartDate}
                        setFilterStartDate={setFilterStartDate}
                        filterEndDate={filterEndDate}
                        setFilterEndDate={setFilterEndDate}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                        onFilter={handleApplyFilter}
                    />
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
                            data-cy="csv-upload-input"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            disabled={uploadingCsv}
                        />
                        <button 
                            type="submit" 
                            disabled={!csvFile || uploadingCsv}
                            className="upload-button"
                            data-cy="upload-csv-button"
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

            {/* Tilføj ny transaktion knap */}
            <div className="action-buttons">
                <button
                    className="add-transaction-button"
                    data-cy="add-transaction-button"
                    onClick={() => {
                        setShowTransactionFormModal(true);
                        setError(null);
                        setSuccessMessage(null);
                    }}
                >
                    <span className="button-icon">➕</span>
                    <span className="button-label">Tilføj ny transaktion</span>
                </button>
            </div>

            {/* Transaktionsformular modal */}
            {showTransactionFormModal && (
                <Modal
                    isOpen={showTransactionFormModal}
                    onClose={handleCancelEdit}
                >
                    <TransactionForm
                        categories={categories}
                        onTransactionAdded={onTransactionAdded}
                        transactionToEdit={transactionToEdit}
                        onTransactionUpdated={onTransactionUpdated}
                        onCancelEdit={handleCancelEdit}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                    />
                </Modal>
            )}

            {/* Transaktionsliste */}
            <div className="transactions-content">
                <h3>Alle Transaktioner</h3>
                <TransactionsList
                    startDate={filterStartDate}
                    endDate={filterEndDate}
                    categoryId={selectedCategory}
                    refreshTrigger={refreshTransactionsTrigger}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    categories={categories}
                />
            </div>
        </div>
    );
}

export default TransactionsPage;