import { useState, useEffect, useMemo } from 'react';
import { fetchDashboardOverview } from '../../api/dashboard';
import { formatAmount, formatDate } from '../../lib/formatters';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF197C',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384', '#9966FF', '#C9CB3D',
  '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
];

export function useDashboardData(startDate, endDate) {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setChartError(null);

      try {
        const data = await fetchDashboardOverview({ startDate, endDate });
        if (!cancelled) setOverviewData(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not fetch dashboard data.');
          setOverviewData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  const processedCategoryData = useMemo(() => {
    if (!overviewData?.expenses_by_category) return [];
    try {
      return Object.entries(overviewData.expenses_by_category)
        .map(([name, value]) => {
          const numValue = Number(value);
          if (!name || Number.isNaN(numValue)) return null;
          return { name: name.trim(), value: Math.abs(numValue) };
        })
        .filter((item) => item !== null && item.value > 0)
        .sort((a, b) => b.value - a.value);
    } catch {
      setChartError('Error processing category data');
      return [];
    }
  }, [overviewData]);

  const categoryDataWithPercentages = useMemo(() => {
    if (!processedCategoryData.length) return [];
    const total = processedCategoryData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    return processedCategoryData.map((item, index) => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }));
  }, [processedCategoryData]);

  return {
    overviewData,
    loading,
    error,
    chartError,
    processedCategoryData,
    categoryDataWithPercentages,
    formatAmount,
    formatDate,
  };
}
