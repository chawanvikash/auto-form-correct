import React, { useState, useContext } from 'react';
import { LogOut, User, UploadCloud, BookOpen, Menu, X } from 'lucide-react';
import { Button, Modal } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import UploadForm from './UploadForm';
import MySubjects from './MySubjects';
import Profile from './Profile';
import logoImage from '../../assets/logo.png'; 

const PageStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
    
    :root {
      --brand-navy:  #1b3f6e;
      --brand-blue:  #2563eb;
      --brand-light: #eff6ff;
      --brand-teal:  #0891b2;
      --surface:     #ffffff;
      --bg:          #f8fafc;
      --border:      #e2e8f0;
      --text-main:   #0f172a;
      --text-muted:  #475569;
    }
    
    body { background-color: var(--bg); }
    .dash-layout { height: 100vh; display: flex; font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
    
    /* ── Desktop Sidebar Styles ── */
    .dash-sidebar { width: 280px; min-width: 280px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 1050; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .dash-brand { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 20px; color: var(--text-main); letter-spacing: -0.5px; }
    
    /* ── Main Canvas & Header ── */
    .dash-main { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow-y: auto; position: relative; }
    .dash-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 24px 32px; }
    .dash-header h5 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: var(--text-main); margin: 0; }
    
    /* ── Dropzone Styles (For UploadForm) ── */
    .dash-dropzone-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
    .dash-dropzone { background: var(--surface); border: 2px dashed var(--border); border-radius: 24px; width: 100%; max-width: 700px; padding: 60px 40px; text-align: center; transition: all 0.2s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
    .dash-dropzone.is-empty { cursor: pointer; }
    .dash-dropzone.is-empty:hover { border-color: var(--brand-blue); background: var(--brand-light); }
    .dash-dropzone-icon { color: var(--brand-blue); margin-bottom: 20px; transition: transform 0.3s ease; }
    .dash-dropzone.is-empty:hover .dash-dropzone-icon { transform: translateY(-5px); }

    /* ── Custom Buttons & Loaders ── */
    .dash-btn-primary { background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important; border: none !important; border-radius: 50px !important; padding: 14px 32px !important; font-size: 15px !important; font-weight: 700 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important; transition: all 0.2s ease !important; position: relative; overflow: hidden; }
    .dash-btn-primary:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35) !important; }
    .btn-loading-shimmer { background: linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%) !important; background-size: 200% 100% !important; animation: shimmerBackground 2s infinite linear !important; pointer-events: none; }
    @keyframes shimmerBackground { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .pro-spinner { animation: proSpin 1.2s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite; }
    @keyframes proSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* ── Laser Scanner & Step Tracker ── */
    .image-preview-container { position: relative; display: inline-block; border-radius: 16px; overflow: hidden; }
    .ai-laser-scanner { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: rgba(59, 130, 246, 0.9); box-shadow: 0 0 20px 8px rgba(59, 130, 246, 0.4), 0 0 40px 10px rgba(59, 130, 246, 0.2); z-index: 10; display: none; }
    .is-scanning .ai-laser-scanner { display: block; animation: scanSweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .is-scanning img { filter: contrast(1.1) brightness(0.95); transition: filter 0.3s ease; }
    @keyframes scanSweep { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
    .step-tracker { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; text-align: left; max-width: 300px; margin-left: auto; margin-right: auto; }
    .step-item { display: flex; align-items: center; gap: 12px; opacity: 0.4; transition: all 0.3s ease; font-size: 13px; font-weight: 600; color: var(--text-muted); }
    .step-item.active { opacity: 1; color: var(--brand-blue); transform: translateX(5px); }
    .step-item.completed { opacity: 1; color: #16a34a; }
    .step-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--border); transition: all 0.3s ease; }
    .step-item.active .step-icon { background: var(--brand-light); color: var(--brand-blue); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
    .step-item.completed .step-icon { background: #dcfce7; color: #16a34a; }

    /* ── Animations & Modals ── */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .delay-100 { animation-delay: 100ms; }
    .dash-modal .modal-content { border-radius: 24px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .dash-modal-body { padding: 40px 32px 32px; text-align: center; }
    .modal-logout-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.05); }
    .dash-modal-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 12px; }
    .dash-modal-footer { border-top: 1px solid var(--border); padding: 20px 24px; display: flex; gap: 12px; background: #f8fafc; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .dash-btn-cancel, .dash-btn-confirm { flex: 1; border-radius: 12px !important; padding: 12px 24px !important; font-weight: 600 !important; }
    .dash-btn-cancel { background: var(--surface) !important; color: var(--text-main) !important; border: 2px solid var(--border) !important; }
    .dash-btn-confirm { background: #ef4444 !important; color: white !important; border: none !important; }

    /* ── MOBILE RESPONSIVENESS (The Magic) ── */
    .mobile-header { display: none; }
    .sidebar-overlay { display: none; }

    @media (max-width: 991px) {
      .dash-layout { flex-direction: column; }
      
      /* New Mobile Top Bar */
      .mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        z-index: 1000;
      }

      /* Hide Sidebar Off-Screen */
      .dash-sidebar {
        position: fixed;
        top: 0;
        left: -280px; 
        height: 100vh;
        box-shadow: 15px 0 30px rgba(0,0,0,0.15);
      }
      
      /* Slide Sidebar In */
      .dash-sidebar.sidebar-open {
        transform: translateX(280px);
      }

      /* Dark Backdrop */
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(2px);
        z-index: 1040;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .sidebar-overlay.sidebar-open {
        opacity: 1;
        pointer-events: auto;
      }

      /* Adjust Main Layout */
      .dash-main { flex: 1; height: calc(100vh - 73px); }
      .dash-dropzone-wrapper { padding: 24px; }
      .dash-dropzone { padding: 40px 20px; }
    }
  `}</style>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('upload'); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <-- New State for Mobile Menu

  // Helper to change tabs and auto-close the mobile menu
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload': return <UploadForm />;
      case 'subjects': return <MySubjects />;
      case 'profile': return <Profile />;
      default: return <UploadForm />;
    }
  };

  return (
    <>
      <PageStyles />
      <div className="dash-layout">
        
        {/* MOBILE HEADER (Only visible on small screens) */}
        <div className="mobile-header">
          <div className="d-flex align-items-center gap-2">
            <img src={logoImage} alt="Ink2Data Logo" style={{ width: '32px', borderRadius: '8px' }} />
            <h4 className="dash-brand mb-0" style={{ fontSize: '18px' }}>Ink2Data</h4>
          </div>
          <Button variant="light" className="border-0 p-2 bg-transparent text-dark" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </Button>
        </div>

        {/* SIDEBAR OVERLAY (Dark backdrop for mobile) */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'sidebar-open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)} 
        />

        {/* SIDEBAR */}
        <div className={`dash-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="p-4 d-flex align-items-center justify-content-between border-bottom">
            <div className="d-flex align-items-center gap-3">
              <img src={logoImage} alt="Ink2Data Logo" style={{ width: '40px', borderRadius: '10px', mixBlendMode: 'multiply' }} />
              <div>
                <h2 className="dash-brand mb-0">Ink2Data</h2>
                <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>WORKSPACE</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <Button variant="light" className="d-lg-none border-0 p-1 bg-transparent text-muted" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </Button>
          </div>

          <div className="flex-grow-1 p-3 d-flex flex-column gap-2 mt-3">
            <Button 
              variant={activeTab === 'upload' ? 'primary' : 'light'} 
              className="text-start fw-semibold py-3 px-4 d-flex align-items-center rounded-3 shadow-sm border-0"
              onClick={() => handleNavClick('upload')}
            >
              <UploadCloud size={20} className="me-3" /> Scan Form
            </Button>
            
            <Button 
              variant={activeTab === 'subjects' ? 'primary' : 'light'} 
              className="text-start fw-semibold py-3 px-4 d-flex align-items-center rounded-3 border-0"
              style={{ backgroundColor: activeTab !== 'subjects' ? 'transparent' : '' }}
              onClick={() => handleNavClick('subjects')}
            >
              <BookOpen size={20} className="me-3" /> My Subjects
            </Button>

            <Button 
              variant={activeTab === 'profile' ? 'primary' : 'light'} 
              className="text-start fw-semibold py-3 px-4 d-flex align-items-center rounded-3 border-0"
              style={{ backgroundColor: activeTab !== 'profile' ? 'transparent' : '' }}
              onClick={() => handleNavClick('profile')}
            >
              <User size={20} className="me-3" /> Profile
            </Button>
          </div>

          <div className="p-4 border-top">
            <Button className="w-100 py-2 d-flex justify-content-center align-items-center border-0 bg-danger text-white rounded-3 shadow-sm" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={18} className="me-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* DYNAMIC MAIN CANVAS */}
        <div className="dash-main">
          {renderContent()}
        </div>

        {/* Logout Modal */}
        <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered backdrop="static" className="dash-modal">
          <Modal.Body className="p-0">
            <div className="dash-modal-body">
              <div className="modal-logout-icon"><LogOut size={32} strokeWidth={2.5} /></div>
              <h4 className="dash-modal-title">Sign Out?</h4>
              <p className="text-muted">Are you sure you want to sign out of your workspace?</p>
            </div>
            <div className="dash-modal-footer">
              <Button className="dash-btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
              <Button className="dash-btn-confirm" onClick={logout}>Yes, Sign Out</Button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Dashboard;