import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { BASE_URL } from '../helper';


const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    :root {
      --brand-navy:  #1b3f6e;
      --brand-blue:  #2563eb;
      --brand-light: #eff6ff;
      --brand-teal:  #0891b2;
      --brand-green: #16a34a;
      --surface:     #ffffff;
      --bg:          #f8fafc;
      --border:      #e2e8f0;
      --text-main:   #0f172a;
      --text-muted:  #475569;
      --text-light:  #94a3b8;
    }

    .otp-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      padding: 40px 0;
      position: relative;
    }
    
    /* Top Brand Bar */
    .otp-page::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--brand-navy), var(--brand-blue), var(--brand-teal));
      z-index: 100;
    }

    .otp-card-wrap {
      border-radius: 16px !important;
      border: none !important;
      box-shadow: 0 10px 40px rgba(30,63,110,0.08), 0 1px 3px rgba(0,0,0,0.05) !important;
      overflow: hidden !important;
      background: var(--surface);
      padding: 48px 40px;
    }

    /* ── Icon & Typography ── */
    .otp-icon-wrapper {
      width: 72px; 
      height: 72px;
      background: var(--brand-light);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      color: var(--brand-blue);
      box-shadow: 0 0 0 8px rgba(37,99,235,0.05);
    }

    .otp-headline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      color: var(--text-main);
      font-size: 26px;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .otp-subtext {
      color: var(--text-muted);
      font-size: 14.5px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    /* ── Form Elements ── */
    .otp-control {
      border-radius: 12px !important;
      border: 2px solid var(--border) !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      color: var(--brand-blue) !important;
      background: #f8fafc !important;
      transition: all 0.2s ease !important;
    }
    .otp-control:focus {
      border-color: var(--brand-blue) !important;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.1) !important;
      background: #fff !important;
    }
    .otp-control::placeholder { color: var(--text-light) !important; opacity: 0.5; }

    /* ── Buttons ── */
    .otp-btn-submit {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 10px !important;
      padding: 14px 22px !important;
      font-size: 15px !important; font-weight: 700 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important;
      transition: all 0.2s ease !important;
    }
    .otp-btn-submit:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35) !important;
    }

    /* ── Alerts ── */
    .otp-alert {
      border-radius: 10px; border: 1.5px solid #fecaca;
      background: #fff5f5; color: #b91c1c;
      font-size: 13.5px; font-weight: 500;
      padding: 12px 16px; margin-bottom: 24px;
      display: flex; align-items: center; gap: 10px;
      text-align: left;
    }
    .otp-alert-success {
      border-color: #bbf7d0; background: #f0fdf4; color: #15803d;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }

    /* Responsive */
    @media (max-width: 576px) {
      .otp-card-wrap { padding: 40px 24px; }
      .otp-headline { font-size: 24px; }
    }
  `}</style>
);

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const url = BASE_URL;
  
  const email = location.state?.email;
  
  if (!email) {
    navigate('/register');
  }

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      return setError('Please enter a valid 6-digit OTP.');
    }

    setIsLoading(true);
    try {     
      const res = await axios.post(url + '/api/auth/verify-otp', { email, otp });     
      login(res.data.token, res.data.user);     
      setMessage('Account verified! Taking you to the dashboard...');
      
      setTimeout(() => {
        navigate('/'); 
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageStyles />
      <div className="otp-page">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              
              <Card className="otp-card-wrap animate-fade-up text-center">
                
                {/* 1. Icon */}
                <div className="otp-icon-wrapper animate-fade-up delay-100">
                  <ShieldCheck size={36} strokeWidth={2.5} />
                </div>
                
                {/* 2. Headline & Subtext */}
                <div className="animate-fade-up delay-200">
                  <h4 className="otp-headline">Verify Your Email</h4>
                  <p className="otp-subtext">
                    We've sent a 6-digit verification code to <br/>
                    <strong style={{ color: 'var(--text-main)' }}>{email}</strong>
                  </p>
                </div>

                {/* 3. Alerts */}
                {error && (
                  <div className="otp-alert animate-fade-up delay-200">
                    <AlertCircle className="flex-shrink-0" size={18} />
                    <div>{error}</div>
                  </div>
                )}
                {message && (
                  <div className="otp-alert otp-alert-success animate-fade-up delay-200">
                    <CheckCircle className="flex-shrink-0" size={18} />
                    <div>{message}</div>
                  </div>
                )}

                {/* 4. Form */}
                <Form onSubmit={handleSubmit} className="animate-fade-up delay-300">
                  <Form.Group className="mb-4">
                    <Form.Control 
                      type="text" 
                      maxLength="6"
                      value={otp}
                      onChange={(e) => {
                        // Only allow numbers
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setOtp(val);
                        setError('');
                      }}
                      placeholder="• • • • • •" 
                      className="otp-control text-center fw-bold py-3"
                      required 
                      disabled={isLoading || message}
                      style={{ 
                        fontSize: '28px', 
                        letterSpacing: otp ? '0.5em' : '0.2em' 
                      }}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="otp-btn-submit w-100"
                    disabled={isLoading || otp.length !== 6 || message}
                  >
                    {isLoading || message ? (
                      <><Spinner as="span" animation="border" size="sm" className="me-2"/> Verifying...</>
                    ) : (
                      <>Verify Account <ArrowRight size={18} className="ms-1" /></>
                    )}
                  </Button>
                </Form>

                {/* 5. Footer */}
                <div className="mt-4 pt-3 border-top animate-fade-up delay-400" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-muted mb-0" style={{ fontSize: '13.5px' }}>
                    Didn't receive the code? 
                    <button 
                      className="btn btn-link p-0 fw-bold ms-1 text-decoration-none" 
                      style={{ color: 'var(--brand-blue)' }}
                      disabled={isLoading || message}
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default VerifyOTPPage;