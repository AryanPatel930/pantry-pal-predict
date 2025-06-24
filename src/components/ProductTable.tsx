
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProcessedData } from '@/types/inventory';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';

interface ProductTableProps {
  data: ProcessedData[];
}

const ProductTable: React.FC<ProductTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStockStatus = (product: ProcessedData) => {
    if (product.lowStockAlert) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (product.overStockAlert) {
      return <Badge variant="secondary">Overstock</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Good</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory Details</CardTitle>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Avg Daily Sales</TableHead>
                <TableHead>Days of Stock</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Sold (60d)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((product) => (
                <TableRow key={product.productName}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell>{product.currentInventory}</TableCell>
                  <TableCell>{product.avgDailySales.toFixed(1)}</TableCell>
                  <TableCell>
                    <span className={
                      product.daysOfStock < 3 
                        ? 'text-red-600 font-medium' 
                        : product.daysOfStock > 30 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }>
                      {product.daysOfStock.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(product.trend)}
                      <span className="capitalize">{product.trend}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStockStatus(product)}
                  </TableCell>
                  <TableCell>{product.totalSold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No products found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductTable;
