// api/client.ts
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const authHeader = this.getAuthHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  private getAuthHeader(): { Authorization?: string } {
    // In a real app, you'd retrieve the JWT token from storage
    // For now, we'll return a placeholder
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Contacts API
  getContacts = (): Promise<any[]> => {
    return this.request('/contacts');
  };

  createContact = (contactData: { name: string; ref_user_id?: number }): Promise<any> => {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  };

  getContact = (id: number): Promise<any> => {
    return this.request(`/contacts/${id}`);
  };

  updateContact = (id: number, contactData: { name?: string; ref_user_id?: number }): Promise<any> => {
    return this.request(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contactData),
    });
  };

  deleteContact = (id: number): Promise<any> => {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  };

  getContactBalance = (id: number, currencyId?: number): Promise<any> => {
    const query = currencyId ? `?currencyId=${currencyId}` : '';
    return this.request(`/contacts/${id}/balance${query}`);
  };

  // Transactions API
  topupBalance = (transactionData: { contact_id: number; currency_id: number; amount: number }): Promise<any> => {
    return this.request('/transactions/topup', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  };

  withdrawBalance = (transactionData: { contact_id: number; currency_id: number; amount: number }): Promise<any> => {
    return this.request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  };

  cancelTransaction = (id: number): Promise<any> => {
    return this.request(`/transactions/${id}/cancel`, {
      method: 'POST',
    });
  };

  // Currency API
  getCurrencies = (): Promise<any[]> => {
    return this.request('/currency');
  };

  createCurrency = (currencyData: { name: string; symbol: string }): Promise<any> => {
    return this.request('/currency', {
      method: 'POST',
      body: JSON.stringify(currencyData),
    });
  };

  updateCurrency = (id: number, currencyData: { name?: string; symbol?: string }): Promise<any> => {
    return this.request(`/currency/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(currencyData),
    });
  };

  deleteCurrency = (id: number): Promise<any> => {
    return this.request(`/currency/${id}`, {
      method: 'DELETE',
    });
  };
}

export const apiClient = new ApiClient();