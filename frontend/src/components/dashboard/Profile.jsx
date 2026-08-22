import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { User, Mail, Hash, BookOpen, Shield, Edit2, X, Save, Phone, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; 
import { BASE_URL } from '../../helper';

const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  
  // Helper to check role
  const isStudent = user?.role === 'student';
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [formData, setFormData] = useState({ semester: '' });

  // 1. FETCH LIVE DATA ON LOAD
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(res.data.profile);
        if (isStudent) {
          setFormData({ semester: res.data.profile.semester });
        }
      } catch (err) {
        setError("Failed to load profile details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token, isStudent]);

  // (Students Only)
  const handleSave = async () => {
    setIsSaving(true);
    setUpdateMessage(null);

    try {
      await axios.put(`${BASE_URL}/api/student/update-semester`, 
        { semester: formData.semester }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfileData(prev => ({ ...prev, semester: formData.semester }));
      if (updateUser) updateUser({ semester: formData.semester });
      
      setUpdateMessage({ type: 'success', text: 'Semester updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setUpdateMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update semester.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-5 text-center"><Spinner animation="border" style={{ color: 'var(--brand-blue)' }} /></div>;
  }

  if (error) {
    return <div className="p-5 text-danger text-center fw-bold">{error}</div>;
  }

  return (
    <Container className="p-3 p-lg-5 animate-fade-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold d-flex align-items-center text-dark mb-0">
          <User className="me-3" style={{ color: 'var(--brand-blue)' }} size={28} /> My Profile
        </h4>
        
        {/* ONLY show the Edit button if the user is a student */}
        {isStudent && (
          !isEditing ? (
            <Button variant="outline-primary" className="rounded-pill d-flex align-items-center" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} className="me-2" /> Edit Profile
            </Button>
          ) : (
            <Button variant="outline-danger" className="rounded-pill d-flex align-items-center" onClick={() => { setIsEditing(false); setFormData({ semester: profileData?.semester }); }}>
              <X size={16} className="me-2" /> Cancel
            </Button>
          )
        )}
      </div>

      {updateMessage && (
        <Alert variant={updateMessage.type} className="mb-4 rounded-3 shadow-sm border-0">
          {updateMessage.text}
        </Alert>
      )}

      <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #4f83e5 , #40cde6)' }}></div>
        
        <Card.Body className="px-4 pb-4 px-md-5 pb-md-5 position-relative">
          <div 
            className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow"
            style={{ width: '100px', height: '100px', marginTop: '-50px', marginBottom: '20px', border: '4px solid white' }}
          >
            <User size={50} style={{ color: 'var(--brand-blue)' }} />
          </div>

          <h3 className="fw-bold text-dark mb-1">{profileData?.full_name || "Name"}</h3>
          <p className="text-muted fw-semibold mb-4">{profileData?.department || "Department"}</p>

          <Row className="g-3 g-md-4 mt-2">
            
            <Col xs={12} md={6}>
              <div className="d-flex align-items-center p-3 bg-light rounded-3 border h-100">
                <Hash style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                <div className="w-100">
                  {/* Dynamic Label based on Role */}
                  <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {isStudent ? 'Enrolment No' : 'Employee ID'}
                  </div>
                  {/* Dynamic Data check */}
                  <div className="fw-semibold text-dark text-break">
                    {profileData?.enrolment_no || profileData?.employee_id || "N/A"}
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={12} md={6}>
              <div className="d-flex align-items-center p-3 bg-light rounded-3 border h-100">
                <Mail style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                <div className="w-100 overflow-hidden">
                  <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>G-Suite ID</div>
                  <div className="fw-semibold text-dark text-truncate">{profileData?.email || "N/A"}</div>
                </div>
              </div>
            </Col>

            {/* ONLY render Program if user is a student */}
            {isStudent && (
              <Col xs={12} md={6}>
                <div className="d-flex align-items-center p-3 bg-light rounded-3 border h-100">
                  <GraduationCap style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                  <div className="w-100">
                    <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Program</div>
                    <div className="fw-semibold text-dark">{profileData?.programme || "N/A"}</div>
                  </div>
                </div>
              </Col>
            )}

            {/* ONLY render Semester if user is a student */}
            {isStudent && (
              <Col xs={12} md={6}>
                <div className={`d-flex align-items-center p-3 bg-light rounded-3 border h-100 ${isEditing ? 'border-primary shadow-sm' : ''}`}>
                  <BookOpen style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                  <div className="w-100">
                    <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Semester</div>
                    
                    {isEditing ? (
                      <Form.Select 
                        size="sm" 
                        className="mt-1 fw-bold" 
                        value={formData.semester}
                        onChange={(e) => setFormData({ semester: e.target.value })}
                      >
                        {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num}</option>)}
                      </Form.Select>
                    ) : (
                      <div className="fw-semibold text-dark">{profileData?.semester || "N/A"}</div>
                    )}
                  </div>
                </div>
              </Col>
            )}

            <Col xs={12} md={6}>
              <div className="d-flex align-items-center p-3 bg-light rounded-3 border h-100">
                <Phone style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                <div className="w-100">
                  <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Phone Number</div>
                  <div className="fw-semibold text-dark">{profileData?.phone_no || "N/A"}</div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="d-flex align-items-center p-3 bg-light rounded-3 border h-100">
                <Shield style={{ color: 'var(--brand-blue)' }} className="me-3 flex-shrink-0" size={24} />
                <div className="w-100">
                  <div className="text-muted fw-bold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Account Role</div>
                  <div className="fw-semibold text-dark text-capitalize">{user?.role || "Student"}</div>
                </div>
              </div>
            </Col>
          </Row>

          {isEditing && isStudent && (
            <div className="mt-4 text-end animate-fade-up">
              <Button 
                variant="primary" 
                className="rounded-pill px-4 d-inline-flex align-items-center fw-bold shadow-sm"
                onClick={handleSave}
                disabled={isSaving || formData.semester === String(profileData?.semester)}
              >
                {isSaving ? <Spinner size="sm" className="me-2" /> : <Save size={18} className="me-2" />}
                Save Changes
              </Button>
            </div>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;