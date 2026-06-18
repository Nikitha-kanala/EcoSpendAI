const Expense = require('../models/Expense');
const User = require('../models/User');
const { parseReceiptImage, parseQuickLogText, getChatRecommendation, parseManualBill, generateSustainabilityExplanation } = require('../utils/gemini');
const { scoreTransaction, calculateEcoPoints } = require('../utils/sustainabilityService');

// Helper to update User metrics based on the added expense
const updateUserMetrics = async (userId, co2SavedKg, carbonScore, amount, ecoPoints = 10) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Financial savings: let's assume higher carbon scores save more money relative to the spent amount (e.g. up to 10% savings by walking, eco-appliances, etc.)
    const estimatedSavings = Math.round(co2SavedKg * 20); // Rs 20 saved per kg of CO2 offset
    
    // EcoPoints: based on bandwidth ranges calculated in sustainabilityService
    const earnedPoints = ecoPoints;
    
    // Weekly score update: positive adjustment if eco score is high, negative if very low
    let scoreAdjustment = 0;
    if (carbonScore >= 80) {
      scoreAdjustment = 3;
    } else if (carbonScore < 40) {
      scoreAdjustment = -2;
    }

    user.totalCarbonOffset = parseFloat((user.totalCarbonOffset + co2SavedKg).toFixed(2));
    user.totalSavings = Math.round(user.totalSavings + estimatedSavings);
    user.ecoPoints = user.ecoPoints + earnedPoints;
    user.weeklyScore = Math.max(1, Math.min(100, user.weeklyScore + scoreAdjustment));

    await user.save();
    return user;
  } catch (error) {
    console.error('Failed to update user metrics:', error.message);
  }
};

// @desc    Upload & parse a receipt image
// @route   POST /api/expenses/upload
// @access  Private
const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a receipt image file' });
    }

    // Call Gemini Vision parser
    const parsedData = await parseReceiptImage(req.file.buffer, req.file.mimetype, req.file.originalname);

    if (parsedData.isValid === false) {
      return res.status(400).json({ message: parsedData.reason || 'Validation failed: Image is not a valid receipt.' });
    }

    // Call local matching & scoring engine
    const scoreResult = await scoreTransaction(parsedData.items, parsedData.category);

    return res.json({
      isPending: true,
      parsedData: {
        merchant: parsedData.merchant || 'Unknown Merchant',
        amount: parsedData.amount || 0,
        category: parsedData.category || 'Miscellaneous',
        items: scoreResult.items,
        carbonScore: scoreResult.carbonScore,
        carbonImpact: scoreResult.carbonImpact,
        co2SavedKg: scoreResult.co2SavedKg,
        sustainabilityResult: scoreResult.sustainabilityResult
      }
    });
  } catch (error) {
    console.error('Upload Receipt Error:', error.message);
    return res.status(500).json({ message: 'Server error parsing receipt' });
  }
};

// @desc    Quick log an unstructured expense text
// @route   POST /api/expenses/quick-log
// @access  Private
const quickLogExpense = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Please provide expense text description' });
    }

    // Call Gemini Text/Regex Parser
    const parsedData = await parseQuickLogText(text);

    if (parsedData.isValid === false) {
      return res.status(400).json({ message: parsedData.reason || 'Validation failed: Text description is invalid or unrelated.' });
    }

    // Call local matching & scoring engine
    const scoreResult = await scoreTransaction(parsedData.items, parsedData.category);

    return res.json({
      isPending: true,
      parsedData: {
        merchant: parsedData.merchant || 'Unknown Merchant',
        amount: parsedData.amount || 0,
        category: parsedData.category || 'Miscellaneous',
        items: scoreResult.items,
        carbonScore: scoreResult.carbonScore,
        carbonImpact: scoreResult.carbonImpact,
        co2SavedKg: scoreResult.co2SavedKg,
        sustainabilityResult: scoreResult.sustainabilityResult
      }
    });
  } catch (error) {
    console.error('Quick Log Error:', error.message);
    return res.status(500).json({ message: 'Server error processing transaction text' });
  }
};

// @desc    Get user's expense history
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(expenses);
  } catch (error) {
    console.error('Get Expenses Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// @desc    Personalized Carbon Advice Chat
// @route   POST /api/expenses/chat
// @access  Private
const chatAdvisor = async (req, res) => {
  const { message, chatHistory } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ message: 'Please enter a chat message' });
    }

    // Fetch user expense history context
    const expenseHistory = await Expense.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);

    // Call Gemini Chat Engine
    const aiResponse = await getChatRecommendation(expenseHistory, chatHistory || [], message);

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat Advisor Error:', error.message);
    return res.status(500).json({ message: 'Server error generating recommendations' });
  }
};

