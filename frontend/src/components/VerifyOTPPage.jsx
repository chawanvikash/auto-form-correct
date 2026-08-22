import React, { useState, useRef, useContext, useEffect } from 'react';
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

    /* ── Form Elements (6 Boxes) ── */
    .otp-inputs-container {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 24px;
    }
    .otp-box {
      width: 48px;
      height: 56px;
      border-radius: 12px;
      border: 2px solid var(--border);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--brand-blue);
      background: #f8fafc;
      text-align: center;
      transition: all 0.2s ease;
      -moz-appearance: textfield;
    }
    .otp-box::-webkit-outer-spin-button,
    .otp-box::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .otp-box:focus {
      border-color: var(--brand-blue);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
      background: #fff;
      outline: none;
    }
    .otp-box:disabled {
      background: #e2e8f0;
      color: var(--text-light);
      cursor: not-allowed;
    }

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
      .otp-box { width: 40px; height: 50px; font-size: 20px; }
      .otp-inputs-container { gap: 6px; }
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

  const [otpValues, setOtpValues] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Timer State (starts at 60s automatically on page load)
  const [countdown, setCountdown] = useState(60);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = element.value.substring(element.value.length - 1);
    setOtpValues(newOtpValues);
    setError('');

    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpValues[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData) {
      const newOtpValues = [...otpValues];
      pasteData.split('').forEach((char, index) => {
        newOtpValues[index] = char;
      });
      setOtpValues(newOtpValues);
      setError('');
      
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex].focus();
    }
  };

  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    // Cleanup the interval when the component unmounts or countdown reaches 0
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const finalOtpString = otpValues.join('');

    if (finalOtpString.length !== 6) {
      return setError('Please enter a valid 6-digit OTP.');
    }

    setIsLoading(true);
    try {     
      const res = await axios.post(url + '/api/auth/verify-otp', { email, otp: finalOtpString });     
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

  
  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    setMessage('');
    
    // Clear the current boxes when they request a new OTP
    setOtpValues(new Array(6).fill(''));
    if(inputRefs.current[0]) inputRefs.current[0].focus();

    try {
      const res = await axios.post(url + '/api/auth/resend-otp', { email });
      setMessage(res.data.message || "A new 6-digit code has been sent to your email.");
      setCountdown(60); // Reset the timer after a successful resend
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
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
                
                <div className="otp-icon-wrapper animate-fade-up delay-100">
                  <ShieldCheck size={36} strokeWidth={2.5} />
                </div>
                
                <div className="animate-fade-up delay-200">
                  <h4 className="otp-headline">Verify Your Email</h4>
                  <p className="otp-subtext">
                    We've sent a 6-digit verification code to <br/>
                    <strong style={{ color: 'var(--text-main)' }}>{email}</strong>
                  </p>
                </div>

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

                <Form onSubmit={handleSubmit} className="animate-fade-up delay-300">
                  
                  <div className="otp-inputs-container">
                    {otpValues.map((data, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        name={`otp-input-${index}`}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        ref={el => inputRefs.current[index] = el}
                        value={data}
                        onChange={e => handleChange(e.target, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="otp-box"
                        disabled={isLoading || isResending || (message && message.includes('Account verified'))}
                      />
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    className="otp-btn-submit w-100"
                    disabled={isLoading || isResending || otpValues.join('').length !== 6 || (message && message.includes('Account verified'))}
                  >
                    {isLoading ? (
                      <><Spinner as="span" animation="border" size="sm" className="me-2"/> Verifying...</>
                    ) : (
                      <>Verify Account <ArrowRight size={18} className="ms-1" /></>
                    )}
                  </Button>
                </Form>

                <div className="mt-4 pt-3 border-top animate-fade-up delay-400" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-muted mb-0" style={{ fontSize: '13.5px' }}>
                    Didn't receive the code? 
                    <button 
                      onClick={handleResendOTP}
                      type="button"
                      className="btn btn-link p-0 fw-bold ms-1 text-decoration-none" 
                      style={{ color: countdown > 0 ? 'var(--text-light)' : 'var(--brand-blue)' }}
                      disabled={isLoading || isResending || countdown > 0 || (message && message.includes('Account verified'))}
                    >
                      {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
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