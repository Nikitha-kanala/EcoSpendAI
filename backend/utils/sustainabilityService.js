const SustainabilitySource = require('../models/SustainabilitySource');
const SustainabilityCategory = require('../models/SustainabilityCategory');
const SustainabilityKnowledge = require('../models/SustainabilityKnowledge');

// Average price/unit metrics per subcategory to estimate consumption quantity from receipt prices
const SUBCATEGORY_PRICES = {
  'Beef': 500, // ₹500/kg
  'Chicken': 250, // ₹250/kg
  'Milk': 60, // ₹60/L
  'Plant Milk': 120, // ₹120/L
  'Fruit/Vegetables': 150, // ₹150/kg
  'Generic Grocery': 200, // ₹200/kg
  'Taxi/Cab': 20, // ₹20/km
  'Metro Transit': 3, // ₹3/km
  'Bus ticket': 2, // ₹2/km
  'Generic Transit': 15, // ₹15/km
  'Electricity': 8, // ₹8/kWh
  'Solar/Clean Electricity': 8, // ₹8/kWh
  'Water Utility': 0.02, // ₹0.02/L
  'Fast Fashion Clothing': 1000, // ₹1000/item
  'Eco-friendly/Organic Cotton': 1500, // ₹1500/item
  'Plastic Goods': 20, // ₹20/item
  'Generic Shopping': 500, // ₹500/item
  'Beef Restaurant Meal': 300, // ₹300/meal
  'Vegetarian Restaurant Meal': 200, // ₹200/meal
  'Coffee/Cafe': 80, // ₹80/beverage
  'Generic Dining': 300, // ₹300/meal
  'General Service': 100, // ₹100/service
  'Miscellaneous': 100
};

// Helper to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Normalizes metrics and calculates a deterministic sustainability score (1-100).
 */
const calculateItemScore = (metrics) => {
  const {
    carbonEmissionKg,
    waterUsageLitres,
    wasteScore,
    packagingScore,
    transportImpactScore
  } = metrics;

  // Normalized carbon score (exponential decay)
  const sc = Math.max(1, Math.min(100, 100 * Math.exp(-0.05 * (carbonEmissionKg || 0))));

  // Normalized water score (exponential decay)
  const sw = Math.max(1, Math.min(100, 100 * Math.exp(-0.0005 * (waterUsageLitres || 0))));

  // Weighted sum
  const finalScore = (sc * 0.40) +
                     (sw * 0.20) +
                     ((wasteScore || 50) * 0.15) +
                     ((packagingScore || 50) * 0.15) +
                     ((transportImpactScore || 50) * 0.10);

  return Math.round(finalScore);
};

/**
 * Maps calculated carbon emissions to EcoPoints based on bandwidth ranges.
 */
const calculateEcoPoints = (totalCarbonEmissionKg) => {
  if (totalCarbonEmissionKg <= 2) return 90;
  if (totalCarbonEmissionKg <= 10) return 70;
  if (totalCarbonEmissionKg <= 30) return 40;
  if (totalCarbonEmissionKg <= 50) return 20;
  return 5;
};

/**
 * Matches a normalized item name against the knowledge base or falls back to category defaults.
 */
