// src/pages/CategoriesPage.js
import React from 'react';
import CategoryManagement from '../components/CategoryManagement/CategoryManagement';
import Modal from '../components/Modal/Modal'; // Sørg for at importere Modal

function CategoriesPage({
  categories,
  showCategoryManagementModal,
  setShowCategoryManagementModal,
  handleCategoryChange,
  setError,
  setSuccessMessage
}) {
  return (
    <div className="categories-page">
      <h2>Håndtering af Kategorier</h2>
      <div className="main-buttons-container">
        <button
          className="add-new-button"
          onClick={() => {
            setShowCategoryManagementModal(true);
            setError(null);
            setSuccessMessage(null);
          }}
        >
          Håndtér Kategorier
        </button>
      </div>

      <Modal
        isOpen={showCategoryManagementModal}
        onClose={() => setShowCategoryManagementModal(false)}
      >
        <CategoryManagement
          categories={categories}
          onCategoryAdded={handleCategoryChange}
          onCategoryUpdated={handleCategoryChange}
          onCategoryDeleted={handleCategoryChange}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />
      </Modal>
    </div>
  );
}

export default CategoriesPage;