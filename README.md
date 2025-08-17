# Clube do Livro 📚

Uma aplicação web simples e elegante para gerenciar clubes de leitura, com sistema de votação para próximos livros e gerenciamento de membros.

## 🎯 Funcionalidades

- ✅ Criar e gerenciar clubes do livro
- ✅ Definir livro da semana
- ✅ Sistema de convites para novos membros
- ✅ Sistema de votação para próximos livros
- ✅ Visualização dos resultados da votação
- ✅ Autenticação de usuários
- ✅ Interface responsiva e moderna

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5
- **Backend/Database:** Firebase (Firestore + Authentication)
- **Deploy:** GitHub Pages
- **Ícones:** Font Awesome

## 🚀 Como executar localmente

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/clube-do-livro.git
   cd clube-do-livro
   ```

2. **Configure o Firebase:**

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Copie as configurações do projeto

3. **Configure as credenciais:**

   - Abra o arquivo `js/firebase-config.js`
   - Substitua as configurações de exemplo pelas suas credenciais do Firebase

4. **Execute um servidor local:**

   ```bash
   # Com Python
   python -m http.server 8000

   # Com Node.js (http-server)
   npx http-server

   # Com PHP
   php -S localhost:8000
   ```

5. **Acesse:** `http://localhost:8000`

## 📦 Deploy no GitHub Pages

1. **Faça push do código para o GitHub**

2. **Configure o GitHub Pages:**

   - Vá em Settings > Pages no seu repositório
   - Selecione "Deploy from a branch"
   - Escolha "main" branch e "/" (root)

3. **Configure o domínio personalizado (opcional):**
   - Adicione um arquivo `CNAME` com seu domínio
   - Configure DNS para apontar para `seu-usuario.github.io`

## ⚙️ Configuração do Firebase

### Authentication

```javascript
// Ative os provedores:
- Email/Password ✅
- Google (opcional)
```

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clubs collection
    match /clubs/{clubId} {
      allow read, write: if request.auth != null
        && (request.auth.uid in resource.data.members
            || request.auth.uid == resource.data.createdBy);
    }

    // Votes collection
    match /votes/{voteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Estrutura do Projeto

```
clube-do-livro/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos customizados
├── js/
│   ├── firebase-config.js  # Configurações do Firebase
│   ├── auth.js            # Gerenciamento de autenticação
│   ├── database.js        # Operações do banco de dados
│   └── app.js             # Lógica principal da aplicação
├── images/                 # Imagens e assets
├── README.md              # Este arquivo
└── CNAME                  # Configuração de domínio (opcional)
```

## 🎨 Funcionalidades Detalhadas

### 👥 Gerenciamento de Clubes

- Criar novos clubes com nome e descrição
- Gerar códigos de convite únicos
- Visualizar estatísticas do clube
- Listar todos os clubes do usuário

### 📖 Gerenciamento de Livros

- Definir livro da semana
- Marcar livros como concluídos
- Histórico de livros lidos
- Visualização de capas (suporte a URLs)

### 🗳️ Sistema de Votação

- Criar votações com múltiplas opções de livros
- Votar nos próximos livros
- Visualizar resultados em tempo real
- Encerrar votações automaticamente

### 🔐 Autenticação

- Cadastro com email/senha
- Login seguro
- Perfil de usuário
- Logout

## 🌐 Opções de Armazenamento

### Firebase (Recomendado)

- **Prós:** Tempo real, escalável, autenticação integrada
- **Contras:** Requer configuração
- **Custo:** Gratuito até 1GB/50K leituras por dia

### JSONBin (Alternativa)

- **Prós:** Setup simples, sem configuração complexa
- **Contras:** Sem tempo real, limitações de concurrent access
- **Custo:** Gratuito até 100K requests/mês

## 🚀 Próximas Funcionalidades

- [ ] Sistema de notificações
- [ ] Chat em tempo real para discussões
- [ ] Integração com APIs de livros (Google Books)
- [ ] Sistema de avaliações e resenhas
- [ ] Calendário de eventos do clube
- [ ] Modo offline com sincronização
- [ ] Temas dark/light
- [ ] Aplicativo mobile (PWA)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões:

1. Abra uma [issue](https://github.com/seu-usuario/clube-do-livro/issues)
2. Entre em contato via email: seu-email@exemplo.com

---

Feito com ❤️ para amantes da leitura
