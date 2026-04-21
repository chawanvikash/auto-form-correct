import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { AlertCircle, Lock, GraduationCap, BookOpen, Shield, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../helper';


const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Outfit:wght@500;600;700&display=swap');

    :root {
      --brand-navy:  #1b3f6e;
      --brand-blue:  #2563eb;
      --brand-light: #eff6ff;
      --brand-teal:  #0891b2;
      --brand-green: #16a34a;
      --surface:     #ffffff;
      --bg:          #f1f5f9;
      --border:      #e2e8f0;
      --text-main:   #1e293b;
      --text-muted:  #64748b;
      --text-light:  #94a3b8;
    }

    .reg-page {
      min-height: 100vh;
      background: var(--bg);
      font-family: 'Nunito', sans-serif;
      display: flex;
      align-items: center;
      padding: 40px 0;
      position: relative;
    }
    .reg-page::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--brand-navy), var(--brand-blue), var(--brand-teal));
      z-index: 100;
    }

    /* ── Left panel ── */
    .reg-left-panel {
      background: linear-gradient(160deg, var(--brand-navy) 0%, #1e4d8c 55%, var(--brand-teal) 100%);
      border-radius: 14px 0 0 14px;
      padding: 44px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 560px;
      position: relative;
      overflow: hidden;
    }
    .reg-left-panel::before {
      content: '';
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.07);
      top: -80px; right: -80px;
    }
    .reg-left-panel::after {
      content: '';
      position: absolute;
      width: 180px; height: 180px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.06);
      bottom: -50px; left: -30px;
    }

    .reg-logo-icon {
      width: 46px; height: 46px;
      background: rgba(255,255,255,0.14);
      border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .reg-logo-name {
      font-family: 'Outfit', sans-serif;
      font-size: 22px; font-weight: 700;
      color: #fff; letter-spacing: -0.3px;
    }
    .reg-logo-sub {
      font-size: 10.5px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.8px;
    }
    .reg-panel-tagline {
      color: rgba(255,255,255,0.48);
      font-size: 12.5px;
      line-height: 1.65;
      margin-top: 16px;
      margin-bottom: 30px;
    }

    .reg-feature-list { list-style: none; padding: 0; margin: 0; }
    .reg-feature-list li {
      display: flex; align-items: flex-start; gap: 12px;
      margin-bottom: 18px;
    }
    .reg-feature-dot {
      width: 32px; height: 32px; flex-shrink: 0;
      border-radius: 9px;
      background: rgba(255,255,255,0.11);
      border: 1px solid rgba(255,255,255,0.16);
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px;
    }
    .reg-feature-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .reg-feature-desc  { font-size: 11.5px; color: rgba(255,255,255,0.48); line-height: 1.4; }
    .reg-panel-footer  { font-size: 11px; color: rgba(255,255,255,0.3); }

    /* ── Right panel ── */
    .reg-right-panel {
      background: var(--surface);
      border-radius: 0 14px 14px 0;
      padding: 44px 44px 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .reg-card-wrap {
      border-radius: 14px !important;
      border: none !important;
      box-shadow: 0 4px 28px rgba(30,63,110,0.1), 0 1px 4px rgba(0,0,0,0.05) !important;
      overflow: hidden !important;
    }

    /* ── Form elements ── */
    .reg-label {
      font-size: 11.5px !important; font-weight: 700 !important;
      text-transform: uppercase; letter-spacing: 0.6px;
      color: var(--text-muted) !important; margin-bottom: 6px !important;
    }
    .reg-control {
      border-radius: 9px !important;
      border: 1.5px solid var(--border) !important;
      font-size: 14.5px !important;
      font-family: 'Nunito', sans-serif !important;
      color: var(--text-main) !important;
      padding: 12px 14px !important;
      background: #f8fafc !important;
      transition: border-color 0.2s, box-shadow 0.2s !important;
    }
    .reg-control:focus {
      border-color: var(--brand-blue) !important;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
      background: #fff !important;
    }
    .reg-control::placeholder { color: var(--text-light) !important; }

    /* ── Buttons ── */
    .reg-btn-submit {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 9px !important;
      padding: 12px 22px !important;
      font-size: 15px !important; font-weight: 700 !important;
      font-family: 'Nunito', sans-serif !important;
      display: flex; align-items: center; gap: 8px;
      transition: transform 0.15s, box-shadow 0.15s !important;
    }
    .reg-btn-submit:hover:not(:disabled) {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(37,99,235,0.28) !important;
    }

    /* ── Alert ── */
    .reg-alert {
      border-radius: 9px; border: 1.5px solid #fecaca;
      background: #fff5f5; color: #b91c1c;
      font-size: 13px; font-weight: 600;
      padding: 12px 16px; margin-bottom: 22px;
      display: flex; align-items: center; gap: 8px;
    }

    /* ── Footer ── */
    .reg-form-footer {
      border-top: 1.5px solid var(--border);
      margin-top: 32px; padding-top: 20px;
      text-align: center;
      font-size: 13.5px; color: var(--text-muted);
    }
    .reg-form-footer a { color: var(--brand-blue) !important; font-weight: 700; text-decoration: none !important; }
    .reg-form-footer a:hover { text-decoration: underline !important; }

    /* ════════ ANIMATIONS ════════ */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 0.4s ease-out both;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }

    /* ── Responsive ── */
    @media (max-width: 767px) {
      .reg-left-panel { border-radius: 14px 14px 0 0; min-height: auto; padding: 28px 22px; }
      .reg-right-panel { border-radius: 0 0 14px 14px; padding: 32px 24px; }
      .reg-feature-list { display: none; }
    }
  `}</style>
);

const LoginPage = () => {
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();
  const url = BASE_URL;
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(url + '/api/auth/login', formData);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageStyles />
      <div className="reg-page">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} xl={10}>
              <Card className="reg-card-wrap animate-fade-up">
                <Row className="g-0">

                  {/* ── Left Panel (Branding) ── */}
                  <Col md={5} className="reg-left-panel">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-0">
                        <div className="reg-logo-icon"><GraduationCap size={22} color="#fff" /></div>
                        <div>
                          <div className="reg-logo-name">Ink2Data</div>
                          <div className="reg-logo-sub">IIEST ACADEMIC PORTAL</div>
                        </div>
                      </div>

                      <p className="reg-panel-tagline">
                        Welcome back to your unified academic workspace.
                      </p>

                      <ul className="reg-feature-list">
                        {[
                          { icon: <BookOpen size={14} color="#93c5fd" />, title: 'Smart Submit',    desc: 'Convert handwritten regisration forms into digital document.' },
                          { icon: <Shield   size={14} color="#86efac" />, title: 'Secure Access',  desc: 'G-Suite verified login for IIEST students only' },
                          { icon: <User     size={14} color="#fcd34d" />, title: 'Personal Dashboard',desc: 'Track your courses, tasks and progress easily' },
                        ].map((f) => (
                          <li key={f.title}>
                            <div className="reg-feature-dot">{f.icon}</div>
                            <div>
                              <div className="reg-feature-title">{f.title}</div>
                              <div className="reg-feature-desc">{f.desc}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="reg-panel-footer">© {new Date().getFullYear()} Ink2Data · IIEST Shibpur</div>
                  </Col>

                  {/* ── Right Panel (Login Form) ── */}
                  <Col md={7} className="reg-right-panel">
                    
                    <div className="mb-4 animate-fade-up delay-100">
                      <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#1e293b', fontSize: 28, marginBottom: 4 }}>
                        Welcome Back
                      </h4>
                      <p style={{ fontSize: 14.5, color: '#64748b', margin: 0 }}>
                        Sign in to your IIEST Academic Account
                      </p>
                    </div>

                    {error && (
                      <div className="reg-alert animate-fade-up">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <div>{error}</div>
                      </div>
                    )}

                    <Form onSubmit={handleSubmit} className="mt-2">
                      <Form.Group className="mb-4 animate-fade-up delay-200">
                        <Form.Label className="reg-label">G-Suite Email ID</Form.Label>
                        <Form.Control 
                          className="reg-control" 
                          type="email" 
                          name="email" 
                          value={formData.email}
                          placeholder="student@students.iiests.ac.in" 
                          onChange={handleChange} 
                          required 
                          disabled={isLoading}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4 animate-fade-up delay-300">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="reg-label mb-0">Password</Form.Label>
                          <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-blue)', textDecoration: 'none' }}>
                            Forgot Password?
                          </Link>
                        </div>
                        <Form.Control 
                          className="reg-control" 
                          type="password" 
                          name="password" 
                          value={formData.password}
                          placeholder="••••••••" 
                          onChange={handleChange} 
                          required 
                          disabled={isLoading}
                        />
                      </Form.Group>

                      <div className="mt-5 animate-fade-up delay-400">
                        <Button 
                          className="reg-btn-submit w-100 justify-content-center" 
                          type="submit" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <><Spinner as="span" animation="border" size="sm" /> Authenticating...</>
                          ) : (
                            <><Lock size={18} /> Secure Login</>
                          )}
                        </Button>
                      </div>
                    </Form>

                    <div className="reg-form-footer animate-fade-up delay-400">
                      Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                  </Col>

                </Row>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default LoginPage;