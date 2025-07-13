// src/pages/TransactionsPage.js
import React from 'react';
import TransactionForm from '../components/TransactionForm/TransactionForm';
import TransactionsList from '../components/TransactionsList/TransactionsList';
import FilterComponent from '../components/FilterComponent/FilterComponent';
import CSVUpload from '../components/CSVUpload/CSVUpload';
import Modal from '../components/Modal/Modal'; // Assuming Modal is here

// Importer komponent-specifik CSS
import '../components/FilterComponent/FilterComponent.css'; // Hvis FilterComponent har sin egen CSS
import '../components/CSVUpload/CSVUpload.css'; // Hvis CSVUpload har sin egen CSS


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
    return (
        <div className="transactions-page-container"> {/* Ny container klasse */}
            <h2>Transaktioner</h2>

            {/* --- Filter og CSV Upload sektion --- */}
            <div className="filter-csv-section"> {/* Ny sektion for filter og CSV */}
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

                <CSVUpload
                    onUploadSuccess={handleCsvUploadSuccess}
                    setError={setError}
                    setSuccessMessage={setSuccessMessage}
                />
            </div>

            <hr /> {/* Separator */}

            {/* --- Tilføj ny transaktion knap --- */}
            <div className="button-group"> {/* Gruppe for knapper */}
                <button
                    className="button" // Anvend den generelle knap-stil
                    onClick={() => {
                        setShowTransactionFormModal(true);
                        setError(null);
                        setSuccessMessage(null);
                    }}
                >
                    Tilføj ny transaktion
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

            <hr /> {/* Separator */}

            {/* --- Transaktionsliste --- */}
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
    );
}

export default TransactionsPage;