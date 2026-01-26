import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // NEW IMPORT

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
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// --- IMPORT ADMIN COMPONENTS ---
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <HelmetProvider> {/* WRAPPED APP IN HELMET PROVIDER */}
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
            
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Guest Route */}
            <Route path="/guest-calculator" element={<TaxCalculator isGuest={true} />} />

            {/* --- Main App Routes --- */}
            <Route path="/calculator" element={<TaxCalculator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/legal" element={<Legal />} />

            {/* --- ADMIN ROUTES --- */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;