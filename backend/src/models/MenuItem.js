const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a dish name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks']
    },
    isVeg: {
      type: Boolean,
      required: true,
      default: false
    },
    allergens: {
      type: [String],
      enum: ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish'],
      default: []
    },
    tags: {
      type: [String],
      enum: ['seasonal', 'chef-special', 'popular', 'new', 'spicy'],
      default: []
    },
    // KEY DIFFERENTIATOR: live availability toggle
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: {
      type: String,
      default: ''
    },
    preparationTime: {
      type: Number, // in minutes
      default: 20
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for fast filtered queries
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isVeg: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
