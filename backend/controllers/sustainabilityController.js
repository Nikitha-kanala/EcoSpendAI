const SustainabilityKnowledge = require('../models/SustainabilityKnowledge');
const SustainabilitySource = require('../models/SustainabilitySource');
const SustainabilityCategory = require('../models/SustainabilityCategory');
const { scoreTransaction, matchProduct } = require('../utils/sustainabilityService');
const { spawn } = require('child_process');
const path = require('path');

// @desc    Lookup a product's sustainability details
// @route   GET /api/sustainability/lookup
// @access  Private
const lookupProduct = async (req, res) => {
  const { q, category } = req.query;
  try {
    if (!q) {
      return res.status(400).json({ message: 'Query string "q" is required' });
    }

    const result = await matchProduct(q, q, category || 'Miscellaneous');
    return res.json(result);
  } catch (error) {
    console.error('Lookup Product Error:', error.message);
    return res.status(500).json({ message: 'Server error looking up product' });
  }
};

// @desc    Calculate sustainability score for items
// @route   POST /api/sustainability/calculate
// @access  Private
const calculateScore = async (req, res) => {
  const { items, category } = req.body;
  try {
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const result = await scoreTransaction(items, category || 'Miscellaneous');
    return res.json(result);
  } catch (error) {
    console.error('Calculate Score Error:', error.message);
    return res.status(500).json({ message: 'Server error calculating sustainability score' });
  }
};

// @desc    Get all verified sustainability sources
// @route   GET /api/sustainability/sources
// @access  Private
const getSources = async (req, res) => {
  try {
    const sources = await SustainabilitySource.find().sort({ name: 1 });
    return res.json(sources);
  } catch (error) {
    console.error('Get Sources Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching sources' });
  }
};

// @desc    Get all categories and default metrics
// @route   GET /api/sustainability/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await SustainabilityCategory.find().sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    console.error('Get Categories Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// @desc    Trigger dataset synchronization / seeding
// @route   POST /api/sustainability/sync
// @access  Private
const syncDataset = async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../scripts/seedSustainability.js');
    const child = spawn('node', [scriptPath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        return res.json({
          message: 'Dataset synchronized and seeded successfully.',
          output: output.trim()
        });
      } else {
        console.error('Seed script error:', errorOutput);
        return res.status(500).json({
          message: 'Dataset synchronization failed.',
          error: errorOutput.trim()
        });
      }
    });
  } catch (error) {
    console.error('Sync Dataset Error:', error.message);
    return res.status(500).json({ message: 'Server error running dataset sync' });
  }
};

module.exports = {
  lookupProduct,
  calculateScore,
  getSources,
  getCategories,
  syncDataset
};
