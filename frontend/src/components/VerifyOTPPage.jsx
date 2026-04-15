import React, { useState,useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { BASE_URL } from '../helper';

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const url=BASE_URL;
  
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
      const res = await axios.post(url+'/api/auth/verify-otp', { email, otp });     
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
    <div className="bg-light min-vh-100 d-flex align-items-center py-5 font-sans">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            
            <div className="text-center mb-4">
              <h2 className="fw-bolder text-primary mb-1">Ink2Data</h2>
            </div>

            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-4 p-md-5 bg-white text-center">
                
                <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex p-3 mb-4">
                  <ShieldCheck size={48} />
                </div>
                
                <h4 className="fw-bold text-dark mb-2">Verify Your Email</h4>
                <p className="text-muted small mb-4">
                  We've sent a 6-digit verification code to <br/>
                  <strong className="text-dark">{email}</strong>
                </p>

                {error && <Alert variant="danger" className="d-flex align-items-center py-2 text-start"><AlertCircle className="me-2 flex-shrink-0" size={18} />{error}</Alert>}
                {message && <Alert variant="success" className="py-2">{message}</Alert>}

                <Form onSubmit={handleSubmit}>
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
                      className="text-center fw-bold fs-3 tracking-widest py-3"
                      required 
                      disabled={isLoading || message}
                      style={{ letterSpacing: '0.5em' }}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center"
                    disabled={isLoading || otp.length !== 6 || message}
                  >
                    {isLoading ? <Spinner as="span" animation="border" size="sm" className="me-2"/> : 'Verify Account'} 
                    {!isLoading && <ArrowRight size={18} className="ms-2" />}
                  </Button>
                </Form>

              </Card.Body>
              
              <Card.Footer className="bg-light border-top-0 text-center pb-4 pt-0">
                <p className="text-muted mb-0 small">
                  Didn't receive the code? <button className="btn btn-link p-0 text-primary fw-bold ms-1 text-decoration-none">Resend OTP</button>
                </p>
              </Card.Footer>

            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyOTPPage;