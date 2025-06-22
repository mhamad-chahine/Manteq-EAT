import React, { useState, useEffect } from 'react';
import './UserAdminPage.css';

const UserAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    email: "",
    cost: 0,
    password: "", 
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentUsers = users.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(users.length / rowsPerPage);

  useEffect(() => {
    const fetchUsers = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`/mat/api/1.0/private/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        })
          .then((response) => response.json())
          .then((data) => setUsers(data))
          .catch((error) => console.error("Error fetching users:", error));
      } else {
        console.error("No token found, please log in.");
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`/mat/api/1.0/private/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          cost: formData.cost,
          fullName: formData.fullName,
          role: "User",
          password: formData.password 
        })
      })
        .then(response => response.json())
        .then(data => {
          setUsers([...users, data]);
          setMessage("User added successfully!"); 
          setMessageType("success");
          setShowForm(false);
          setTimeout(() => setMessage(""), 5000); 
        })
        .catch(error => {
          console.error("Error adding user:", error);
          setMessage(`Failed to add user. Error: ${error.message}`);
          setMessageType("error");
          setTimeout(() => setMessage(""), 5000); 
        });
    } else {
      console.error("No token found, please log in.");
    }
  };

  return (
    <div className="user-table">
      {message && <div className="message-box">{message}</div>}
      {users.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Cost</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>${user.cost}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls-container">
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <button onClick={() => setShowForm(true)} className="add-user-button">
              +
            </button>
          </div>
        </>
      ) : (
        <p>No users found.</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group inline">
            <label htmlFor="fullName">Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group inline">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group inline">
            <label htmlFor="cost">Cost:</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleFormChange}
              step="0.01"
              required
            />
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleFormChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">Add user</button>
        </form>
      )}
    </div>
  );
};

export default UserAdminPage;
