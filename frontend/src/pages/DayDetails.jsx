import { useParams, Link } from "react-router-dom";

function DayDetails() {
  const { day } = useParams();

  // Mock data for sensors
  const sensors = [
    { name: "Living Room", type: "Temperature", value: `${Math.floor(65 + Math.random() * 10)}°F`, time: "08:00 AM" },
    { name: "Kitchen", type: "Temperature", value: `${Math.floor(60 + Math.random() * 15)}°F`, time: "10:30 AM" },
    { name: "Front Door", type: "Door/Window", value: Math.random() > 0.5 ? "Opened" : "Closed", time: "12:15 PM" },
    { name: "Bedroom", type: "Motion", value: Math.random() > 0.5 ? "Detected" : "No Motion", time: "02:45 PM" },
    { name: "Garage", type: "Temperature", value: `${Math.floor(55 + Math.random() * 20)}°F`, time: "04:00 PM" },
    { name: "Bathroom", type: "Humidity", value: `${Math.floor(40 + Math.random() * 20)}%`, time: "05:30 PM" },
  ];

  return (
    <div className="container mt-4">
      <h2>Details for {day}</h2>
      <p>Here you can see all logged sensor data for {day}.</p>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Type</th>
            <th>Value</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor, idx) => (
            <tr key={idx}>
              <td>{sensor.name}</td>
              <td>{sensor.type}</td>
              <td>{sensor.value}</td>
              <td>{sensor.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/home" className="btn btn-primary mt-3">
        ← Back to Dashboard
      </Link>
    </div>
  );
}

export default DayDetails;