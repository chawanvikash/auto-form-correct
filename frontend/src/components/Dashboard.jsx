import React, { useContext, useRef, useState } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { UploadCloud, LogOut, User, X, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import logoImage from '../assets/logo.png'; 

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDropzoneClick = () => {
    if (!previewUrl) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    } else {
      alert("Please select a valid image file (PNG, JPG, JPEG).");
    }
  };

  const clearImage = (e) => {
    e.stopPropagation(); 
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = () => {
    console.log("Sending to AI Model:", selectedFile);
    
  };

  return (
    <Container fluid className="vh-100 p-0 d-flex overflow-hidden font-sans bg-light">
      
      {/* ========================================== */}
      {/* LEFT SIDEBAR (Static Info) */}
      {/* ========================================== */}
      <div className="d-flex flex-column bg-white shadow-sm h-100 z-3" style={{ width: '320px', minWidth: '320px' }}>
        
        {/* 2. REBRANDED HEADER WITH LOGO */}
        <div className="p-4 border-bottom d-flex align-items-center gap-3">
          <img 
            src={logoImage} 
            alt="Ink2Data Logo" 
            style={{ width: '45px', borderRadius: '8px' }} 
            className="shadow-sm"
          />
          <div>
            <h2 className="fw-bolder text-primary mb-0 fs-5">Ink2Data</h2>
            <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>WORKSPACE</span>
          </div>
        </div>

        <div className="flex-grow-1 p-4 overflow-auto">
          <div className="bg-primary bg-opacity-10 p-4 rounded-4 border border-primary border-opacity-25 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary text-white rounded-circle p-2 me-3">
                <User size={24} />
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{user?.name}</h5>
                <small className="text-primary fw-semibold">{user?.enrolment_no}</small>
              </div>
            </div>
            <div className="border-top border-primary border-opacity-25 pt-3 mt-2">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small fw-semibold">Department:</span>
                <span className="text-dark small fw-bold">{user?.department}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary small fw-semibold">Semester:</span>
                <span className="text-dark small fw-bold">{user?.semester}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-top">
          <Button variant="light" className="w-100 py-2 fw-bold d-flex justify-content-center text-danger border hover-lift transition-all" onClick={logout}>
            <LogOut size={18} className="me-2" /> Sign Out
          </Button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN CANVAS (The Application Area) */}
      {/* ========================================== */}
      <div className="flex-grow-1 d-flex flex-column h-100">
        <div className="p-4 border-bottom bg-white">
          <h5 className="mb-0 text-dark fw-bold">New Document Scan</h5>
        </div>

        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-5 overflow-auto">
          <Card 
            onClick={handleDropzoneClick}
            className={`border-0 shadow-sm w-100 ${!previewUrl ? 'cursor-pointer' : ''}`} 
            style={{ 
              maxWidth: '700px',
              border: !previewUrl ? '3px dashed #0d6efd' : '3px dashed transparent', 
              borderRadius: '24px', 
              backgroundColor: '#ffffff',
              transition: 'all 0.3s ease'
            }}
          >
            <Card.Body className="p-5 text-center min-vh-50 d-flex flex-column justify-content-center align-items-center">
              
              <input type="file" ref={fileInputRef} className="d-none" accept="image/jpeg, image/png" onChange={handleFileChange} />
              
              {/* STATE 1: Image Uploaded */}
              {previewUrl ? (
                <div className="w-100">
                  <div className="position-relative d-inline-block mb-4">
                    <img src={previewUrl} alt="Form Preview" className="img-fluid rounded shadow-sm border" style={{ maxHeight: '400px' }} />
                    <Button variant="danger" size="sm" className="position-absolute top-0 start-100 translate-middle rounded-circle p-1 shadow hover-lift" onClick={clearImage}>
                      <X size={16} />
                    </Button>
                  </div>
                  <Button variant="primary" size="lg" className="fw-bold px-5 py-3 rounded-pill shadow d-flex align-items-center mx-auto hover-lift transition-all" onClick={handleScan}>
                    <Sparkles className="me-2" size={20} /> Extract Data with AI
                  </Button>
                </div>
              ) : (
                /* STATE 2: Empty Dropzone */
                <>
                  <UploadCloud size={64} className="text-primary mb-3" />
                  <h3 className="fw-bold text-dark mb-2">Click to Upload Form</h3>
                  <p className="text-muted mb-0">Supports JPG, PNG (Max 5MB)</p>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;