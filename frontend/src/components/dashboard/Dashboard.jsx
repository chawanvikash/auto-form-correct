import React, { useState, useContext } from 'react';
import { LogOut, User, UploadCloud, BookOpen, Menu, X, ShieldCheck, Users } from 'lucide-react';
import { Button, Modal } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import UploadForm from './UploadForm';
import MySubjects from './MySubjects';
import Profile from './Profile';
import DepartmentRegistrations from './DepartmentRegistrations';
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
    
    /* ── Animations & Modals ── */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    
    .dash-modal .modal-content { border-radius: 24px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .dash-modal-body { padding: 40px 32px 32px; text-align: center; }
    .modal-logout-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.05); }
    .dash-modal-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 12px; }
    .dash-modal-footer { border-top: 1px solid var(--border); padding: 20px 24px; display: flex; gap: 12px; background: #f8fafc; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .dash-btn-cancel, .dash-btn-confirm { flex: 1; border-radius: 12px !important; padding: 12px 24px !important; font-weight: 600 !important; }
    .dash-btn-cancel { background: var(--surface) !important; color: var(--text-main) !important; border: 2px solid var(--border) !important; }
    .dash-btn-confirm { background: #ef4444 !important; color: white !important; border: none !important; }

    /* ── MOBILE RESPONSIVENESS ── */
    .mobile-header { display: none; }
    .sidebar-overlay { display: none; }

    @media (max-width: 991px) {
      .dash-layout { flex-direction: column; }
      
      .mobile-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 24px; background: var(--surface); border-bottom: 1px solid var(--border); z-index: 1000;
      }

      .dash-sidebar {
        position: fixed; top: 0; left: -280px; height: 100vh; box-shadow: 15px 0 30px rgba(0,0,0,0.15);
      }
      .dash-sidebar.sidebar-open { transform: translateX(280px); }

      .sidebar-overlay {
        display: block; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(2px); z-index: 1040; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
      }
      .sidebar-overlay.sidebar-open { opacity: 1; pointer-events: auto; }
      .dash-main { flex: 1; height: calc(100vh - 73px); }
    }
  `}</style>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  // default tab dynamically. Admins start on 'registrations', Students start on 'upload'
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'registrations' : 'upload'); 
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      // Student Tabs
      case 'upload': return <UploadForm />;
      case 'subjects': return <MySubjects />;
      
      // Admin Tabs
      case 'registrations': return <DepartmentRegistrations />;
      
      // Shared Tabs
      case 'profile': return <Profile />;
      
      default: return isAdmin ? <DepartmentRegistrations /> : <UploadForm />;
    }
  };

  return (
    <>
      <PageStyles />
      <div className="dash-layout">
        
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <div className="d-flex align-items-center gap-2">
            <img src={logoImage} alt="Ink2Data Logo" style={{ width: '32px', borderRadius: '8px' }} />
            <h4 className="dash-brand mb-0" style={{ fontSize: '18px' }}>Ink2Data</h4>
          </div>
          <Button variant="light" className="border-0 p-2 bg-transparent text-dark" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </Button>
        </div>

        {/* SIDEBAR OVERLAY */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'sidebar-open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)} 
        />

        {/* SIDEBAR */}
        <div className={`dash-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="p-4 d-flex align-items-center justify-content-between border-bottom">
            <div className="d-flex align-items-center gap-3">
              {isAdmin ? (
                // Admin Logo Style
                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                  <ShieldCheck size={24} className="text-primary" />
                </div>
              ) : (
                // Student Logo Style
                <img src={logoImage} alt="Ink2Data Logo" style={{ width: '40px', borderRadius: '10px', mixBlendMode: 'multiply' }} />
              )}
              
              <div>
                <h2 className="dash-brand mb-0">Ink2Data</h2>
                <span className={`fw-bold ${isAdmin ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  {isAdmin ? 'ADMIN CONSOLE' : 'WORKSPACE'}
                </span>
              </div>
            </div>
            
            <Button variant="light" className="d-lg-none border-0 p-1 bg-transparent text-muted" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </Button>
          </div>

          <div className="flex-grow-1 p-3 d-flex flex-column gap-2 mt-3">
            
            {/* CONDITIONAL RENDER: STUDENT BUTTONS */}
            {!isAdmin && (
              <>
                <Button 
                  variant={activeTab === 'upload' ? 'primary' : 'light'} 
                  className="text-start fw-semibold py-3 px-4 d-flex align-items-center rounded-3 border-0 shadow-sm"
                  style={{ backgroundColor: activeTab !== 'upload' ? 'transparent' : '' }}
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
              </>
            )}

            {/* CONDITIONAL RENDER: ADMIN BUTTONS */}
            {isAdmin && (
              <Button 
                variant={activeTab === 'registrations' ? 'primary' : 'light'} 
                className="text-start fw-semibold py-3 px-4 d-flex align-items-center rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: activeTab !== 'registrations' ? 'transparent' : '' }}
                onClick={() => handleNavClick('registrations')}
              >
                <Users size={20} className="me-3" /> Registrations
              </Button>
            )}

            {/* SHARED BUTTON: PROFILE */}
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
          {/* CONDITIONAL RENDER: ADMIN BANNER */}
          {isAdmin && (
            <div className="bg-primary bg-opacity-10 border-bottom border-primary border-opacity-25 px-4 py-2 d-none d-lg-block">
              <span className="text-primary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                <ShieldCheck size={14} className="me-1 mb-1" /> ADMINISTRATOR ACCESS: {user?.department || 'Department'}
              </span>
            </div>
          )}
          
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