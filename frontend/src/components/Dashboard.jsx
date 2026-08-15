import React, { useContext, useRef, useState } from 'react';
import { Container, Button, Card, Row, Col, Modal } from 'react-bootstrap';
import { UploadCloud, LogOut, User, X, Sparkles, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';
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
      --brand-green: #16a34a;
      --surface:     #ffffff;
      --bg:          #f8fafc;
      --border:      #e2e8f0;
      --text-main:   #0f172a;
      --text-muted:  #475569;
      --text-light:  #94a3b8;
    }

    body { background-color: var(--bg); }

    .dash-layout {
      height: 100vh;
      display: flex;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* ── Sidebar (Desktop) / Topbar (Mobile) ── */
    .dash-sidebar {
      width: 320px;
      min-width: 320px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 10;
      transition: all 0.3s ease;
    }

    .dash-brand {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 20px;
      color: var(--text-main);
      letter-spacing: -0.5px;
    }

    .dash-user-card {
      background: var(--brand-light);
      border: 1px solid rgba(37, 99, 235, 0.15);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .dash-user-avatar {
      width: 48px; height: 48px;
      background: var(--brand-blue);
      color: white;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    /* ── Main Canvas ── */
    .dash-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      overflow-y: auto;
    }

    .dash-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 24px 32px;
    }
    .dash-header h5 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    /* ── Dropzone ── */
    .dash-dropzone-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .dash-dropzone {
      background: var(--surface);
      border: 2px dashed var(--border);
      border-radius: 24px;
      width: 100%;
      max-width: 700px;
      padding: 60px 40px;
      text-align: center;
      transition: all 0.2s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    .dash-dropzone.is-empty {
      cursor: pointer;
    }
    .dash-dropzone.is-empty:hover {
      border-color: var(--brand-blue);
      background: var(--brand-light);
    }

    .dash-dropzone-icon {
      color: var(--brand-blue);
      margin-bottom: 20px;
      transition: transform 0.3s ease;
    }
    .dash-dropzone.is-empty:hover .dash-dropzone-icon {
      transform: translateY(-5px);
    }

    /* ── Buttons ── */
    .dash-btn-primary {
      background: linear-gradient(135deg, var(--brand-blue), #1d4ed8) !important;
      border: none !important; border-radius: 50px !important;
      padding: 14px 32px !important;
      font-size: 15px !important; font-weight: 700 !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2) !important;
      transition: all 0.2s ease !important;
    }
    .dash-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35) !important;
    }

    .dash-btn-logout {
      border: 2px solid var(--border) !important;
      background: transparent !important;
      color: #ef4444 !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
    }
    .dash-btn-logout:hover {
      background: #fef2f2 !important;
      border-color: #fca5a5 !important;
    }

    /* ── Result Box ── */
    .dash-result-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      text-align: left;
      margin-bottom: 24px;
    }
    .dash-result-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .dash-result-value {
      font-weight: 600;
      color: var(--text-main);
      font-size: 15px;
      margin-bottom: 16px;
    }

    /* ── Logout Modal Styles ── */
    .dash-modal .modal-content {
      border-radius: 24px;
      border: none;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      font-family: 'Inter', sans-serif;
    }
    .dash-modal-body {
      padding: 40px 32px 32px;
      text-align: center;
    }
    .modal-logout-icon {
      width: 64px; height: 64px;
      background: #fef2f2;
      color: #ef4444;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.05);
    }
    .dash-modal-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      color: var(--text-main);
      font-size: 22px;
      margin-bottom: 12px;
    }
    .dash-modal-text {
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 0;
    }
    .dash-modal-footer {
      border-top: 1px solid var(--border);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      background: #f8fafc;
      border-bottom-left-radius: 24px;
      border-bottom-right-radius: 24px;
    }
    .dash-btn-cancel {
      background: var(--surface) !important;
      color: var(--text-main) !important;
      border: 2px solid var(--border) !important;
      border-radius: 12px !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      flex: 1;
      transition: all 0.2s ease !important;
    }
    .dash-btn-cancel:hover { background: var(--bg) !important; }
    .dash-btn-confirm {
      background: #ef4444 !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      flex: 1;
      transition: all 0.2s ease !important;
    }
    .dash-btn-confirm:hover { background: #dc2626 !important; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important; }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .delay-100 { animation-delay: 100ms; }

    /* ── Responsive Mobile ── */
    @media (max-width: 991px) {
      .dash-layout { flex-direction: column; }
      .dash-sidebar { 
        width: 100%; min-width: 100%; 
        flex-direction: row; align-items: center; justify-content: space-between;
        border-right: none; border-bottom: 1px solid var(--border);
        padding: 16px 24px; height: auto;
      }
      .dash-sidebar-body { display: none; }
      .dash-sidebar-footer { display: none; }
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const url = BASE_URL;
  
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleDropzoneClick = () => {
    if (!previewUrl && !result) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setResult(null); 
      setError(null); 
    } else {
      alert("Please select a valid image file (PNG, JPG, JPEG).");
    }
  };

  const clearImage = (e) => {
    e.stopPropagation(); 
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async (e) => {
    e.stopPropagation();
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('document', selectedFile);

    try {     
      const response = await axios.post(
          url + '/api/model/upload-and-verify', 
          formData,
          {
              headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'multipart/form-data'
              }
          }
      );
      
      const data = response.data; 
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Verification failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error); 
      } else {
          setError("Failed to connect to the server.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <PageStyles />
      <div className="dash-layout">
        
        {/* ========================================== */}
        {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
        {/* ========================================== */}
        <div className="dash-sidebar">
          
          <div className="p-4 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="d-flex align-items-center gap-3">
              <img 
                src={logoImage} 
                alt="Ink2Data Logo" 
                style={{ width: '40px', borderRadius: '10px', mixBlendMode: 'multiply' }} 
              />
              <div>
                <h2 className="dash-brand mb-0">Ink2Data</h2>
                <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>WORKSPACE</span>
              </div>
            </div>
            {/* Mobile Only Logout - Opens Modal */}
            <Button variant="light" className="dash-mobile-logout d-none text-danger border-0 p-2" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={20} />
            </Button>
          </div>

          <div className="dash-sidebar-body flex-grow-1 p-4 overflow-auto">
            <div className="dash-user-card animate-fade-up">
              <div className="d-flex align-items-center mb-3">
                <div className="dash-user-avatar me-3">
                  <User size={24} />
                </div>
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
                
                {/* Conditionally render Semester for Students only */}
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
            {/* Desktop Logout - Opens Modal */}
            <Button className="dash-btn-logout w-100 py-2 d-flex justify-content-center align-items-center" onClick={() => setShowLogoutModal(true)}>
              <LogOut size={18} className="me-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* ========================================== */}
        {/* MAIN CANVAS */}
        {/* ========================================== */}
        <div className="dash-main">
          <div className="dash-header animate-fade-up">
            <h5>New Document Scan</h5>
          </div>

          <div className="dash-dropzone-wrapper">
            <div 
              onClick={handleDropzoneClick}
              className={`dash-dropzone animate-fade-up delay-100 ${(!previewUrl && !result) ? 'is-empty' : 'border-0'}`}
            >
              <input type="file" ref={fileInputRef} className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              
              {/* STATE 3: Success Result */}
              {result ? (
                <div className="w-100 animate-fade-up">
                  <CheckCircle size={64} className="text-success mb-3 mx-auto" />
                  <h3 className="fw-bold text-success mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Extraction Complete</h3>
                  <p className="text-muted mb-4">The AI model has successfully processed your form.</p>

                  <div className="dash-result-box shadow-sm">
                    <h6 className="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center">
                      <FileText className="me-2 text-primary" size={20} />
                      AI Extracted Data
                    </h6>
                    
                    <Row>
                      <Col sm={6}>
                        <div className="dash-result-label">Student Name</div>
                        <div className="dash-result-value">{result.extractedData?.full_name || 'N/A'}</div>
                      </Col>
                      <Col sm={6}>
                        <div className="dash-result-label">Registration No.</div>
                        <div className="dash-result-value">{result.extractedData?.enrolment_no || 'N/A'}</div>
                      </Col>
                    </Row>
                    
                    <div className="dash-result-label mt-2">Verified Subjects</div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {result.extractedData?.subjects?.map(sub => (
                        <span key={sub} className="badge bg-primary px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: '13px' }}>
                          {sub}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <div className="dash-result-label">Cloudinary Image Backup</div>
                      <a href={result.imageUrl || result.document_url} target="_blank" rel="noopener noreferrer" className="text-truncate d-block text-primary" style={{ fontSize: '13px', fontWeight: 500 }}>
                        {result.imageUrl || result.document_url || 'Link generated'}
                      </a>
                    </div>
                  </div>

                  <Button variant="outline-secondary" className="rounded-pill px-4 py-2 fw-bold" onClick={clearImage}>
                    Scan Another Document
                  </Button>
                </div>

              ) : previewUrl ? (
                /* STATE 2: Image Preview */
                <div className="w-100 animate-fade-up">
                  <div className="position-relative d-inline-block mb-4">
                    <img src={previewUrl} alt="Form Preview" className="img-fluid rounded-4 shadow-sm border" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                    <Button variant="danger" size="sm" className="position-absolute top-0 start-100 translate-middle rounded-circle p-1 shadow" onClick={clearImage} disabled={isUploading}>
                      <X size={16} />
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center text-start mb-4 rounded-3 small">
                      <AlertCircle size={18} className="me-2 flex-shrink-0" /> 
                      {error}
                    </div>
                  )}

                  <Button 
                    className="dash-btn-primary mx-auto w-100" 
                    style={{ maxWidth: '300px' }}
                    onClick={handleScan}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <><Loader2 className="me-2 animate-spin" size={20} /> Processing via AI...</>
                    ) : (
                      <><Sparkles className="me-2" size={20} /> Verify Form Data</>
                    )}
                  </Button>
                </div>

              ) : (
                /* STATE 1: Empty Dropzone */
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

      {/* ========================================== */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ========================================== */}
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)} 
        centered 
        backdrop="static"
        className="dash-modal"
      >
        <Modal.Body className="p-0">
          <div className="dash-modal-body">
            <div className="modal-logout-icon">
              <LogOut size={32} strokeWidth={2.5} />
            </div>
            <h4 className="dash-modal-title">Sign Out?</h4>
            <p className="dash-modal-text">
              Are you sure you want to sign out of your workspace? You will need to securely authenticate to log back in.
            </p>
          </div>
          <div className="dash-modal-footer">
            <Button className="dash-btn-cancel" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button className="dash-btn-confirm" onClick={logout}>
              Yes, Sign Out
            </Button>
          </div>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default Dashboard;