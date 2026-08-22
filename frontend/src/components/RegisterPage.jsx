import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { User, BookOpen, Shield, AlertCircle, ArrowRight, ArrowLeft, CheckCircle, GraduationCap } from 'lucide-react';
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
      padding: 38px 36px 30px;
    }
    .reg-card-wrap {
      border-radius: 14px !important;
      border: none !important;
      box-shadow: 0 4px 28px rgba(30,63,110,0.1), 0 1px 4px rgba(0,0,0,0.05) !important;
      overflow: hidden !important;
    }

    /* ── Steps ── */
    .reg-steps {
      display: flex; align-items: center;
      margin-bottom: 28px;
    }
    .reg-step-node {
      display: flex; flex-direction: column;
      align-items: center; gap: 5px; flex: 0;
    }
    .reg-step-circle {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
      transition: all 0.25s;
      border: 2px solid var(--border);
      color: var(--text-light);
      background: #fff;
    }
    .reg-step-circle.active {
      border-color: var(--brand-blue); color: var(--brand-blue);
      background: var(--brand-light);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
    }
    .reg-step-circle.done {
      border-color: var(--brand-green);
      background: #f0fdf4; color: var(--brand-green);
    }
    .reg-step-name {
      font-size: 10.5px; font-weight: 600;
      color: var(--text-light); white-space: nowrap; letter-spacing: 0.3px;
    }
    .reg-step-name.active { color: var(--brand-blue); }
    .reg-step-name.done  { color: var(--brand-green); }
    .reg-step-connector {
      flex: 1; height: 2px; background: var(--border);
      margin: 0 6px; margin-bottom: 18px;
      border-radius: 2px; transition: background 0.3s;
    }
    .reg-step-connector.done { background: #bbf7d0; }

    /* ── Section head ── */
    .reg-section-head {
      margin-bottom: 22px;
      padding-bottom: 14px;
      border-bottom: 1.5px solid var(--border);
    }
    .reg-section-head h5 {
      font-family: 'Outfit', sans-serif;
      font-size: 17px; font-weight: 700;
      color: var(--text-main);
      margin: 0 0 3px;
      display: flex; align-items: center; gap: 9px;
    }
    .reg-section-head p { font-size: 12.5px; color: var(--text-muted); margin: 0; }
    .reg-head-icon {
      width: 30px; height: 30px; border-radius: 8px;
      background: var(--brand-light);
      display: flex; align-items: center; justify-content: center;
      color: var(--brand-blue);
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
      font-size: 14px !important;
      font-family: 'Nunito', sans-serif !important;
      color: var(--text-main) !important;
      padding: 10px 13px !important;
      background: #f8fafc !important;
      transition: border-color 0.2s, box-shadow 0.2s !important;
    }
    .reg-control:focus {
      border-color: var(--brand-blue) !important;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
      background: #fff !important;
    }
    .reg-control::placeholder { color: var(--text-light) !important; }
    .reg-control option { background: #fff; color: var(--text-main); }

    /* ── Buttons ── */
    .reg-btn-next {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 9px !important;
      padding: 10px 22px !important;
      font-size: 14px !important; font-weight: 700 !important;
      font-family: 'Nunito', sans-serif !important;
      display: flex; align-items: center; gap: 7px;
      transition: transform 0.15s, box-shadow 0.15s !important;
    }
    .reg-btn-next:hover:not(:disabled) {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(37,99,235,0.28) !important;
    }
    .reg-btn-submit {
      background: linear-gradient(135deg, #16a34a, #15803d) !important;
      border: none !important; border-radius: 9px !important;
      padding: 10px 22px !important;
      font-size: 14px !important; font-weight: 700 !important;
      font-family: 'Nunito', sans-serif !important;
      display: flex; align-items: center; gap: 7px;
      transition: transform 0.15s, box-shadow 0.15s !important;
    }
    .reg-btn-submit:hover:not(:disabled) {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(22,163,74,0.28) !important;
    }
    .reg-btn-back {
      border-radius: 9px !important;
      border: 1.5px solid var(--border) !important;
      background: transparent !important;
      color: var(--text-muted) !important;
      padding: 9px 18px !important;
      font-size: 14px !important; font-weight: 600 !important;
      font-family: 'Nunito', sans-serif !important;
      display: flex; align-items: center; gap: 6px;
    }
    .reg-btn-back:hover { background: var(--bg) !important; }

    /* ── Alert ── */
    .reg-alert {
      border-radius: 9px; border: 1.5px solid #fecaca;
      background: #fff5f5; color: #b91c1c;
      font-size: 13px; font-weight: 600;
      padding: 10px 14px; margin-bottom: 18px;
      display: flex; align-items: center; gap: 8px;
    }

    /* ── Admin warning ── */
    .reg-admin-notice {
      background: #fffbeb; border: 1.5px solid #fde68a;
      border-radius: 8px; padding: 8px 12px;
      font-size: 12px; font-weight: 600; color: #92400e;
      margin-top: 8px; display: flex; align-items: center; gap: 7px;
    }

    /* ── Footer ── */
    .reg-form-footer {
      border-top: 1.5px solid var(--border);
      margin-top: 22px; padding-top: 16px;
      text-align: center;
      font-size: 13px; color: var(--text-muted);
    }
    .reg-form-footer a { color: var(--brand-blue) !important; font-weight: 700; text-decoration: none !important; }
    .reg-form-footer a:hover { text-decoration: underline !important; }

    /* ── Animation ── */
    @keyframes fadein {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .reg-fade { animation: fadein 0.25s ease both; }

    /* ── Responsive ── */
    @media (max-width: 767px) {
      .reg-left-panel { border-radius: 14px 14px 0 0; min-height: auto; padding: 28px 22px; }
      .reg-right-panel { border-radius: 0 0 14px 14px; padding: 26px 20px 22px; }
      .reg-feature-list { display: none; }
    }
  `}</style>
);


const Steps = ({ current }) => {
  const items = ['Identity', 'Academic', 'Security'];
  return (
    <div className="reg-steps">
      {items.map((label, i) => {
        const n = i + 1;
        const done = n < current, active = n === current;
        return (
          <React.Fragment key={n}>
            <div className="reg-step-node">
              <div className={`reg-step-circle ${done ? 'done' : active ? 'active' : ''}`}>
                {done ? <CheckCircle size={15} /> : n}
              </div>
              <span className={`reg-step-name ${done ? 'done' : active ? 'active' : ''}`}>{label}</span>
            </div>
            {i < items.length - 1 && <div className={`reg-step-connector ${done ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};


const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const url = BASE_URL;

  const [formData, setFormData] = useState({
    full_name: '', phone_no: '', identifier: '',
    programme: 'B.Tech', department: 'Computer Science and Technology',
    semester: '', email: '', password: '', role: 'student',
  });

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };
  
  const nextStep = () => {
    // Step 1 Validation
    if (step === 1 && (!formData.full_name || !formData.phone_no || !formData.identifier || !formData.role)) {
      return setError('Please fill in all Personal details.');
    }
    // Step 2 Validation (Dynamic based on role)
    if (step === 2) {
        if (formData.role === 'student' && (!formData.semester || !formData.programme || !formData.department)) {
            return setError('Please fill in all Academic details.');
        }
        if (formData.role !== 'student' && !formData.department) {
            return setError('Please select your department.');
        }
    }
    setError(''); setStep((p) => p + 1);
  };
  
  const prevStep = () => { setError(''); setStep((p) => p - 1); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || formData.password.length < 6)
      return setError('Please provide a valid email and a password of at least 6 characters.');
    setError(''); setIsLoading(true);
    
    try {
      await axios.post(url + '/api/auth/register', formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  const stepTitles    = ['Personal Identity', 'Academic Profile', 'Account Security'];
  const stepSubtitles = [
    'Tell us who you are so we can set up your profile.',
    'Your academic classification for your account.',
    'Set your login credentials to secure your account.',
  ];

  return (
    <>
      <PageStyles />
      <div className="reg-page">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} xl={10}>
              <Card className="reg-card-wrap">
                <Row className="g-0">

                  {/* ── Left Panel ── */}
                  <Col md={4} className="reg-left-panel">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-0">
                        <div className="reg-logo-icon"><GraduationCap size={22} color="#fff" /></div>
                        <div>
                          <div className="reg-logo-name">Ink2Data</div>
                          <div className="reg-logo-sub">IIEST ACADEMIC PORTAL</div>
                        </div>
                      </div>

                      <p className="reg-panel-tagline">
                        Your unified academic workspace.
                      </p>

                      <ul className="reg-feature-list">
                        {[
                          { icon: <BookOpen size={14} color="#93c5fd" />, title: 'Smart Submit',      desc: 'Convert handwritten registration forms into digital documents' },
                          { icon: <Shield   size={14} color="#86efac" />, title: 'Secure Access',     desc: 'G-Suite verified login for IIEST students only' },
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

                  {/* ── Right Panel ── */}
                  <Col md={8} className="reg-right-panel">

                    <div className="mb-1">
                      <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#1e293b', fontSize: 20, marginBottom: 2 }}>
                        Create your account
                      </h4>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                        Step {step} of 3 — {stepTitles[step - 1]}
                      </p>
                    </div>

                    <hr style={{ borderColor: '#e2e8f0', margin: '14px 0 18px' }} />
                    <Steps current={step} />

                    {error && (
                      <div className="reg-alert"><AlertCircle size={16} />{error}</div>
                    )}

                    <Form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>

                      {/* STEP 1 */}
                      {step === 1 && (
                        <div className="reg-fade">
                          <div className="reg-section-head">
                            <h5><span className="reg-head-icon"><User size={15} /></span>Personal Identity</h5>
                            <p>{stepSubtitles[0]}</p>
                          </div>
                          
                          <Row>
                            <Col sm={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="reg-label">Account Role</Form.Label>
                                <Form.Select className="reg-control" name="role" value={formData.role} onChange={handleChange}>
                                  <option value="student">Student</option>
                                  <option value="faculty">Faculty</option>
                                  <option value="admin">Administrator</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col sm={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="reg-label">Full Name</Form.Label>
                                <Form.Control className="reg-control" type="text" name="full_name"
                                  value={formData.full_name} placeholder="e.g. Chawan Vikas" onChange={handleChange} />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col sm={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="reg-label">
                                  {formData.role === 'student' ? 'Enrolment No.' : 'Employee ID'}
                                </Form.Label>
                                <Form.Control className="reg-control" type="text" name="identifier"
                                  value={formData.identifier} 
                                  placeholder={formData.role === 'student' ? '2024CS001' : 'EMP12345'} 
                                  onChange={handleChange} />
                              </Form.Group>
                            </Col>
                            <Col sm={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="reg-label">Phone Number</Form.Label>
                                <Form.Control className="reg-control" type="tel" name="phone_no"
                                  value={formData.phone_no} placeholder="+91 XXXXXXXXXX" onChange={handleChange} />
                              </Form.Group>
                            </Col>
                          </Row>

                          {formData.role === 'admin' && (
                            <div className="reg-admin-notice mb-3">⚠ Admin registration requires a pre-authorized faculty email ID.</div>
                          )}

                          <div className="d-flex justify-content-end mt-2">
                            <Button className="reg-btn-next" onClick={nextStep}>Continue <ArrowRight size={16} /></Button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2 */}
                      {step === 2 && (
                        <div className="reg-fade">
                          <div className="reg-section-head">
                            <h5><span className="reg-head-icon"><BookOpen size={15} /></span>Academic Profile</h5>
                            <p>{stepSubtitles[1]}</p>
                          </div>
                          
                          {formData.role === 'student' && (
                            <Row>
                              <Col sm={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="reg-label">Programme</Form.Label>
                                  <Form.Select className="reg-control" name="programme"
                                    value={formData.programme} onChange={handleChange}>
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="M.Tech">M.Tech</option>
                                    <option value="M.Sc">M.Sc</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col sm={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="reg-label">Current Semester</Form.Label>
                                  <Form.Select className="reg-control" name="semester"
                                    value={formData.semester} onChange={handleChange}>
                                    <option value="">— Select Semester —</option>
                                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>
                          )}

                          <Form.Group className="mb-3">
                            <Form.Label className="reg-label">Department</Form.Label>
                            <Form.Select className="reg-control" name="department"
                              value={formData.department} onChange={handleChange}>
                              <option value="Computer Science and Technology">Computer Science &amp; Technology</option>
                              <option value="Information Technology">Information Technology</option>
                              <option value="Electrical Engineering">Electrical Engineering</option>
                              <option value="Mechanical Engineering">Mechanical Engineering</option>
                            </Form.Select>
                          </Form.Group>

                          <div className="d-flex justify-content-between mt-2">
                            <Button className="reg-btn-back" onClick={prevStep}><ArrowLeft size={15} /> Back</Button>
                            <Button className="reg-btn-next" onClick={nextStep}>Continue <ArrowRight size={16} /></Button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3 */}
                      {step === 3 && (
                        <div className="reg-fade">
                          <div className="reg-section-head">
                            <h5><span className="reg-head-icon"><Shield size={15} /></span>Account Security</h5>
                            <p>{stepSubtitles[2]}</p>
                          </div>
                          
                          <Form.Group className="mb-3">
                            <Form.Label className="reg-label">Official Email ID</Form.Label>
                            <Form.Control className="reg-control" type="email" name="email"
                              value={formData.email} placeholder="name@iiests.ac.in"
                              onChange={handleChange} disabled={isLoading} />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="reg-label">Password</Form.Label>
                            <Form.Control className="reg-control" type="password" name="password"
                              value={formData.password} placeholder="Minimum 6 characters"
                              onChange={handleChange} disabled={isLoading} />
                          </Form.Group>

                          <div className="d-flex justify-content-between mt-3">
                            <Button className="reg-btn-back" onClick={prevStep} disabled={isLoading}>
                              <ArrowLeft size={15} /> Back
                            </Button>
                            <Button className="reg-btn-submit" type="submit" disabled={isLoading}>
                              {isLoading
                                ? <><Spinner as="span" animation="border" size="sm" /> Sending Code…</>
                                : <><CheckCircle size={16} /> Complete Registration</>}
                            </Button>
                          </div>
                        </div>
                      )}

                    </Form>

                    <div className="reg-form-footer">
                      Already have an account? <Link to="/login">Log in here</Link>
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

export default RegisterPage;