// @desc    Log a manual bill/expense or speech transcript
// @route   POST /api/expenses/manual
// @access  Private
const logManualBill = async (req, res) => {
  const { merchant, category, amount, date, usageDetails } = req.body;
  try {
    if (!merchant || !category || !amount) {
      return res.status(400).json({ message: 'Merchant, Category, and Amount are required' });
    }

    // Call Gemini Manual Bill Parser & Auditor
    const parsedData = await parseManualBill(merchant, category, amount, date || new Date().toISOString(), usageDetails || '');

    if (parsedData.isValid === false) {
      return res.status(400).json({ message: parsedData.reason || 'Validation failed: Absurd or invalid bill details.' });
    }

    // Call local matching & scoring engine
    const scoreResult = await scoreTransaction(parsedData.items, parsedData.category);

    return res.json({
      isPending: true,
      parsedData: {
        merchant: parsedData.merchant || merchant,
        amount: parsedData.amount || Number(amount),
        category: parsedData.category || category,
        items: scoreResult.items,
        carbonScore: scoreResult.carbonScore,
        carbonImpact: scoreResult.carbonImpact,
        co2SavedKg: scoreResult.co2SavedKg,
        sustainabilityResult: scoreResult.sustainabilityResult
      }
    });
  } catch (error) {
    console.error('Log Manual Bill Error:', error.message);
    return res.status(500).json({ message: 'Server error processing manual bill' });
  }
};

// @desc    Fetch eco-friendly blogs from Reddit r/sustainability
// @route   GET /api/expenses/reddit
// @access  Private
const getRedditBlogs = async (req, res) => {
  try {
    const response = await fetch('https://www.reddit.com/r/sustainability/hot.json?limit=10');
    if (!response.ok) {
      throw new Error('Reddit request failed');
    }
    const data = await response.json();
    const posts = data.data.children.map(child => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        url: 'https://reddit.com' + post.permalink,
        subreddit: post.subreddit_name_prefixed,
        score: post.score,
        numComments: post.num_comments,
        thumbnail: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : '',
        createdUtc: post.created_utc
      };
    });
    return res.json(posts);
  } catch (error) {
    console.warn('Reddit fetch failed, returning mock data:', error.message);
    const mockBlogs = [
      {
        id: 'mock1',
        title: 'Simple steps to cut your household carbon footprint by 40%',
        author: 'EcoExpert',
        url: 'https://reddit.com/r/sustainability',
        subreddit: 'r/sustainability',
        score: 245,
        numComments: 34,
        thumbnail: '',
        createdUtc: Date.now() / 1000 - 3600 * 2
      },
      {
        id: 'mock2',
        title: 'Study: Plant-based proteins have 90% less environmental impact than beef',
        author: 'GreenLife',
        url: 'https://reddit.com/r/sustainability',
        subreddit: 'r/sustainability',
        score: 189,
        numComments: 56,
        thumbnail: '',
        createdUtc: Date.now() / 1000 - 3600 * 8
      },
      {
        id: 'mock3',
        title: 'Electric grids are decarbonizing faster than expected, report shows',
        author: 'SolarWindFan',
        url: 'https://reddit.com/r/sustainability',
        subreddit: 'r/sustainability',
        score: 312,
        numComments: 89,
        thumbnail: '',
        createdUtc: Date.now() / 1000 - 3600 * 15
      }
    ];
    return res.json(mockBlogs);
  }
};

