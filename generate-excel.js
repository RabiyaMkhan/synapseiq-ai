const XLSX = require('xlsx');
const path = require('path');

const data = [
  ['Product', 'Category', 'Price', 'Units Sold', 'Revenue', 'Profit Margin', 'Region', 'Date'],
  ['Laptop Pro 15', 'Electronics', 1299, 450, 584550, 22, 'North', '2024-01'],
  ['Wireless Mouse', 'Accessories', 49, 2300, 112700, 35, 'South', '2024-01'],
  ['Standing Desk', 'Furniture', 599, 180, 107820, 28, 'East', '2024-02'],
  ['Monitor 27"', 'Electronics', 449, 320, 143680, 25, 'West', '2024-02'],
  ['Keyboard Mech', 'Accessories', 89, 1850, 164650, 40, 'North', '2024-03'],
  ['Ergonomic Chair', 'Furniture', 899, 95, 85405, 30, 'South', '2024-03'],
  ['Webcam HD', 'Electronics', 129, 980, 126420, 32, 'East', '2024-04'],
  ['USB Hub', 'Accessories', 39, 3100, 120900, 45, 'West', '2024-04'],
  ['Desk Lamp', 'Furniture', 79, 1200, 94800, 38, 'North', '2024-05'],
  ['Tablet 10"', 'Electronics', 349, 270, 94230, 27, 'South', '2024-05'],
  ['Headphones', 'Accessories', 199, 750, 149250, 33, 'East', '2024-06'],
  ['Bookshelf', 'Furniture', 249, 140, 34860, 26, 'West', '2024-06'],
  ['Smart Watch', 'Electronics', 279, 420, 117180, 29, 'North', '2024-07'],
  ['Cable Set', 'Accessories', 29, 4500, 130500, 50, 'South', '2024-07'],
  ['Filing Cabinet', 'Furniture', 189, 200, 37800, 24, 'East', '2024-08'],
  ['Printer', 'Electronics', 399, 150, 59850, 21, 'West', '2024-08'],
  ['Mousepad XL', 'Accessories', 19, 5200, 98800, 55, 'North', '2024-09'],
  ['Whiteboard', 'Furniture', 149, 310, 46190, 31, 'South', '2024-09'],
  ['Docking Station', 'Electronics', 249, 380, 94620, 26, 'East', '2024-10'],
  ['Pen Set Premium', 'Accessories', 24, 2800, 67200, 48, 'West', '2024-10'],
];

const ws = XLSX.utils.aoa_to_sheet(data);

ws['!cols'] = [
  { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 12 },
  { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 }
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

const outPath = path.join(__dirname, 'sample-sales-data.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Excel file created: sample-sales-data.xlsx');
