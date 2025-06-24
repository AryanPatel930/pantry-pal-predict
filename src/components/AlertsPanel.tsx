
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ProcessedData } from '@/types/inventory';
import { AlertTriangle, Package, TrendingUp, Clock } from 'lucide-react';

interface AlertsPanelProps {
  data: ProcessedData[];
  detailed?: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ data, detailed = false }) => {
  const lowStockProducts = data.filter(p => p.lowStockAlert);
  const overStockProducts = data.filter(p => p.overStockAlert);
  const trendingUpProducts = data.filter(p => p.trend === 'up').slice(0, 3);
  const trendingDownProducts = data.filter(p => p.trend === 'down').slice(0, 3);

  const getRecommendation = (product: ProcessedData) => {
    if (product.lowStockAlert) {
      const suggestedOrder = Math.ceil(product.avgDailySales * 7); // 7 days worth
      return `Order ${suggestedOrder} units (7 days supply)`;
    } else if (product.overStockAlert) {
      return 'Consider promotion or discount to move inventory';
    } else if (product.trend === 'up') {
      const suggestedOrder = Math.ceil(product.avgDailySales * 5); // 5 days worth extra
      return `Consider ordering ${suggestedOrder} extra units due to upward trend`;
    }
    return 'No action needed';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lowStockProducts.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-red-800">
                    {lowStockProducts.length} product(s) running low on stock
                  </p>
                  {detailed && (
                    <div className="space-y-1">
                      {lowStockProducts.map(product => (
                        <div key={product.productName} className="flex justify-between items-center">
                          <span className="text-sm">{product.productName}</span>
                          <Badge variant="destructive">{product.daysOfStock.toFixed(1)} days left</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {overStockProducts.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Package className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-orange-800">
                    {overStockProducts.length} product(s) overstocked
                  </p>
                  {detailed && (
                    <div className="space-y-1">
                      {overStockProducts.map(product => (
                        <div key={product.productName} className="flex justify-between items-center">
                          <span className="text-sm">{product.productName}</span>
                          <Badge variant="secondary">{product.daysOfStock.toFixed(0)} days supply</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {lowStockProducts.length === 0 && overStockProducts.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Package className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="text-green-800">All products have healthy inventory levels!</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {detailed && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Trending Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingUpProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">📈 Trending Up</h4>
                    <div className="space-y-2">
                      {trendingUpProducts.map(product => (
                        <div key={product.productName} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">{product.productName}</span>
                          <Badge variant="default" className="bg-green-500">
                            {product.avgDailySales.toFixed(1)}/day
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trendingDownProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">📉 Trending Down</h4>
                    <div className="space-y-2">
                      {trendingDownProducts.map(product => (
                        <div key={product.productName} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="text-sm font-medium">{product.productName}</span>
                          <Badge variant="destructive">
                            {product.avgDailySales.toFixed(1)}/day
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trendingUpProducts.length === 0 && trendingDownProducts.length === 0 && (
                  <p className="text-gray-500 text-sm">No significant trends detected in recent data.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...lowStockProducts, ...overStockProducts, ...trendingUpProducts.slice(0, 2)].map(product => (
                  <div key={product.productName} className="flex justify-between items-start p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-gray-600">{getRecommendation(product)}</p>
                    </div>
                    {product.lowStockAlert && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                    {product.overStockAlert && (
                      <Badge variant="secondary">Review</Badge>
                    )}
                    {product.trend === 'up' && !product.lowStockAlert && !product.overStockAlert && (
                      <Badge variant="default" className="bg-blue-500">Opportunity</Badge>
                    )}
                  </div>
                ))}
                
                {lowStockProducts.length === 0 && overStockProducts.length === 0 && trendingUpProducts.length === 0 && (
                  <p className="text-gray-500 text-sm">No recommendations at this time. Your inventory is well-balanced!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AlertsPanel;
