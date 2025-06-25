// src/pages/Dashboard.tsx

import React, { useState } from 'react';
import {
  Upload, TrendingUp, AlertTriangle, Package, BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DataUpload from '@/components/DataUpload';
import InventoryChart from '@/components/InventoryChart';
import ForecastChart from '@/components/ForecastChart';
import ProductTable from '@/components/ProductTable';
import AlertsPanel from '@/components/AlertsPanel';
import { InventoryData, ProcessedData } from '@/types/inventory';
import { processAndForecastData } from '@/lib/api';

const Dashboard = () => {
  const [inventoryData, setInventoryData] = useState<ProcessedData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleDataUpload = async (data: InventoryData[]) => {
    try {
      const result = await processAndForecastData(data);
      setInventoryData(result);
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Failed to process uploaded data:", err);
      alert("Error processing inventory data. Please try again.");
    }
  };

  const handleUploadNew = () => {
    setInventoryData([]);
    setIsDataLoaded(false);
  };

  const totalProducts = inventoryData.length;
  const lowStockProducts = inventoryData.filter(item => item.lowStockAlert).length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.currentInventory * 10), 0); // $10 placeholder
  const avgTurnover = inventoryData.length > 0
    ? inventoryData.reduce((sum, item) => sum + (1 / (item.daysOfStock || 1)), 0) / totalProducts
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Smart Inventory Forecasting
              </h1>
              <p className="text-lg text-gray-600">
                AI-powered inventory management for food businesses
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {isDataLoaded && (
                <Button 
                  onClick={handleUploadNew}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Upload New Data
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isDataLoaded ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Upload className="h-6 w-6" />
                  Upload Your Inventory Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataUpload onDataUpload={handleDataUpload} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowStockProducts}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Turnover</CardTitle>
                  <BarChart3 className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgTurnover.toFixed(2)}x</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InventoryChart data={inventoryData} />
                  <AlertsPanel data={inventoryData} />
                </div>
              </TabsContent>

              <TabsContent value="forecasting" className="space-y-6">
                <ForecastChart data={inventoryData} />
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <ProductTable data={inventoryData} />
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <AlertsPanel data={inventoryData} detailed />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
