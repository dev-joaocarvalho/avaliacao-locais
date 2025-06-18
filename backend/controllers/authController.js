const User = require('../models/User');

const authController = {
  register: (req, res) => {
    const { name, email, password } = req.body;
    
    // Verificar se o email já existe
    const emailExists = global.users.some(u => u.email === email);
    
    if (emailExists) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }
    
    // Criar novo usuário
    const newUser = new User(
      global.users.length + 1,
      name,
      email,
      password
    );
    
    global.users.push(newUser);
    res.status(201).json({ 
      message: 'Cadastro realizado com sucesso!', 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  },
  
  login: (req, res) => {
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
  }
};

module.exports = authController;