import React from 'react';
import './Table.css';

const getWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay() + 1);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date.toLocaleDateString('en-US'));
  }
  return days;
};


const Table = ({ tableData, fixedDates, handleHoursChange, isEditable }) => {
  console.log('Table Data:', tableData);
  console.log('Fixed Dates:', fixedDates);

  const weekDays = getWeekDays(fixedDates[0] || new Date());

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Task</th>
            {weekDays.map((date, index) => (
              <th key={index}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                 {/* ({date}) */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{row.project}</td>
              <td>{row.task}</td>
              {weekDays.map((date, dateIndex) => {
                const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <td key={dateIndex}>
                    <input
                      type="number"
                      value={row.hours[day] || 0}
                      onChange={(e) => handleHoursChange(rowIndex, day, e.target.value)}
                      disabled={!isEditable}
                      className="hour-input"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default Table;
