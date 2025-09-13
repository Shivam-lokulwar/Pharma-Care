import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, User, Calendar, DollarSign } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    items: [{ medicineId: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    paymentMethod: 'cash',
    status: 'completed'
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
    if (savedSales.length === 0) {
      const mockSales = [
        {
          id: 1,
          saleNumber: 'SALE-001',
          customerName: 'Rajesh Kumar',
          customerPhone: '+91-98765-43210',
          items: [
            { medicineId: 1, medicineName: 'Paracetamol 500mg', quantity: 2, price: 5.99 },
            { medicineId: 2, medicineName: 'Ibuprofen 400mg', quantity: 1, price: 8.50 }
          ],
          totalAmount: 20.48,
          paymentMethod: 'cash',
          status: 'completed',
          createdAt: '2024-01-15T10:30:00Z',
          createdBy: 'Admin'
        },
        {
          id: 2,
          saleNumber: 'SALE-002',
          customerName: 'Priya Sharma',
          customerPhone: '+91-98765-43211',
          items: [
            { medicineId: 3, medicineName: 'Amoxicillin 250mg', quantity: 1, price: 12.99 }
          ],
          totalAmount: 12.99,
          paymentMethod: 'card',
          status: 'completed',
          createdAt: '2024-01-14T14:20:00Z',
          createdBy: 'Admin'
        },
        {
          id: 3,
          saleNumber: 'SALE-003',
          customerName: 'Amit Patel',
          customerPhone: '+91-98765-43212',
          items: [
            { medicineId: 4, medicineName: 'Vitamin D3', quantity: 3, price: 15.99 },
            { medicineId: 5, medicineName: 'Calcium Tablets', quantity: 2, price: 9.99 }
          ],
          totalAmount: 67.95,
          paymentMethod: 'cash',
          status: 'pending',
          createdAt: '2024-01-13T16:45:00Z',
          createdBy: 'Admin'
        }
      ];
      localStorage.setItem('sales', JSON.stringify(mockSales));
      setSales(mockSales);
    } else {
      setSales(savedSales);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) return;

    const newSale = {
      id: editingSale ? editingSale.id : Date.now(),
      saleNumber: editingSale ? editingSale.saleNumber : `SALE-${String(Date.now()).slice(-3)}`,
      ...formData,
      createdAt: editingSale ? editingSale.createdAt : new Date().toISOString(),
      createdBy: 'Admin'
    };

    if (editingSale) {
      setSales(sales.map(sale => sale.id === editingSale.id ? newSale : sale));
    } else {
      setSales([...sales, newSale]);
    }

    localStorage.setItem('sales', JSON.stringify(editingSale ? 
      sales.map(sale => sale.id === editingSale.id ? newSale : sale) : 
      [...sales, newSale]
    ));

    setShowModal(false);
    setEditingSale(null);
    setFormData({
      customerName: '',
      customerPhone: '',
      items: [{ medicineId: '', quantity: 1, price: 0 }],
      totalAmount: 0,
      paymentMethod: 'cash',
      status: 'completed'
    });
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      items: sale.items,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status
    });
    setShowModal(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicineId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const totalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: totalAmount
    });
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerPhone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || sale.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaySales = sales.filter(sale => 
    new Date(sale.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">{todaySales}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.saleNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                    <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{sale.items.length} items</div>
                    <div className="text-sm text-gray-500">
                      {sale.items.map(item => item.medicineName).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{sale.totalAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : sale.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSale ? 'Edit Sale' : 'New Sale'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={item.medicineName || ''}
                      onChange={(e) => updateItem(index, 'medicineName', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 px-3 py-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSale(null);
                    setFormData({
                      customerName: '',
                      customerPhone: '',
                      items: [{ medicineId: '', quantity: 1, price: 0 }],
                      totalAmount: 0,
                      paymentMethod: 'cash',
                      status: 'completed'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSale ? 'Update' : 'Create'} Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;