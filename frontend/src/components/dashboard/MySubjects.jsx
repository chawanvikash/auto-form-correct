import React, { useState, useEffect, useContext } from 'react';
import { Table, Spinner, Container } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../helper';
import { BookOpen, AlertCircle } from 'lucide-react';

const MySubjects = () => {
  const { user, token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/my-subjects/${user.identifier}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(res.data.subjects);
      } catch (err) {
        setError("Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.identifier) fetchSubjects();
  }, [user, token]);

  if (loading) return <div className="p-3 p-lg-5 text-center"><Spinner animation="border" style={{ color: 'var(--brand-blue)' }} /></div>;
  if (error) return <div className="p-3 p-lg-5 text-danger"><AlertCircle className="me-2"/>{error}</div>;

  return (
    <Container className="p-3 p-lg-5 animate-fade-up">
      <h4 className="fw-bold mb-4 d-flex align-items-center text-dark fs-5 fs-md-4">
        <BookOpen className="me-3 flex-shrink-0" style={{ color: 'var(--brand-blue)' }} size={24} /> 
        Officially Registered Subjects
      </h4>
      
      {subjects.length === 0 ? (
        <div className="text-muted p-4 bg-white border rounded shadow-sm text-center">
          You have not registered for any subjects yet.
        </div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-hidden">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="text-nowrap">
                <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>CODE</th>
                <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>SUBJECT NAME</th>
                <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>TYPE</th>
                <th className="text-secondary py-3 px-4" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>CATEGORY</th>
                <th className="text-secondary py-3 px-4 text-center" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>CREDITS</th>
                <th className="text-secondary py-3 px-4 text-center" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>SEMESTER</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, i) => (
                <tr key={i}>
                  <td className="fw-bold px-4 py-3 text-nowrap">{sub.subject_code}</td>
                  {/* minWidth ensures the name doesn't squish into a tall tower of text on mobile */}
                  <td className="px-4 py-3" style={{ minWidth: '220px' }}>{sub.subject_name}</td>
                  <td className="px-4 py-3 text-nowrap">{sub.subject_type}</td>
                  <td className="px-4 py-3 text-nowrap">
                    <span className={`badge bg-${sub.subject_category?.toLowerCase() === 'core' ? 'primary' : 'info'}`}>
                      {sub.subject_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center fw-bold">{sub.credits}</td>
                  <td className="px-4 py-3 text-center fw-bold">{sub.semester}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default MySubjects;