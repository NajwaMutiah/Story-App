import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_WITH_LOCATION: `${CONFIG.BASE_URL}/stories?location=1`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Helper function to create headers
function createHeaders(includeAuth = false, isFormData = false) {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// Get all stories
export async function getStories() {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch stories');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
}

// Get stories with location
export async function getStoriesWithLocation() {
  try {
    const response = await fetch(ENDPOINTS.STORIES_WITH_LOCATION, {
      method: 'GET',
      headers: createHeaders(true),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch stories with location');
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching stories with location:', error);
    throw error;
  }
}

// Add new story
export async function addStory(storyData) {
  try {
    const formData = new FormData();
    formData.append('description', storyData.description);
    formData.append('photo', storyData.photo);
    
    if (storyData.lat && storyData.lon) {
      formData.append('lat', storyData.lat);
      formData.append('lon', storyData.lon);
    }
    
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: createHeaders(true, true),
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add story');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding story:', error);
    throw error;
  }
}

// Register user
export async function registerUser(userData) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to register');
    }
    
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Login user
export async function loginUser(credentials) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to login');
    }
    
    // Store auth token
    if (result.loginResult && result.loginResult.token) {
      localStorage.setItem('authToken', result.loginResult.token);
    }
    
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Logout user
export function logoutUser() {
  localStorage.removeItem('authToken');
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getAuthToken();
}