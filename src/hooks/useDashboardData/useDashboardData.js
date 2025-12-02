// frontend/src/hooks/useDashboardData.js
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF197C',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384', '#9966FF', '#C9CB3D',
  '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
];

export function useDashboardData(startDate, endDate, refreshTrigger) {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      setError(null);
      setChartError(null); // Reset chart error on new fetch

      let url = 'http://localhost:8001/dashboard/overview/';
      const params = new URLSearchParams();

      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        const response = await fetch(url, {
          headers: getAuthHeader()
        });

        if (!response.ok) {
          const errorDetail = await response.json();
          throw new Error(`HTTP error! status: ${response.status} - ${errorDetail.detail || 'Unknown error'}`);
        }

        const data = await response.json();
        setOverviewData(data);
      } catch (e) {
        console.error("Error fetching dashboard overview:", e);
        setError(e.message || "Could not fetch dashboard data.");
        setOverviewData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [startDate, endDate, refreshTrigger, getAuthHeader]);

  const processedCategoryData = useMemo(() => {
    if (!overviewData || !overviewData.expenses_by_category) {
      return [];
    }

    try {
      const entries = Object.entries(overviewData.expenses_by_category);
      
      const processed = entries
        .map(([name, value]) => {
          if (!name || typeof name !== 'string') {
            console.warn('Invalid category name:', name);
            return null;
          }
          
          const numValue = Number(value);
          if (isNaN(numValue)) {
            console.warn('Invalid category value:', value);
            return null;
          }
          
          return {
            name: name.trim(),
            value: Math.abs(numValue)
          };
        })
        .filter(item => item !== null && item.value > 0)
        .sort((a, b) => b.value - a.value);
      
      return processed;
    } catch (error) {
      console.error('Error processing category data:', error);
      setChartError('Error processing category data');
      return [];
    }
  }, [overviewData]);

  const categoryDataWithPercentages = useMemo(() => {
    if (!processedCategoryData || processedCategoryData.length === 0) {
      return [];
    }

    try {
      const totalExpenses = processedCategoryData.reduce((sum, item) => sum + (item?.value || 0), 0);
      
      if (totalExpenses === 0) {
        return [];
      }

      return processedCategoryData.map((item, index) => {
        if (!item || typeof item.value !== 'number') {
          console.warn('Invalid item in processedCategoryData:', item);
          return null;
        }

        return {
          ...item,
          percentage: ((item.value / totalExpenses) * 100).toFixed(1),
          color: COLORS[index % COLORS.length]
        };
      }).filter(item => item !== null);
    } catch (error) {
      console.error('Error calculating percentages:', error);
      setChartError('Error calculating percentages for chart data'); // Set chart error here
      return [];
    }
  }, [processedCategoryData]);

  const formatAmount = (amount) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) {
        return 'Kr. 0,00';
      }
      return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: 2
      }).format(numAmount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return 'Kr. 0,00';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('da-DK');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return {
    overviewData,
    loading,
    error,
    chartError,
    processedCategoryData,
    categoryDataWithPercentages,
    formatAmount,
    formatDate
  };
}