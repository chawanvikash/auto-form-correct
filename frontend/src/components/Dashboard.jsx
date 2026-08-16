import React, { useContext, useRef, useState } from 'react';
import { Container, Button, Row, Col, Modal } from 'react-bootstrap';
import { UploadCloud, LogOut, User, X, Sparkles, Loader2, AlertCircle, Database, BrainCircuit, Cloud, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../helper';
import logoImage from '../assets/logo.png'; 

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

    .dash-layout { height: 100vh; display: flex; font-family: 'Inter', sans-serif; overflow: hidden; }

    /* ── Sidebar ── */
    .dash-sidebar { width: 320px; min-width: 320px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; transition: all 0.3s ease; }
    .dash-brand { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 20px; color: var(--text-main); letter-spacing: -0.5px; }
    .dash-user-card { background: var(--brand-light); border: 1px solid rgba(37, 99, 235, 0.15); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .dash-user-avatar { width: 48px; height: 48px; background: var(--brand-blue); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

    /* ── Main Canvas ── */
    .dash-main { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow-y: auto; }
    .dash-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 24px 32px; }
    .dash-header h5 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: var(--text-main); margin: 0; }
    .dash-dropzone-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
    
    .dash-dropzone { background: var(--surface); border: 2px dashed var(--border); border-radius: 24px; width: 100%; max-width: 700px; padding: 60px 40px; text-align: center; transition: all 0.2s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
    .dash-dropzone.is-empty { cursor: pointer; }
    .dash-dropzone.is-empty:hover { border-color: var(--brand-blue); background: var(--brand-light); }
    .dash-dropzone-icon { color: var(--brand-blue); margin-bottom: 20px; transition: transform 0.3s ease; }
    .dash-dropzone.is-empty:hover .dash-dropzone-icon { transform: translateY(-5px); }

    /* ── Buttons & Loaders ── */
    .dash-btn-primary {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 50px !important; padding: 14px 32px !important;
      font-size: 15px !important; font-weight: 700 !important; font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important; transition: all 0.2s ease !important;
      position: relative; overflow: hidden;
    }
    .dash-btn-primary:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35) !important; }
    
    /* Active Loading State Button Shimmer */
    .btn-loading-shimmer {
      background: linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%) !important;
      background-size: 200% 100% !important;
      animation: shimmerBackground 2s infinite linear !important;
      pointer-events: none;
    }
    @keyframes shimmerBackground { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Professional Revolving Circle */
    .pro-spinner { animation: proSpin 1.2s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite; }
    @keyframes proSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* ── AI Laser Scanning Effect ── */
    .image-preview-container { position: relative; display: inline-block; border-radius: 16px; overflow: hidden; }
    
    .ai-laser-scanner {
      position: absolute; top: 0; left: 0; width: 100%; height: 4px;
      background: rgba(59, 130, 246, 0.9);
      box-shadow: 0 0 20px 8px rgba(59, 130, 246, 0.4), 0 0 40px 10px rgba(59, 130, 246, 0.2);
      z-index: 10;
      /* Keep it completely removed from the DOM until needed */
      display: none; 
    }
    
    /* Only trigger the display and animation when 'is-scanning' is active */
    .is-scanning .ai-laser-scanner { 
      display: block;
      animation: scanSweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
    }
    
    .is-scanning img { filter: contrast(1.1) brightness(0.95); transition: filter 0.3s ease; }
    
    @keyframes scanSweep {
      0% { top: -10%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 110%; opacity: 0; }
    }

    /* ── Step Tracker Progress ── */
    .step-tracker { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; text-align: left; max-width: 300px; margin-left: auto; margin-right: auto; }
    .step-item { display: flex; align-items: center; gap: 12px; opacity: 0.4; transition: all 0.3s ease; font-size: 13px; font-weight: 600; color: var(--text-muted); }
    .step-item.active { opacity: 1; color: var(--brand-blue); transform: translateX(5px); }
    .step-item.completed { opacity: 1; color: #16a34a; }
    .step-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--border); transition: all 0.3s ease; }
    .step-item.active .step-icon { background: var(--brand-light); color: var(--brand-blue); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
    .step-item.completed .step-icon { background: #dcfce7; color: #16a34a; }

    /* ── Modals & Mobile ── */
    .dash-btn-logout { border: 2px solid var(--border) !important; background: transparent !important; color: #ef4444 !important; border-radius: 12px !important; font-weight: 600 !important; transition: all 0.2s ease !important; }
    .dash-btn-logout:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; }
    .dash-modal .modal-content { border-radius: 24px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .dash-modal-body { padding: 40px 32px 32px; text-align: center; }
    .modal-logout-icon { width: 64px; height: 64px; background: #fef2f2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.05); }
    .dash-modal-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 12px; }
    .dash-modal-footer { border-top: 1px solid var(--border); padding: 20px 24px; display: flex; gap: 12px; background: #f8fafc; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .dash-btn-cancel, .dash-btn-confirm { flex: 1; border-radius: 12px !important; padding: 12px 24px !important; font-weight: 600 !important; }
    .dash-btn-cancel { background: var(--surface) !important; color: var(--text-main) !important; border: 2px solid var(--border) !important; }
    .dash-btn-confirm { background: #ef4444 !important; color: white !important; border: none !important; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .delay-100 { animation-delay: 100ms; }

    @media (max-width: 991px) {
      .dash-layout { flex-direction: column; }
      .dash-sidebar { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; border-right: none; border-bottom: 1px solid var(--border); padding: 16px 24px; height: auto; }
      .dash-sidebar-body, .dash-sidebar-footer { display: none; }
      .dash-mobile-logout { display: flex !important; }
      .dash-header { padding: 16px 24px; }
      .dash-dropzone-wrapper { padding: 24px; }
      .dash-dropzone { padding: 40px 20px; }
    }
  `}</style>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const url = BASE_URL;
  
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0=None, 1=Upload, 2=Extract, 3=Verify
  const [error, setError] = useState(null);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleDropzoneClick = () => {
    if (!previewUrl) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setError(null); 
      setActiveStep(0);
    } else {
      alert("Please select a valid image file (PNG, JPG, JPEG).");
    }
  };

  const clearImage = (e) => {
    e.stopPropagation(); 
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setActiveStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // The 3-Step Pipeline
  const handleScan = async (e) => {
    e.stopPropagation();
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    
    try {
      // Step 1: Upload to Cloudinary
      setActiveStep(1);
      const formData = new FormData();
      formData.append('registration_form', selectedFile);

      const uploadRes = await axios.post(`${url}/api/model/upload-image`, formData, {
        headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = uploadRes.data.imageUrl;

      // Step 2: OCR Extraction via Gemini AI
      setActiveStep(2);
      const extractRes = await axios.post(`${url}/api/model/extract-data`, { imageUrl }, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const extractedData = extractRes.data.extractedData;

      // Step 3: Cross-check with Database
      setActiveStep(3);
      try {
        const verifyRes = await axios.post(`${url}/api/model/verify-data`, {
            enrolment_no: user.identifier,
            extractedData,
            imageUrl
        }, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });

        // Add a tiny artificial delay on the final step so the user sees the 3rd checkmark
        setTimeout(() => {
          navigate('/result', { state: { status: 'success', data: verifyRes.data, extractedData, imageUrl } });
        }, 800);

      } catch (verifyErr) {
        setTimeout(() => {
          if (verifyErr.response && verifyErr.response.data && verifyErr.response.data.discrepancies) {
              navigate('/result', { state: { status: 'mismatch', data: verifyErr.response.data, extractedData, imageUrl } });
          } else {
              setError(verifyErr.response?.data?.error || "Database cross-check failed.");
              setIsUploading(false);
          }
        }, 800);
      }

    } catch (err) {
      console.error("Pipeline error:", err);
      setError(err.response?.data?.error || "An error occurred during processing.");
      setIsUploading(false);
    }
  };

  return (
    <>
      <PageStyles />
      <div className="dash-layout">
        
        {/* SIDEBAR */}
        <div className="dash-sidebar">
          <div className="p-4 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="d-flex align-items-center gap-3">
              <img src={logoImage} alt="Ink2Data Logo" style={{ width: '40px', borderRadius: '10px', mixBlendMode: 'multiply' }} />
              <div>
                <h2 className="dash-brand mb-0">Ink2Data</h2>
                <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>WORKSPACE</span>
              </div>
            </div>
            <Button variant="light" className="dash-mobile-logout d-none text-danger border-0 p-2" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={20} />
            </Button>
          </div>

          <div className="dash-sidebar-body flex-grow-1 p-4 overflow-auto">
            <div className="dash-user-card animate-fade-up">
              <div className="d-flex align-items-center mb-3">
                <div className="dash-user-avatar me-3"><User size={24} /></div>
                <div>
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>{user?.name || "User"}</h5>
                  <span className="text-primary fw-semibold" style={{ fontSize: '13px' }}>{user?.identifier || "No ID"}</span>
                </div>
              </div>
              
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(37, 99, 235, 0.15)' }}>
                <div className="mb-2">
                  <div className="text-muted fw-bold mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</div>
                  <div className="fw-semibold text-dark" style={{ fontSize: '13px' }}>{user?.department || "N/A"}</div>
                </div>
                {user?.role === 'student' ? (
                  <div>
                    <div className="text-muted fw-bold mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semester</div>
                    <div className="fw-semibold text-dark" style={{ fontSize: '13px' }}>{user?.semester || "N/A"}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-muted fw-bold mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</div>
                    <div className="fw-semibold text-dark text-capitalize" style={{ fontSize: '13px' }}>{user?.role || "Faculty"}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dash-sidebar-footer p-4 border-top">
            <Button className="dash-btn-logout w-100 py-2 d-flex justify-content-center align-items-center" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={18} className="me-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* MAIN CANVAS */}
        <div className="dash-main">
          <div className="dash-header animate-fade-up">
            <h5>New Document Scan</h5>
          </div>

          <div className="dash-dropzone-wrapper">
            <div onClick={handleDropzoneClick} className={`dash-dropzone animate-fade-up delay-100 ${!previewUrl ? 'is-empty' : 'border-0'}`}>
              <input type="file" ref={fileInputRef} className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              
              {previewUrl ? (
                <div className="w-100 animate-fade-up">
                  
                  {/* Holographic Laser Scanning Image Container */}
                  <div className={`image-preview-container mb-4 shadow-sm border ${isUploading ? 'is-scanning' : ''}`}>
                    <img src={previewUrl} alt="Form Preview" className="img-fluid" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                    <div className="ai-laser-scanner"></div>
                    {!isUploading && (
                      <Button variant="danger" size="sm" className="position-absolute top-0 start-100 translate-middle rounded-circle p-1 shadow" onClick={clearImage}>
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center text-start mb-4 rounded-3 small">
                      <AlertCircle size={18} className="me-2 flex-shrink-0" /> {error}
                    </div>
                  )}

                  {/* Upgraded Professional Button */}
                  <Button 
                    className={`dash-btn-primary mx-auto w-100 ${isUploading ? 'btn-loading-shimmer' : ''}`} 
                    style={{ maxWidth: '300px' }} 
                    onClick={handleScan} 
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="me-2 pro-spinner" size={20} /> 
                        {activeStep === 1 ? "Uploading..." : activeStep === 2 ? "Extracting Data..." : "Verifying..."}
                      </>
                    ) : (
                      <><Sparkles className="me-2" size={20} /> Verify Form Data</>
                    )}
                  </Button>
                  
                  {/* Step-by-Step Progress Indicators */}
                  {isUploading && (
                    <div className="step-tracker animate-fade-up">
                      {/* Step 1: Upload */}
                      <div className={`step-item ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}>
                        <div className="step-icon">
                          {activeStep > 1 ? <CheckCircle size={16} strokeWidth={3} /> : <Cloud size={16} />}
                        </div>
                        Secure Cloud Storage
                      </div>
                      
                      {/* Step 2: Extract */}
                      <div className={`step-item ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}>
                        <div className="step-icon">
                          {activeStep > 2 ? <CheckCircle size={16} strokeWidth={3} /> : <BrainCircuit size={16} />}
                        </div>
                        AI Vision Extraction
                      </div>

                      {/* Step 3: Verify */}
                      <div className={`step-item ${activeStep === 3 ? 'active' : ''}`}>
                        <div className="step-icon">
                          <Database size={16} />
                        </div>
                        Database Cross-Check
                      </div>
                    </div>
                  )}
                </div>

              ) : (
                <div className="animate-fade-up">
                  <UploadCloud size={64} className="dash-dropzone-icon" />
                  <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload Registration Form</h3>
                  <p className="text-muted mb-0">Click to browse • Supports JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered backdrop="static" className="dash-modal">
        <Modal.Body className="p-0">
          <div className="dash-modal-body">
            <div className="modal-logout-icon"><LogOut size={32} strokeWidth={2.5} /></div>
            <h4 className="dash-modal-title">Sign Out?</h4>
            <p className="dash-modal-text">Are you sure you want to sign out of your workspace?</p>
          </div>
          <div className="dash-modal-footer">
            <Button className="dash-btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
            <Button className="dash-btn-confirm" onClick={logout}>Yes, Sign Out</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;