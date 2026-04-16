import { API_BASE } from '../config.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`
  };
};

export async function getStories() {
  try {
    const response = await fetch(`${API_BASE}/stories?page=1&size=10&location=1`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data.listStory || [];
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export async function postStory(formData) {
  try {
    const response = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error('Error posting story:', error);
    throw error;
  }
}
