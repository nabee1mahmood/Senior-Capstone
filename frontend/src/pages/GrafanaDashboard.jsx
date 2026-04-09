function GrafanaDashboard() {
    return (
      <div className="dashboard">
        <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
          <h1 className="h4 mb-0 font-weight-bold">Grafana Dashboard</h1>
        </header>
  
        <div className="card shadow-sm">
          <div className="card-body p-0" style={{ height: '80vh' }}>
            <iframe
              title="Grafana Dashboard"
              src="http://localhost:3002"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      </div>
    )
  }
  
  export default GrafanaDashboard