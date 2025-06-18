const API_URL = 'http://localhost:5000/api';

// Função utilitária para requisições HTTP
async function fetchData(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Erro na requisição');
    }
    
    return responseData;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// API para autenticação
export const authApi = {
  register: (name, email, password) => {
    return fetchData(`${API_URL}/auth/register`, 'POST', { name, email, password });
  },
  
  login: (email, password) => {
    return fetchData(`${API_URL}/auth/login`, 'POST', { email, password });
  }
};

// API para locais
export const placeApi = {
  getAllPlaces: () => {
    return fetchData(`${API_URL}/places`);
  }
};

// API para avaliações
export const reviewApi = {
  getReviewsByPlace: (placeId) => {
    return fetchData(`${API_URL}/reviews/${placeId}`);
  },
  
  createReview: (userId, placeId, rating, comment) => {
    return fetchData(`${API_URL}/reviews`, 'POST', { userId, placeId, rating, comment });
  }
};