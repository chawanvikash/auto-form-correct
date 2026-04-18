import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { ArrowRight, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/logo.png'; 
import Typewriter from './Typewriter';

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          /* 1. The Breathing/Floating Animation */
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }

          .animate-float {
            animation: float 4s ease-in-out infinite;
          }

          /* 2. The Base Background Color */
          .bg-premium-light {
            background-color: #eef2f9;;
          }

          /* 3. The Glowing, Blurred Grid Layer */
          .grid-background-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none; 
            z-index: 0;
            
            /* Brighter, slightly more opaque vibrant blue */
            background-image: 
  linear-gradient(to right, rgba(14, 116, 255, 0.3) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(14, 116, 255, 0.3) 1px, transparent 1px);
            background-size: 80px 80px; 
            background-position: center center;
            
            /* THE MAGIC GLOW/BLUR EFFECT */
            filter: blur(1.5px);
            
            /* Softer Radial Mask to blend smoothly into the background */
            mask-image: radial-gradient(circle at center, black 15%, transparent 75%);
            -webkit-mask-image: radial-gradient(circle at center, black 15%, transparent 75%);
          }
        `}
      </style>

      <Container fluid className="vh-100 d-flex flex-column align-items-center justify-content-center bg-premium-light font-sans position-relative overflow-hidden">
        
        {/* Glowing Grid Layer */}
        <div className="grid-background-layer"></div>

        {/* Content Layer */}
        <div className="text-center px-3 position-relative z-1" style={{ maxWidth: '800px' }}>
          
          <div className="mx-auto mb-4 animate-float" style={{ maxWidth: '400px' }}>
            <img 
              src={logoImage} 
              alt="Ink2Data Official Logo" 
              className="img-fluid drop-shadow-sm" 
              style={{ borderRadius: '16px' }} 
            />
          </div>
          
          <p 
  className="lead text-secondary mb-5 px-md-5 fw-medium" 
  style={{ fontSize: '1.2rem', lineHeight: '1.6', minHeight: '3em' }}
>
  <Typewriter 
    text="The official IIEST Semester Registration AI Evaluator. Instantly cross-check your handwritten registration forms against the official curriculum." 
    typingSpeed={35}     // Faster = lower number (milliseconds per character)
    pauseDuration={4000} // How long it waits before restarting (4 seconds)
  />
</p>

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
    </>
  );
};

export default LandingPage;