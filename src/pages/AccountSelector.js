import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import '../styles/AccountSelector.css';

export default function AccountSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [error, setError] = useState(null);

  // Helper funktion til at parse error
  const parseError = (errorData) => {
    if (typeof errorData.detail === 'string') {
      return errorData.detail;
    }
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.map(e => e.msg || e).join(', ');
    }
    return 'Ukendt fejl';
  };

  const selectAccount = React.useCallback((accountId) => {
    localStorage.setItem('account_id', accountId);
    navigate('/dashboard');
  }, [navigate]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiClient.get('/accounts');

        if (response.ok) {
          const data = await response.json();
          console.log('Accounts hentet:', data);
          setAccounts(data);
          // Hvis kun 1 account, vis den men lad brugeren vælge den manuelt
          // (fjernet auto-select så brugeren altid ser account selector)
        } else {
          const errorData = await response.json();
          console.error('Backend fejl:', errorData);
          setError(parseError(errorData));
        }
      } catch (err) {
        console.error('Fejl ved hentning af accounts:', err);
        setError('Forbindelsesfejl - kan ikke nå backend');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAccounts();
    }
  }, [user, selectAccount]);

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      setError('Kontonavn kan ikke være tomt');
      return;
    }

    try {
      const response = await apiClient.post('/accounts', {
        name: newAccountName.trim()
      });

      if (response.ok) {
        const newAccount = await response.json();
        console.log('Konto oprettet:', newAccount);
        setAccounts([...accounts, newAccount]);
        setNewAccountName('');
        setShowCreateForm(false);
        setError(null);
        selectAccount(newAccount.idAccount || newAccount.id);
      } else {
        const errorData = await response.json();
        console.error('Backend fejl ved oprettelse:', errorData);
        setError(parseError(errorData));
      }
    } catch (err) {
      console.error('Fejl ved oprettelse af account:', err);
      setError('Forbindelsesfejl - kan ikke nå backend');
    }
  };

  if (loading) {
    return (
      <div className="account-selector-container">
        <div className="account-selector-card">
          <div className="account-selector-loading">Indlæser konti...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-selector-container">
      <div className="account-selector-card">
        <div className="account-selector-header">
          <h1>💰 Vælg eller opret en konto</h1>
          <p>Hej {user?.username}! 👋</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {accounts.length > 0 && (
          <div className="accounts-list">
            <h2>Dine konti:</h2>
            {accounts.map((account, index) => (
              <button
                key={account.idAccount || account.id || `account-${index}`}
                onClick={() => selectAccount(account.idAccount || account.id)}
                className="account-button"
              >
                {account.name}
              </button>
            ))}
          </div>
        )}

        {accounts.length === 0 && !showCreateForm && (
          <p className="no-accounts-message">
            Du har ingen konti endnu. Opret en for at komme i gang! 🚀
          </p>
        )}

        <div className="create-account-section">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setError(null);
            }}
            className="create-account-button"
          >
            {showCreateForm ? 'Annuller' : '+ Opret ny konto'}
          </button>

          {showCreateForm && (
            <div className="create-account-form">
              <input
                type="text"
                placeholder="Kontonavn (f.eks. 'Min privat konto')"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
                autoFocus
              />
              <button
                onClick={handleCreateAccount}
                className="create-account-submit-button"
              >
                Opret konto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}