import { authManager } from './auth.js';
import { dbManager } from './database.js';

class App {
  constructor() {
    this.currentClub = null;
    this.userClubs = [];
    this.init();
  }

  init() {
    this.hideLoadingSpinner();
    this.setupEventListeners();
    this.loadUserData();
  }

  hideLoadingSpinner() {
    setTimeout(() => {
      const spinner = document.getElementById('loadingSpinner');
      if (spinner) {
        spinner.style.display = 'none';
      }
    }, 1000);
  }

  setupEventListeners() {
    // Create club form
    document
      .getElementById('createClubForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateClub(e);
      });

    // Auth state listener
    authManager.auth?.onAuthStateChanged((user) => {
      if (user) {
        this.loadUserData();
      }
    });
  }

  async loadUserData() {
    if (!authManager.currentUser) return;

    try {
      // Load user clubs
      this.userClubs = await dbManager.getUserClubs(
        authManager.currentUser.uid
      );
      this.renderClubs();
      this.updateStatistics();

      // Load home data
      await this.loadHomeData();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async loadHomeData() {
    if (this.userClubs.length === 0) return;

    // Get current book from first club (or main club)
    const mainClub = this.userClubs[0];
    if (mainClub?.currentBook) {
      this.renderWeeklyBook(mainClub.currentBook);
    }

    // Load active voting
    if (mainClub?.activeVoting) {
      const voting = await dbManager.getVoting(mainClub.activeVoting);
      if (voting) {
        this.renderActiveVoting(voting);
      }
    }

    // Load recent activity
    this.renderRecentActivity();
  }

  renderWeeklyBook(book) {
    const weeklyBookElement = document.getElementById('weeklyBook');
    if (!book) {
      weeklyBookElement.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-book fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhum livro definido para esta semana</p>
                </div>
            `;
      return;
    }

    weeklyBookElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-auto">
                    <img src="${
                      book.cover ||
                      'https://via.placeholder.com/80x120/007bff/ffffff?text=Livro'
                    }" 
                         alt="${book.title}" class="book-cover">
                </div>
                <div class="col">
                    <h5 class="mb-1">${book.title}</h5>
                    <p class="text-muted mb-1">por ${book.author}</p>
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        Definido em ${this.formatDate(book.setAt)}
                    </small>
                </div>
                <div class="col-auto">
                    <button class="btn btn-outline-success btn-sm" onclick="app.markBookAsFinished()">
                        <i class="fas fa-check me-1"></i>Concluído
                    </button>
                </div>
            </div>
        `;
  }

  renderActiveVoting(voting) {
    const activeVotingElement = document.getElementById('activeVoting');
    if (!voting || !voting.isActive) {
      activeVotingElement.innerHTML =
        '<p class="text-muted small">Nenhuma votação ativa</p>';
      return;
    }

    const totalVotes = Object.keys(voting.votes || {}).length;
    activeVotingElement.innerHTML = `
            <h6 class="mb-2">${voting.title}</h6>
            <p class="small text-muted mb-2">${
              voting.books?.length || 0
            } opções</p>
            <p class="small mb-2">
                <i class="fas fa-users me-1"></i>
                ${totalVotes} voto${totalVotes !== 1 ? 's' : ''}
            </p>
            <button class="btn btn-primary btn-sm w-100" onclick="app.showVotingDetails('${
              voting.id
            }')">
                Ver Votação
            </button>
        `;
  }

  renderRecentActivity() {
    const recentActivityElement = document.getElementById('recentActivity');

    // Mock recent activity for now
    const activities = [
      {
        type: 'book_finished',
        text: 'O clube "Leitores Unidos" terminou de ler "1984"',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        type: 'voting_created',
        text: 'Nova votação criada: "Próximo livro de ficção científica"',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        type: 'member_joined',
        text: 'João Silva entrou no clube "Clássicos Modernos"',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    if (activities.length === 0) {
      recentActivityElement.innerHTML =
        '<p class="text-muted">Nenhuma atividade recente</p>';
      return;
    }

    recentActivityElement.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item slide-in">
                <div class="d-flex justify-content-between align-items-start">
                    <p class="mb-1">${activity.text}</p>
                    <small class="activity-time">${this.getTimeAgo(
                      activity.time
                    )}</small>
                </div>
            </div>
        `
      )
      .join('');
  }

  renderClubs() {
    const clubsListElement = document.getElementById('clubsList');

    if (this.userClubs.length === 0) {
      clubsListElement.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Você ainda não faz parte de nenhum clube</h5>
                    <p class="text-muted">Crie um novo clube ou use um código de convite para participar</p>
                    <button class="btn btn-primary" onclick="app.showCreateClubModal()">
                        <i class="fas fa-plus me-2"></i>Criar Primeiro Clube
                    </button>
                </div>
            `;
      return;
    }

    clubsListElement.innerHTML = this.userClubs
      .map(
        (club) => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card club-card h-100" onclick="app.selectClub('${
                  club.id
                }')">
                    <div class="card-body">
                        <h5 class="card-title">${club.name}</h5>
                        <p class="card-text text-muted">${
                          club.description || 'Sem descrição'
                        }</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i>
                                ${club.members?.length || 0} membros
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-book me-1"></i>
                                ${club.booksRead?.length || 0} livros
                            </small>
                        </div>
                        ${
                          club.currentBook
                            ? `
                            <div class="mt-2">
                                <small class="text-success">
                                    <i class="fas fa-book-open me-1"></i>
                                    Lendo: ${club.currentBook.title}
                                </small>
                            </div>
                        `
                            : ''
                        }
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  updateStatistics() {
    const totalMembers = this.userClubs.reduce(
      (total, club) => total + (club.members?.length || 0),
      0
    );
    const totalBooks = this.userClubs.reduce(
      (total, club) => total + (club.booksRead?.length || 0),
      0
    );
    const totalVotings = this.userClubs.length; // Simplified count

    document.getElementById('memberCount').textContent = totalMembers;
    document.getElementById('booksRead').textContent = totalBooks;
    document.getElementById('votingCount').textContent = totalVotings;
  }

  async handleCreateClub(e) {
    if (!authManager.currentUser) return;

    const formData = new FormData(e.target);
    const clubData = {
      name:
        formData.get('clubName') || document.getElementById('clubName').value,
      description:
        formData.get('clubDescription') ||
        document.getElementById('clubDescription').value,
      inviteCode: dbManager.generateInviteCode(),
    };

    try {
      const newClub = await dbManager.createClub(
        clubData,
        authManager.currentUser.uid
      );
      this.userClubs.push(newClub);
      this.renderClubs();

      authManager.showMessage('Clube criado com sucesso!', 'success');
      authManager.hideModal('createClubModal');
      e.target.reset();
    } catch (error) {
      console.error('Error creating club:', error);
      authManager.showMessage('Erro ao criar clube', 'error');
    }
  }

  selectClub(clubId) {
    this.currentClub = this.userClubs.find((club) => club.id === clubId);
    // Here you could navigate to a detailed club view
    console.log('Selected club:', this.currentClub);
  }

  async markBookAsFinished() {
    if (!this.currentClub || !this.currentClub.currentBook) return;

    try {
      await dbManager.addFinishedBook(
        this.currentClub.id,
        this.currentClub.currentBook
      );
      await this.loadUserData();
      authManager.showMessage('Livro marcado como concluído!', 'success');
    } catch (error) {
      console.error('Error marking book as finished:', error);
      authManager.showMessage('Erro ao marcar livro como concluído', 'error');
    }
  }

  showVotingDetails(votingId) {
    // Navigate to voting section and show specific voting
    authManager.showSection('voting');
    // Load voting details here
  }

  // Utility functions
  formatDate(timestamp) {
    if (!timestamp) return 'Data não disponível';

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('pt-BR');
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  }
}

// Global functions
window.showCreateClubModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('createClubModal'));
  modal.show();
};

// Initialize app
const app = new App();
window.app = app;

export default app;
