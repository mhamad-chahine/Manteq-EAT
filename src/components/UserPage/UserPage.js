import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';
import './UserPage.css';
import { Table } from '../index'

const UserPage = () => {
const [selectedDate, setSelectedDate] = useState('');
const [fixedDates, setFixedDates] = useState([]);
const [selectedProject, setSelectedProject] = useState('');
const [availableTasks, setAvailableTasks] = useState([]);
const [selectedTask, setSelectedTask] = useState('');
const [tableData, setTableData] = useState([]);
const [projects, setProjects] = useState([]);
const [error, setError] = useState('');
const [comment, setComment] = useState('');
const [userEmail, setUserEmail] = useState('');
const [responseDate, setResponseDate] = useState('');
const [reportId, setReportId] = useState('');
const [savedData, setSavedData] = useState(null);
const [reportExistsMessage, setReportExistsMessage] = useState('');
const [isSubmitted, setIsSubmitted] = useState(false);
const [locked, setLocked] = useState(false);
const [selectedProjectId, setSelectedProjectId] = useState('');
const [author, setAuthor] = useState('');
const [txt, setTxt] = useState('');
const location = useLocation();




  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const email = decodeToken(token);
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedDate && userEmail) {
      const weekStart = getWeekStartDate(new Date(selectedDate));
      checkForExistingReport(formatDate(weekStart), userEmail);
    }
  }, [selectedDate, userEmail]);


  useEffect(() => {
    if (location.state && location.state.rejectedDate) {
      const rejectedDate = location.state.rejectedDate;
      console.log('Date passed from rejected page:', rejectedDate); 
  
    
      const date = new Date(rejectedDate);
      setSelectedDate(formatDate(date));
    }
  }, [location.state]);
  


  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const formatDate = (date) => {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const getWeekStartDate = (date) => {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; 
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    return startOfWeek;
  };

  const getWeekDates = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + 6);

    const dates = [];
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(formatDate(new Date(d)));
    }

    return {
      dateFrom: dates[0],
      dateTo: dates[6],
      dates
    };
  };

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    const weekStart = getWeekStartDate(date);
    const weekDates = getWeekDates(weekStart);
    setSelectedDate(formatDate(date));
    setFixedDates(weekDates.dates);
    setSelectedProject('');
    setAvailableTasks([]);
    setSelectedTask('');
    checkForExistingReport(weekDates.dateFrom, userEmail);
  };
  

  const handleProjectChange = async (event) => {
    const project = event.target.value;
    setSelectedProject(project);
    setSelectedTask('');
    setAvailableTasks([]);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const response = await fetch(`/mat/api/1.0/private/projects/${encodeURIComponent(project)}/tasks`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(setAvailableTasks);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const data = await response.json();
      setAvailableTasks(data);
    } catch (error) {
      setError('Failed to fetch tasks for the selected project. ' + error.message);
    }
  };

  const handleTaskChange = (event) => {
    const task = event.target.value;
    setSelectedTask(task);
  };

  const handleAddClick = () => {
    if (selectedDate && selectedProject && selectedTask) {
      const taskId = availableTasks.find(task => task.name === selectedTask)?.id;
  
      const newRow = {
        project: selectedProject,
        task: selectedTask,
        taskId: taskId,
        hours: {
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Sunday: 0
        }
      };
  
      setTableData([...tableData, newRow]);
      setSelectedProject('');
      setAvailableTasks([]);
      setSelectedTask('');
    } else {
      alert('Please select a date, project, and task');
    }
  };
  
  

  const handleRemoveLastClick = () => {
    const newTableData = tableData.slice(0, -1);
    setTableData(newTableData);
  };

  const handleHoursChange = (index, day, value) => {
    const newTableData = [...tableData];
    newTableData[index] = {
      ...newTableData[index],
      hours: {
        ...newTableData[index].hours,
        [day]: parseFloat(value) || 0
      }
    };
    setTableData(newTableData);
  };



  const handleSave = async () => {
    if (tableData.length === 0) {
        alert('The table is empty. Please add data before submitting.');
        return;
    }

    if (!userEmail) {
        alert('User email is not set. Please try reloading the page.');
        return;
    }

    const weekDates = getWeekDates(getWeekStartDate(new Date(selectedDate)));
    const activities = tableData.flatMap(row => {
        const { project, task, taskId, hours } = row;
        
        return Object.entries(hours).map(([day, duration]) => ({
            projectId: project || '',
            taskName: task || '',
            taskId, 
            date: weekDates.dates.find(date => day.toLowerCase() === new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()),
            duration: duration > 0 ? duration : 0
        })).filter(activity => activity.date && activity.duration > 0);
    });

    const comments = [{
        txt: comment,
        date: new Date().toISOString(),
        author: userEmail
    }];

    const requestBody = {
        userId: userEmail,
        dateFrom: weekDates.dateFrom,
        dateTo: weekDates.dateTo,
        msg: comment,
        activities,
        comments
    };

    console.log('Requested body:', requestBody);

    const token = localStorage.getItem('token');

    try {
        const apiUrl = reportId ? `/mat/api/1.0/private/reports/${reportId}` : '/mat/api/1.0/private/reports';
        const method = reportId ? 'PUT' : 'POST';

        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${errorText}`);
        }

        const result = await response.json();
        if (!reportId) {
            setReportId(result.id);
        }

        alert('Data submitted successfully!');
    } catch (error) {
        console.error('Error submitting report:', error);
        setError(`An error occurred while submitting the data: ${error.message}`);
    }
};


  const getTaskId = (taskName) => {
    const task = availableTasks.find(t => t.taskName === taskName);
    return task ? task.taskId : 0;
  };
  
  

  const handleSubmit = async () => {
    if (!reportId) {
      alert('No report ID found. Please save your data first.');
      return;
    }

    if (!comment.trim()) {
      alert('Comment is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    try {
      const url = `/mat/api/1.0/private/reports/${reportId}/submit?comment=${encodeURIComponent(comment.trim())}&rid=${reportId}`;
      console.log('Submitting report with URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLocked(true); 
        alert('Report submitted successfully!');
      } else {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError(`An error occurred while submitting the report: ${error.message}`);
    }
  };
  
  

 const handleReset = () => {
  setSelectedDate('');
    setFixedDates([]);
    setSelectedProject('');
    setAvailableTasks([]);
    setSelectedTask('');
    setTableData([]);
    setComment('');
    setSavedData(null); 
    setError(''); 
    setReportExistsMessage('');
};

const checkForExistingReport = async (weekOf, userId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    setError('No authentication token found.');
    return;
  }

  try {
    const response = await fetch(`/mat/api/1.0/private/reports/user/${encodeURIComponent(userId)}?weekOf=${encodeURIComponent(weekOf)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Network response was not ok: ${errorText}`);
      setError(`Failed to fetch report: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('Fetched data:', data); 

    setSavedData(data);
    setReportId(data.id || '');
    setResponseDate(data.dateFrom || '');

    
    if (data.status === 'Submitted') {
      setIsSubmitted(true);
      setLocked(true);
      setReportExistsMessage('The report is submitted and cannot be edited.');
    } else if (data.status === 'Rejected') {
      setIsSubmitted(false);
      setLocked(false);
      if (data.comments && data.comments.length > 0) {
        const latestComment = data.comments[0];
        console.log('Latest Comment:', latestComment);
        setAuthor(latestComment.author || 'Unknown');
        setTxt(latestComment.txt || 'No comment provided');
        setReportExistsMessage(`The report is rejected.`);
      } else {
        setAuthor('Unknown');
        setTxt('No comment provided');
        setReportExistsMessage('The report is rejected, but no comments are available.');
      }
    } else {
      setIsSubmitted(false);
      setLocked(false);
      setReportExistsMessage('A report already exists for the selected week.');
    }

 
    const newTableData = {};
    data.activities.forEach(activity => {
      if (!newTableData[activity.taskId]) {
        newTableData[activity.taskId] = {
          project: activity.projectId,
          task: activity.taskName,
          taskId: activity.taskId,
          hours: {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
          }
        };
      }
      const activityDate = new Date(activity.date);
      const dayOfWeek = activityDate.toLocaleString('en-US', { weekday: 'long' });
      if (newTableData[activity.taskId] && newTableData[activity.taskId].hours[dayOfWeek] !== undefined) {
        newTableData[activity.taskId].hours[dayOfWeek] = activity.duration;
      }
    });
    setTableData(Object.values(newTableData));
  } catch (error) {
    console.error('Error checking for existing report:', error);
    setError(`Failed to check for existing report: ${error.message}`);
  }
};
  
  
  
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        return;
      }

      try {
        const response = await fetch('/mat/api/1.0/private/projects', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(`Network response was not ok: ${errorText}`);
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        setError('Failed to fetch projects. ' + error.message);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="user-page">
      <h1>User Page</h1>
      <div className="date-picker">
        <label className='select'>
          Select Date:
          <input className='select'  value={selectedDate} type="date" onChange={handleDateChange}  />
        </label>
      </div>

      {reportExistsMessage && (
        <div className="alert-message">
          {reportExistsMessage}
        </div>
      )}

      <div className="project-task-form">
        <label>
          Project:
          <select className='select' value={selectedProject} onChange={handleProjectChange} disabled={isSubmitted}>
            <option value="">Select Project</option>
            {projects.map((project, index) => (
              <option key={index} value={project.name}>{project.name}</option>
            ))}
          </select>
        </label>
        <label>
          Task:
          <select className='select' value={selectedTask} onChange={handleTaskChange} disabled={isSubmitted}>
            <option value="">Select Task</option>
            {availableTasks.map((task, index) => (
              <option key={index} value={task.name}>{task.name}</option>
            ))}
          </select>
        </label>
        <div className='button-container'>
          <button onClick={handleAddClick} disabled={isSubmitted}>Add</button>
          <button onClick={handleRemoveLastClick} disabled={isSubmitted}>Remove</button>
        </div>
      </div>

      <Table
        tableData={tableData}
        fixedDates={fixedDates} 
        handleHoursChange={handleHoursChange}
        isEditable={!locked}
      />

      <div className="comment-box">
        <label>Comments:</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} disabled={isSubmitted} />
      </div>

      {reportId && savedData ? (
        savedData.comments && savedData.comments.length > 0 ? (
          <div className="existing-comments">
            <h3>Previous Comments</h3>
            <table className="comment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Author</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {savedData.comments.map((comment, index) => (
                  <tr key={index}>
                    <td>{new Date(comment.date).toLocaleDateString()}</td>
                    <td>{comment.author}</td>
                    <td>{comment.txt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No comments available.</div>
        )
      ) : (
        <div>Loading</div>
      )}

      <div className="button-container">
        <div className='save-sub'>
          <button className='submit-button' onClick={handleSubmit} disabled={isSubmitted}>Submit</button>
          <button className='submit-button' onClick={handleSave} disabled={isSubmitted}>Save</button>
        </div>
        <button className='submit-button' onClick={handleReset} >Reset</button>
      </div>
    </div>
  );
}

export default UserPage;