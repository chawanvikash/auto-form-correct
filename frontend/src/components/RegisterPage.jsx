import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { User, BookOpen, Shield, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { BASE_URL } from '../helper';

const RegisterPage = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const url=BASE_URL;

  const [formData, setFormData] = useState({
    full_name: '',
    phone_no: '',
    enrolment_no: '',
    programme: 'B.Tech',
    department: 'Computer Science and Technology',
    semester: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.phone_no || !formData.enrolment_no) {
        return setError("Please fill in all Personal details.");
      }
    } else if (step === 2) {
      if (!formData.semester || !formData.programme || !formData.department) {
        return setError("Please fill in all Academic details.");
      }
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || formData.password.length < 6) {
      return setError("Please provide a valid email and a password of at least 6 characters.");
    }

    setError('');
    setIsLoading(true);

    try {
      await axios.post(url+'/api/auth/register', formData);

      navigate('/verify-otp', { state: { email: formData.email } });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepPercentage = (step / 3) * 100;

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5 font-sans">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6}>
            
            <div className="text-center mb-4">
              <h2 className="fw-bolder text-primary mb-1">Ink2Data</h2>
              <p className="text-muted">Create your IIEST Academic Account</p>
            </div>

            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Progress Bar Header */}
              <div className="px-4 pt-4 pb-2 bg-white">
                <div className="d-flex justify-content-between mb-2 text-muted small fw-bold">
                  <span className={step >= 1 ? "text-primary" : ""}>Step 1: Identity</span>
                  <span className={step >= 2 ? "text-primary" : ""}>Step 2: Academic</span>
                  <span className={step >= 3 ? "text-primary" : ""}>Step 3: Security</span>
                </div>
                <ProgressBar now={stepPercentage} style={{ height: '6px' }} />
              </div>

              <Card.Body className="p-4 p-md-5 bg-white">
                
                {error && <Alert variant="danger" className="d-flex align-items-center py-2"><AlertCircle className="me-2" size={18} />{error}</Alert>}

                <Form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
                  
                  {/* ================= STEP 1: PERSONAL DETAILS ================= */}
                  {step === 1 && (
                    <div className="animation-fade-in">
                      <div className="d-flex align-items-center mb-4">
                        <User className="text-primary me-2" size={24} />
                        <h4 className="mb-0 fw-bold text-dark">Personal Identity</h4>
                      </div>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-secondary">Full Name</Form.Label>
                        <Form.Control type="text" name="full_name" value={formData.full_name} placeholder="e.g. Chawan Vikas" onChange={handleChange} />
                      </Form.Group>

                      <Row>
                        <Col sm={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-secondary">Enrolment No.</Form.Label>
                            <Form.Control type="text" name="enrolment_no" value={formData.enrolment_no} placeholder="2024CS001" onChange={handleChange} />
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-secondary">Phone Number</Form.Label>
                            <Form.Control type="tel" name="phone_no" value={formData.phone_no} placeholder="+91..." onChange={handleChange} />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end mt-2">
                        <Button variant="primary" className="px-4 py-2 fw-bold d-flex align-items-center rounded-3" onClick={nextStep}>
                          Next Step <ArrowRight size={18} className="ms-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ================= STEP 2: ACADEMIC DETAILS ================= */}
                  {step === 2 && (
                    <div className="animation-fade-in">
                      <div className="d-flex align-items-center mb-4">
                        <BookOpen className="text-primary me-2" size={24} />
                        <h4 className="mb-0 fw-bold text-dark">Academic Profile</h4>
                      </div>

                      <Row>
                        <Col sm={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-secondary">Programme</Form.Label>
                            <Form.Select name="programme" value={formData.programme} onChange={handleChange}>
                              <option value="B.Tech">B.Tech</option>
                              <option value="M.Tech">M.Tech</option>
                              <option value="M.Sc">M.Sc</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-secondary">Current Semester</Form.Label>
                            <Form.Select name="semester" value={formData.semester} onChange={handleChange}>
                              <option value="">Select Semester</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-secondary">Department</Form.Label>
                        <Form.Select name="department" value={formData.department} onChange={handleChange}>
                          <option value="Computer Science and Technology">Computer Science & Technology</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </Form.Select>
                      </Form.Group>

                      <div className="d-flex justify-content-between mt-2">
                        <Button variant="outline-secondary" className="px-4 py-2 fw-bold d-flex align-items-center rounded-3" onClick={prevStep}>
                          <ArrowLeft size={18} className="me-2" /> Back
                        </Button>
                        <Button variant="primary" className="px-4 py-2 fw-bold d-flex align-items-center rounded-3" onClick={nextStep}>
                          Next Step <ArrowRight size={18} className="ms-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ================= STEP 3: SECURITY & ACCOUNT ================= */}
                  {step === 3 && (
                    <div className="animation-fade-in">
                      <div className="d-flex align-items-center mb-4">
                        <Shield className="text-primary me-2" size={24} />
                        <h4 className="mb-0 fw-bold text-dark">Account Security</h4>
                      </div>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-secondary">Account Role</Form.Label>
                        <Form.Select name="role" value={formData.role} onChange={handleChange} disabled={isLoading}>
                          <option value="student">Student</option>
                          <option value="admin">Administrator</option>
                        </Form.Select>
                        {formData.role === 'admin' && (
                          <Form.Text className="text-warning fw-bold">
                            * Admin registration requires an authorized email ID.
                          </Form.Text>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-secondary">G-Suite Email ID</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} placeholder="student@students.iiests.ac.in" onChange={handleChange} disabled={isLoading} />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-secondary">Password</Form.Label>
                        <Form.Control type="password" name="password" value={formData.password} placeholder="Minimum 6 characters" onChange={handleChange} disabled={isLoading} />
                      </Form.Group>

                      <div className="d-flex justify-content-between mt-4">
                        <Button variant="outline-secondary" className="px-4 py-2 fw-bold d-flex align-items-center rounded-3" onClick={prevStep} disabled={isLoading}>
                          <ArrowLeft size={18} className="me-2" /> Back
                        </Button>
                        <Button variant="success" type="submit" className="px-4 py-2 fw-bold rounded-3 d-flex align-items-center" disabled={isLoading}>
                          {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2"/> Sending Code...</> : 'Complete Registration'}
                        </Button>
                      </div>
                    </div>
                  )}

                </Form>
              </Card.Body>
              
              {/* Footer text */}
              <Card.Footer className="bg-light border-top-0 text-center pb-4 pt-3">
                <p className="text-muted mb-0 small fw-semibold">
                  Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">Log in here</Link>
                </p>
              </Card.Footer>

            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;