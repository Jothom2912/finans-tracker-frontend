import React, { useState, useCallback } from 'react';
import CategoryManagement from '../components/CategoryManagement/CategoryManagement';
import Modal from '../components/Modal/Modal';
import { useCategories } from '../hooks/useCategories';
import { useNotifications } from '../hooks/useNotifications';

function CategoriesPage() {
  const { categories, refresh } = useCategories();
  const { showError, showSuccess, clearMessages } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  const handleCategoryChange = useCallback(() => {
    refresh();
    showSuccess('Handling udført!');
    setShowModal(false);
  }, [refresh, showSuccess]);

  return (
    <div className="categories-page">
      <h2>Håndtering af Kategorier</h2>

      <div className="main-buttons-container">
        <button
          className="add-new-button"
          onClick={() => { setShowModal(true); clearMessages(); }}
        >
          Håndtér Kategorier
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <CategoryManagement
          categories={categories}
          onCategoryAdded={handleCategoryChange}
          onCategoryUpdated={handleCategoryChange}
          onCategoryDeleted={handleCategoryChange}
          setError={showError}
          setSuccessMessage={showSuccess}
        />
      </Modal>
    </div>
  );
}

export default CategoriesPage;