// @desc    Confirm and calculate final LCA carbon footprint & save
// @route   POST /api/expenses/confirm
// @access  Private
const confirmExpense = async (req, res) => {
  const { merchant, amount, category, items, lifecycleDetails } = req.body;

  try {
    if (!merchant || !category || amount === undefined || !items) {
      return res.status(400).json({ message: 'Missing required confirmation fields' });
    }

    // Default emissions variables
    let cookingEmissions = 0;
    let transportEmissions = 0;
    let packagingEmissions = 0;
    let wasteEmissions = 0;

    if (lifecycleDetails) {
      const { cooking, transport, packaging, waste } = lifecycleDetails;

      // 1. Cooking Emissions
      if (cooking && cooking.involved) {
        const minutes = Number(cooking.minutes) || 0;
        if (cooking.method === 'electric') {
          cookingEmissions = minutes * (1.5 / 60) * 0.85;
        } else if (cooking.method === 'gas') {
          cookingEmissions = minutes * (0.15 / 60) * 3.0;
        } else if (cooking.method === 'solar') {
          cookingEmissions = minutes * (1.5 / 60) * 0.04;
        }
      }

      // 2. Transport Emissions
      if (transport && transport.involved) {
        const dist = Number(transport.distanceKm) || 0;
        const fuel = Number(transport.fuelLiters) || 0;
        if (transport.mode === 'petrol_diesel') {
          if (fuel > 0) {
            transportEmissions = fuel * 2.3;
          } else {
            transportEmissions = dist * 0.15;
          }
        } else if (transport.mode === 'ev') {
          transportEmissions = dist * 0.03;
        } else if (transport.mode === 'cng') {
          transportEmissions = dist * 0.08;
        } else if (transport.mode === 'bicycle') {
          transportEmissions = 0;
        }
      }

      // 3. Packaging Emissions
      if (packaging && packaging.involved) {
        const plastic = Number(packaging.plasticQty) || 0;
        const cardboard = Number(packaging.cardboardQty) || 0;
        const aluminium = Number(packaging.aluminiumQty) || 0;
        const styrofoam = Number(packaging.styrofoamQty) || 0;
        packagingEmissions = (plastic * 0.1) + (cardboard * 0.02) + (aluminium * 0.25) + (styrofoam * 0.15);
      }

      // 4. Waste Emissions
      if (waste && waste.involved) {
        if (waste.size === 'small') {
          wasteEmissions = 0.05;
        } else if (waste.size === 'medium') {
          wasteEmissions = 0.15;
        } else if (waste.size === 'large') {
          wasteEmissions = 0.35;
        }
      }
    }

    // Round calculations to 3 decimal places
    cookingEmissions = Math.round(cookingEmissions * 1000) / 1000;
    transportEmissions = Math.round(transportEmissions * 1000) / 1000;
    packagingEmissions = Math.round(packagingEmissions * 1000) / 1000;
    wasteEmissions = Math.round(wasteEmissions * 1000) / 1000;

    // Sum items ingredient emissions
    let ingredientsEmissions = 0;
    let confidenceSum = 0;
    const allSources = new Set();

    items.forEach(item => {
      ingredientsEmissions += Number(item.carbonEmissionKg) || 0;
      confidenceSum += Number(item.confidenceScore) || 50;
      if (item.sources) {
        item.sources.forEach(src => allSources.add(src));
      }
    });

    const totalCarbonEmissionKg = Math.round((ingredientsEmissions + cookingEmissions + transportEmissions + packagingEmissions + wasteEmissions) * 100) / 100;

    // Recompute Carbon Score: 100 * exp(-0.05 * total emissions)
    const finalCarbonScore = Math.max(1, Math.min(100, Math.round(100 * Math.exp(-0.05 * totalCarbonEmissionKg))));

    // Recompute EcoPoints based on bandwidth ranges
    const ecoPoints = calculateEcoPoints(totalCarbonEmissionKg);

    let carbonImpact = 'medium';
    if (finalCarbonScore >= 70) {
      carbonImpact = 'low';
    } else if (finalCarbonScore < 40) {
      carbonImpact = 'high';
    }

    const avgConfidence = items.length > 0 ? Math.round(confidenceSum / items.length) : 80;

    const initialExpense = {
      merchant,
      amount,
      category,
      items,
      carbonScore: finalCarbonScore,
      carbonImpact,
      co2SavedKg: 0,
      sustainabilityResult: {
        score: finalCarbonScore,
        confidence: avgConfidence,
        sourceReferences: allSources.size > 0 ? Array.from(allSources) : ['Lifecycle Assessment Standards'],
        methodology: 'Knowledge-Base-Driven Lifecycle Assessment (LCA)',
        ecoPoints,
        totalCarbonEmissionKg
      }
    };

    // Calculate co2SavedKg: original co2Saved minus cooking, transport, packaging, waste emissions
    const initialCo2Saved = Number(req.body.co2SavedKg) || 0;
    const totalProcessEmissions = cookingEmissions + transportEmissions + packagingEmissions + wasteEmissions;
    const co2SavedKg = Math.round((Math.max(0, initialCo2Saved - totalProcessEmissions)) * 100) / 100;
    initialExpense.co2SavedKg = co2SavedKg;

    // Generate post-scoring sustainability explanation with AI context
    const explanation = await generateSustainabilityExplanation(initialExpense);
    initialExpense.sustainabilityResult.explanation = explanation;

    // Create Expense in DB
    const expense = await Expense.create({
      userId: req.user._id,
      merchant,
      amount,
      category,
      items,
      carbonScore: finalCarbonScore,
      carbonImpact,
      co2SavedKg,
      sustainabilityResult: initialExpense.sustainabilityResult,
      cookingEmissions,
      transportEmissions,
      packagingEmissions,
      wasteEmissions,
      lifecycleDetails
    });

    // Update user aggregates
    const updatedUser = await updateUserMetrics(
      req.user._id,
      expense.co2SavedKg,
      expense.carbonScore,
      expense.amount,
      expense.sustainabilityResult.ecoPoints
    );

    return res.status(201).json({
      expense,
      user: {
        totalSavings: updatedUser.totalSavings,
        totalCarbonOffset: updatedUser.totalCarbonOffset,
        ecoPoints: updatedUser.ecoPoints,
        weeklyScore: updatedUser.weeklyScore,
      }
    });

  } catch (error) {
    console.error('Confirm Expense Error:', error.message);
    return res.status(500).json({ message: 'Server error saving confirmed expense' });
  }
};

module.exports = {
  uploadReceipt,
  quickLogExpense,
  getExpenses,
  chatAdvisor,
  logManualBill,
  getRedditBlogs,
  confirmExpense
};
