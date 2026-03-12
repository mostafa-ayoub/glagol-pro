// Glagol Pro API Client
class GlagolAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('glagol_token') || null;
    this.user = JSON.parse(localStorage.getItem('glagol_user') || 'null');
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(role, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, password })
      });

      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('glagol_token', this.token);
      localStorage.setItem('glagol_user', JSON.stringify(this.user));

      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('glagol_token');
      localStorage.removeItem('glagol_user');
    }
  }

  async getCurrentUser() {
    try {
      const data = await this.request('/auth/me');
      this.user = data.user;
      localStorage.setItem('glagol_user', JSON.stringify(this.user));
      return data.user;
    } catch (error) {
      // Token might be expired, clear it
      this.logout();
      throw error;
    }
  }

  // Order methods
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders?${query}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    });
  }

  async updateOrderWorkflow(id, workflow) {
    return this.request(`/orders/${id}/workflow`, {
      method: 'PATCH',
      body: JSON.stringify({ workflow })
    });
  }

  async addOrderPayment(id, amount) {
    return this.request(`/orders/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  async getOrderStats() {
    return this.request('/orders/stats/dashboard');
  }

  // Service methods
  async getServices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/services?${query}`);
  }

  async getService(id) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(id, serviceData) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    });
  }

  async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  async reorderServices(orders) {
    return this.request('/services/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    });
  }

  async toggleService(id) {
    return this.request(`/services/${id}/toggle`, {
      method: 'PATCH'
    });
  }

  // Company methods
  async getCompanies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/companies?${query}`);
  }

  async getCompany(id) {
    return this.request(`/companies/${id}`);
  }

  async createCompany(companyData) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  }

  async updateCompany(id, companyData) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData)
    });
  }

  async deleteCompany(id) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE'
    });
  }

  async getCompanyDebts() {
    return this.request('/companies/debts/list');
  }

  async updateCompanyFinancials(id, financials) {
    return this.request(`/companies/${id}/financials`, {
      method: 'PATCH',
      body: JSON.stringify(financials)
    });
  }

  async getCompanyStatement(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/companies/${id}/statement?${query}`);
  }

  // Staff methods
  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff?${query}`);
  }

  async getStaffMember(id) {
    return this.request(`/staff/${id}`);
  }

  async createStaffMember(staffData) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  }

  async updateStaffMember(id, staffData) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  }

  async deleteStaffMember(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }

  async changeStaffPassword(id, password) {
    return this.request(`/staff/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password })
    });
  }

  async toggleStaffMember(id) {
    return this.request(`/staff/${id}/toggle`, {
      method: 'PATCH'
    });
  }

  async updateStaffPermissions(id, permissions) {
    return this.request(`/staff/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions })
    });
  }

  async getStaffList() {
    return this.request('/staff/list');
  }

  // Dashboard methods
  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getSystemStats() {
    return this.request('/dashboard/stats/system');
  }

  async saveDailyNotes(notes) {
    return this.request('/dashboard/daily-notes', {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    });
  }

  async getFinancialReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dashboard/reports/financial?${query}`);
  }

  // Settings methods
  async getSettings() {
    return this.request('/dashboard');
  }

  async updateSettings(settingsData) {
    return this.request('/dashboard', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  async updatePasswords(passwords) {
    return this.request('/dashboard/passwords', {
      method: 'PATCH',
      body: JSON.stringify({ passwords })
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  hasPermission(permission) {
    return this.user && this.user.permissions && this.user.permissions[permission];
  }

  hasRole(role) {
    return this.user && this.user.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isReception() {
    return this.hasRole('reception');
  }

  isTranslator() {
    return this.hasRole('translator');
  }
}

// Create global API instance
const API = new GlagolAPI();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlagolAPI;
} else {
  window.GlagolAPI = GlagolAPI;
  window.API = API;
}
