import React, { useContext, useRef, useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { X, AlertCircle, Server, Cpu, Cloud, CheckCircle2, ShieldCheck, FileImage, ScanSearch, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../helper';

const UploadForm = () => {
  const { user, token } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // File & Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0); 
  const [error, setError] = useState(null);

  // Check if already registered
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/my-subjects/${user.identifier}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.subjects && res.data.subjects.length > 0) {
          const currentSemesterSubjects = res.data.subjects.filter(
            (sub) => parseInt(sub.semester) === parseInt(user.semester)
          );
          if (currentSemesterSubjects.length > 0) setIsAlreadyRegistered(true);
        }
      } catch (err) {
        console.error("Failed to check status:", err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    if (user?.identifier && user?.semester) checkRegistrationStatus();
    else setIsCheckingStatus(false);
  }, [user, token]);

  const handleDropzoneClick = () => {
    if (!previewUrl && !isAlreadyRegistered) fileInputRef.current.click();
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

  const handleScan = async (e) => {
    e.stopPropagation();
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    
    try {
      setActiveStep(1); // Uploading
      const formData = new FormData();
      formData.append('registration_form', selectedFile);

      const uploadRes = await axios.post(`${BASE_URL}/api/model/upload-image`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data.imageUrl;

      setActiveStep(2); // Extracting
      const extractRes = await axios.post(`${BASE_URL}/api/model/extract-data`, { imageUrl }, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const extractedData = extractRes.data.extractedData;

      setActiveStep(3); // Verifying
      try {
        const verifyRes = await axios.post(`${BASE_URL}/api/model/verify-data`, {
          enrolment_no: user.identifier,
          extractedData,
          imageUrl
        }, {
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        setTimeout(() => {
          navigate('/result', { state: { status: 'success', data: verifyRes.data, extractedData, imageUrl } });
        }, 1000);

      } catch (verifyErr) {
        setTimeout(() => {
          if (verifyErr.response && verifyErr.response.data && verifyErr.response.data.discrepancies) {
              navigate('/result', { state: { status: 'mismatch', data: verifyErr.response.data, extractedData, imageUrl } });
          } else {
              setError(verifyErr.response?.data?.error || "Database cross-check failed.");
              setIsUploading(false);
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during processing.");
      setIsUploading(false);
    }
  };

  // Calculate progress bar fill percentage
  const progressPercentage = activeStep === 0 ? 0 : activeStep === 1 ? 33 : activeStep === 2 ? 66 : 100;

  return (
    <>
      {/* ── Custom Component Styles for Advanced Animations ── */}
      <style>{`
        .upload-zone {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px dashed var(--border);
          background: #ffffff;
        }
        .upload-zone.is-empty:hover {
          border-color: var(--brand-blue);
          background: linear-gradient(145deg, #ffffff, #eff6ff);
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(37, 99, 235, 0.08);
        }
        .icon-bounce { transition: transform 0.3s ease; }
        .upload-zone.is-empty:hover .icon-bounce { transform: scale(1.1) translateY(-5px); color: var(--brand-blue); }
        
        .ai-scanner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(37,99,235,0) 0%, rgba(37,99,235,0.1) 50%, rgba(37,99,235,0) 100%);
          background-size: 100% 200%;
          animation: scanOverlay 2s linear infinite;
          pointer-events: none;
        }
        .ai-scanner-line {
          position: absolute; left: 0; right: 0; height: 3px;
          background: #3b82f6;
          box-shadow: 0 0 15px 4px rgba(59, 130, 246, 0.6);
          animation: scanLine 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes scanOverlay { 0% { background-position: 0 -100%; } 100% { background-position: 0 200%; } }
        @keyframes scanLine { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        
        .progress-track { background: #e2e8f0; border-radius: 12px; height: 8px; overflow: hidden; width: 100%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 12px; position: relative; overflow: hidden; }
        .progress-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 1.5s infinite; }
        
        .pulse-text { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

  
      <h4 className="fw-bold mb-4 d-flex align-items-center text-dark fs-7 fs-md-4  " style={{ color:'blue',marginTop:'20px',marginLeft:'20px'}}>
        <Fingerprint size={20} className="me-3 flex-shrink-0 text-primary" /> 
        Verification Terminal
      </h4>

      <div className="flex-grow-1 d-flex flex-column overflow-auto p-3 p-md-4 p-lg-5 w-100" style={{ alignItems: 'flex-start' }}>
        <div className="m-auto w-100" style={{ maxWidth: '680px' }}>
          
          {/* State 1: Checking DB */}
          {isCheckingStatus ? (
            <div className="text-center p-5 animate-fade-up">
              <Spinner animation="border" variant="primary" style={{ borderWidth: '3px', width: '3rem', height: '3rem' }} />
              <p className="mt-3 fw-semibold text-muted pulse-text">Connecting to secure database...</p>
            </div>
          ) : 
          
          /* State 2: Locked (Already Registered) */
          isAlreadyRegistered ? (
            <div className="upload-zone rounded-4 p-5 text-center animate-fade-up border-0 shadow-sm w-100" style={{ cursor: 'default' }}>
              <div className="mb-4 d-inline-flex p-4 rounded-circle bg-success bg-opacity-10">
                <ShieldCheck size={48} className="text-success" />
              </div>
              <h3 className="fw-bolder text-dark mb-2 fs-4">Registration Verified</h3>
              <p className="text-muted mb-0 mx-auto" style={{ fontSize: '15px', maxWidth: '400px', lineHeight: '1.6' }}>
                Your academic subjects for this semester are secured. Navigate to <strong>My Subjects</strong> to review your official record.
              </p>
            </div>
          ) : 
          
          /* State 3: Active Upload/Scan Zone */
          (
            <div 
              onClick={handleDropzoneClick} 
              className={`upload-zone rounded-4 p-4 p-md-5 animate-fade-up delay-100 w-100 ${!previewUrl ? 'is-empty' : 'border-0 bg-transparent p-0 p-md-0 shadow-none'}`}
            >
              <input type="file" ref={fileInputRef} className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              
              {previewUrl ? (
                <div className="w-100 animate-fade-up mx-auto bg-white p-3 p-md-4 rounded-4 shadow-sm border">
                  
                  {/* High-Tech Image Preview */}
                  <div className={`position-relative w-100 mb-4 rounded-3 border overflow-hidden bg-light ${isUploading ? 'shadow-sm' : ''}`} style={{ minHeight: '200px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Form Preview" 
                      className="img-fluid w-100 d-block" 
                      style={{ maxHeight: '40vh', objectFit: 'contain', filter: isUploading ? 'contrast(1.1) brightness(0.9)' : 'none', transition: 'all 0.5s ease' }} 
                    />
                    
                    {/* Realistic Scanner Animation */}
                    {isUploading && (
                      <>
                        <div className="ai-scanner-overlay"></div>
                        <div className="ai-scanner-line"></div>
                      </>
                    )}
                    
                    {!isUploading && (
                      <Button variant="dark" size="sm" className="position-absolute top-0 end-0 m-2 rounded-circle p-1 shadow-sm opacity-75 hover-opacity-100" onClick={clearImage}>
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center text-start mb-4 rounded-3 shadow-sm" style={{ fontSize: '14px', fontWeight: 500 }}>
                      <AlertCircle size={18} className="me-2 flex-shrink-0" /> {error}
                    </div>
                  )}

                  {/* Dynamic Progress UI */}
                  {isUploading ? (
                    <div className="mt-4 px-2">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <span className="fw-bold text-dark fs-6 d-flex align-items-center pulse-text">
                          {activeStep === 1 && <><Cloud size={18} className="me-2 text-primary" /> Uploading encrypted file...</>}
                          {activeStep === 2 && <><Cpu size={18} className="me-2 text-info" /> AI Vision Engine processing...</>}
                          {activeStep === 3 && <><Server size={18} className="me-2 text-success" /> Cross-referencing database...</>}
                        </span>
                        <span className="fw-bold text-muted" style={{ fontSize: '13px' }}>{progressPercentage}%</span>
                      </div>
                      <div className="progress-track mb-3">
                        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                      <div className="text-muted text-center" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                        DO NOT CLOSE THIS WINDOW
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="dash-btn-primary mx-auto w-100 shadow" 
                      style={{ height: '52px' }} 
                      onClick={handleScan}
                    >
                      <ScanSearch className="me-2" size={22} /> Initiate Smart Verification
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4 d-inline-flex p-4 rounded-circle bg-primary bg-opacity-10 icon-bounce">
                    <FileImage size={42} className="text-primary" />
                  </div>
                  <h3 className="fw-bolder text-dark mb-2 fs-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Secure Document Upload</h3>
                  <p className="text-muted mb-0 mx-auto" style={{ fontSize: '14.5px', maxWidth: '350px' }}>
                    Drag & drop or click to browse. Ensure your handwritten form is clearly visible and well-lit.
                  </p>
                  <div className="mt-4 d-inline-flex align-items-center bg-light px-3 py-1 rounded-pill text-muted fw-bold" style={{ fontSize: '12px' }}>
                    <ShieldCheck size={14} className="me-1 text-success" /> JPG, PNG up to 5MB
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadForm;