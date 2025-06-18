const API_URL = 'http://localhost:5000/api';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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

// Funções de autenticação
async function registerUser(name, email, password) {
  try {
    const response = await fetchData(`${API_URL}/auth/register`, 'POST', { name, email, password });
    return response;
  } catch (error) {
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const user = await fetchData(`${API_URL}/auth/login`, 'POST', { email, password });
    return user;
  } catch (error) {
    throw error;
  }
}

// Funções de locais
async function getPlaces() {
  try {
    const places = await fetchData(`${API_URL}/places`);
    return places;
  } catch (error) {
    throw error;
  }
}

// Funções de avaliações
async function getReviewsByPlace(placeId) {
  try {
    const reviews = await fetchData(`${API_URL}/reviews/${placeId}`);
    return reviews;
  } catch (error) {
    throw error;
  }
}

async function getAllReviews() {
  try {
    const reviews = await fetchData(`${API_URL}/reviews`);
    return reviews;
  } catch (error) {
    throw error;
  }
}

async function createReview(userId, userName, placeId, rating, comment) {
  try {
    const newReview = await fetchData(`${API_URL}/reviews`, 'POST', { 
      userId, 
      userName,
      placeId, 
      rating, 
      comment 
    });
    return newReview;
  } catch (error) {
    throw error;
  }
}

async function getUserReviewForPlace(userId, placeId) {
  try {
    const reviews = await getAllReviews();
    return reviews.find(r => r.userId === userId && r.placeId === placeId);
  } catch (error) {
    console.error('Erro ao buscar avaliação existente:', error);
    return null;
  }
}

// Funções auxiliares
function showAlert(elementId, message, type) {
  const alertDiv = document.getElementById(elementId);
  if (!alertDiv) return;
  
  alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  
  setTimeout(() => {
    alertDiv.innerHTML = '';
  }, 3000);
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  updateAuthUI();
  window.location.href = 'login.html';
}

function updateAuthUI() {
  if (currentUser) {
    if (document.getElementById('auth-buttons')) {
      document.getElementById('auth-buttons').style.display = 'none';
    }
    if (document.getElementById('user-menu')) {
      document.getElementById('user-menu').style.display = 'flex';
      document.getElementById('username').textContent = currentUser.name;
    }
  } else {
    if (document.getElementById('auth-buttons')) {
      document.getElementById('auth-buttons').style.display = 'block';
    }
    if (document.getElementById('user-menu')) {
      document.getElementById('user-menu').style.display = 'none';
    }
  }
}

