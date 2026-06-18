const express = require('express');
const router = express.Router();
const {
  lookupProduct,
  calculateScore,
  getSources,
  getCategories,
  syncDataset
} = require('../controllers/sustainabilityController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.get('/lookup', lookupProduct);
router.post('/calculate', calculateScore);
router.get('/sources', getSources);
router.get('/categories', getCategories);
router.post('/sync', syncDataset);

module.exports = router;
