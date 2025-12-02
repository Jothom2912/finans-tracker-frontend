import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8001/accounts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Accounts hentet:', data);
          setAccounts(data);
          // Hvis kun 1 account, vælg den automatisk
          if (data.length === 1) {
            selectAccount(data[0].id);
          }
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
  }, [user]);

  const selectAccount = (accountId) => {
    localStorage.setItem('account_id', accountId);
    navigate('/');
  };

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      setError('Kontonavn kan ikke være tomt');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8001/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newAccountName.trim()
        })
      });

      if (response.ok) {
        const newAccount = await response.json();
        console.log('Konto oprettet:', newAccount);
        setAccounts([...accounts, newAccount]);
        setNewAccountName('');
        setShowCreateForm(false);
        setError(null);
        selectAccount(newAccount.id);
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
    return <div style={{ padding: '40px', textAlign: 'center' }}>Indlæser konti...</div>;
  }


  
  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Vælg eller opret en konto</h1>
      <p>Hej {user?.username}! 👋</p>

      {error && (
        <div style={{
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ef5350'
        }}>
          ⚠️ {error}
        </div>
      )}

      {accounts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Dine konti:</h2>
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => selectAccount(account.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '15px',
                margin: '10px 0',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              {account.name}
            </button>
          ))}
        </div>
      )}

      {accounts.length === 0 && !showCreateForm && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Du har ingen konti endnu. Opret en for at komme i gang!
        </p>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setError(null);
          }}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          {showCreateForm ? 'Annuller' : '+ Opret ny konto'}
        </button>

        {showCreateForm && (
          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Kontonavn (f.eks. 'Min privat konto')"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
              style={{
                padding: '10px',
                width: '100%',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
              autoFocus
            />
            <button
              onClick={handleCreateAccount}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Opret konto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}