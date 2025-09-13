const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('pharmacy_token');
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: createHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }
};

// Medicines API
export const medicinesAPI = {
  getAll: async (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest(`/medicines${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/medicines/${id}`);
  },

  create: async (medicineData) => {
    return apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData)
    });
  },

  update: async (id, medicineData) => {
    return apiRequest(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicineData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/medicines/${id}`, {
      method: 'DELETE'
    });
  },

  getByStatus: async (status) => {
    return apiRequest(`/medicines/status/${status}`);
  },

  getExpiring: async (days = 30) => {
    return apiRequest(`/medicines/expiring/${days}`);
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/categories');
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  update: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

// Suppliers API
export const suppliersAPI = {
  getAll: async () => {
    return apiRequest('/suppliers');
  },

  getById: async (id) => {
    return apiRequest(`/suppliers/${id}`);
  },

  create: async (supplierData) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },

  update: async (id, supplierData) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  }
};

// Sales API
export const salesAPI = {
  getAll: async (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest(`/sales${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/sales/${id}`);
  },

  create: async (saleData) => {
    return apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData)
    });
  },

  update: async (id, saleData) => {
    return apiRequest(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/sales/${id}`, {
      method: 'DELETE'
    });
  }
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: async (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiRequest(`/prescriptions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/prescriptions/${id}`);
  },

  create: async (prescriptionData) => {
    return apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData)
    });
  },

  update: async (id, prescriptionData) => {
    return apiRequest(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prescriptionData)
    });
  },

  delete: async (id) => {
    return apiRequest(`/prescriptions/${id}`, {
      method: 'DELETE'
    });
  },

  dispense: async (id, dispenseData) => {
    return apiRequest(`/prescriptions/${id}/dispense`, {
      method: 'POST',
      body: JSON.stringify(dispenseData)
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/dashboard/stats');
  },

  getSalesChart: async (days) => {
    return apiRequest(`/dashboard/sales-chart${days ? `?days=${days}` : ''}`);
  },

  getTopMedicines: async (limit, days) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (days) params.append('days', days.toString());
    return apiRequest(`/dashboard/top-medicines${params.toString() ? `?${params.toString()}` : ''}`);
  },

  getInventoryDistribution: async () => {
    return apiRequest('/dashboard/inventory-distribution');
  },

  getAlerts: async () => {
    return apiRequest('/dashboard/alerts');
  }
};

// Reports API
export const reportsAPI = {
  getSalesReport: async (startDate, endDate) => {
    return apiRequest(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
  },

  getInventoryReport: async () => {
    return apiRequest('/reports/inventory');
  },

  getPrescriptionReport: async (startDate, endDate) => {
    return apiRequest(`/reports/prescriptions?startDate=${startDate}&endDate=${endDate}`);
  },

  getSupplierReport: async () => {
    return apiRequest('/reports/suppliers');
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    return apiRequest('/notifications');
  },

  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT'
    });
  },

  delete: async (id) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }
};

export default {
  auth: authAPI,
  medicines: medicinesAPI,
  categories: categoriesAPI,
  suppliers: suppliersAPI,
  sales: salesAPI,
  prescriptions: prescriptionsAPI,
  dashboard: dashboardAPI,
  reports: reportsAPI,
  notifications: notificationsAPI
};

