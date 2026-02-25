import React, { useState } from 'react';
import DashboardOverview from '../components/DashboardOverview/DashboardOverview';

function DashboardPage() {
  const [filterStartDate] = useState('2020-01-01');
  const [filterEndDate] = useState('2030-12-31');

  return (
    <div className="dashboard-page">
      <DashboardOverview startDate={filterStartDate} endDate={filterEndDate} />
    </div>
  );
}

export default DashboardPage;
