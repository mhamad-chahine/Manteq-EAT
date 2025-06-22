import React, { useState } from 'react';
import './LoginForm.css';
import logo from '../../assets/Images/logo.png';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ setUserType, setUserName }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/mat/api/1.0/public/authentication/login?login=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('API Response:', data); 

      if (data.token) {
        localStorage.setItem('token', data.token);
        setUserName(data.fullName); 

        if (data.role === 'Administrator') {
          setUserType('admin');
          navigate('/home');
        } else if (data.role === 'User') {
          setUserType('user');
          navigate('/home');
        } else {
          setError('Invalid credentials');
        }
      } else {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setError('Incorrect User or Password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className='title-container'>
          <h1>Manteq Activity Tracker</h1>
        </div>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="input-group">
          <label htmlFor="user">User:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)} required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="button-container">
          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
