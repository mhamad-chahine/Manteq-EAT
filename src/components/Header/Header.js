import React, { useState, Fragment } from 'react';
import logo2 from '../../assets/Images/logo2.png';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Header = ({ userName }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleLogout = () => {
   
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Fragment>
      <header className="header">
        <img src={logo2} alt="Company Logo" className="logo-admin" />
        <h1 className="header-title">MANTEQ ACTIVITY TRACKER</h1>
        <div className="user-info" onClick={toggleDropdown}>
          <FontAwesomeIcon icon={faUser} className="user-icon" />
          <span className="user-name">{userName || "User"}</span>
          {showDropdown && (
            <div className="dropdown-menu">
              <a href="#logout" className="dropdown-item" onClick={handleLogout}>Logout</a>
            </div>
          )}
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
