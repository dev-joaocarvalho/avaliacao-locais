class Place {
  constructor(id, name, category, address) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.address = address;
    this.createdAt = new Date();
  }
}

module.exports = Place;