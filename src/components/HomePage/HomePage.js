import React, { Fragment, useState, useEffect } from 'react';
import { Header, Footer, UserAdminPage, UserPage, PendindCards, RejectedCards, UserPending } from "../index";
import './HomePage.css';
import { useLocation } from 'react-router-dom';

const HomePage = ({ userType, userName }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const location = useLocation(); 

  useEffect(() => {
    if (location.state) {
      const { selectedOption, date } = location.state;
      if (selectedOption) setSelectedOption(selectedOption);
      if (date) setSelectedDate(date);
    } else {
      if (userType === 'admin') {
        setSelectedOption('Pending Cards');
      } else if (userType === 'user') {
        setSelectedOption('Time Card');
      }
    }
  }, [userType, location.state]);

  const renderMainContent = () => {
    if (selectedOption === 'Users') {
      return <UserAdminPage />;
    }
    if (selectedOption === 'Pending Cards' && userType === 'admin') {
      return <PendindCards />;
    }
    if (selectedOption === 'Pending Cards' && userType === 'user') {
      return <UserPending />;
    }
    if (selectedOption === 'Time Card' && userType === 'user') {
      return <UserPage date={selectedDate} />;
    }
    if (selectedOption === 'Rejected Cards' && userType === 'user') {
      return <RejectedCards />;
    }

    return <p>Select an option from the sidebar to view details.</p>;
  };

  return (
    <Fragment>
      <Header userName={userName} />
      <div className="homepage-container">
        <div className="homepage-content">
          <aside className="sidebar">
            <ul>
              {userType === 'admin' && (
                <>
                  <li>
                    <a href="#" onClick={() => setSelectedOption('Users')}>Users</a>
                  </li>
                  <li>
                    <a href="#" onClick={() => setSelectedOption('Pending Cards')}>Pending Cards</a>
                  </li>
                </>
              )}
              {userType === 'user' && (
                <>
                  <li>
                    <a href="#" onClick={() => setSelectedOption('Time Card')}>Time Card</a>
                  </li>
                  <li>
                    <a href="#" onClick={() => setSelectedOption('Rejected Cards')}>Rejected Cards</a>
                  </li> 
                </>
              )}
            </ul>
          </aside>
          <main className="main-content">
            {renderMainContent()}
          </main>
        </div>
      </div>
      <Footer />
    </Fragment>
  );
};

export default HomePage;
