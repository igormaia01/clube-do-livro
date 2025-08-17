# 🚀 Guia Passo a Passo - Deploy da Aplicação

## Opção 1: Firebase (Recomendado)

### Passo 1: Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Criar novo projeto:
   - Nome: `clube-do-livro`
   - Desativar Analytics
   - Criar projeto

### Passo 2: Configurar Authentication

1. No painel lateral: **Authentication**
2. Clique **Começar**
3. Aba **Sign-in method**
4. Ativar **Email/senha**
5. Salvar

### Passo 3: Configurar Firestore

1. No painel lateral: **Firestore Database**
2. **Criar banco de dados**
3. **Modo de teste** (por enquanto)
4. Localização: `southamerica-east1`
5. **Concluído**

### Passo 4: Obter Credenciais

1. **Configurações do projeto** (⚙️)
2. **Seus apps** → Ícone Web `</>`
3. Nome: `clube-do-livro-web`
4. **Registrar app**
5. **Copiar configuração**

### Passo 5: Atualizar Código

1. Abrir `js/firebase-config.js`
2. Substituir configurações:

```javascript
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'clube-do-livro-xxx.firebaseapp.com',
  projectId: 'clube-do-livro-xxx',
  storageBucket: 'clube-do-livro-xxx.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};
```

### Passo 6: Configurar Regras de Segurança

1. No Firestore, aba **Regras**
2. Substituir por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clubs/{clubId} {
      allow read, write: if request.auth != null
        && (request.auth.uid in resource.data.members
            || request.auth.uid == resource.data.createdBy);
    }

    match /votes/{voteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Publicar**

---

## Opção 2: JSONBin (Alternativa Simples)

### Passo 1: Criar Conta

1. Acesse [JSONBin.io](https://jsonbin.io/)
2. Criar conta gratuita
3. Fazer login

### Passo 2: Criar Bin

1. **Create Bin**
2. Conteúdo inicial:

```json
{
  "clubs": [],
  "votes": [],
  "users": []
}
```

3. **Create**
4. **Copiar Bin ID** (ex: `6507a123b89b1e2...`)

### Passo 3: Obter Master Key

1. **API Keys** no menu
2. Copiar **Master Key**

### Passo 4: Configurar Aplicação

1. Em `js/firebase-config.js`, comentar Firebase
2. Descomentar JSONBin:

```javascript
export const JSONBIN_CONFIG = {
  masterKey: 'sua-master-key-aqui',
  binId: 'seu-bin-id-aqui',
  apiUrl: 'https://api.jsonbin.io/v3',
};
```

3. Modificar imports nos outros arquivos JS

---

## 📦 Deploy no GitHub Pages

### Passo 1: Preparar Repositório

```bash
# Navegar para a pasta do projeto
cd clube-do-livro

# Inicializar git (se ainda não feito)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Primeira versão do Clube do Livro"

# Adicionar remote (substitua pela sua URL)
git remote add origin https://github.com/seu-usuario/clube-do-livro.git

# Push para GitHub
git push -u origin main
```

### Passo 2: Configurar GitHub Pages

1. No GitHub, vá para **Settings** do repositório
2. **Pages** no menu lateral
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: / (root)
6. **Save**

### Passo 3: Aguardar Deploy

- GitHub levará alguns minutos para fazer o deploy
- URL será: `https://seu-usuario.github.io/clube-do-livro`

### Passo 4: Domínio Personalizado (Opcional)

1. Renomear `CNAME.example` para `CNAME`
2. Adicionar seu domínio no arquivo
3. Configurar DNS para apontar para GitHub Pages

---

## 🧪 Teste Local

### Opção 1: Python

```bash
cd clube-do-livro
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Opção 2: Node.js

```bash
npx http-server
# Acesse: http://localhost:8080
```

### Opção 3: PHP

```bash
php -S localhost:8000
# Acesse: http://localhost:8000
```

---

## 🔧 Configurações Avançadas

### Configurar Firebase Hosting (Opcional)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

### Performance

- Minificar CSS/JS para produção
- Otimizar imagens
- Configurar cache headers

### SEO

- Adicionar meta tags apropriadas
- Configurar Open Graph
- Sitemap.xml

---

## 📋 Checklist Final

- [ ] Firebase/JSONBin configurado
- [ ] Credenciais atualizadas no código
- [ ] Projeto testado localmente
- [ ] Código commitado no GitHub
- [ ] GitHub Pages habilitado
- [ ] URL funcionando
- [ ] Autenticação testada
- [ ] Criação de clube testada
- [ ] Sistema de votação testado

---

## 🆘 Solução de Problemas

### Firebase não conecta

- Verificar credenciais em `firebase-config.js`
- Verificar regras do Firestore
- Verificar console do navegador

### GitHub Pages não funciona

- Verificar se branch está correta
- Aguardar alguns minutos para propagação
- Verificar se arquivos estão no root

### Aplicação não carrega

- Verificar console do navegador
- Verificar se está servindo via HTTP/HTTPS
- Verificar imports ES6

### JSONBin não funciona

- Verificar Master Key
- Verificar Bin ID
- Verificar CORS no JSONBin
