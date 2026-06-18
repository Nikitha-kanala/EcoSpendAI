const mongoose = require('mongoose');

const SustainabilityMetricsSchema = new mongoose.Schema({
  carbonEmissionKg: { type: Number, default: 0 },
  waterUsageLitres: { type: Number, default: 0 },
  wasteScore: { type: Number, default: 50, min: 1, max: 100 },
  packagingScore: { type: Number, default: 50, min: 1, max: 100 },
  transportImpactScore: { type: Number, default: 50, min: 1, max: 100 }
}, { _id: false });

const ExpenseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  ecoFriendly: { type: Boolean, default: false },
  
  // Enhanced Sustainability Fields
  normalizedName: { type: String, default: '' },
  sustainabilityMetrics: { type: SustainabilityMetricsSchema },
  sustainabilityScore: { type: Number, min: 1, max: 100 },
  confidenceScore: { type: Number, min: 1, max: 100 },
  sources: [{ type: String }],
  methodology: { type: String },
  carbonEmissionKg: { type: Number, default: 0 }
});

const SustainabilityResultSchema = new mongoose.Schema({
  score: { type: Number, min: 1, max: 100 },
  confidence: { type: Number, min: 1, max: 100 },
  sourceReferences: [{ type: String }],
  methodology: { type: String },
  explanation: { type: String, default: '' },
  ecoPoints: { type: Number, default: 0 },
  totalCarbonEmissionKg: { type: Number, default: 0 }
}, { _id: false });

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  merchant: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  items: [ExpenseItemSchema],
  carbonScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  carbonImpact: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  co2SavedKg: {
    type: Number,
    default: 0,
  },
  
  // Traceability & Audit fields
  sustainabilityResult: {
    type: SustainabilityResultSchema
  },

  // Lifecycle emissions (LCA)
  cookingEmissions: { type: Number, default: 0 },
  transportEmissions: { type: Number, default: 0 },
  packagingEmissions: { type: Number, default: 0 },
  wasteEmissions: { type: Number, default: 0 },

  lifecycleDetails: {
    cooking: {
      involved: { type: Boolean, default: false },
      method: { type: String, default: '' },
      minutes: { type: Number, default: 0 }
    },
    transport: {
      involved: { type: Boolean, default: false },
      mode: { type: String, default: '' },
      distanceKm: { type: Number, default: 0 },
      fuelLiters: { type: Number, default: 0 }
    },
    packaging: {
      involved: { type: Boolean, default: false },
      plasticQty: { type: Number, default: 0 },
      cardboardQty: { type: Number, default: 0 },
      aluminiumQty: { type: Number, default: 0 },
      styrofoamQty: { type: Number, default: 0 }
    },
    waste: {
      involved: { type: Boolean, default: false },
      size: { type: String, default: '' }
    }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', ExpenseSchema);

