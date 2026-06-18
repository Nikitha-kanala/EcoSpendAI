const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadReceipt,
  quickLogExpense,
  getExpenses,
  chatAdvisor,
  logManualBill,
  getRedditBlogs,
  confirmExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// Multer in-memory storage config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image file (JPEG, PNG, etc.)'), false);
    }
  }
});

router.use(protect);

router.post('/upload', upload.single('receipt'), uploadReceipt);
router.post('/quick-log', quickLogExpense);
router.post('/manual', logManualBill);
router.post('/confirm', confirmExpense);
router.get('/reddit', getRedditBlogs);
router.get('/', getExpenses);
router.post('/chat', chatAdvisor);

module.exports = router;
