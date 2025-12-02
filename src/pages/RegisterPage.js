// frontend/finans-tracker-frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Adgangskoderne matcher ikke');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Adgangskode skal være mindst 8 tegn');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8001/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Registration successful, redirect to login
      navigate('/login', { 
        state: { message: 'Konto oprettet! Log ind nu.' } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>💰 Finans Tracker</h1>
          <p>Opret din konto</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Brugernavn:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Vælg et brugernavn (3-20 tegn)"
              required
              disabled={loading}
              minLength="3"
              maxLength="20"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Indtast din email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Adgangskode:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mindst 8 tegn"
              required
              disabled={loading}
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirm">Bekræft adgangskode:</label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="Gentag adgangskode"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Opretter konto...' : 'Opret konto'}
          </button>
        </form>

        <div className="register-footer">
          <p>Har du allerede en konto? <Link to="/login">Log ind her</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
