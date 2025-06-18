import { reviewApi, placeApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
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
  try {
    const reviews = await reviewApi.getAllReviews();
    const userReviews = reviews.filter(r => r.userId === currentUser.id);
    const places = await placeApi.getAllPlaces();
    
    const container = document.getElementById('user-reviews');
    
    if (userReviews.length === 0) {
      container.innerHTML = '<p>Você ainda não fez nenhuma avaliação.</p>';
      return;
    }
    
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
    container.innerHTML = '<p>Ocorreu um erro ao carregar suas avaliações.</p>';
  }
});

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