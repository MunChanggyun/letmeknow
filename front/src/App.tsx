import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompanyPage from './pages/CompanyPage'

const App: React.FC= () => {
  return (
    <>
      <Route component={LoginPage} path="/login"/>
      <Route component={RegisterPage} path="/register"/>
      <Route component={CompanyPage} path="/main"/>
    </>
  );
}

export default App;
