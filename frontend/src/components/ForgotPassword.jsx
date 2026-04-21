import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Mail, ArrowLeft, Key, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../helper';


const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    :root {
      --brand-navy:  #1b3f6e;
      --brand-blue:  #2563eb;
      --brand-light: #eff6ff;
      --brand-teal:  #0891b2;
      --surface:     #ffffff;
      --bg:          #f8fafc;
      --border:      #e2e8f0;
      --text-main:   #0f172a;
      --text-muted:  #475569;
      --text-light:  #94a3b8;
    }

    .fp-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      padding: 40px 0;
      position: relative;
    }
    
    /* Top Brand Bar */
    .fp-page::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--brand-navy), var(--brand-blue), var(--brand-teal));
      z-index: 100;
    }

    .fp-card-wrap {
      border-radius: 16px !important;
      border: none !important;
      box-shadow: 0 10px 40px rgba(30,63,110,0.08), 0 1px 3px rgba(0,0,0,0.05) !important;
      overflow: hidden !important;
      background: var(--surface);
      padding: 48px 40px;
    }

    /* ── Icon & Typography ── */
    .fp-icon-wrapper {
      width: 72px; 
      height: 72px;
      background: var(--brand-light);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      color: var(--brand-blue);
      box-shadow: 0 0 0 8px rgba(37,99,235,0.05);
      transition: all 0.3s ease;
    }

    .fp-headline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      color: var(--text-main);
      font-size: 26px;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .fp-subtext {
      color: var(--text-muted);
      font-size: 14.5px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    /* ── Form Elements ── */
    .fp-label {
      font-size: 12px !important; font-weight: 700 !important;
      text-transform: uppercase; letter-spacing: 0.6px;
      color: var(--text-muted) !important; margin-bottom: 8px !important;
      text-align: left; display: block;
    }
    
    .fp-control {
      border-radius: 10px !important;
      border: 2px solid var(--border) !important;
      font-family: 'Inter', sans-serif !important;
      color: var(--text-main) !important;
      background: #f8fafc !important;
      padding: 12px 16px !important;
      transition: all 0.2s ease !important;
    }
    .fp-control:focus {
      border-color: var(--brand-blue) !important;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.1) !important;
      background: #fff !important;
    }
    .fp-control::placeholder { color: var(--text-light) !important; font-weight: 400; }

    /* Special large input for OTP */
    .fp-otp-control {
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      font-size: 28px !important;
      color: var(--brand-blue) !important;
      text-align: center;
      padding: 16px !important;
      letter-spacing: 0.4em !important;
    }
    .fp-otp-control::placeholder { letter-spacing: 0.2em !important; opacity: 0.4; }

    /* ── Buttons ── */
    .fp-btn-submit {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 10px !important;
      padding: 14px 22px !important;
      font-size: 15px !important; font-weight: 700 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important;
      transition: all 0.2s ease !important;
    }
    .fp-btn-submit:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35) !important;
    }

    /* ── Alerts ── */
    .fp-alert {
      border-radius: 10px; border: 1.5px solid #fecaca;
      background: #fff5f5; color: #b91c1c;
      font-size: 13.5px; font-weight: 500;
      padding: 12px 16px; margin-bottom: 24px;
      display: flex; align-items: center; gap: 10px;
      text-align: left;
    }
    .fp-alert-success {
      border-color: #bbf7d0; background: #f0fdf4; color: #15803d;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    
    /* Fade transition between steps */
    .step-fade {
      animation: fadeUp 0.3s ease-out forwards;
    }

    /* Responsive */
    @media (max-width: 576px) {
      .fp-card-wrap { padding: 40px 24px; }
      .fp-headline { font-size: 24px; }
    }
  `}</style>
);

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

  
  const stepConfig = {
    1: { icon: <Mail size={32} />, title: "Reset Password", subtext: "Enter your official email and we'll send you a 6-digit verification code." },
    2: { icon: <Key size={32} />, title: "Enter Code", subtext: "Please check your inbox and enter the 6-digit verification code we just sent." },
    3: { icon: <Lock size={32} />, title: "New Password", subtext: "Create a new, secure password for your Ink2Data account." }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null); setMessage(null);
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
    setIsLoading(true); setError(null); setMessage(null);
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
    setIsLoading(true); setError(null); setMessage(null);
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
    <>
      <PageStyles />
      <div className="fp-page">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              
              <Card className="fp-card-wrap animate-fade-up text-center">
                
                {/* 1. Dynamic Step Icon */}
                <div key={`icon-${step}`} className="fp-icon-wrapper step-fade">
                  {stepConfig[step].icon}
                </div>
                
                {/* 2. Dynamic Headline & Subtext */}
                <div key={`text-${step}`} className="step-fade">
                  <h4 className="fp-headline">{stepConfig[step].title}</h4>
                  <p className="fp-subtext">{stepConfig[step].subtext}</p>
                </div>

                {/* 3. Alerts */}
                {error && (
                  <div className="fp-alert animate-fade-up">
                    <AlertCircle className="flex-shrink-0" size={18} />
                    <div>{error}</div>
                  </div>
                )}
                {message && (
                  <div className="fp-alert fp-alert-success animate-fade-up">
                    <CheckCircle className="flex-shrink-0" size={18} />
                    <div>{message}</div>
                  </div>
                )}

                {/* 4. Forms */}
                
                {/* STEP 1: EMAIL */}
                {step === 1 && (
                  <Form onSubmit={handleEmailSubmit} className="step-fade delay-100">
                    <Form.Group className="mb-4 text-start">
                      <Form.Label className="fp-label">Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        required 
                        placeholder="student@students.iiests.ac.in" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="fp-control"
                        disabled={isLoading}
                      />
                    </Form.Group>
                    <Button type="submit" className="fp-btn-submit w-100" disabled={isLoading}>
                      {isLoading ? <><Spinner as="span" animation="border" size="sm"/> Sending...</> : <>Send OTP <ArrowRight size={18}/></>}
                    </Button>
                  </Form>
                )}

                {/* STEP 2: OTP */}
                {step === 2 && (
                  <Form onSubmit={handleOtpSubmit} className="step-fade delay-100">
                    <Form.Group className="mb-4">
                      <Form.Control 
                        type="text" 
                        required 
                        maxLength="6"
                        placeholder="• • • • • •" 
                        value={otp} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setOtp(val);
                          setError('');
                        }}
                        className="fp-control fp-otp-control"
                        disabled={isLoading}
                      />
                    </Form.Group>
                    <Button type="submit" className="fp-btn-submit w-100" disabled={isLoading || otp.length !== 6}>
                      {isLoading ? <><Spinner as="span" animation="border" size="sm"/> Verifying...</> : <>Verify Code <ArrowRight size={18}/></>}
                    </Button>
                  </Form>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                  <Form onSubmit={handlePasswordSubmit} className="step-fade delay-100">
                    <Form.Group className="mb-4 text-start">
                      <Form.Label className="fp-label">New Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        required 
                        minLength="6"
                        placeholder="Minimum 6 characters" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="fp-control"
                        disabled={isLoading || (message && message.includes("successfully"))}
                      />
                    </Form.Group>
                    <Button type="submit" className="fp-btn-submit w-100" disabled={isLoading || (message && message.includes("successfully"))}>
                      {isLoading ? <><Spinner as="span" animation="border" size="sm"/> Updating...</> : <>Update Password <CheckCircle size={18}/></>}
                    </Button>
                  </Form>
                )}

                {/* 5. Footer */}
                <div className="mt-4 pt-3 border-top animate-fade-up delay-200" style={{ borderColor: 'var(--border)' }}>
                  <Button 
                    variant="link" 
                    className="w-100 text-decoration-none p-0 fw-bold" 
                    style={{ color: 'var(--text-muted)', fontSize: '14px' }}
                    onClick={() => navigate('/login')}
                  >
                    <ArrowLeft size={16} className="me-1 mb-1" /> Back to Login
                  </Button>
                </div>

              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default ForgotPassword;