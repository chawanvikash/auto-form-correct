import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./content/ProtectedRoute";
import VerifyOTPPage from "./components/VerifyOTPPage";
import Dashboard from "./components/Dashboard";
import Typewriter from "./components/Typewriter";
import ForgotPassword from './components/ForgotPassword';
import VerificationResult from "./components/VerificationResult";


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/result" element={<ProtectedRoute><VerificationResult /></ProtectedRoute>} />              
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
