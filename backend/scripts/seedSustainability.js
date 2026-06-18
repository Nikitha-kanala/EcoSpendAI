require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const SustainabilitySource = require('../models/SustainabilitySource');
const SustainabilityCategory = require('../models/SustainabilityCategory');
const SustainabilityKnowledge = require('../models/SustainabilityKnowledge');

// Connect to MongoDB
const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing sustainability collections...');
    await SustainabilitySource.deleteMany({});
    await SustainabilityCategory.deleteMany({});
    await SustainabilityKnowledge.deleteMany({});
    console.log('Collections cleared.');

    // 1. Seed Sustainability Sources
    console.log('Seeding Sustainability Sources...');
    const sources = [
      {
        name: 'FAO GLEAM',
        description: 'Global Livestock Environmental Assessment Model (GLEAM) by the Food and Agriculture Organization of the UN. Standard for livestock greenhouse gas emissions.',
        url: 'http://www.fao.org/gleam/en/',
        reliabilityRating: 9,
        lastChecked: new Date()
      },
      {
        name: 'AGRIBALYSE',
        description: 'French public database reference on agricultural and food products environmental footprint, based on Life Cycle Assessment (LCA) methodology.',
        url: 'https://www.agribalyse.fr/en',
        reliabilityRating: 9,
        lastChecked: new Date()
      },
      {
        name: 'Open Food Facts Eco-Score',
        description: 'Collaborative open-source database rating environmental impact of food items worldwide.',
        url: 'https://world.openfoodfacts.org/eco-score',
        reliabilityRating: 8,
        lastChecked: new Date()
      },
      {
        name: 'EDGAR Food Emissions Database',
        description: 'Emissions Database for Global Atmospheric Research, focusing on food system greenhouse gas emissions.',
        url: 'https://edgar.jrc.ec.europa.eu/',
        reliabilityRating: 9,
        lastChecked: new Date()
      },
      {
        name: 'IEA Grid Intensity',
        description: 'International Energy Agency dataset for electricity grid carbon intensity by region.',
        url: 'https://www.iea.org/data-and-statistics',
        reliabilityRating: 9,
        lastChecked: new Date()
      }
    ];

    await SustainabilitySource.insertMany(sources);
    console.log('Sustainability Sources seeded.');

    // Helper to calculate score deterministically for knowledge base items
    const calculateScore = (m) => {
      const sc = Math.max(1, Math.min(100, 100 * Math.exp(-0.05 * m.carbonEmissionKg)));
      const sw = Math.max(1, Math.min(100, 100 * Math.exp(-0.0005 * m.waterUsageLitres)));
      const finalScore = (sc * 0.40) + (sw * 0.20) + (m.wasteScore * 0.15) + (m.packagingScore * 0.15) + (m.transportImpactScore * 0.10);
      return Math.round(finalScore);
    };

    // 2. Seed Sustainability Categories & Subcategories
    console.log('Seeding Categories...');
    const categories = [
      {
        name: 'Groceries',
        subCategories: [
          {
            name: 'Beef',
            defaultMetrics: { carbonEmissionKg: 27.0, waterUsageLitres: 15000, wasteScore: 20, packagingScore: 30, transportImpactScore: 50 },
            defaultScore: calculateScore({ carbonEmissionKg: 27.0, waterUsageLitres: 15000, wasteScore: 20, packagingScore: 30, transportImpactScore: 50 }),
            baselineCarbonEmissionKg: 35.0,
            methodology: 'FAO GLEAM Lifecycle Assessment',
            sources: ['FAO GLEAM']
          },
          {
            name: 'Chicken',
            defaultMetrics: { carbonEmissionKg: 6.9, waterUsageLitres: 4300, wasteScore: 30, packagingScore: 40, transportImpactScore: 60 },
            defaultScore: calculateScore({ carbonEmissionKg: 6.9, waterUsageLitres: 4300, wasteScore: 30, packagingScore: 40, transportImpactScore: 60 }),
            baselineCarbonEmissionKg: 35.0,
            methodology: 'AGRIBALYSE LCA average for poultry',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Milk',
            defaultMetrics: { carbonEmissionKg: 3.0, waterUsageLitres: 1000, wasteScore: 45, packagingScore: 35, transportImpactScore: 70 },
            defaultScore: calculateScore({ carbonEmissionKg: 3.0, waterUsageLitres: 1000, wasteScore: 45, packagingScore: 35, transportImpactScore: 70 }),
            baselineCarbonEmissionKg: 3.5,
            methodology: 'AGRIBALYSE LCA dairy average',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Plant Milk',
            defaultMetrics: { carbonEmissionKg: 0.9, waterUsageLitres: 120, wasteScore: 75, packagingScore: 70, transportImpactScore: 80 },
            defaultScore: calculateScore({ carbonEmissionKg: 0.9, waterUsageLitres: 120, wasteScore: 75, packagingScore: 70, transportImpactScore: 80 }),
            baselineCarbonEmissionKg: 3.5, // Compared to Cow Milk
            methodology: 'Oxford Food Emission LCA research',
            sources: ['AGRIBALYSE', 'Open Food Facts Eco-Score']
          },
          {
            name: 'Fruit/Vegetables',
            defaultMetrics: { carbonEmissionKg: 0.4, waterUsageLitres: 250, wasteScore: 90, packagingScore: 85, transportImpactScore: 85 },
            defaultScore: calculateScore({ carbonEmissionKg: 0.4, waterUsageLitres: 250, wasteScore: 90, packagingScore: 85, transportImpactScore: 85 }),
            baselineCarbonEmissionKg: 2.0,
            methodology: 'FAOSTAT Agricultural averages',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Generic Grocery',
            defaultMetrics: { carbonEmissionKg: 2.5, waterUsageLitres: 500, wasteScore: 60, packagingScore: 50, transportImpactScore: 65 },
            defaultScore: calculateScore({ carbonEmissionKg: 2.5, waterUsageLitres: 500, wasteScore: 60, packagingScore: 50, transportImpactScore: 65 }),
            baselineCarbonEmissionKg: 4.0,
            methodology: 'Standard Retail Grocery LCA average',
            sources: ['Open Food Facts Eco-Score']
          }
        ]
      },
      {
        name: 'Transit',
        subCategories: [
          {
            name: 'Taxi/Cab',
            defaultMetrics: { carbonEmissionKg: 4.4, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 20 },
            defaultScore: calculateScore({ carbonEmissionKg: 4.4, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 20 }),
            baselineCarbonEmissionKg: 4.4,
            methodology: 'EPA Greenhouse Gas Emissions (average 20 km passenger ride)',
            sources: ['EDGAR Food Emissions Database']
          },
          {
            name: 'Metro Transit',
            defaultMetrics: { carbonEmissionKg: 0.6, waterUsageLitres: 0, wasteScore: 90, packagingScore: 100, transportImpactScore: 95 },
            defaultScore: calculateScore({ carbonEmissionKg: 0.6, waterUsageLitres: 0, wasteScore: 90, packagingScore: 100, transportImpactScore: 95 }),
            baselineCarbonEmissionKg: 4.4, // Compared to Taxi
            methodology: 'IEA passenger transport intensity models',
            sources: ['IEA Grid Intensity']
          },
          {
            name: 'Bus ticket',
            defaultMetrics: { carbonEmissionKg: 1.0, waterUsageLitres: 0, wasteScore: 85, packagingScore: 100, transportImpactScore: 90 },
            defaultScore: calculateScore({ carbonEmissionKg: 1.0, waterUsageLitres: 0, wasteScore: 85, packagingScore: 100, transportImpactScore: 90 }),
            baselineCarbonEmissionKg: 4.4, // Compared to Taxi
            methodology: 'EPA Transport Emissions averages',
            sources: ['EDGAR Food Emissions Database']
          },
          {
            name: 'Generic Transit',
            defaultMetrics: { carbonEmissionKg: 2.5, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 60 },
            defaultScore: calculateScore({ carbonEmissionKg: 2.5, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 60 }),
            baselineCarbonEmissionKg: 4.4,
            methodology: 'Global passenger transport average',
            sources: ['EDGAR Food Emissions Database']
          }
        ]
      },
      {
        name: 'Dining',
        subCategories: [
          {
            name: 'Beef Restaurant Meal',
            defaultMetrics: { carbonEmissionKg: 15.0, waterUsageLitres: 4000, wasteScore: 50, packagingScore: 60, transportImpactScore: 55 },
            defaultScore: calculateScore({ carbonEmissionKg: 15.0, waterUsageLitres: 4000, wasteScore: 50, packagingScore: 60, transportImpactScore: 55 }),
            baselineCarbonEmissionKg: 18.0,
            methodology: 'Restaurant supply chain LCA model',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Vegetarian Restaurant Meal',
            defaultMetrics: { carbonEmissionKg: 1.5, waterUsageLitres: 600, wasteScore: 80, packagingScore: 80, transportImpactScore: 80 },
            defaultScore: calculateScore({ carbonEmissionKg: 1.5, waterUsageLitres: 600, wasteScore: 80, packagingScore: 80, transportImpactScore: 80 }),
            baselineCarbonEmissionKg: 18.0, // Compared to beef dining
            methodology: 'Restaurant supply chain LCA model',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Coffee/Cafe',
            defaultMetrics: { carbonEmissionKg: 0.4, waterUsageLitres: 140, wasteScore: 60, packagingScore: 50, transportImpactScore: 70 },
            defaultScore: calculateScore({ carbonEmissionKg: 0.4, waterUsageLitres: 140, wasteScore: 60, packagingScore: 50, transportImpactScore: 70 }),
            baselineCarbonEmissionKg: 0.8, // Compared to disposable/imported luxury drinks
            methodology: 'LCA analysis of beverage serving',
            sources: ['Open Food Facts Eco-Score']
          },
          {
            name: 'Generic Dining',
            defaultMetrics: { carbonEmissionKg: 4.5, waterUsageLitres: 1200, wasteScore: 65, packagingScore: 60, transportImpactScore: 70 },
            defaultScore: calculateScore({ carbonEmissionKg: 4.5, waterUsageLitres: 1200, wasteScore: 65, packagingScore: 60, transportImpactScore: 70 }),
            baselineCarbonEmissionKg: 10.0,
            methodology: 'Commercial foodservice average emission profiles',
            sources: ['AGRIBALYSE']
          }
        ]
      },
      {
        name: 'Utilities',
        subCategories: [
          {
            name: 'Electricity',
            defaultMetrics: { carbonEmissionKg: 85.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 100, transportImpactScore: 80 },
            defaultScore: calculateScore({ carbonEmissionKg: 85.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 100, transportImpactScore: 80 }),
            baselineCarbonEmissionKg: 85.0, // Baseline is grid coal mix
            methodology: 'IEA national grid average emissions (approx 100 kWh usage)',
            sources: ['IEA Grid Intensity']
          },
          {
            name: 'Solar/Clean Electricity',
            defaultMetrics: { carbonEmissionKg: 4.0, waterUsageLitres: 5, wasteScore: 80, packagingScore: 100, transportImpactScore: 95 },
            defaultScore: calculateScore({ carbonEmissionKg: 4.0, waterUsageLitres: 5, wasteScore: 80, packagingScore: 100, transportImpactScore: 95 }),
            baselineCarbonEmissionKg: 85.0, // Compared to standard coal grid
            methodology: 'PV solar panel lifetime LCA amortized over production cycles',
            sources: ['IEA Grid Intensity']
          },
          {
            name: 'Water Utility',
            defaultMetrics: { carbonEmissionKg: 0.3, waterUsageLitres: 1000, wasteScore: 90, packagingScore: 100, transportImpactScore: 90 },
            defaultScore: calculateScore({ carbonEmissionKg: 0.3, waterUsageLitres: 1000, wasteScore: 90, packagingScore: 100, transportImpactScore: 90 }),
            baselineCarbonEmissionKg: 0.8,
            methodology: 'Municipal water supply filtration & pump energy impact',
            sources: ['IEA Grid Intensity']
          }
        ]
      },
      {
        name: 'Shopping',
        subCategories: [
          {
            name: 'Fast Fashion Clothing',
            defaultMetrics: { carbonEmissionKg: 15.0, waterUsageLitres: 2700, wasteScore: 30, packagingScore: 40, transportImpactScore: 40 },
            defaultScore: calculateScore({ carbonEmissionKg: 15.0, waterUsageLitres: 2700, wasteScore: 30, packagingScore: 40, transportImpactScore: 40 }),
            baselineCarbonEmissionKg: 20.0,
            methodology: 'Global textile supply chain LCA average',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Eco-friendly/Organic Cotton',
            defaultMetrics: { carbonEmissionKg: 5.0, waterUsageLitres: 900, wasteScore: 85, packagingScore: 80, transportImpactScore: 70 },
            defaultScore: calculateScore({ carbonEmissionKg: 5.0, waterUsageLitres: 900, wasteScore: 85, packagingScore: 80, transportImpactScore: 70 }),
            baselineCarbonEmissionKg: 20.0,
            methodology: 'Organic cotton textile LCA assessment',
            sources: ['AGRIBALYSE']
          },
          {
            name: 'Plastic Goods',
            defaultMetrics: { carbonEmissionKg: 3.5, waterUsageLitres: 80, wasteScore: 15, packagingScore: 20, transportImpactScore: 60 },
            defaultScore: calculateScore({ carbonEmissionKg: 3.5, waterUsageLitres: 80, wasteScore: 15, packagingScore: 20, transportImpactScore: 60 }),
            baselineCarbonEmissionKg: 5.0,
            methodology: 'Polyethylene production environmental impacts',
            sources: ['Open Food Facts Eco-Score']
          },
          {
            name: 'Generic Shopping',
            defaultMetrics: { carbonEmissionKg: 8.0, waterUsageLitres: 1200, wasteScore: 50, packagingScore: 50, transportImpactScore: 60 },
            defaultScore: calculateScore({ carbonEmissionKg: 8.0, waterUsageLitres: 1200, wasteScore: 50, packagingScore: 50, transportImpactScore: 60 }),
            baselineCarbonEmissionKg: 12.0,
            methodology: 'Consumer goods manufacturing LCA averages',
            sources: ['AGRIBALYSE']
          }
        ]
      },
      {
        name: 'Miscellaneous',
        subCategories: [
          {
            name: 'General Service',
            defaultMetrics: { carbonEmissionKg: 1.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 90, transportImpactScore: 85 },
            defaultScore: calculateScore({ carbonEmissionKg: 1.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 90, transportImpactScore: 85 }),
            baselineCarbonEmissionKg: 1.5,
            methodology: 'Service sector energy footprint profiles',
            sources: ['EDGAR Food Emissions Database']
          }
        ]
      }
    ];

    await SustainabilityCategory.insertMany(categories);
    console.log('Sustainability Categories seeded.');

    // 3. Seed Sustainability Knowledge Items
    console.log('Seeding Sustainability Knowledge Base Items...');
    const knowledgeItems = [
      {
        canonicalName: 'Beef Steak',
        aliases: ['beef', 'steak', 'ground beef', 'hamburger patty', 'ribeye', 'meat beef', 'beef ribeye'],
        category: 'Groceries',
        subCategory: 'Beef',
        sustainabilityMetrics: { carbonEmissionKg: 27.2, waterUsageLitres: 15415, wasteScore: 20, packagingScore: 30, transportImpactScore: 50 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 27.2, waterUsageLitres: 15415, wasteScore: 20, packagingScore: 30, transportImpactScore: 50 }),
        confidenceScore: 100,
        sources: ['FAO GLEAM', 'AGRIBALYSE'],
        methodology: 'LCA of pasture vs feedlot beef products',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Chicken Breasts',
        aliases: ['chicken', 'chicken meat', 'poultry', 'chicken wings', 'chicken nuggets', 'chicken breast', 'boneless chicken'],
        category: 'Groceries',
        subCategory: 'Chicken',
        sustainabilityMetrics: { carbonEmissionKg: 6.9, waterUsageLitres: 4325, wasteScore: 30, packagingScore: 40, transportImpactScore: 60 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 6.9, waterUsageLitres: 4325, wasteScore: 30, packagingScore: 40, transportImpactScore: 60 }),
        confidenceScore: 100,
        sources: ['AGRIBALYSE'],
        methodology: 'LCA agricultural averages for broiler production',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Cow Milk 1L',
        aliases: ['milk', 'fresh milk', 'dairy milk', 'whole milk', 'skimmed milk', 'cow milk', 'pasteurized milk'],
        category: 'Groceries',
        subCategory: 'Milk',
        sustainabilityMetrics: { carbonEmissionKg: 3.1, waterUsageLitres: 1020, wasteScore: 40, packagingScore: 35, transportImpactScore: 70 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 3.1, waterUsageLitres: 1020, wasteScore: 40, packagingScore: 35, transportImpactScore: 70 }),
        confidenceScore: 100,
        sources: ['AGRIBALYSE', 'Open Food Facts Eco-Score'],
        methodology: 'LCA raw milk production and carton packaging',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Oat Milk 1L',
        aliases: ['oat milk', 'almond milk', 'soy milk', 'plant milk', 'vegan milk', 'organic soy milk', 'oat milk tetrapack'],
        category: 'Groceries',
        subCategory: 'Plant Milk',
        sustainabilityMetrics: { carbonEmissionKg: 0.9, waterUsageLitres: 120, wasteScore: 75, packagingScore: 70, transportImpactScore: 80 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 0.9, waterUsageLitres: 120, wasteScore: 75, packagingScore: 70, transportImpactScore: 80 }),
        confidenceScore: 100,
        sources: ['Open Food Facts Eco-Score'],
        methodology: 'LCA plant-based beverage packaging and distribution',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Local Fresh Apples',
        aliases: ['apples', 'apple', 'fresh apples', 'red apples', 'green apples', 'organic apples'],
        category: 'Groceries',
        subCategory: 'Fruit/Vegetables',
        sustainabilityMetrics: { carbonEmissionKg: 0.3, waterUsageLitres: 200, wasteScore: 95, packagingScore: 90, transportImpactScore: 90 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 0.3, waterUsageLitres: 200, wasteScore: 95, packagingScore: 90, transportImpactScore: 90 }),
        confidenceScore: 100,
        sources: ['AGRIBALYSE'],
        methodology: 'LCA orchard management to local distribution',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Local Vegetables',
        aliases: ['vegetables', 'onion', 'onions', 'tomato', 'tomatoes', 'potato', 'potatoes', 'carrots', 'garlic', 'spinach', 'organic veggies'],
        category: 'Groceries',
        subCategory: 'Fruit/Vegetables',
        sustainabilityMetrics: { carbonEmissionKg: 0.25, waterUsageLitres: 150, wasteScore: 95, packagingScore: 90, transportImpactScore: 95 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 0.25, waterUsageLitres: 150, wasteScore: 95, packagingScore: 90, transportImpactScore: 95 }),
        confidenceScore: 100,
        sources: ['AGRIBALYSE', 'FAOSTAT'],
        methodology: 'Open-field agriculture LCA indicators',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'White Rice 1kg',
        aliases: ['rice', 'basmati rice', 'white rice', 'brown rice', 'jasmine rice', 'raw rice'],
        category: 'Groceries',
        subCategory: 'Rice',
        sustainabilityMetrics: { carbonEmissionKg: 4.1, waterUsageLitres: 2450, wasteScore: 80, packagingScore: 60, transportImpactScore: 70 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 4.1, waterUsageLitres: 2450, wasteScore: 80, packagingScore: 60, transportImpactScore: 70 }),
        confidenceScore: 100,
        sources: ['FAOSTAT', 'EDGAR Food Emissions Database'],
        methodology: 'Paddy rice methane emission and packaging footprint analysis',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Metro Transit Passenger Ticket',
        aliases: ['metro', 'metro ticket', 'metro ride', 'subway ticket', 'electric train ticket', 'train ride', 'delhi metro ticket'],
        category: 'Transit',
        subCategory: 'Metro Transit',
        sustainabilityMetrics: { carbonEmissionKg: 0.5, waterUsageLitres: 0, wasteScore: 90, packagingScore: 100, transportImpactScore: 95 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 0.5, waterUsageLitres: 0, wasteScore: 90, packagingScore: 100, transportImpactScore: 95 }),
        confidenceScore: 100,
        sources: ['IEA Grid Intensity'],
        methodology: 'Grid efficiency models for urban electric light rails',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Taxi Ride / Cab fare',
        aliases: ['uber', 'taxi', 'ola', 'cab', 'gasoline ride', 'lyft', 'auto fare'],
        category: 'Transit',
        subCategory: 'Taxi/Cab',
        sustainabilityMetrics: { carbonEmissionKg: 4.4, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 20 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 4.4, waterUsageLitres: 0, wasteScore: 80, packagingScore: 100, transportImpactScore: 20 }),
        confidenceScore: 100,
        sources: ['EDGAR Food Emissions Database'],
        methodology: 'EPA average emission coefficient for light passenger combustion vehicles',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'City Bus Ticket',
        aliases: ['bus', 'bus ticket', 'bus fare', 'public bus ticket', 'local bus ride'],
        category: 'Transit',
        subCategory: 'Bus ticket',
        sustainabilityMetrics: { carbonEmissionKg: 0.9, waterUsageLitres: 0, wasteScore: 85, packagingScore: 100, transportImpactScore: 90 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 0.9, waterUsageLitres: 0, wasteScore: 85, packagingScore: 100, transportImpactScore: 90 }),
        confidenceScore: 100,
        sources: ['EDGAR Food Emissions Database'],
        methodology: 'Transit agency bus fuel intensity per passenger passenger-km',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Coal Grid Electricity Bill',
        aliases: ['electricity bill', 'electric bill', 'power bill', 'bses electricity', 'coal grid power'],
        category: 'Utilities',
        subCategory: 'Electricity',
        sustainabilityMetrics: { carbonEmissionKg: 85.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 100, transportImpactScore: 80 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 85.0, waterUsageLitres: 50, wasteScore: 80, packagingScore: 100, transportImpactScore: 80 }),
        confidenceScore: 100,
        sources: ['IEA Grid Intensity'],
        methodology: 'Grid intensity LCA (850g CO2/kWh on 100kWh baseline coal dominant grid)',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Clean Solar Rooftop Power Bill',
        aliases: ['solar power bill', 'clean power bill', 'solar utility service', 'green energy power'],
        category: 'Utilities',
        subCategory: 'Solar/Clean Electricity',
        sustainabilityMetrics: { carbonEmissionKg: 4.0, waterUsageLitres: 5, wasteScore: 80, packagingScore: 100, transportImpactScore: 95 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 4.0, waterUsageLitres: 5, wasteScore: 80, packagingScore: 100, transportImpactScore: 95 }),
        confidenceScore: 100,
        sources: ['IEA Grid Intensity'],
        methodology: 'Photovoltaic manufacturing footprint amortized across panel lifespan',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Single-Use Plastic Water Bottle',
        aliases: ['plastic bottle', 'water bottle', 'packaged water', 'disposable plastic cup', 'plastic goods'],
        category: 'Shopping',
        subCategory: 'Plastic Goods',
        sustainabilityMetrics: { carbonEmissionKg: 3.5, waterUsageLitres: 75, wasteScore: 10, packagingScore: 10, transportImpactScore: 60 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 3.5, waterUsageLitres: 75, wasteScore: 10, packagingScore: 10, transportImpactScore: 60 }),
        confidenceScore: 100,
        sources: ['Open Food Facts Eco-Score'],
        methodology: 'Polyethylene terephthalate resin manufacturing and recycling rate assessment',
        lastVerifiedAt: new Date()
      },
      {
        canonicalName: 'Organic Cotton T-Shirt',
        aliases: ['cotton shirt', 't-shirt', 'organic shirt', 'clothing organic', 'eco-friendly t-shirt', 'eco shirt'],
        category: 'Shopping',
        subCategory: 'Eco-friendly/Organic Cotton',
        sustainabilityMetrics: { carbonEmissionKg: 4.8, waterUsageLitres: 920, wasteScore: 85, packagingScore: 80, transportImpactScore: 70 },
        sustainabilityScore: calculateScore({ carbonEmissionKg: 4.8, waterUsageLitres: 920, wasteScore: 85, packagingScore: 80, transportImpactScore: 70 }),
        confidenceScore: 100,
        sources: ['AGRIBALYSE'],
        methodology: 'LCA comparing organic crop cultivation vs standard cotton chemical usage',
        lastVerifiedAt: new Date()
      }
    ];

    await SustainabilityKnowledge.insertMany(knowledgeItems);
    console.log('Sustainability Knowledge Base seeded successfully.');

    mongoose.connection.close();
    console.log('Database seeding process completed successfully!');
  } catch (error) {
    console.error('Seeding process failed:', error.message);
    process.exit(1);
  }
};

seedData();
