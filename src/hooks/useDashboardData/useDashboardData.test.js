import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from './useDashboardData';
import { fetchDashboardOverview } from '../../api/dashboard';

jest.mock('../../api/dashboard');

beforeEach(() => jest.clearAllMocks());

const mockOverview = {
  total_income: 10000,
  total_expenses: -6000,
  expenses_by_category: {
    Food: 3000,
    Transport: 2000,
    Rent: 1000,
  },
};

describe('useDashboardData', () => {
  it('fetches overview data on mount', async () => {
    fetchDashboardOverview.mockResolvedValue(mockOverview);

    const { result } = renderHook(() =>
      useDashboardData('2025-01-01', '2025-01-31'),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.overviewData).toEqual(mockOverview);
    expect(result.current.error).toBeNull();
    expect(fetchDashboardOverview).toHaveBeenCalledWith({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    });
  });

  it('processes category data sorted by value descending', async () => {
    fetchDashboardOverview.mockResolvedValue(mockOverview);

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const names = result.current.processedCategoryData.map((c) => c.name);
    expect(names).toEqual(['Food', 'Transport', 'Rent']);

    expect(result.current.processedCategoryData[0].value).toBe(3000);
  });

  it('computes percentages and assigns colors', async () => {
    fetchDashboardOverview.mockResolvedValue(mockOverview);

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const { categoryDataWithPercentages } = result.current;
    expect(categoryDataWithPercentages).toHaveLength(3);

    const foodEntry = categoryDataWithPercentages.find((c) => c.name === 'Food');
    expect(foodEntry.percentage).toBe('50.0');
    expect(foodEntry.color).toBeDefined();
  });

  it('handles negative values by taking absolute value', async () => {
    fetchDashboardOverview.mockResolvedValue({
      expenses_by_category: { Groceries: -500 },
    });

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.processedCategoryData[0].value).toBe(500);
  });

  it('filters out zero-value and NaN categories', async () => {
    fetchDashboardOverview.mockResolvedValue({
      expenses_by_category: { Real: 100, Empty: 0, Bad: 'not-a-number' },
    });

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.processedCategoryData).toHaveLength(1);
    expect(result.current.processedCategoryData[0].name).toBe('Real');
  });

  it('sets error on fetch failure', async () => {
    fetchDashboardOverview.mockRejectedValue(new Error('API down'));

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API down');
    expect(result.current.overviewData).toBeNull();
  });

  it('re-fetches when date params change', async () => {
    fetchDashboardOverview.mockResolvedValue(mockOverview);

    const { result, rerender } = renderHook(
      ({ start, end }) => useDashboardData(start, end),
      { initialProps: { start: '2025-01-01', end: '2025-01-31' } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ start: '2025-02-01', end: '2025-02-28' });

    await waitFor(() => {
      expect(fetchDashboardOverview).toHaveBeenCalledTimes(2);
    });

    expect(fetchDashboardOverview).toHaveBeenLastCalledWith({
      startDate: '2025-02-01',
      endDate: '2025-02-28',
    });
  });

  it('exposes formatAmount and formatDate utilities', () => {
    fetchDashboardOverview.mockResolvedValue(mockOverview);

    const { result } = renderHook(() => useDashboardData('2025-01-01', '2025-01-31'));

    expect(typeof result.current.formatAmount).toBe('function');
    expect(typeof result.current.formatDate).toBe('function');
  });
});
