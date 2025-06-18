const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Dados em memória (simulando banco de dados)
global.users = [];
global.places = [
  { id: 1, name: "Praça Central", category: "Público", address: "Av. Principal, 100" },
  { id: 2, name: "Restaurante Sabor & Arte", category: "Restaurante", address: "Rua das Flores, 250" },
  { id: 3, name: "Biblioteca Municipal", category: "Educação", address: "Praça do Conhecimento, 15" }
];
global.reviews = [];

// Rota raiz para verificar status do backend
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Servidor Backend</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          .status { 
            background-color: #4CAF50; 
            color: white; 
            padding: 10px; 
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 20px;
          }
          .routes { 
            background-color: #f5f5f5; 
            padding: 20px; 
            border-radius: 5px;
            margin-top: 20px;
          }
          .route { 
            padding: 10px; 
            border-bottom: 1px solid #ddd; 
            font-family: monospace;
          }
          .route:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Servidor Backend</h1>
          <div class="status">Status: Online 🟢</div>
          
          <h2>Rotas Disponíveis:</h2>
          <div class="routes">
            <div class="route"><strong>GET</strong> /api/places - Lista todos os locais</div>
            <div class="route"><strong>GET</strong> /api/reviews - Lista todas as avaliações</div>
            <div class="route"><strong>GET</strong> /api/reviews/:placeId - Avaliações de um local específico</div>
          </div>
          
          <p style="margin-top: 30px;">
            <strong>Instruções:</strong> Este é o servidor backend para o sistema de avaliação de locais.
            Acesse as rotas acima usando um cliente HTTP como Postman ou Insomnia, ou através do frontend.
          </p>
        </div>
      </body>
    </html>
  `);
});


// Rotas de autenticação
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Verificar se o email já existe
  const emailExists = global.users.some(u => u.email === email);
  
  if (emailExists) {
    return res.status(400).json({ error: 'Este email já está cadastrado' });
  }
  
  // Criar novo usuário
  const newUser = {
    id: global.users.length + 1,
    name,
    email,
    password
  };
  
  global.users.push(newUser);
  res.status(201).json({ 
    message: 'Cadastro realizado com sucesso!', 
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = global.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } else {
    res.status(401).json({ error: 'Email ou senha incorretos' });
  }
});

// Rotas de locais
app.get('/api/places', (req, res) => {
  res.json(global.places);
});

// Rotas de avaliações
app.get('/api/reviews', (req, res) => {
  res.json(global.reviews);
});

app.get('/api/reviews/:placeId', (req, res) => {
  const placeId = parseInt(req.params.placeId);
  const placeReviews = global.reviews.filter(r => r.placeId === placeId);
  res.json(placeReviews);
});

app.post('/api/reviews', (req, res) => {
  const { userId, userName, placeId, rating, comment } = req.body;
  
  // Verificar se usuário e local existem
  const userExists = global.users.some(u => u.id === userId);
  const placeExists = global.places.some(p => p.id === placeId);
  
  if (!userExists || !placeExists) {
    return res.status(400).json({ error: 'Usuário ou local inválido' });
  }
  
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
  }
  
  // Verificar se já existe avaliação deste usuário para este local
  const existingReviewIndex = global.reviews.findIndex(
    r => r.userId === userId && r.placeId === placeId
  );
  
  if (existingReviewIndex !== -1) {
    // Atualizar avaliação existente
    global.reviews[existingReviewIndex].rating = rating;
    global.reviews[existingReviewIndex].comment = comment;
    global.reviews[existingReviewIndex].date = new Date().toISOString().split('T')[0];
    
    return res.status(200).json({
      message: 'Avaliação atualizada com sucesso!',
      review: global.reviews[existingReviewIndex]
    });
  } else {
    // Criar nova avaliação
    const newReview = {
      id: global.reviews.length + 1,
      userId,
      userName,
      placeId,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    
    global.reviews.push(newReview);
    return res.status(201).json({
      message: 'Avaliação enviada com sucesso!',
      review: newReview
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});