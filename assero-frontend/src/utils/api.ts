const API_BASE_URL = 'http://localhost:4000';

export const api = {
  // Authentication
  async getNonce(address: string) {
    const response = await fetch(`${API_BASE_URL}/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    return response.json();
  },

  async verifySignature(address: string, signature: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature })
    });
    return response.json();
  },

  // File Operations
  async uploadFile(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  async getFiles(token: string) {
    const response = await fetch(`${API_BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.json();
  }
};