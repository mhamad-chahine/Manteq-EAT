import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Table } from '../index'; 
import './UserPending.css';

const UserPending = () => {
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const currentData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleView = (report) => {
    setSelectedReport(report);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);
        return decodedToken.sub; 
      } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
      }
    }
    return null;
  };

  const fetchReports = async (userId) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/mat/api/1.0/private/reports/status/Defined/user/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch reports:', errorText);
        throw new Error(`Failed to fetch reports: ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched Reports Data:', data);

      if (Array.isArray(data) && data.length > 0) {
        setData(data);
      } else if (data.reports && Array.isArray(data.reports)) {
        setData(data.reports);
      } else {
        console.warn('No reports found in the data');
        setData([]);
      }
      
      setLoading(false);
      setUserStatus('Reports fetched successfully');
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
      setLoading(false);
      setUserStatus('Error fetching reports');
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      const userId = getUserIdFromToken();
      if (userId) {
        console.log('User ID:', userId);
        setUserId(userId);
        fetchReports(userId);
      } else {
        setError('Failed to decode user ID from token');
        setUserStatus('Failed to decode user ID from token');
      }
    };

    loadUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      <h1>Pending Cards</h1>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Week Of</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={index}>
              <td>{item.userId}</td>
              <td>{item.dateFrom}</td>
              <td>
                <button onClick={() => handleView(item)}>
                  <FontAwesomeIcon icon={faEye} />
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

      {selectedReport && (
        <div className="report-details">
          <h2>Report Details for Week {selectedReport.dateFrom}</h2>
          <Table
            tableData={selectedReport.activities.reduce((acc, activity) => {
              const existing = acc.find(row => row.project === activity.projectId && row.task === activity.taskName);

              if (existing) {
                existing.hours[new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long' })] = activity.duration;
              } else {
                acc.push({
                  project: activity.projectId,
                  task: activity.taskName,
                  hours: {
                    [new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long' })]: activity.duration
                  }
                });
              }
              return acc;
            }, [])}
            fixedDates={[selectedReport.dateFrom]} 
            handleHoursChange={() => {}}
            isEditable={false}
          />
          <button onClick={() => setSelectedReport(null)}>Close table</button>
        </div>
      )}
    </div>
  );
};

export default UserPending;
