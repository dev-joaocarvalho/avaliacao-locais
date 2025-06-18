const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Adicionar esta rota
router.get('/', reviewController.getAllReviews);
router.get('/:placeId', reviewController.getReviewsByPlace);
router.post('/', reviewController.createReview);

module.exports = router;