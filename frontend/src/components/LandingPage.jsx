import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { ArrowRight, UserPlus, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/logo.png'; 
import Typewriter from './Typewriter';


const PageStyles = () => (
  <style>{`
    /* Upgraded to industry-standard premium fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

    :root {
      --brand-navy:  #1b3f6e;
      --brand-blue:  #2563eb;
      --brand-light: #eff6ff;
      --brand-teal:  #0891b2;
      --brand-green: #16a34a;
      --surface:     #ffffff;
      --text-main:   #0f172a;
      --text-muted:  #475569;
    }

    .landing-page {
      min-height: 100vh;
      /* Upgraded: Soft radial spotlight background */
      background: radial-gradient(circle at top center, #ffffff 0%, #e2e8f0 100%);
      font-family: 'Inter', sans-serif;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* ── The Glowing, Blurred Grid Layer (Brighter) ── */
    .grid-background-layer {
      position: absolute;
      inset: 0;
      pointer-events: none; 
      z-index: 0;
      
      /* Upgraded: Brighter blue grid lines (opacity increased to 0.25) */
      background-image: 
        linear-gradient(to right, rgba(37, 99, 235, 0.25) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(37, 99, 235, 0.25) 1px, transparent 1px);
      background-size: 60px 60px; 
      background-position: center center;
      
      filter: blur(1px);
      /* Wider mask to show more of the bright grid */
      mask-image: radial-gradient(circle at center, black 20%, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black 20%, transparent 80%);
    }

    /* ── Typography ── */
    .landing-headline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      color: var(--text-main);
      font-size: clamp(2.5rem, 6vw, 4.5rem); 
      letter-spacing: -1.5px;
      line-height: 1.1;
      margin-bottom: 24px;
    }
    .landing-headline span {
      background: linear-gradient(135deg, var(--brand-blue), var(--brand-teal));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .landing-subtext {
      color: var(--text-muted);
      font-size: clamp(1.1rem, 2vw, 1.35rem);
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
      font-weight: 500;
      min-height: 80px; 
    }

    /* ── Buttons ── */
    .landing-btn-primary {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important;
      border-radius: 50px !important;
      padding: 16px 36px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25) !important;
      transition: all 0.2s ease !important;
    }
    .landing-btn-primary:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4) !important;
    }

    .landing-btn-outline {
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(10px);
      color: var(--text-main) !important;
      border: 2px solid rgba(203, 213, 225, 0.8) !important;
      border-radius: 50px !important;
      padding: 14px 36px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s ease !important;
    }
    .landing-btn-outline:hover {
      border-color: var(--brand-blue) !important;
      color: var(--brand-blue) !important;
      background: #ffffff !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05) !important;
    }

    .landing-btn-success {
      background: linear-gradient(135deg, var(--brand-green), #15803d) !important;
      border: none !important;
      border-radius: 50px !important;
      padding: 16px 40px !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(22, 163, 74, 0.25) !important;
      transition: all 0.2s ease !important;
    }
    .landing-btn-success:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4) !important;
    }

    /* ── Animations ── */
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
      100% { transform: translateY(0px); }
    }
    .animate-float {
      animation: float 5s ease-in-out infinite;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .delay-100 { animation-delay: 150ms; }
    .delay-200 { animation-delay: 300ms; }
    .delay-300 { animation-delay: 450ms; }

    /* ── Responsive Mobile Tweaks ── */
    @media (max-width: 576px) {
      .landing-btn-primary, .landing-btn-outline, .landing-btn-success {
        width: 100%;
      }
      .landing-subtext { min-height: 110px; }
    }
  `}</style>
);

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <PageStyles />
      <div className="landing-page">
        
        {/* Glowing Grid Background Layer */}
        <div className="grid-background-layer"></div>

        <Container className="position-relative z-1 text-center px-4" style={{ maxWidth: '900px' }}>
          
          {/* 1. Floating Logo (Larger & Transparent) */}
          <div className="animate-fade-up">
            <div className="mx-auto mb-4 animate-float" style={{ maxWidth: '320px' }}>
              <img 
                src={logoImage} 
                alt="Ink2Data Official Logo" 
                className="img-fluid" 
                style={{ 
                  /* Multiply removes the white background automatically */
                  mixBlendMode: 'multiply',
                  filter: 'contrast(1.1)' /* Keeps the logo sharp */
                }} 
              />
            </div>
          </div>

          {/* 2. Bold SaaS Headline */}
          <h1 className="landing-headline animate-fade-up delay-100">
            Welcome to <span>Ink2Data</span>
          </h1>
          
          {/* 3. Typewriter Subtext */}
          <div className="landing-subtext animate-fade-up delay-200 mb-5">
            <Typewriter 
              text="The official IIEST Semester Registration AI Evaluator. Instantly cross-check your handwritten registration forms against the official curriculum." 
              typingSpeed={35}     
              pauseDuration={4000} 
            />
          </div>

          {/* 4. Action Buttons */}
          <div className="animate-fade-up delay-300">
            {!isAuthenticated ? (
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 px-2">
                <Button 
                  className="landing-btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Login to Portal <ArrowRight size={18} />
                </Button>
                
                <Button 
                  className="landing-btn-outline"
                  onClick={() => navigate('/register')}
                >
                  <UserPlus size={18} /> Create Account
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-center px-2">
                <Button 
                  className="landing-btn-success"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard size={20} /> Open Secure Workspace 
                </Button>
              </div>
            )}
          </div>
          
        </Container>
      </div>
    </>
  );
};

export default LandingPage;