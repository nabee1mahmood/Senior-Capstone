import { useParams, Link } from 'react-router-dom'
import './Home.css'
import './DayDetails.css'

function DayDetails({ darkMode, setDarkMode }) {
  const { day } = useParams()

  const sensors = [
    { name: 'Living Room', type: 'Temperature', value: `${Math.floor(65 + Math.random() * 10)}°F`, time: '08:00 AM' },
    { name: 'Kitchen', type: 'Temperature', value: `${Math.floor(60 + Math.random() * 15)}°F`, time: '10:30 AM' },
    { name: 'Front Door', type: 'Door/Window', value: Math.random() > 0.5 ? 'Opened' : 'Closed', time: '12:15 PM' },
    { name: 'Bedroom', type: 'Motion', value: Math.random() > 0.5 ? 'Detected' : 'No Motion', time: '02:45 PM' },
    { name: 'Garage', type: 'Temperature', value: `${Math.floor(55 + Math.random() * 20)}°F`, time: '04:00 PM' },
    { name: 'Bathroom', type: 'Humidity', value: `${Math.floor(40 + Math.random() * 20)}%`, time: '05:30 PM' },
  ]

  return (
    <div className={`dashboard gf-dashboard ${darkMode ? 'dark' : 'light'}`}>
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="h4 mb-0 font-weight-bold gf-dashboard-title">Details for {day}</h1>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link to="/home" className="btn btn-outline-secondary btn-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="day-details px-0">
        <p className="dd-subtitle text-muted mb-3">
          Here you can see all logged sensor data for {day}.
        </p>

        <div className="table-responsive">
          <table className="table table-striped table-hover dd-table mt-3">
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
        </div>
      </div>
    </div>
  )
}

export default DayDetails
