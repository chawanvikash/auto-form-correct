import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { ArrowRight, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/logo.png'; 

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Container fluid className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light font-sans">
      <div className="text-center px-3" style={{ maxWidth: '800px' }}>
        
        {/* 2. USE THE IMAGE TAG */}
        <div className="mx-auto mb-4" style={{ maxWidth: '400px' }}>
          <img 
            src={logoImage} 
            alt="Ink2Data Official Logo" 
            className="img-fluid drop-shadow-sm" 
            style={{ borderRadius: '16px' }} 
          />
        </div>
        
        {/* The Value Proposition */}
        <p className="lead text-secondary mb-5 px-md-5" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          The official IIEST Semester Registration AI Evaluator. Instantly cross-check your handwritten registration forms against the official curriculum.
        </p>

        {/* The Call to Action (CTA) */}
        {!isAuthenticated ? (
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button 
              variant="primary" 
              size="lg" 
              className="fw-bold px-4 py-3 rounded-pill shadow-sm d-flex align-items-center hover-lift transition-all"
              onClick={() => navigate('/login')}
            >
              Login to Portal <ArrowRight className="ms-2" size={20} />
            </Button>
            <Button 
              variant="outline-secondary" 
              size="lg" 
              className="fw-bold px-4 py-3 rounded-pill d-flex align-items-center transition-all"
              onClick={() => navigate('/register')}
            >
              <UserPlus className="me-2" size={20} /> Create Account
            </Button>
          </div>
        ) : (
          <div className="animation-fade-in">
            <Button 
              variant="success" 
              size="lg" 
              className="fw-bold px-5 py-3 rounded-pill shadow d-flex align-items-center mx-auto hover-lift transition-all"
              onClick={() => navigate('/dashboard')}
            >
              Open My Secure Workspace <ArrowRight className="ms-2" size={20} />
            </Button>
          </div>
        )}
        
      </div>
    </Container>
  );
};

export default LandingPage;