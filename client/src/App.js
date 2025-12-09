// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaxCalculator from './components/TaxCalculator';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; // Import the new Dashboard component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes (Main App) */}
          <Route path="/calculator" element={<TaxCalculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;