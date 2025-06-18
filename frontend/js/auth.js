import { authApi } from './api.js';

// Verificar se o usuário está logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser) {
    if (document.getElementById('auth-buttons')) {
      document.getElementById('auth-buttons').style.display = 'none';
    }
    if (document.getElementById('user-menu')) {
      document.getElementById('user-menu').style.display = 'flex';
      document.getElementById('username').textContent = currentUser.name;
    }
  } else {
    // Se não estiver logado e estiver em uma página que requer autenticação, redirecionar
    if (window.location.pathname.endsWith('profile.html')) {
      window.location.href = 'login.html';
    }
  }
  
  // Configurar formulário de login
  if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        const user = await authApi.login(email, password);
        
        // Salvar usuário no localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
      } catch (error) {
        showAlert('login-alert', error.message || 'Erro ao fazer login', 'error');
      }
    });
  }
  
  // Configurar formulário de registro
  if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      try {
        await authApi.register(name, email, password);
        showAlert('register-alert', 'Cadastro realizado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } catch (error) {
        showAlert('register-alert', error.message || 'Erro ao registrar', 'error');
      }
    });
  }
});

// Função global para logout
window.logout = function() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
};

function showAlert(elementId, message, type) {
  const alertDiv = document.getElementById(elementId);
  alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  
  setTimeout(() => {
    alertDiv.innerHTML = '';
  }, 3000);
}