function generateStarIcons(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

function getCategoryIcon(category) {
  switch(category.toLowerCase()) {
    case 'restaurante':
      return 'fas fa-utensils';
    case 'público':
      return 'fas fa-park';
    case 'educação':
      return 'fas fa-school';
    case 'comércio':
      return 'fas fa-shopping-cart';
    case 'cultura':
      return 'fas fa-theater-masks';
    default:
      return 'fas fa-map-marker-alt';
  }
}

// Funções de renderização
function renderPlaces(places) {
  const container = document.getElementById('places-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  places.forEach(place => {
    const card = document.createElement('div');
    card.className = 'place-card';
    
    // Ícone baseado na categoria
    const icon = getCategoryIcon(place.category);
    
    card.innerHTML = `
      <div class="place-img">
        <i class="${icon}"></i>
      </div>
      <div class="place-content">
        <h3 class="place-title">${place.name}</h3>
        <span class="place-category">${place.category}</span>
        <p class="place-address"><i class="fas fa-map-marker-alt"></i> ${place.address}</p>
        <button class="btn btn-outline" onclick="viewPlaceReviews(${place.id})">Ver Avaliações</button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function populatePlacesDropdown(places) {
  const select = document.getElementById('review-place');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecione um local</option>';
  
  places.forEach(place => {
    const option = document.createElement('option');
    option.value = place.id;
    option.textContent = place.name;
    select.appendChild(option);
  });
}

async function loadUserReviews() {
  if (!currentUser) return;
  
  try {
    const reviews = await getAllReviews();
    const userReviews = reviews.filter(r => r.userId === currentUser.id);
    const places = await getPlaces();
    
    const container = document.getElementById('user-reviews');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userReviews.length === 0) {
      container.innerHTML = '<p>Você ainda não fez nenhuma avaliação.</p>';
      return;
    }
    
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    userReviews.forEach(review => {
      const place = places.find(p => p.id === review.placeId);
      if (!place) return;
      
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-card';
      
      reviewCard.innerHTML = `
        <div class="review-header">
          <div class="user-avatar">${initials[0]}</div>
          <div class="review-info">
            <div class="review-user">${place.name}</div>
            <div class="review-date">${review.date}</div>
          </div>
          <div class="rating">
            ${generateStarIcons(review.rating)}
          </div>
        </div>
        <p>${review.comment}</p>
      `;
      
      container.appendChild(reviewCard);
    });
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    if (container) {
      container.innerHTML = '<p>Ocorreu um erro ao carregar suas avaliações.</p>';
    }
  }
}

// Página de login
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const user = await loginUser(email, password);
      
      // Salvar usuário no localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      currentUser = user;
      updateAuthUI();
      
      window.location.href = 'index.html';
    } catch (error) {
      showAlert('login-alert', error.message || 'Erro ao fazer login', 'error');
    }
  });
}

// Página de registro
if (document.getElementById('register-form')) {
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
      await registerUser(name, email, password);
      showAlert('register-alert', 'Cadastro realizado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      showAlert('register-alert', error.message || 'Erro ao registrar', 'error');
    }
  });
}

// Página inicial
if (document.getElementById('places-container')) {
  // Carregar locais
  (async function() {
    try {
      const places = await getPlaces();
      renderPlaces(places);
      populatePlacesDropdown(places);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    }
  })();
  
  // Configurar estrelas de avaliação
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const value = parseInt(this.getAttribute('data-value'));
      document.getElementById('rating-value').value = value;
      
      stars.forEach((s, index) => {
        if (index < value) {
          s.classList.remove('far');
          s.classList.add('fas', 'active');
        } else {
          s.classList.remove('fas', 'active');
          s.classList.add('far');
        }
      });
    });
  });
  
  // Quando o local selecionado mudar
  if (document.getElementById('review-place')) {
    document.getElementById('review-place').addEventListener('change', async function() {
      const placeId = parseInt(this.value);
      if (!placeId || !currentUser) return;
      
      try {
        const existingReview = await getUserReviewForPlace(currentUser.id, placeId);
        
        if (existingReview) {
          // Preencher a avaliação existente
          document.getElementById('rating-value').value = existingReview.rating;
          
          // Atualizar as estrelas
          const stars = document.querySelectorAll('.star');
          stars.forEach((star, index) => {
            if (index < existingReview.rating) {
              star.classList.remove('far');
              star.classList.add('fas', 'active');
            } else {
              star.classList.remove('fas', 'active');
              star.classList.add('far');
            }
          });
          
          document.getElementById('review-comment').value = existingReview.comment;
          
          // Alterar texto do botão
          document.getElementById('submit-review').textContent = 'Atualizar Avaliação';
        } else {
          // Limpar o formulário se não houver avaliação
          document.getElementById('rating-value').value = 0;
          const stars = document.querySelectorAll('.star');
          stars.forEach(star => {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
          });
          document.getElementById('review-comment').value = '';
          
          // Restaurar texto do botão
          document.getElementById('submit-review').textContent = 'Enviar Avaliação';
        }
      } catch (error) {
        console.error('Erro ao carregar avaliação existente:', error);
      }
    });
  }
  
  // Configurar envio de avaliação
  document.getElementById('submit-review').addEventListener('click', async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para avaliar um local');
      window.location.href = 'login.html';
      return;
    }
    
    const placeId = parseInt(document.getElementById('review-place').value);
    const rating = parseInt(document.getElementById('rating-value').value);
    const comment = document.getElementById('review-comment').value.trim();
    
    if (!placeId) {
      alert('Selecione um local');
      return;
    }
    
    if (!rating) {
      alert('Selecione uma avaliação');
      return;
    }
    
    if (!comment) {
      alert('Digite um comentário');
      return;
    }
    
    try {
      const response = await createReview(
        currentUser.id,
        currentUser.name, // Inclui o nome do usuário
        placeId,
        rating,
        comment
      );
      
      // Verificar se é atualização ou nova avaliação
      const isUpdate = response.message.includes('atualizada');
      
      alert(isUpdate ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!');
      
      // Alterar texto do botão para "Atualizar Avaliação" após o envio
      document.getElementById('submit-review').textContent = 'Atualizar Avaliação';
      
      // Recarregar avaliações no perfil se estiver visível
      if (window.location.pathname.endsWith('profile.html')) {
        await loadUserReviews();
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação: ' + error.message);
    }
  });
}

// Página de perfil
if (document.getElementById('profile-avatar')) {
  (async function() {
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    
    // Atualizar informações do usuário
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Gerar iniciais para o avatar
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('profile-avatar').textContent = initials.substring(0, 2);
    
    // Carregar avaliações do usuário
    await loadUserReviews();
  })();
}

// Função global para visualizar avaliações
window.viewPlaceReviews = async function(placeId) {
  try {
    const reviews = await getReviewsByPlace(placeId);
    const places = await getPlaces();
    const place = places.find(p => p.id === placeId);
    
    let reviewsHtml = '';
    if (reviews.length === 0) {
      reviewsHtml = '<p>Este local ainda não possui avaliações.</p>';
    } else {
      reviews.forEach(review => {
        // Usar a primeira letra do nome para o avatar
        const userInitial = review.userName ? review.userName.charAt(0) : 'U';
        
        reviewsHtml += `
          <div class="review-card">
            <div class="review-header">
              <div class="user-avatar">${userInitial}</div>
              <div class="review-info">
                <div class="review-user">${review.userName || 'Usuário ' + review.userId}</div>
                <div class="review-date">${review.date}</div>
              </div>
              <div class="rating">
                ${generateStarIcons(review.rating)}
              </div>
            </div>
            <p>${review.comment}</p>
          </div>
        `;
      });
    }
    
    // Criar um modal para mostrar as avaliações
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    modalContent.innerHTML = `
      <h2>Avaliações de ${place.name}</h2>
      <div>${reviewsHtml}</div>
      <button style="margin-top: 20px; padding: 8px 16px; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">Fechar</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Botão para fechar o modal
    const closeButton = modalContent.querySelector('button');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    alert('Erro ao carregar avaliações: ' + error.message);
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  updateAuthUI();
  window.logout = logout;
});