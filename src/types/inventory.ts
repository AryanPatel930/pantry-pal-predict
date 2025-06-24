
export interface InventoryData {
  date: string;
  productName: string;
  inventory: number;
  sold: number;
}

export interface ProcessedData {
  productName: string;
  data: InventoryData[];
  totalSold: number;
  avgDailySales: number;
  currentInventory: number;
  daysOfStock: number;
  trend: 'up' | 'down' | 'stable';
  forecast: number[];
  lowStockAlert: boolean;
  overStockAlert: boolean;
}
