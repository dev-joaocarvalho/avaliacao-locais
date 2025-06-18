import { placeApi, reviewApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Se não estiver logado, redirecionar para login
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  
  // Carregar locais
  try {
    const places = await placeApi.getAllPlaces();
    populatePlacesDropdown(places);
    renderPlaces(places);
  } catch (error) {
    console.error('Erro ao carregar locais:', error);
  }
  
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
  
  // Configurar envio de avaliação
  document.getElementById('submit-review').addEventListener('click', async () => {
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
      await reviewApi.createReview(
        currentUser.id,
        placeId,
        rating,
        comment
      );
      
      alert('Avaliação enviada com sucesso!');
      
      // Limpar o formulário
      document.getElementById('review-place').value = '';
      document.getElementById('review-comment').value = '';
      stars.forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
      });
      document.getElementById('rating-value').value = 0;
      
      // Recarregar locais para atualizar avaliações
      const places = await placeApi.getAllPlaces();
      renderPlaces(places);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação: ' + error.message);
    }
  });
});

function populatePlacesDropdown(places) {
  const select = document.getElementById('review-place');
  select.innerHTML = '<option value="">Selecione um local</option>';
  
  places.forEach(place => {
    const option = document.createElement('option');
    option.value = place.id;
    option.textContent = place.name;
    select.appendChild(option);
  });
}

function renderPlaces(places) {
  const container = document.getElementById('places-container');
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

// Função global para visualizar avaliações
window.viewPlaceReviews = async function(placeId) {
  try {
    const reviews = await reviewApi.getReviewsByPlace(placeId);
    const place = (await placeApi.getAllPlaces()).find(p => p.id === placeId);
    
    let reviewsHtml = '';
    if (reviews.length === 0) {
      reviewsHtml = '<p>Este local ainda não possui avaliações.</p>';
    } else {
      reviews.forEach(review => {
        reviewsHtml += `
          <div class="review-card">
            <div class="review-header">
              <div class="user-avatar">${review.userId}</div>
              <div class="review-info">
                <div class="review-user">Usuário ${review.userId}</div>
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
    
    alert(`
      Avaliações de ${place.name}
      ----------------------------------
      ${reviewsHtml.replace(/<[^>]*>/g, '')}
    `);
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    alert('Erro ao carregar avaliações: ' + error.message);
  }
};

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