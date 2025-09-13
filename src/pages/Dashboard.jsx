import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShoppingCart,
  Calendar,
  Clock,
  Target,
  Zap,
  Plus,
  Eye,
  FileText,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
// import StatsCard from '../components/Dashboard/StatsCard';
// import AlertCard from '../components/Dashboard/AlertCard';
import { getMedicines, getSales, getSuppliers, getPrescriptions } from '../utils/storage';
import { useNotifications } from '../hooks/useNotifications';
import { isExpired, isExpiringSoon } from '../utils/dateUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    dailySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    lowStockItems: 0,
    expiredItems: 0,
    expiringSoonItems: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    pendingPrescriptions: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const medicines = getMedicines();
    const sales = getSales();
    const suppliers = getSuppliers();
    const prescriptions = getPrescriptions();

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailySales = sales
      .filter(sale => new Date(sale.createdAt) >= today)
      .reduce((sum, sale) => sum + sale.total, 0);

    const weeklySales = sales
      .filter(sale => new Date(sale.createdAt) >= weekAgo)
      .reduce((sum, sale) => sum + sale.total, 0);

    const monthlySales = sales
      .filter(sale => new Date(sale.createdAt) >= monthAgo)
      .reduce((sum, sale) => sum + sale.total, 0);

    const lowStockItems = medicines.filter(med => med.quantity <= med.parLevel).length;
    const expiredItems = medicines.filter(med => isExpired(med.expiryDate)).length;
    const expiringSoonItems = medicines.filter(med => isExpiringSoon(med.expiryDate)).length;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;

    setStats({
      totalMedicines: medicines.length,
      dailySales: dailySales,
      weeklySales: weeklySales,
      monthlySales: monthlySales,
      lowStockItems: lowStockItems,
      expiredItems: expiredItems,
      expiringSoonItems: expiringSoonItems,
      totalSuppliers: suppliers.filter(s => s.active).length,
      totalCustomers: new Set(sales.map(s => s.customerName).filter(Boolean)).size,
      pendingPrescriptions: pendingPrescriptions,
    });

    // Generate sales chart data (last 7 days)
    const salesChartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const daySales = sales
        .filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= dayStart && saleDate < dayEnd;
        })
        .reduce((sum, sale) => sum + sale.total, 0);

      const dayTransactions = sales
        .filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= dayStart && saleDate < dayEnd;
        }).length;

      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySales,
        transactions: dayTransactions,
        date: date.toISOString().split('T')[0],
      };
    });
    setSalesData(salesChartData);

    // Generate revenue data (last 12 weeks)
    const revenueChartData = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(today.getTime() - (11 - i) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekSales = sales
        .filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart && saleDate < weekEnd;
        })
        .reduce((sum, sale) => sum + sale.total, 0);

      return {
        week: `W${i + 1}`,
        revenue: weekSales,
        profit: weekSales * 0.25, // Assuming 25% profit margin
      };
    });
    setRevenueData(revenueChartData);

    // Generate inventory pie chart data
    const categories = [...new Set(medicines.map(m => m.category))];
    const inventoryChartData = categories.map(category => ({
      name: category,
      value: medicines.filter(m => m.category === category).length,
      stock: medicines.filter(m => m.category === category).reduce((sum, m) => sum + m.quantity, 0),
    }));
    setInventoryData(inventoryChartData);

    // Generate top medicines data
    const medicinesSold = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = medicinesSold.get(item.medicineName) || { quantity: 0, revenue: 0 };
        medicinesSold.set(item.medicineName, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.total,
        });
      });
    });

    const topMedicinesData = Array.from(medicinesSold.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    setTopMedicines(topMedicinesData);

    // Generate alerts
    const alertsData = [];
    
    if (expiredItems > 0) {
      alertsData.push({
        id: 'expired',
        type: 'expiry',
        title: 'Expired Medicines',
        message: 'Medicines have expired and need to be removed',
        count: expiredItems,
        priority: 'high',
      });
    }

    if (expiringSoonItems > 0) {
      alertsData.push({
        id: 'expiring',
        type: 'expiry',
        title: 'Expiring Soon',
        message: 'Medicines will expire within 30 days',
        count: expiringSoonItems,
        priority: 'medium',
      });
    }

    if (lowStockItems > 0) {
      alertsData.push({
        id: 'low-stock',
        type: 'low-stock',
        title: 'Low Stock Items',
        message: 'Medicines are below minimum stock levels',
        count: lowStockItems,
        priority: 'medium',
      });
    }

    if (pendingPrescriptions > 0) {
      alertsData.push({
        id: 'prescriptions',
        type: 'prescription',
        title: 'Pending Prescriptions',
        message: 'Prescriptions waiting to be dispensed',
        count: pendingPrescriptions,
        priority: 'low',
      });
    }

    setAlerts(alertsData);

    // Add notifications for critical alerts
    if (expiredItems > 0) {
      addNotification({
        type: 'expiry',
        title: 'Expired Medicines Alert',
        message: `${expiredItems} medicines have expired and need immediate attention`,
        read: false,
      });
    }

    if (lowStockItems > 0) {
      addNotification({
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${lowStockItems} medicines are running low on stock`,
        read: false,
      });
    }
  };

  const handleViewAlertDetails = (type) => {
    switch (type) {
      case 'expiry':
        navigate('/inventory?filter=expiry');
        break;
      case 'low-stock':
        navigate('/inventory?filter=low-stock');
        break;
      case 'prescription':
        navigate('/prescriptions');
        break;
      default:
        navigate('/inventory');
    }
  };

  // Quick action handlers
  const handleNewSale = () => {
    navigate('/sales');
  };

  const handleAddMedicine = () => {
    navigate('/inventory');
  };

  const handleNewPrescription = () => {
    navigate('/prescriptions');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleViewInventory = () => {
    navigate('/inventory');
  };

  const handleViewSales = () => {
    navigate('/sales');
  };

  const handleViewPrescriptions = () => {
    navigate('/prescriptions');
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const gradientColors = ['#3B82F6', '#1D4ED8'];

  // Calculate growth percentages
  const salesGrowth = stats.weeklySales > 0 ? ((stats.dailySales * 7 - stats.weeklySales) / stats.weeklySales * 100) : 0;
  const prescriptionGrowth = 8.5; // Mock data
  const inventoryGrowth = -2.3; // Mock data

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-blue-100 text-lg">Welcome back! Here's what's happening at your pharmacy today.</p>
            <div className="flex items-center mt-4 space-x-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">{new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <button
          onClick={handleViewSales}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{stats.dailySales.toFixed(0)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">+{salesGrowth.toFixed(1)}% from yesterday</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <IndianRupee className="w-8 h-8" />
            </div>
          </div>
        </button>

        {/* Medicines Card */}
        <button
          onClick={handleViewInventory}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Medicines</p>
              <p className="text-3xl font-bold mt-1">{stats.totalMedicines}</p>
              <div className="flex items-center mt-2">
                <Target className="w-4 h-4 mr-1" />
                <span className="text-sm">{stats.totalMedicines - stats.lowStockItems} in good stock</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Pill className="w-8 h-8" />
            </div>
          </div>
        </button>

        {/* Prescriptions Card */}
        <button
          onClick={handleViewPrescriptions}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pending Prescriptions</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingPrescriptions}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">+{prescriptionGrowth}% this week</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Stethoscope className="w-8 h-8" />
            </div>
          </div>
        </button>

        {/* Alerts Card */}
        <button
          onClick={() => handleViewAlertDetails('low-stock')}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Critical Alerts</p>
              <p className="text-3xl font-bold mt-1">{stats.lowStockItems + stats.expiredItems}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm">Needs attention</span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Sales Analytics</h3>
              <p className="text-gray-600">Revenue and transaction trends over the last 7 days</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Transactions</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }}
                formatter={(value, name) => [
                  name === 'sales' ? `₹${Number(value).toFixed(2)}` : value,
                  name === 'sales' ? 'Revenue' : 'Transactions'
                ]} 
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#salesGradient)"
              />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke="#10B981" 
                strokeWidth={3}
                fill="url(#transactionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Smart Alerts</h3>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">{alerts.length} Active</span>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group text-white"
                    onClick={() => handleViewAlertDetails(alert.type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-xl">{alert.title}</h4>
                            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                              {alert.count}
                            </span>
                          </div>
                          <p className="text-sm opacity-90 leading-relaxed mb-4">{alert.message}</p>
                          <div className="flex items-center">
                            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full font-medium shadow-lg group-hover:bg-white/30 transition-colors">
                              Click to view details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-green-600 mb-3">All Clear!</h4>
                  <p className="text-gray-600 text-lg mb-2">No alerts at this time</p>
                  <p className="text-sm text-gray-500">Your pharmacy is running smoothly!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trends */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Revenue Trends</h3>
              <p className="text-gray-600">Weekly revenue and profit analysis</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }}
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, '']}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Medicines */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Top Selling Medicines</h3>
              <p className="text-gray-600">Best performing products this month</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-4">
            {topMedicines.map((medicine, index) => (
              <div key={medicine.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                    <p className="text-sm text-gray-600">{medicine.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{medicine.revenue.toFixed(0)}</p>
                  <p className="text-sm text-green-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleNewSale}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="font-medium">New Sale</span>
          </button>
          <button
            onClick={handleAddMedicine}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <Package className="w-6 h-6" />
            <span className="font-medium">Add Medicine</span>
          </button>
          <button
            onClick={handleNewPrescription}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <Stethoscope className="w-6 h-6" />
            <span className="font-medium">New Prescription</span>
          </button>
          <button
            onClick={handleViewReports}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;