const matchProduct = async (rawName, normalizedName, transactionCategory) => {
  const searchTerm = (normalizedName || rawName || '').trim();
  if (!searchTerm) {
    return getFallbackCategoryMetrics(transactionCategory, 'Miscellaneous');
  }

  // 1. Try exact match on canonical name or aliases
  let matched = await SustainabilityKnowledge.findOne({
    $or: [
      { canonicalName: { $regex: new RegExp('^' + escapeRegex(searchTerm) + '$', 'i') } },
      { aliases: { $regex: new RegExp('^' + escapeRegex(searchTerm) + '$', 'i') } }
    ]
  });

  if (matched) {
    return {
      canonicalName: matched.canonicalName,
      subCategory: matched.subCategory,
      metrics: matched.sustainabilityMetrics,
      confidenceScore: 98,
      sources: matched.sources || [],
      methodology: matched.methodology || 'Lifecycle Assessment',
      baselineCarbonEmissionKg: await getBaselineCarbon(transactionCategory, matched.subCategory)
    };
  }

  // 2. Try substring match (fuzzy regex lookup)
  matched = await SustainabilityKnowledge.findOne({
    $or: [
      { canonicalName: { $regex: new RegExp(escapeRegex(searchTerm), 'i') } },
      { aliases: { $regex: new RegExp(escapeRegex(searchTerm), 'i') } }
    ]
  });

  if (matched) {
    return {
      canonicalName: matched.canonicalName,
      subCategory: matched.subCategory,
      metrics: matched.sustainabilityMetrics,
      confidenceScore: 80,
      sources: matched.sources || [],
      methodology: matched.methodology || 'Lifecycle Assessment',
      baselineCarbonEmissionKg: await getBaselineCarbon(transactionCategory, matched.subCategory)
    };
  }

  // 3. Try splitting terms and matching individual words
  const words = searchTerm.split(/\s+/).filter(w => w.length > 2);
  if (words.length > 0) {
    const wordRegexes = words.map(w => new RegExp(escapeRegex(w), 'i'));
    matched = await SustainabilityKnowledge.findOne({
      $or: [
        { canonicalName: { $in: wordRegexes } },
        { aliases: { $in: wordRegexes } }
      ]
    });

    if (matched) {
      return {
        canonicalName: matched.canonicalName,
        subCategory: matched.subCategory,
        metrics: matched.sustainabilityMetrics,
        confidenceScore: 70,
        sources: matched.sources || [],
        methodology: matched.methodology || 'Lifecycle Assessment',
        baselineCarbonEmissionKg: await getBaselineCarbon(transactionCategory, matched.subCategory)
      };
    }
  }

  // 4. Fallback to subcategory or overall category default
  return getFallbackCategoryMetrics(transactionCategory, searchTerm);
};

/**
 * Retrieves fallback metrics when no exact/fuzzy knowledge base match is found.
 */
const getFallbackCategoryMetrics = async (categoryName, searchTerm) => {
  let mappedCategory = 'Miscellaneous';
  const categoriesList = ['Groceries', 'Dining', 'Transit', 'Shopping', 'Utilities', 'Miscellaneous'];
  const matchedCat = categoriesList.find(c => c.toLowerCase() === (categoryName || '').toLowerCase());
  if (matchedCat) {
    mappedCategory = matchedCat;
  }

  const categoryDoc = await SustainabilityCategory.findOne({ name: mappedCategory });
  if (!categoryDoc || !categoryDoc.subCategories || categoryDoc.subCategories.length === 0) {
    const defaultMetrics = {
      carbonEmissionKg: 2.0,
      waterUsageLitres: 100,
      wasteScore: 60,
      packagingScore: 50,
      transportImpactScore: 60
    };
    return {
      canonicalName: `${mappedCategory} (Generic)`,
      subCategory: 'Miscellaneous',
      metrics: defaultMetrics,
      confidenceScore: 40,
      sources: ['Global Average Baselines'],
      methodology: 'Global Environmental Input-Output Model Fallback',
      baselineCarbonEmissionKg: 3.5
    };
  }

  let matchedSub = null;
  for (const sub of categoryDoc.subCategories) {
    if (searchTerm.toLowerCase().includes(sub.name.toLowerCase()) ||
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      matchedSub = sub;
      break;
    }
  }

  if (!matchedSub) {
    matchedSub = categoryDoc.subCategories.find(sub => sub.name.toLowerCase().includes('generic')) || categoryDoc.subCategories[0];
  }

  return {
    canonicalName: `${mappedCategory} - ${matchedSub.name} (Category Averages)`,
    subCategory: matchedSub.name,
    metrics: matchedSub.defaultMetrics,
    confidenceScore: 55,
    sources: matchedSub.sources || ['Category Standard Baselines'],
    methodology: matchedSub.methodology || 'LCA Category Averages',
    baselineCarbonEmissionKg: matchedSub.baselineCarbonEmissionKg || (matchedSub.defaultMetrics.carbonEmissionKg * 1.5)
  };
};

/**
 * Finds the baseline carbon emission for a specific subcategory to calculate offset savings.
 */
const getBaselineCarbon = async (categoryName, subCategoryName) => {
  try {
    const categoryDoc = await SustainabilityCategory.findOne({ name: categoryName });
    if (categoryDoc && categoryDoc.subCategories) {
      const sub = categoryDoc.subCategories.find(s => s.name.toLowerCase() === (subCategoryName || '').toLowerCase());
      if (sub && sub.baselineCarbonEmissionKg) {
        return sub.baselineCarbonEmissionKg;
      }
    }
  } catch (error) {
    console.error('Failed to get baseline carbon:', error.message);
  }
  return 0;
};

/**
 * Processes a transaction with OCR extracted items and performs scoring, matching, and trace assembly.
 */
