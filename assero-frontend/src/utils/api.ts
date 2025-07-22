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
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async getFiles() {
    const response = await fetch(`${API_BASE_URL}/files`);
    return response.json();
  }
};

// Example file upload usage
const handleUpload = async (file: File) => {
  try {
    const result = await api.uploadFile(file);
    console.log('File uploaded:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Example file retrieval
const getFiles = async () => {
  try {
    const files = await api.getFiles();
    console.log('Files retrieved:', files);
  } catch (error) {
    console.error('Failed to get files:', error);
  }
};