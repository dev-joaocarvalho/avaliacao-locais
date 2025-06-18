const Review = require('../models/Review');

const reviewController = {
  getReviewsByPlace: (req, res) => {
    const placeId = parseInt(req.params.placeId);
    const placeReviews = global.reviews.filter(r => r.placeId === placeId);
    res.json(placeReviews);
  },
  
  getAllReviews: (req, res) => {
    res.json(global.reviews);
},

  createReview: (req, res) => {
    const { userId, placeId, rating, comment } = req.body;
    
    // Verificar se usuário e local existem
    const userExists = global.users.some(u => u.id === userId);
    const placeExists = global.places.some(p => p.id === placeId);
    
    if (!userExists || !placeExists) {
      return res.status(400).json({ error: 'Usuário ou local inválido' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
    }
    
    const newReview = new Review(
      global.reviews.length + 1,
      userId,
      placeId,
      rating,
      comment
    );
    
    global.reviews.push(newReview);
    res.status(201).json(newReview);
  }
};

module.exports = reviewController;