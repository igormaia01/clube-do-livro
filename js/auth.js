import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initializeAuth();
  }

  initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.updateUI();
    });
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      this.showMessage('Login realizado com sucesso!', 'success');
      this.hideModal('loginModal');
      return userCredential.user;
    } catch (error) {
      this.showMessage(this.getErrorMessage(error.code), 'error');
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      this.showMessage('Cadastro realizado com sucesso!', 'success');
      this.hideModal('registerModal');
      return userCredential.user;
    } catch (error) {
      this.showMessage(this.getErrorMessage(error.code), 'error');
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
      this.showMessage('Logout realizado com sucesso!', 'success');
    } catch (error) {
      this.showMessage('Erro ao fazer logout', 'error');
    }
  }

  updateUI() {
    const authSection = document.getElementById('authSection');
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    const userName = document.getElementById('userName');

    if (this.currentUser) {
      authSection.classList.add('d-none');
      userInfo.classList.remove('d-none');
      loginBtn.classList.add('d-none');
      userName.textContent =
        this.currentUser.displayName || this.currentUser.email;

      // Show main sections
      this.showSection('home');
    } else {
      authSection.classList.remove('d-none');
      userInfo.classList.add('d-none');
      loginBtn.classList.remove('d-none');

      // Hide main sections
      this.hideAllSections();
    }
  }

  showSection(sectionName) {
    this.hideAllSections();
    const section = document.getElementById(sectionName + 'Section');
    if (section) {
      section.classList.remove('d-none');
      section.classList.add('fade-in');
    }
  }

  hideAllSections() {
    const sections = ['home', 'clubs', 'voting'];
    sections.forEach((section) => {
      const element = document.getElementById(section + 'Section');
      if (element) {
        element.classList.add('d-none');
        element.classList.remove('fade-in');
      }
    });
  }

  showMessage(message, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', alertHTML);

    // Auto remove after 5 seconds
    setTimeout(() => {
      const alert = container.querySelector('.alert');
      if (alert) {
        alert.remove();
      }
    }, 5000);
  }

  hideModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
      modal.hide();
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    };
    return errorMessages[errorCode] || 'Erro desconhecido';
  }
}

// Export instance
export const authManager = new AuthManager();

// Global functions for HTML onclick events
window.showLoginModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('loginModal'));
  modal.show();
};

window.showRegisterModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('registerModal'));
  modal.show();
};

window.logout = () => {
  authManager.logout();
};

window.showSection = (section) => {
  authManager.showSection(section);
};

// Form event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      await authManager.login(email, password);
      e.target.reset();
    } catch (error) {
      console.error('Login error:', error);
    }
  });

  // Register form
  document
    .getElementById('registerForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      try {
        await authManager.register(name, email, password);
        e.target.reset();
      } catch (error) {
        console.error('Register error:', error);
      }
    });
});
