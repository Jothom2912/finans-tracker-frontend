import { useState, useCallback } from 'react';

export function useNotifications() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const showError = useCallback((message) => {
    setSuccessMessage(null);
    setError(message);
  }, []);

  const showSuccess = useCallback((message) => {
    setError(null);
    setSuccessMessage(message);
  }, []);

  return { error, successMessage, setError, setSuccessMessage, clearMessages, showError, showSuccess };
}
