import React, { useContext, useRef, useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { UploadCloud, X, Sparkles, Loader2, AlertCircle, Database, BrainCircuit, Cloud, CheckCircle, ShieldCheck } from 'lucide-react';
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

  // New State: Check if already registered
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

// Check database on load
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/my-subjects/${user.identifier}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.subjects && res.data.subjects.length > 0) {
          // CRITICAL FIX: Only lock the form if they have subjects for their CURRENT semester
          const currentSemesterSubjects = res.data.subjects.filter(
            (sub) => parseInt(sub.semester) === parseInt(user.semester)
          );
          
          if (currentSemesterSubjects.length > 0) {
            setIsAlreadyRegistered(true);
          }
        }
      } catch (err) {
        console.error("Failed to check status:", err);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    // Ensure we have the user identifier AND their semester before checking
    if (user?.identifier && user?.semester) {
      checkRegistrationStatus();
    } else {
      setIsCheckingStatus(false);
    }
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
      setActiveStep(1);
      const formData = new FormData();
      formData.append('registration_form', selectedFile);

      const uploadRes = await axios.post(`${BASE_URL}/api/model/upload-image`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data.imageUrl;

      setActiveStep(2);
      const extractRes = await axios.post(`${BASE_URL}/api/model/extract-data`, { imageUrl }, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const extractedData = extractRes.data.extractedData;

      setActiveStep(3);
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
      <div className="dash-header animate-fade-up d-none d-lg-block">
        <h5>New Document Scan</h5>
      </div>

      <div className="dash-dropzone-wrapper p-3 p-lg-5">
        
        {/* State 1: Loading initial status */}
        {isCheckingStatus ? (
          <div className="text-center p-5">
            <Spinner animation="border" style={{ color: 'var(--brand-blue)' }} />
          </div>
        ) : 
        
        /* State 2: Already Registered (Locked) */
        isAlreadyRegistered ? (
          <div className="dash-dropzone animate-fade-up border-0 bg-white shadow-sm" style={{ cursor: 'default' }}>
            <ShieldCheck size={64} className="text-success mb-3" />
            <h3 className="fw-bold text-dark mb-2 fs-5 fs-md-4">Registration Complete</h3>
            <p className="text-muted mb-0" style={{ fontSize: '15px' }}>
              Your semester subjects are already securely recorded in the database. 
              <br className="d-none d-md-block" /> Navigate to the "My Subjects" tab to view them.
            </p>
          </div>
        ) : 
        
        /* State 3: Normal Upload Zone */
        (
          <div onClick={handleDropzoneClick} className={`dash-dropzone animate-fade-up delay-100 ${!previewUrl ? 'is-empty' : 'border-0'}`}>
            <input type="file" ref={fileInputRef} className="d-none" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
            
            {previewUrl ? (
              <div className="w-100 animate-fade-up">
                <div className={`image-preview-container mb-4 shadow-sm border ${isUploading ? 'is-scanning' : ''}`}>
                  <img src={previewUrl} alt="Form Preview" className="img-fluid" style={{ maxHeight: '50vh', objectFit: 'contain' }} />
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
                
                {isUploading && (
                  <div className="step-tracker animate-fade-up">
                    <div className={`step-item ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}>
                      <div className="step-icon">
                        {activeStep > 1 ? <CheckCircle size={16} strokeWidth={3} /> : <Cloud size={16} />}
                      </div>
                      Secure Cloud Storage
                    </div>
                    
                    <div className={`step-item ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}>
                      <div className="step-icon">
                        {activeStep > 2 ? <CheckCircle size={16} strokeWidth={3} /> : <BrainCircuit size={16} />}
                      </div>
                      AI Vision Extraction
                    </div>

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
              <div className="animate-fade-up px-2">
                <UploadCloud size={56} className="dash-dropzone-icon mb-3" />
                <h3 className="fw-bold text-dark mb-2 fs-5 fs-md-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload Registration Form</h3>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Click to browse • Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UploadForm;