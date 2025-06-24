
import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InventoryData } from '@/types/inventory';

interface DataUploadProps {
  onDataUpload: (data: InventoryData[]) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const parseCSV = (csvText: string): InventoryData[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredHeaders = ['date', 'productname', 'inventory', 'sold'];
    const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.includes(h.replace('productname', 'product'))));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: InventoryData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 4) continue;
      
      const dateIndex = headers.findIndex(h => h.includes('date'));
      const productIndex = headers.findIndex(h => h.includes('product'));
      const inventoryIndex = headers.findIndex(h => h.includes('inventory'));
      const soldIndex = headers.findIndex(h => h.includes('sold'));
      
      data.push({
        date: values[dateIndex],
        productName: values[productIndex],
        inventory: parseInt(values[inventoryIndex]) || 0,
        sold: parseInt(values[soldIndex]) || 0
      });
    }
    
    return data;
  };

  const handleFileUpload = useCallback((file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const data = parseCSV(csvText);
        
        if (data.length === 0) {
          throw new Error('No valid data found in file');
        }
        
        onDataUpload(data);
        setUploadStatus('success');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file');
        setUploadStatus('error');
      }
    };
    
    reader.readAsText(file);
  }, [onDataUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const generateSampleData = () => {
    const products = ['Fresh Bread', 'Coffee Beans', 'Croissants', 'Muffins', 'Sandwiches'];
    const sampleData: InventoryData[] = [];
    
    for (let day = 0; day < 60; day++) {
      const date = new Date();
      date.setDate(date.getDate() - (59 - day));
      
      products.forEach(product => {
        const baseInventory = Math.floor(Math.random() * 50) + 20;
        const baseSold = Math.floor(Math.random() * 15) + 5;
        
        sampleData.push({
          date: date.toISOString().split('T')[0],
          productName: product,
          inventory: baseInventory + Math.floor(Math.random() * 20),
          sold: baseSold + Math.floor(Math.random() * 10)
        });
      });
    }
    
    onDataUpload(sampleData);
    setUploadStatus('success');
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploadStatus === 'uploading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">Processing your data...</p>
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-green-700 font-medium">Data uploaded successfully!</p>
          </div>
        )}
        
        {uploadStatus === 'idle' && (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
              <p className="text-gray-600">or click to browse</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>
        )}
      </div>

      {uploadStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="border-t pt-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Don't have data? Try our sample dataset to explore the features.
          </p>
          <Button variant="outline" onClick={generateSampleData}>
            Load Sample Data
          </Button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 space-y-2">
          <p className="font-medium">CSV Format Requirements:</p>
          <p>• Columns: Date, Product Name, Inventory, Sold</p>
          <p>• Date format: YYYY-MM-DD</p>
          <p>• Numbers should be whole integers</p>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
