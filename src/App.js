import React, { Fragment, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserAdminPage, LoginForm, UserPage, HomePage } from './components/index';

const App = () => {
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState(''); 

  return (
    <Fragment>
      <Router>
        <Routes>
          <Route path='/' element={<LoginForm setUserType={setUserType} setUserName={setUserName} />} />
          <Route path='/admin' element={userType === 'admin' ? <UserAdminPage /> : <Navigate to='/' />} />
          <Route path='/home' element={userType ? <HomePage userType={userType} userName={userName} /> : <Navigate to='/' />} />
        </Routes>
      </Router>
    </Fragment>
  );
};

export default App;
