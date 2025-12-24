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

// --- NEW IMPORTS ---
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import CookiePolicy from './components/legal/CookiePolicy';
import DataProcessingAgreement from './components/legal/DataProcessingAgreement';

// --- IMPORT ADMIN COMPONENTS ---
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <CookieBanner /> 
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          
          {/* New Public Legal Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/data-processing-agreement" element={<DataProcessingAgreement />} />

          {/* Guest Route */}
          <Route path="/guest-calculator" element={<TaxCalculator isGuest={true} />} />   
          {/* --- Main App Routes --- */}
          <Route path="/calculator" element={<TaxCalculator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Internal Legal Route (Dashboard variant) */}
          <Route path="/legal" element={<Legal />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;