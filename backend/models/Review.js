class Review {
  constructor(id, userId, placeId, rating, comment) {
    this.id = id;
    this.userId = userId;
    this.placeId = placeId;
    this.rating = rating;
    this.comment = comment;
    this.date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
}

module.exports = Review;