// src/lib/api.ts

import { InventoryData, ProcessedData } from '@/types/inventory';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Calculates trend based on recent vs older sales data
 */
function calculateTrend(data: InventoryData[]): 'up' | 'down' | 'stable' {
  if (data.length < 14) return 'stable';

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentSales = sortedData.slice(-7).reduce((sum, item) => sum + item.sold, 0) / 7;
  const olderSales = sortedData.slice(-14, -7).reduce((sum, item) => sum + item.sold, 0) / 7;

  if (recentSales > olderSales * 1.1) return 'up';
  if (recentSales < olderSales * 0.9) return 'down';
  return 'stable';
}

/**
 * Sends grouped sales data per product to the AI backend for forecasting
 * and returns processed inventory analytics.
 */
export async function processAndForecastData(data: InventoryData[]): Promise<ProcessedData[]> {
  const formatted = data.map(item => ({
    Date: item.date,
    'Product Name': item.productName,
    Inventory: item.inventory,
    Sold: item.sold,
  }));

  const grouped: { [productName: string]: any[] } = {};
  formatted.forEach(entry => {
    const name = entry['Product Name'];
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push({ Date: entry.Date, Sold: entry.Sold });
  });

  const result: ProcessedData[] = await Promise.all(
    Object.entries(grouped).map(async ([productName, salesData]) => {
      const productData = data.filter(d => d.productName === productName);
      const totalSold = productData.reduce((sum, d) => sum + d.sold, 0);
      const avgDailySales = totalSold / (productData.length || 1);
      const currentInventory = productData[productData.length - 1]?.inventory || 0;
      const daysOfStock = currentInventory / (avgDailySales || 1);
      const trend = calculateTrend(productData);

      try {
        const res = await fetch(`${API_URL}/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_data: salesData,
            product_name: productName,
          }),
        });

        if (!res.ok) throw new Error(`Forecast API call failed with status: ${res.status}`);

        const forecastResponse = await res.json();
        const forecast = Array.isArray(forecastResponse.forecast)
          ? forecastResponse.forecast.map((f: any) => Math.round(f.yhat || f.predicted_sales || f))
          : [];

        return {
          productName,
          data: productData,
          totalSold,
          avgDailySales,
          currentInventory,
          daysOfStock,
          trend,
          forecast,
          lowStockAlert: daysOfStock < 3,
          overStockAlert: daysOfStock > 30,
          hasApiForecast: true,
          apiForecast: forecast,
        };
      } catch (err) {
        console.error(`Forecast error for ${productName}:`, err);
        const fallbackForecast = generateLocalForecast(productData, 7);
        return {
          productName,
          data: productData,
          totalSold,
          avgDailySales,
          currentInventory,
          daysOfStock,
          trend,
          forecast: fallbackForecast,
          lowStockAlert: daysOfStock < 3,
          overStockAlert: daysOfStock > 30,
          hasApiForecast: false,
          apiForecast: [],
        };
      }
    })
  );

  return result;
}

/**
 * Generates a simple local forecast as fallback
 */
function generateLocalForecast(data: InventoryData[], days: number): number[] {
  if (data.length < 7) return Array(days).fill(0);

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentSales = sortedData.slice(-14).map(item => item.sold);
  const avgSales = recentSales.reduce((sum, sales) => sum + sales, 0) / recentSales.length;

  const trendAdjustment =
    sortedData.slice(-7).reduce((sum, item) => sum + item.sold, 0) / 7 -
    sortedData.slice(-14, -7).reduce((sum, item) => sum + item.sold, 0) / 7;

  return Array(days)
    .fill(0)
    .map((_, index) => Math.max(0, Math.round(avgSales + trendAdjustment * 0.1 * index)));
}
