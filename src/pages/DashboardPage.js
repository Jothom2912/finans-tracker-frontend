// src/pages/DashboardPage.js
import React from 'react';
import DashboardOverview from '../components/DashboardOverview/DashboardOverview'; // Juster stien om nødvendigt

function DashboardPage({ filterStartDate, filterEndDate, refreshDashboardTrigger }) {
  return (
    <div className="dashboard-page">
      {/* Du kan tilføje andre dashboard-relaterede komponenter her senere */}
      <DashboardOverview
        startDate={filterStartDate}
        endDate={filterEndDate}
        refreshTrigger={refreshDashboardTrigger}
      />
    </div>
  );
}

export default DashboardPage;