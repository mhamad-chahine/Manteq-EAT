import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import './RejectedCards.css';

const RejectedCards = () => {
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const fetchReports = async (userId) => {
    setLoading(true);
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`/mat/api/1.0/private/reports/status/Rejected/user/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data = await response.json();
      setData(Array.isArray(data) && data.length > 0 ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); 
        const userId = decodedToken.sub;
        setUserId(userId);
        fetchReports(userId);
      }
    };

    loadUserData();
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (report) => {
    navigate('/home', { state: { selectedOption: 'Time Card', rejectedDate: report.dateFrom } });
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      <h1>Rejected Cards</h1>
      
      <table>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((report, index) => (
            <tr key={index}>
              <td>{report.id}</td>
              <td>{report.dateFrom}</td>
              <td>
                <button onClick={() => handleEdit(report)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RejectedCards;
