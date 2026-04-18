import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { LogIn, AlertCircle, Mail, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../helper';


const LoginPage = () => {
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();
  const url=BASE_URL;
  
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
      const res = await axios.post(url+'/api/auth/login', formData);
      login(res.data.token, res.data.user);
      
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5 font-sans">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={4}> {/* Tighter column for a sleek login box */}
            
            <div className="text-center mb-4">
              <h2 className="fw-bolder text-primary mb-1">Ink2Data</h2>
              <p className="text-muted">Sign in to your IIEST Academic Account</p>
            </div>

            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-4 p-md-5 bg-white">
                
                <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                  <LogIn className="text-primary me-2" size={24} />
                  <h4 className="mb-0 fw-bold text-dark">Welcome Back</h4>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center py-2">
                    <AlertCircle className="me-2 flex-shrink-0" size={18} />
                    <div>{error}</div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-secondary d-flex align-items-center">
                      <Mail size={16} className="me-2" /> G-Suite Email ID
                    </Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      placeholder="student@students.iiests.ac.in" 
                      onChange={handleChange} 
                      required 
                      disabled={isLoading}
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="fw-semibold text-secondary d-flex align-items-center mb-0">
                        <Lock size={16} className="me-2" /> Password
                      </Form.Label>
                      {/* Placeholder for future Forgot Password feature */}
                       <Link to ='/forgot-password' className="text-decoration-none small text-muted hover-primary">Forgot Password</Link>
                    </div>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      value={formData.password}
                      placeholder="••••••••" 
                      onChange={handleChange} 
                      required 
                      disabled={isLoading}
                      className="py-2 mt-2"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2"/>
                        Authenticating...
                      </>
                    ) : (
                      'Secure Login'
                    )}
                  </Button>

                </Form>
              </Card.Body>
              
              <Card.Footer className="bg-light border-top-0 text-center pb-4 pt-3">
                <p className="text-muted mb-0 small fw-semibold">
                  Don't have an account? 
                  <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1">
                    Register here
                  </Link>
                </p>
              </Card.Footer>

            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;