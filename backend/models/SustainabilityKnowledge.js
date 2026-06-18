const mongoose = require('mongoose');

const SustainabilityMetricsSchema = new mongoose.Schema({
  carbonEmissionKg: { type: Number, required: true },
  waterUsageLitres: { type: Number, required: true },
  wasteScore: { type: Number, required: true, min: 1, max: 100 },
  packagingScore: { type: Number, required: true, min: 1, max: 100 },
  transportImpactScore: { type: Number, required: true, min: 1, max: 100 }
}, { _id: false });

const SustainabilityKnowledgeSchema = new mongoose.Schema({
  canonicalName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  aliases: {
    type: [String],
    default: [],
    index: true // Multikey index for alias lookups
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  sustainabilityMetrics: {
    type: SustainabilityMetricsSchema,
    required: true
  },
  sustainabilityScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 100
  },
  sources: {
    type: [String],
    default: []
  },
  methodology: {
    type: String,
    required: true,
    default: 'Lifecycle Assessment (LCA)'
  },
  lastVerifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound text index for canonicalName and aliases for text search matching
SustainabilityKnowledgeSchema.index({ canonicalName: 'text', aliases: 'text' });

module.exports = mongoose.model('SustainabilityKnowledge', SustainabilityKnowledgeSchema);
