// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx'; // Adjust the path to your login component
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
 <Router>
      <Routes>
    <Route path="/" element={<Signup />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={ <Dashboard />} />
</Routes>
    </Router>
  );
}

export default App;
