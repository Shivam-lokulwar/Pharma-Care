import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Clock,
  Package,
  CheckCircle
} from 'lucide-react';
import { getMedicines, setMedicines, getCategories, getSuppliers } from '../utils/storage';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '../utils/dateUtils';

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [medicines, setMedicinesState] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    batch: '',
    expiryDate: '',
    quantity: 0,
    price: 0,
    mrp: 0,
    supplier: '',
    parLevel: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle URL filter parameter
    const filter = searchParams.get('filter');
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  useEffect(() => {
    filterMedicines();
  }, [medicines, searchTerm, statusFilter, categoryFilter]);

  const loadData = () => {
    const medicinesData = getMedicines();
    const categoriesData = getCategories();
    const suppliersData = getSuppliers();

    // Update medicine status based on current date and stock
    const updatedMedicines = medicinesData.map(medicine => {
      let status = 'in-stock';
      
      if (medicine.quantity === 0) {
        status = 'expired';
      } else if (medicine.quantity <= medicine.parLevel) {
        status = 'low-stock';
      } else if (isExpired(medicine.expiryDate)) {
        status = 'expired';
      } else if (isExpiringSoon(medicine.expiryDate)) {
        status = 'expiring-soon';
      }

      return { ...medicine, status };
    });

    setMedicinesState(updatedMedicines);
    setCategories(categoriesData.filter(c => c.active).map(c => c.name));
    setSuppliers(suppliersData.filter(s => s.active).map(s => s.name));

    // Save updated medicines back to storage
    setMedicines(updatedMedicines);
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'expiry') {
        filtered = filtered.filter(medicine => 
          medicine.status === 'expired' || medicine.status === 'expiring-soon'
        );
      } else {
        filtered = filtered.filter(medicine => medicine.status === statusFilter);
      }
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === categoryFilter);
    }

    setFilteredMedicines(filtered);
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      category: '',
      batch: '',
      expiryDate: '',
      quantity: 0,
      price: 0,
      mrp: 0,
      supplier: '',
      parLevel: 0,
    });
    setShowAddModal(true);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      batch: medicine.batch,
      expiryDate: medicine.expiryDate,
      quantity: medicine.quantity,
      price: medicine.price,
      mrp: medicine.mrp,
      supplier: medicine.supplier,
      parLevel: medicine.parLevel,
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let status = 'in-stock';
    if (formData.quantity === 0) {
      status = 'expired';
    } else if (formData.quantity <= formData.parLevel) {
      status = 'low-stock';
    } else if (isExpired(formData.expiryDate)) {
      status = 'expired';
    } else if (isExpiringSoon(formData.expiryDate)) {
      status = 'expiring-soon';
    }

    const medicineData = {
      id: editingMedicine?.id || Date.now().toString(),
      ...formData,
      status,
      updatedAt: new Date().toISOString(),
      createdAt: editingMedicine?.createdAt || new Date().toISOString(),
    };

    let updatedMedicines;
    if (editingMedicine) {
      updatedMedicines = medicines.map(med => 
        med.id === editingMedicine.id ? medicineData : med
      );
    } else {
      updatedMedicines = [...medicines, medicineData];
    }

    setMedicinesState(updatedMedicines);
    setMedicines(updatedMedicines);
    setShowAddModal(false);
  };

  const handleDeleteMedicine = (id) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      const updatedMedicines = medicines.filter(med => med.id !== id);
      setMedicinesState(updatedMedicines);
      setMedicines(updatedMedicines);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'expiring-soon':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'low-stock':
        return <Package className="w-4 h-4 text-yellow-600" />;
      case 'in-stock':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (medicine) => {
    const { status, expiryDate, quantity } = medicine;
    
    switch (status) {
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {quantity === 0 ? 'Out of Stock' : 'Expired'}
          </span>
        );
      case 'expiring-soon':
        const days = getDaysUntilExpiry(expiryDate);
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Expires in {days} days
          </span>
        );
      case 'low-stock':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Low Stock
          </span>
        );
      case 'in-stock':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            In Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage your medicine inventory and stock levels</p>
        </div>
        <button
          onClick={handleAddMedicine}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">In Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {medicines.filter(m => m.status === 'in-stock').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {medicines.filter(m => m.status === 'low-stock').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Expiring Soon</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {medicines.filter(m => m.status === 'expiring-soon').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Expired</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {medicines.filter(m => m.status === 'expired').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="expiry">All Expiry Issues</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(medicine.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.supplier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medicine.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medicine.batch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(medicine.expiryDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.quantity}</div>
                    <div className="text-xs text-gray-500">Min: {medicine.parLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{medicine.mrp.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost: ₹{medicine.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(medicine)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMedicine(medicine)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <input
                  type="text"
                  required
                  value={formData.batch}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Par Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.parLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, parLevel: parseInt(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <select
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingMedicine ? 'Update' : 'Add'} Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