const scoreTransaction = async (parsedItems, category) => {
  if (!parsedItems || parsedItems.length === 0) {
    parsedItems = [{ name: `${category || 'General'} Expense`, price: 0 }];
  }

  const scoredItems = [];
  let totalScoreSum = 0;
  let totalSavedKg = 0;
  let totalConfidenceSum = 0;
  let totalCarbonEmissionKg = 0;
  const allSources = new Set();

  for (const item of parsedItems) {
    const match = await matchProduct(item.name, item.normalizedName || item.name, category);
    
    // Estimate consumption quantity based on price and subcategory baseline price
    const subCategoryName = match.subCategory || 'Miscellaneous';
    const avgPrice = SUBCATEGORY_PRICES[subCategoryName] || 100;
    const priceVal = parseFloat(item.price);
    const quantity = (!isNaN(priceVal) && priceVal > 0) ? (priceVal / avgPrice) : 1;

    // Calculate actual magnitudes based on quantity
    const carbonEmissionKg = parseFloat((quantity * (match.metrics.carbonEmissionKg || 0)).toFixed(2));
    const waterUsageLitres = parseFloat((quantity * (match.metrics.waterUsageLitres || 0)).toFixed(2));

    // Calculate item scores using dynamic magnitudes
    const itemMetrics = {
      carbonEmissionKg,
      waterUsageLitres,
      wasteScore: match.metrics.wasteScore || 50,
      packagingScore: match.metrics.packagingScore || 50,
      transportImpactScore: match.metrics.transportImpactScore || 50
    };

    const calculatedItemScore = calculateItemScore(itemMetrics);

    // Calculate baseline carbon and CO2 offset
    const baselineUnit = match.baselineCarbonEmissionKg || 0;
    const baselineCarbon = parseFloat((quantity * baselineUnit).toFixed(2));
    const co2Saved = Math.max(0, baselineCarbon - carbonEmissionKg);

    totalCarbonEmissionKg += carbonEmissionKg;
    totalSavedKg += co2Saved;
    totalScoreSum += calculatedItemScore;
    totalConfidenceSum += match.confidenceScore;
    (match.sources || []).forEach(src => allSources.add(src));

    scoredItems.push({
      name: item.name,
      price: item.price || 0,
      ecoFriendly: calculatedItemScore >= 70,
      normalizedName: match.canonicalName,
      sustainabilityMetrics: {
        carbonEmissionKg,
        waterUsageLitres,
        wasteScore: match.metrics.wasteScore,
        packagingScore: match.metrics.packagingScore,
        transportImpactScore: match.metrics.transportImpactScore
      },
      sustainabilityScore: calculatedItemScore,
      confidenceScore: match.confidenceScore,
      sources: match.sources,
      methodology: match.methodology,
      carbonEmissionKg // store calculated magnitude directly
    });
  }

  const itemCount = scoredItems.length;
  
  // Calculate average confidence
  const avgConfidence = Math.max(1, Math.min(100, Math.round(totalConfidenceSum / itemCount)));
  
  // Calculate aggregate Carbon Score (1-100) based on total carbon emission magnitude
  totalCarbonEmissionKg = parseFloat(totalCarbonEmissionKg.toFixed(2));
  const finalCarbonScore = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-0.05 * totalCarbonEmissionKg))));

  // Allocate EcoPoints using the predefined bandwidth ranges
  const ecoPoints = calculateEcoPoints(totalCarbonEmissionKg);
  
  let carbonImpact = 'medium';
  if (finalCarbonScore >= 70) {
    carbonImpact = 'low';
  } else if (finalCarbonScore < 40) {
    carbonImpact = 'high';
  }

  const sustainabilityResult = {
    score: finalCarbonScore,
    confidence: avgConfidence,
    sourceReferences: Array.from(allSources),
    methodology: 'Knowledge-Base-Driven Lifecycle Assessment (LCA)',
    ecoPoints,
    totalCarbonEmissionKg
  };

  return {
    carbonScore: finalCarbonScore, // Backward compatible field (Carbon Score 1-100)
    carbonImpact, // Backward compatible field ('low'|'medium'|'high')
    co2SavedKg: parseFloat(totalSavedKg.toFixed(2)), // Backward compatible field
    items: scoredItems,
    sustainabilityResult
  };
};

module.exports = {
  calculateItemScore,
  calculateEcoPoints,
  matchProduct,
  scoreTransaction,
  SUBCATEGORY_PRICES
};
