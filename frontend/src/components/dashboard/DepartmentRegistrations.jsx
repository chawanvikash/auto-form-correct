import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Form, InputGroup, Spinner, Badge, Modal, Button } from 'react-bootstrap';
import { Search, Users, ClipboardCheck, AlertCircle, Filter, Eye, Download, FileImage, BookOpen, User } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../helper';

const DepartmentRegistrations = () => {
  const { token, user } = useContext(AuthContext);
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Modal & Detailed View State
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/department-registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRegistrations(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load department data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDepartmentData();
  }, [token]);

  // Handle Row Click to Fetch Details
  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setDetailsLoading(true);
    
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/student-details/${student.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(student => {
    const matchesSearch = student.enrolment_no.toLowerCase().includes(searchTerm.toLowerCase()) || student.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = semesterFilter === '' || String(student.semester) === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  if (loading) return <div className="p-5 text-center mt-5"><Spinner animation="border" style={{ color: 'var(--brand-blue)' }} /></div>;

  return (
    <>
      <style>{`
        .admin-table-row { cursor: pointer; transition: all 0.2s ease; }
        .admin-table-row:hover { background-color: #f8fafc !important; transform: scale(1.001); box-shadow: 0 4px 12px rgba(0,0,0,0.03); z-index: 10; position: relative; }
        .custom-modal .modal-content { border-radius: 20px; border: none; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      `}</style>

      <Container className="p-3 p-lg-5 animate-fade-up">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold d-flex align-items-center text-dark mb-1">
              <Users className="me-3" style={{ color: 'var(--brand-blue)' }} size={28} /> Department Registrations
            </h4>
            <p className="text-muted mb-0 ms-md-5" style={{ fontSize: '14px' }}>Overview of all verified subject registrations.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-pill shadow-sm border text-center">
            <span className="text-muted fw-bold me-2" style={{ fontSize: '12px' }}>TOTAL VERIFIED:</span>
            <span className="fw-bold text-success fs-5">{registrations.length}</span>
          </div>
        </div>

        {error && <div className="alert alert-danger d-flex align-items-center rounded-3 shadow-sm"><AlertCircle size={20} className="me-2" /> {error}</div>}

        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Card.Header className="bg-white border-bottom p-3 p-md-4">
            <Row className="g-3">
              <Col xs={12} md={8}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Control className="bg-light border-start-0 ps-0 shadow-none fw-medium" placeholder="Search Enrolment No. or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </InputGroup>
              </Col>
              <Col xs={12} md={4}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0"><Filter size={18} className="text-muted" /></InputGroup.Text>
                  <Form.Select className="bg-light border-start-0 shadow-none fw-bold text-muted" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center p-5">
                <ClipboardCheck size={48} className="text-muted mb-3 opacity-50" />
                <h5 className="fw-bold text-dark">No Registrations Found</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr className="text-nowrap">
                      <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>ENROLMENT NO</th>
                      <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>STUDENT NAME</th>
                      <th className="text-secondary py-3 px-4 text-center" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>SEMESTER</th>
                      <th className="text-secondary py-3 px-4 text-center" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>SUBJECTS</th>
                      <th className="text-secondary py-3 px-4 text-end" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((student, i) => (
                      <tr key={i} className="admin-table-row" onClick={() => handleViewDetails(student)}>
                        <td className="fw-bold px-4 py-3 text-primary">{student.enrolment_no}</td>
                        <td className="px-4 py-3 fw-semibold text-dark">{student.full_name}</td>
                        <td className="px-4 py-3 text-center"><Badge bg="info" className="text-dark rounded-pill px-3 py-2">Sem {student.semester}</Badge></td>
                        <td className="px-4 py-3 text-center fw-bold text-success">{student.subject_count} Verified</td>
                        <td className="px-4 py-3 text-end text-muted"><Eye size={18} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Detailed View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered className="custom-modal">
        <Modal.Header closeButton className="border-bottom bg-light p-4">
          <Modal.Title className="fw-bold text-dark d-flex align-items-center">
            <User size={24} className="me-2 text-primary" /> 
            {selectedStudent?.full_name} 
            <Badge bg="secondary" className="ms-3 fs-6 rounded-pill">{selectedStudent?.enrolment_no}</Badge>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-0">
          {detailsLoading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Row className="g-0">
              
              {/* Left Column: Subjects List */}
              <Col lg={5} className="p-4 border-end bg-white">
                <h6 className="fw-bold text-muted mb-3 d-flex align-items-center text-uppercase" style={{ fontSize: '13px' }}>
                  <BookOpen size={16} className="me-2" /> Verified Subjects ({studentDetails?.subjects?.length})
                </h6>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {studentDetails?.subjects?.map((sub, idx) => (
                    <div key={idx} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark fs-6">{sub.subject_code}</div>
                        <div className="text-muted small fw-medium">{sub.subject_name}</div>
                      </div>
                      <Badge bg="success" className="rounded-pill p-2">{sub.credits} CR</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-3 d-flex justify-content-between align-items-center border border-primary border-opacity-25">
                  <span className="fw-bold text-primary">Total Credits</span>
                  <span className="fw-bolder text-primary fs-5">{selectedStudent?.total_credits}</span>
                </div>
              </Col>

              {/* Right Column: Scanned Document */}
              <Col lg={7} className="p-4 bg-light d-flex flex-column align-items-center">
                <div className="w-100 mb-3 text-start">
                  <h6 className="fw-bold text-muted d-flex align-items-center text-uppercase" style={{ fontSize: '13px' }}>
                    <FileImage size={16} className="me-2" /> Scanned Original Document
                  </h6>
                </div>
                
                {studentDetails?.imageUrl ? (
                  <div className="d-flex flex-column align-items-center w-100">
                    <div className="border rounded-3 overflow-hidden shadow-sm bg-white mb-4 w-100 d-flex justify-content-center p-2" style={{ minHeight: '300px' }}>
                      <img src={studentDetails.imageUrl} alt="Scanned Form" className="img-fluid" style={{ maxHeight: '450px', objectFit: 'contain' }} />
                    </div>
                    
                    <a href={studentDetails.imageUrl} target="_blank" rel="noopener noreferrer" download className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center shadow-sm">
                      <Download size={18} className="me-2" /> Download Document
                    </a>
                  </div>
                ) : (
                  <div className="text-center w-100 p-5 border rounded-3 bg-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center">
                    <FileImage size={48} className="text-muted opacity-50 mb-3" />
                    <h6 className="fw-bold text-dark">No Image Found</h6>
                    <p className="text-muted small">The original document was not saved in the database.</p>
                  </div>
                )}
              </Col>

            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DepartmentRegistrations;