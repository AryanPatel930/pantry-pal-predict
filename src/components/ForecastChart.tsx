
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProcessedData } from '@/types/inventory';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ForecastChartProps {
  data: ProcessedData[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>(data[0]?.productName || '');

  const selectedProductData = data.find(p => p.productName === selectedProduct);

  const chartData = React.useMemo(() => {
    if (!selectedProductData) return [];
    
    const historicalData = selectedProductData.data.slice(-14).map((item, index) => ({
      day: `Day ${index + 1}`,
      date: item.date,
      actual: item.sold,
      type: 'historical'
    }));

    const forecastData = selectedProductData.forecast.map((forecast, index) => ({
      day: `Day ${historicalData.length + index + 1}`,
      date: '',
      forecast: forecast,
      type: 'forecast'
    }));

    return [...historicalData, ...forecastData];
  }, [selectedProductData]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No data available for forecasting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Forecasting</CardTitle>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {data.map(product => (
                <SelectItem key={product.productName} value={product.productName}>
                  {product.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'actual' ? 'Actual Sales' : 'Forecasted Sales']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Actual Sales"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#EF4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Forecasted Sales"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedProductData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Trend</CardTitle>
              {getTrendIcon(selectedProductData.trend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(selectedProductData.trend)}`}>
                {selectedProductData.trend.charAt(0).toUpperCase() + selectedProductData.trend.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent sales data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Daily Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedProductData.avgDailySales.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Units per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${selectedProductData.daysOfStock < 3 ? 'text-red-600' : selectedProductData.daysOfStock > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                {selectedProductData.daysOfStock.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                At current sales rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ForecastChart;
