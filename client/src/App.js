// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import TaxCalculator from './components/TaxCalculator';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import History from './components/History';
import CookieBanner from './components/CookieBanner';
import Legal from './components/Legal';

// --- IMPORT ADMIN COMPONENTS ---
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <CookieBanner /> {/* Add this here so it shows on all pages */}
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          
          {/* Guest Route */}
          <Route path="/guest-calculator" element={<TaxCalculator isGuest={true} />} /> {/* Pass prop */}

          {/* --- Main App Routes --- */}
          <Route path="/calculator" element={<TaxCalculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />

          {/* --- ADMIN ROUTES (This is what was missing) --- */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/legal" element={<Legal />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;