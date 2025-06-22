import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Table } from "../index";
import "./PendingCards.css";

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub; 
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

const transformActivities = (activities = [], startDate) => {
  const weekDays = getWeekDays(startDate);

  if (!Array.isArray(activities)) {
    console.error("Activities is not an array:", activities);
    return [];
  }

  const activityMap = {};

  activities.forEach((activity) => {
    const key = `${activity.projectId || "Unknown Project"}|${
      activity.taskName || "Unknown Task"
    }`;

    if (!activityMap[key]) {
      activityMap[key] = {
        project: activity.projectId || "Unknown Project",
        task: activity.taskName || "Unknown Task",
        hours: weekDays.reduce((acc, day) => {
          const dayOfWeek = new Date(day).toLocaleDateString("en-US", {
            weekday: "long",
          });
          acc[dayOfWeek] = 0;
          return acc;
        }, {}),
      };
    }

    const dayOfWeek = new Date(activity.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    activityMap[key].hours[dayOfWeek] += activity.duration || 0;
  });

  return Object.values(activityMap);
};

const getWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay() + 1);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date.toISOString().split("T")[0]);
  }

  return days;
};

const PendingCards = () => {
  const [pendingCards, setPendingCards] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [comment, setComment] = useState(""); 
  const [userEmail, setUserEmail] = useState(""); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const email = decodeToken(token);
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  const rowsPerPage = 3;
  const totalPages = Math.ceil(pendingCards.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedCards = pendingCards.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  useEffect(() => {
    const fetchPendingCards = async () => {
      const apiUrl = "/mat/api/1.0/private/reports/status/Submitted";

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPendingCards(data);
      } catch (error) {
        console.error("Error fetching pending cards:", error);
        setError("Failed to fetch pending cards");
      }
    };

    fetchPendingCards();
  }, []);

  const handleView = async (cardId) => {
    console.log(`Viewing details for card ${cardId}`);
    const apiUrl = `/mat/api/1.0/private/reports/${cardId}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Card Details:", data);

      setSelectedCard(data);
      setComment(data.comment || ""); 
    } catch (error) {
      console.error("Error fetching card details:", error);
      setError("Failed to fetch card details");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleApprove = async () => {
    if (!selectedCard) return;

    const apiUrl = `/mat/api/1.0/private/reports/${
      selectedCard.id
    }/validate?accepted=true&adminEmail=${encodeURIComponent(
      userEmail
    )}&comment=${encodeURIComponent(comment)}`;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setPendingCards((prev) =>
        prev.filter((card) => card.id !== selectedCard.id)
      );
      setSelectedCard(null); 
      setComment("");
    } catch (error) {
      console.error("Error approving card:", error);
      setError("Failed to approve card");
    }
  };

  const handleReject = async () => {
    if (!selectedCard) return;

    const apiUrl = `/mat/api/1.0/private/reports/${
      selectedCard.id
    }/validate?accepted=false&adminEmail=${encodeURIComponent(
      userEmail
    )}&comment=${encodeURIComponent(comment)}`;
    const token = localStorage.getItem("token"); 

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setPendingCards((prev) =>
        prev.filter((card) => card.id !== selectedCard.id)
      );
      setSelectedCard(null);
      setComment("");
    } catch (error) {
      console.error("Error rejecting card:", error);
      setError("Failed to reject card");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="pending-table">
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Week Of</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCards.length > 0 ? (
            paginatedCards.map((card, index) => (
              <tr key={index}>
                <td>{card.userId}</td>
                <td>{formatDate(card.dateFrom)}</td>
                <td>{card.status}</td>
                <td>
                  <button
                    className="button-view"
                    onClick={() => handleView(card.id)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No pending cards available.</td>
            </tr>
          )}
        </tbody>
      </table>

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
            className={currentPage === index + 1 ? "active" : ""}
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

      {selectedCard && (
        <div className="details-container">
          <h2>Weekly Work Details</h2>
          <Table
            tableData={transformActivities(
              selectedCard.activities || [],
              selectedCard.dateFrom
            )}
            fixedDates={[selectedCard.dateFrom, selectedCard.dateTo]}
            handleHoursChange={() => {}} 
            isEditable={false} 
          />
          <label htmlFor="comment">Comments:</label>
          <div className="comment-box">
            <textarea
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <div className="action-buttons">
              <button className="approve-button" onClick={handleApprove}>Approve</button>
              <button className="reject-button" onClick={handleReject}>Reject</button>
              <button className="close-button" onClick={() => setSelectedCard(null)}>Close table</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCards;
