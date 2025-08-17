// Configuração alternativa usando JSONBin.io
// Use esta configuração se preferir não usar Firebase

class JSONBinManager {
  constructor() {
    this.config = {
      masterKey: 'sua-master-key-aqui', // Obtenha em jsonbin.io
      binId: 'seu-bin-id-aqui', // ID do seu bin
      apiUrl: 'https://api.jsonbin.io/v3',
    };
  }

  async makeRequest(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Master-Key': this.config.masterKey,
    };

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}${endpoint}`, options);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('JSONBin request error:', error);
      throw error;
    }
  }

  async getData() {
    try {
      const result = await this.makeRequest(
        'GET',
        `/b/${this.config.binId}/latest`
      );
      return result.record || { clubs: [], votes: [], users: [] };
    } catch (error) {
      console.error('Error getting data:', error);
      return { clubs: [], votes: [], users: [] };
    }
  }

  async saveData(data) {
    try {
      const result = await this.makeRequest(
        'PUT',
        `/b/${this.config.binId}`,
        data
      );
      return result.success;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // Simular autenticação simples
  async login(email, password) {
    const data = await this.getData();
    const user = data.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Credenciais inválidas');
  }

  async register(name, email, password) {
    const data = await this.getData();

    // Verificar se email já existe
    if (data.users.find((u) => u.email === email)) {
      throw new Error('Email já cadastrado');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Em produção, use hash!
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    await this.saveData(data);

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  async createClub(clubData, userId) {
    const data = await this.getData();

    const newClub = {
      id: Date.now().toString(),
      ...clubData,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      members: [userId],
      currentBook: null,
      booksRead: [],
      activeVoting: null,
    };

    data.clubs.push(newClub);
    await this.saveData(data);

    return newClub;
  }

  async getUserClubs(userId) {
    const data = await this.getData();
    return data.clubs.filter((club) => club.members.includes(userId));
  }

  async createVoting(clubId, votingData, userId) {
    const data = await this.getData();

    const newVoting = {
      id: Date.now().toString(),
      ...votingData,
      clubId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      votes: {},
      isActive: true,
    };

    data.votes.push(newVoting);

    // Atualizar clube com votação ativa
    const club = data.clubs.find((c) => c.id === clubId);
    if (club) {
      club.activeVoting = newVoting.id;
    }

    await this.saveData(data);
    return newVoting;
  }

  async vote(votingId, userId, bookIndex) {
    const data = await this.getData();
    const voting = data.votes.find((v) => v.id === votingId);

    if (voting) {
      voting.votes[userId] = bookIndex;
      await this.saveData(data);
      return true;
    }
    return false;
  }
}

// Para usar JSONBin em vez do Firebase:
// 1. Comente a importação do Firebase em firebase-config.js
// 2. Descomente a seção JSONBIN_CONFIG
// 3. Crie uma conta em jsonbin.io
// 4. Obtenha sua Master Key e Bin ID
// 5. Use esta classe em vez do Firebase

export const jsonBinManager = new JSONBinManager();
