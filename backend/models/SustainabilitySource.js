const mongoose = require('mongoose');

const SustainabilitySourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: '',
  },
  reliabilityRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 8,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SustainabilitySource', SustainabilitySourceSchema);
