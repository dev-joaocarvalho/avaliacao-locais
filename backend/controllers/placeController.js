const Place = require('../models/Place');

const placeController = {
  getAllPlaces: (req, res) => {
    res.json(global.places);
  },
  
  createPlace: (req, res) => {
    const { name, category, address } = req.body;
    
    if (!name || !category || !address) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const newPlace = new Place(
      global.places.length + 1,
      name,
      category,
      address
    );
    
    global.places.push(newPlace);
    res.status(201).json(newPlace);
  }
};

module.exports = placeController;