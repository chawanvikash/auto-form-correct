import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Table } from 'react-bootstrap';
import { ArrowLeft, CheckCircle, XCircle, FileText, Database, AlertTriangle, Send } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../helper';

const ResultStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
    
    .result-page { min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; padding: 40px 0; }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .result-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; color: #0f172a; margin: 0; }
    
    .frame-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; height: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
    .frame-title { font-size: 14px; text-transform: uppercase; font-weight: 700; color: #475569; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; }
    
    .compare-row { display: flex; align-items: flex-start; margin-bottom: 16px; padding: 12px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .compare-row.match { background: #f0fdf4; border-color: #bbf7d0; }
    .compare-row.mismatch { background: #fef2f2; border-color: #fecaca; }
    
    .field-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .field-value { font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .status-icon { flex-shrink: 0; margin-right: 16px; margin-top: 4px; }
    
    .image-preview { width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; object-fit: contain; max-height: 800px; background: #f1f5f9; }
    
    .subject-table-wrapper { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 10px; }
    .subject-table { margin-bottom: 0; font-size: 13px; }
    .subject-table th { background: #f8fafc; font-weight: 700; text-transform: uppercase; font-size: 11px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 12px; }
    .subject-table td { padding: 12px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; font-weight: 500; }
    .subject-match { background-color: #f0fdf4; }
    .subject-mismatch { background-color: #fef2f2; }
  `}</style>
);

const VerificationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user,token } = useContext(AuthContext);

  const { status, data, imageUrl } = location.state || {};
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  if (!location.state) {
    return (
      <Container className="text-center mt-5 pt-5">
        <h4>No data found.</h4>
        <Button onClick={() => navigate('/Dashboard')}>Return to Dashboard</Button>
      </Container>
    );
  }

  // Parse the unified payload from the backend
  const payload = status === 'success' ? data : data.discrepancies;
  const dbData = payload.database_data;
  const scannedData = payload.scanned_data;
  const dbSubjects = payload.database_subjects || [];
  const scannedSubjects = scannedData.subjects || [];

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await axios.post(`${BASE_URL}/api/model/register-subjects`, {
        enrolment_no: user.identifier,
        subjects: scannedSubjects,
        imageUrl
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      
      setRegisterSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      alert("Failed to register subjects. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const cleanStr = (str) => (str || "").toString().toLowerCase().trim();

  const renderComparison = (label, scannedVal, dbVal, isMatch) => (
    <div className={`compare-row ${isMatch ? 'match' : 'mismatch'}`}>
      <div className="status-icon">
        {isMatch ? <CheckCircle color="#16a34a" size={20} /> : <XCircle color="#ef4444" size={20} />}
      </div>
      <div className="w-100">
        <div className="field-label">{label}</div>
        <Row>
          <Col xs={6}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>SCANNED FORM</div>
            <div className="field-value">{scannedVal || 'Not Found'}</div>
          </Col>
          <Col xs={6} style={{ borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>OFFICIAL DATABASE</div>
            <div className="field-value">{dbVal}</div>
          </Col>
        </Row>
      </div>
    </div>
  );

  return (
    <>
      <ResultStyles />
      <div className="result-page">
        <Container fluid style={{ maxWidth: '1400px' }}>
          
          <div className="result-header">
            <div>
              <Button variant="link" className="text-decoration-none p-0 mb-2 text-muted fw-bold d-flex align-items-center" onClick={() => navigate('/Dashboard')}>
                <ArrowLeft size={16} className="me-1" /> Back to Workspace
              </Button>
              <h2 className="result-title">
                {status === 'success' ? 'Verification Approved' : 'Verification Rejected'}
              </h2>
            </div>
            
            {status === 'success' ? (
              <div className="bg-success text-white px-4 py-2 rounded-pill fw-bold d-flex align-items-center">
                <CheckCircle size={20} className="me-2" /> 100% Match
              </div>
            ) : (
              <div className="bg-danger text-white px-4 py-2 rounded-pill fw-bold d-flex align-items-center">
                <AlertTriangle size={20} className="me-2" /> Discrepancies Found
              </div>
            )}
          </div>

          <Row className="g-4">
            {/* LEFT FRAME: Uploaded Document */}
            <Col lg={5}>
              <div className="frame-card">
                <h5 className="frame-title"><FileText className="me-2 text-primary" size={20} /> Submitted Document</h5>
                <img src={imageUrl} alt="Form" className="image-preview" />
              </div>
            </Col>

            {/* RIGHT FRAME: Verification Logic */}
            <Col lg={7}>
              <div className="frame-card" style={{ maxHeight: '850px', overflowY: 'auto' }}>
                <h5 className="frame-title"><Database className="me-2 text-primary" size={20} /> Primary Fields Verification</h5>
                
                <Row>
                  <Col md={6}>
                    {renderComparison(
                      "Student Name", 
                      scannedData?.name, 
                      dbData?.full_name, 
                      cleanStr(scannedData?.name).includes(cleanStr(dbData?.full_name)) || cleanStr(dbData?.full_name).includes(cleanStr(scannedData?.name))
                    )}
                    {renderComparison(
                      "Department", 
                      scannedData?.department, 
                      dbData?.department, 
                      cleanStr(scannedData?.department) === cleanStr(dbData?.department)
                    )}
                    {renderComparison(
                      "Programme", 
                      scannedData?.programme, 
                      dbData?.programme, 
                      cleanStr(scannedData?.programme) === cleanStr(dbData?.programme)
                    )}
                    {renderComparison(
                      "Semester", 
                      scannedData?.semester, 
                      dbData?.semester, 
                      parseInt(scannedData?.semester) === parseInt(dbData?.semester)
                    )}
                  </Col>
                  <Col md={6}>
                    {renderComparison(
                      "Enrolment Number", 
                      scannedData?.enrolment_no, 
                      dbData?.enrolment_no, 
                      cleanStr(scannedData?.enrolment_no).length === 10 && cleanStr(scannedData?.enrolment_no) === cleanStr(dbData?.enrolment_no)
                    )}
                    {renderComparison(
                      "Official G-Suite", 
                      scannedData?.g_suite_id, 
                      dbData?.email, 
                      cleanStr(scannedData?.g_suite_id) === cleanStr(dbData?.email)
                    )}
                    {renderComparison(
                      "Mobile Number", 
                      scannedData?.mobile_no, 
                      dbData?.phone_no, 
                      cleanStr(scannedData?.mobile_no).slice(-10) === cleanStr(dbData?.phone_no).slice(-10)
                    )}
                  </Col>
                </Row>

                <div className="mt-4 pt-3 border-top">
                  <h5 className="frame-title"><Database className="me-2 text-primary" size={20} /> Subjects Verification</h5>
                  
                  <div className="subject-table-wrapper">
                    <Table responsive className="subject-table">
                      <thead>
                        <tr>
                          <th className="text-center">Status</th>
                          <th>Sl</th>
                          <th>Subject Code</th>
                          <th>Subject Name</th>
                          <th>Category</th>
                          <th>Cr.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedSubjects.map((scannedSub, index) => {
                          const dbSub = dbSubjects.find(s => cleanStr(s.subject_code) === cleanStr(scannedSub.subject_code));
                          
                          // Check if all columns match
                          const isCodeMatch = !!dbSub;
                          const isCatMatch = dbSub && cleanStr(scannedSub.subject_category) === cleanStr(dbSub.subject_category);
                          const isCredMatch = dbSub && parseInt(scannedSub.credit) === parseInt(dbSub.credits);
                          
                          const isPerfectMatch = isCodeMatch && isCatMatch && isCredMatch;

                          return (
                            <tr key={index} className={isPerfectMatch ? 'subject-match' : 'subject-mismatch'}>
                              <td className="text-center">
                                {isPerfectMatch ? <CheckCircle color="#16a34a" size={16} /> : <AlertTriangle color="#ef4444" size={16} />}
                              </td>
                              <td>{index + 1}</td>
                              <td className={!isCodeMatch ? 'text-danger fw-bold' : ''}>{scannedSub.subject_code || 'N/A'}</td>
                              <td>
                                <div className="text-truncate" style={{maxWidth: '180px'}} title={scannedSub.subject_name}>
                                  {scannedSub.subject_name || 'N/A'}
                                </div>
                              </td>
                              <td className={!isCatMatch ? 'text-danger fw-bold' : ''}>{scannedSub.subject_category || 'N/A'}</td>
                              <td className={!isCredMatch ? 'text-danger fw-bold' : ''}>{scannedSub.credit || '0'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Show missing core subjects or DB validation errors if any */}
                  {payload.subjectErrors && payload.subjectErrors.length > 0 && (
                    <div className="mt-3 p-3 bg-white border border-danger rounded-3">
                      <div className="fw-bold text-danger mb-2" style={{fontSize: '12px', textTransform: 'uppercase'}}>Critical Database Errors</div>
                      {payload.subjectErrors.map((err, i) => (
                        <div key={i} className="text-danger fw-medium" style={{fontSize: '13px'}}><AlertTriangle size={14} className="me-1"/> {err}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Final Registration Action (Locked if there is a mismatch) */}
                <div className="mt-5 pt-4 border-top text-end">
                  {registerSuccess ? (
                    <div className="text-success fw-bold d-flex align-items-center justify-content-end">
                      <CheckCircle className="me-2" /> Registration Official! Returning to Dashboard...
                    </div>
                  ) : (
                    <div>
                      {/* Warning message if disabled */}
                      {status !== 'success' && (
                        <div className="text-danger mb-2 fw-semibold" style={{ fontSize: '13px' }}>
                          <AlertTriangle size={14} className="me-1 mb-1" /> 
                          Registration locked. 100% data match is required to proceed.
                        </div>
                      )}
                      
                      <Button 
                        variant={status === 'success' ? "primary" : "secondary"} 
                        size="lg" 
                        className="rounded-pill px-5 fw-bold shadow-sm d-inline-flex align-items-center" 
                        onClick={handleRegister} 
                        // The button is strictly disabled if registering OR if there is a mismatch
                        disabled={isRegistering || status !== 'success'}
                        style={{ cursor: status !== 'success' ? 'not-allowed' : 'pointer' }}
                      >
                        {isRegistering ? (
                          <><Spinner size="sm" className="me-2"/> Saving to Database...</>
                        ) : (
                          <><Send size={18} className="me-2"/> Confirm & Register Subjects</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default VerificationResult;