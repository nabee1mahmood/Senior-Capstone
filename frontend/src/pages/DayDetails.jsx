import { useParams, Link } from "react-router-dom";

function DayDetails() {
  const { day } = useParams();

  return (
    <div className="container mt-4">
      <h2>Details for {day}</h2>
      <p>Here you can display all logged sensor data for {day}.</p>
      
      <Link to="/home" className="btn btn-primary mt-3">
        ← Back to Dashboard
      </Link>
    </div>
  );
}

export default DayDetails;