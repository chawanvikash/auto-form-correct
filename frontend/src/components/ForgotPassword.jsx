import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { Mail, ArrowLeft, Key, Lock } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../helper';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState(null); 
  
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2); 
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/verify-reset-otp`, { email, otp });
      
      if (res.data.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setMessage("OTP Verified! Please create a new password.");
        setStep(3); 
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
    
      const res = await axios.post(`${BASE_URL}/api/auth/reset-password/${resetToken}`, { newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000); 
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Card className="shadow-sm border-0 rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="fw-bold text-center mb-3">Reset Password</h3>
        
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* --- RENDER STEP 1: EMAIL INPUT --- */}
        {step === 1 && (
          <>
            <p className="text-muted text-center small mb-4">Enter your email and we will send you a 6-digit OTP.</p>
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Mail size={18} /></span>
                  <Form.Control type="email" required placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3 rounded-pill" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </Form>
          </>
        )}

        {/* --- RENDER STEP 2: OTP INPUT --- */}
        {step === 2 && (
          <>
            <p className="text-muted text-center small mb-4">Please check your inbox and enter the 6-digit code.</p>
            <Form onSubmit={handleOtpSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Verification Code</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Key size={18} /></span>
                  <Form.Control type="text" required placeholder="Enter 6-digit OTP" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3 rounded-pill" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </Form>
          </>
        )}

        {/* --- RENDER STEP 3: NEW PASSWORD INPUT --- */}
        {step === 3 && (
          <>
            <p className="text-muted text-center small mb-4">Create a new secure password for your account.</p>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">New Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Lock size={18} /></span>
                  <Form.Control type="password" required placeholder="Minimum 6 characters" minLength="6" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3 rounded-pill" disabled={isLoading || (message && message.includes("successfully"))}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </Form>
          </>
        )}

        {/* Always show the back button */}
        <Button variant="link" className="w-100 text-decoration-none text-muted" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} className="me-2" /> Back to Login
        </Button>
      </Card>
    </Container>
  );
};

export default ForgotPassword;