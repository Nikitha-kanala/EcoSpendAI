const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  carbonEmissionKg: { type: Number, default: 0 },
  waterUsageLitres: { type: Number, default: 0 },
  wasteScore: { type: Number, default: 50, min: 1, max: 100 },
  packagingScore: { type: Number, default: 50, min: 1, max: 100 },
  transportImpactScore: { type: Number, default: 50, min: 1, max: 100 }
}, { _id: false });

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  defaultMetrics: { type: MetricSchema, required: true },
  defaultScore: { type: Number, required: true, min: 1, max: 100 },
  baselineCarbonEmissionKg: { type: Number, default: 0 },
  methodology: { type: String, default: 'Lifecycle Assessment (LCA) category average' },
  sources: [{ type: String }]
}, { _id: false });

const SustainabilityCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subCategories: [SubCategorySchema]
}, {
  timestamps: true,
});

module.exports = mongoose.model('SustainabilityCategory', SustainabilityCategorySchema);
