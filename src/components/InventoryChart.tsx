
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProcessedData } from '@/types/inventory';

interface InventoryChartProps {
  data: ProcessedData[];
}

const InventoryChart: React.FC<InventoryChartProps> = ({ data }) => {
  // Prepare chart data by combining all products' daily data
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const dateMap = new Map<string, any>();
    
    data.forEach(product => {
      product.data.forEach(item => {
        const date = item.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        const entry = dateMap.get(date);
        entry[`${product.productName}_inventory`] = item.inventory;
        entry[`${product.productName}_sold`] = item.sold;
      });
    });
    
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Levels Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value, name) => [value, name.replace('_inventory', '')]}
            />
            <Legend />
            {data.slice(0, 5).map((product, index) => (
              <Line
                key={product.productName}
                type="monotone"
                dataKey={`${product.productName}_inventory`}
                stroke={colors[index]}
                strokeWidth={2}
                dot={false}
                name={product.productName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default InventoryChart;
