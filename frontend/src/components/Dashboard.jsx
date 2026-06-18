import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  TrendingDown, 
  Leaf, 
  IndianRupee, 
  Award, 
  Sparkles,
  Download,
  AlertCircle,
  X,
  Mic,
  Calendar,
  Lock,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const getPersonalizedAlternative = (insight) => {
  if (!insight) return { name: '', description: '', costReductionPct: 0, carbonReductionPct: 0 };
  const category = (insight.category || 'Miscellaneous').toLowerCase();
  const amount = Number(insight.amount) || 0;
  const items = insight.items || [];
  const merchant = insight.merchant || 'this merchant';
  
  // Find key items by keyword
  const itemNames = items.map(it => it.name.toLowerCase());
  
  let name = '';
  let description = '';
  let costReductionPct = 30;
  let carbonReductionPct = 50;

  // Check specific high-impact item patterns
  const hasBeef = itemNames.some(n => n.includes('beef') || n.includes('steak') || n.includes('mutton') || n.includes('pork') || n.includes('meat'));
  const hasDairy = itemNames.some(n => n.includes('milk') || n.includes('dairy') || n.includes('cheese') || n.includes('butter') || n.includes('paneer'));
  const hasCab = itemNames.some(n => n.includes('cab') || n.includes('taxi') || n.includes('uber') || n.includes('ola') || n.includes('ride'));
  const hasCoffee = itemNames.some(n => n.includes('coffee') || n.includes('tea') || n.includes('cafe') || n.includes('beverage') || n.includes('coke') || n.includes('soda'));
  const hasFastFood = itemNames.some(n => n.includes('samosa') || n.includes('popcorn') || n.includes('burger') || n.includes('pizza') || n.includes('fry') || n.includes('chips'));

  if (hasBeef) {
    name = 'Substitute Red Meat with Plant Proteins (Save ~35% Cost & 70% Carbon)';
    const meatItem = items.find(it => it.name.toLowerCase().includes('beef') || it.name.toLowerCase().includes('steak') || it.name.toLowerCase().includes('mutton') || it.name.toLowerCase().includes('pork') || it.name.toLowerCase().includes('meat'))?.name || 'meat items';
    description = `Your purchase of "${meatItem}" has a heavy carbon footprint. Swapping this for plant proteins (lentils/beans) or chicken cuts checkout expenses by ~35% while lowering meal emissions by 70%.`;
    costReductionPct = 35;
    carbonReductionPct = 70;
  } else if (hasDairy) {
    name = 'Choose Plant-Based Milk / Dairy Alternatives (Save ~25% Cost & 60% Carbon)';
    const dairyItem = items.find(it => it.name.toLowerCase().includes('milk') || it.name.toLowerCase().includes('dairy') || it.name.toLowerCase().includes('cheese') || it.name.toLowerCase().includes('butter') || it.name.toLowerCase().includes('paneer'))?.name || 'dairy items';
    description = `Dairy products like "${dairyItem}" rely on high-emission livestock farming. Choosing plant-based milks (oat, soy, almond) decreases purchase costs by ~25% and reduces carbon by 60%.`;
    costReductionPct = 25;
    carbonReductionPct = 60;
  } else if (hasCab) {
    name = 'Switch Cab Commutes to Metro / EV / City Bus (Save ~80% Cost & 85% Carbon)';
    const cabItem = items.find(it => it.name.toLowerCase().includes('cab') || it.name.toLowerCase().includes('taxi') || it.name.toLowerCase().includes('uber') || it.name.toLowerCase().includes('ola'))?.name || 'cab transit';
    description = `Your ride "${cabItem}" is highly carbon-intensive. Shifting to city metro rail, public bus transit, or hybrid/EV rides cuts travel expenses by up to 80% and reduces carbon by 85%.`;
    costReductionPct = 80;
    carbonReductionPct = 85;
  } else if (hasCoffee) {
    name = 'Use Personal Thermal Tumbler / Reusable Mug (Save ~15% Cost & 40% Carbon)';
    const coffeeItem = items.find(it => it.name.toLowerCase().includes('coffee') || it.name.toLowerCase().includes('tea') || it.name.toLowerCase().includes('cafe') || it.name.toLowerCase().includes('coke') || it.name.toLowerCase().includes('soda'))?.name || 'beverages';
    description = `For your drink "${coffeeItem}", bringing a personal thermal cup avoids single-use container tax/waste, lowers carbon by 40%, and earns a ₹20-50 discount at major cafes.`;
    costReductionPct = 15;
    carbonReductionPct = 40;
  } else if (hasFastFood) {
    name = 'Choose Dine-in Vegetarian Combos (Save ~40% Cost & 50% Carbon)';
    const foodItem = items.find(it => it.name.toLowerCase().includes('samosa') || it.name.toLowerCase().includes('popcorn') || it.name.toLowerCase().includes('burger') || it.name.toLowerCase().includes('pizza'))?.name || 'food items';
    description = `Your order of "${foodItem}" at ${merchant} includes processed ingredients. Opting for dine-in local veg combos cuts single-use packaging surcharges and cuts emissions by 50%.`;
    costReductionPct = 40;
    carbonReductionPct = 50;
  } else {
    // Category-specific fallbacks with customized items text
    const sampleItem = items[0]?.name || 'items';
    if (category === 'transit') {
      name = 'Switch Cabs to Public/Shared Transit (Save ~80% Cost & 85% Carbon)';
      description = `For your transit fare of ₹${amount.toLocaleString('en-IN')}, opting for metro rail or cycling reduces your transport expenses by ~80% and cuts carbon by 85%.`;
      costReductionPct = 80;
      carbonReductionPct = 85;
    } else if (category === 'dining') {
      name = 'Choose Plant-Based Entrees & Dine-in (Save ~45% Cost & 60% Carbon)';
      description = `For your meal of ₹${amount.toLocaleString('en-IN')} at ${merchant} (featuring "${sampleItem}"), ordering vegetarian options and dining in avoids packaging markups and cuts carbon by 60%.`;
      costReductionPct = 45;
      carbonReductionPct = 60;
    } else if (category === 'groceries') {
      name = 'Buy Local Produce & Plant Proteins (Save ~35% Cost & 70% Carbon)';
      description = `For your grocery bill (with "${sampleItem}"), substituting red meat with seasonal vegetables and plant-based protein lowers your bill by ~35% and cuts food emissions by 70%.`;
      costReductionPct = 35;
      carbonReductionPct = 70;
    } else if (category === 'utilities') {
      name = 'Transition to Solar Net-Metering & LEDs (Save ~50% Cost & 90% Carbon)';
      description = `Your utility payment of ₹${amount.toLocaleString('en-IN')} for "${sampleItem}" relies on coal power. Installing solar panels or 5-star energy appliances reduces electricity bills by 50% and cuts carbon by 90%.`;
      costReductionPct = 50;
      carbonReductionPct = 90;
    } else if (category === 'shopping') {
      name = 'Choose Thrifted / Pre-Loved Fashion (Save ~65% Cost & 50% Carbon)';
      description = `For your shopping item "${sampleItem}", buying pre-loved/secondhand items reduces retail markup costs by ~65% and saves 50% of manufacturing carbon emissions.`;
      costReductionPct = 65;
      carbonReductionPct = 50;
    } else {
      name = 'Opt for Package-Free Bulk Buying (Save ~25% Cost & 40% Carbon)';
      description = `For your purchase of "${sampleItem}" at ${merchant}, buying package-free or in bulk cuts product markup by ~25% and saves packaging carbon emissions by 40%.`;
      costReductionPct = 25;
      carbonReductionPct = 40;
    }
  }

  return { name, description, costReductionPct, carbonReductionPct };
};

const getItemEmoji = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('samosa')) return '🥟';
  if (n.includes('popcorn')) return '🍿';
  if (n.includes('coke') || n.includes('soda') || n.includes('cola')) return '🥤';
  if (n.includes('beef') || n.includes('steak') || n.includes('meat') || n.includes('mutton') || n.includes('pork')) return '🥩';
  if (n.includes('chicken') || n.includes('breast')) return '🍗';
  if (n.includes('milk') || n.includes('dairy') || n.includes('cheese') || n.includes('butter') || n.includes('paneer')) return '🥛';
  if (n.includes('apple') || n.includes('fruit')) return '🍎';
  if (n.includes('wheat') || n.includes('atta') || n.includes('flour')) return '🌾';
  if (n.includes('metro') || n.includes('train')) return '🚇';
  if (n.includes('bus')) return '🚌';
  if (n.includes('cab') || n.includes('taxi') || n.includes('ride') || n.includes('uber') || n.includes('ola')) return '🚗';
  if (n.includes('electricity') || n.includes('power') || n.includes('energy') || n.includes('light')) return '⚡';
  if (n.includes('water')) return '💧';
  if (n.includes('jean') || n.includes('denim') || n.includes('pant')) return '👖';
  if (n.includes('shirt') || n.includes('polo') || n.includes('t-shirt') || n.includes('clothe') || n.includes('jacket')) return '👕';
  return '📦';
};

export default function Dashboard() {
  const { user, updateUserMetrics } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogLoading, setQuickLogLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [insight, setInsight] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Lifecycle Assessment states
  const [pendingExpense, setPendingExpense] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireStep, setQuestionnaireStep] = useState(1);
  const [lifecycleDetails, setLifecycleDetails] = useState({
    cooking: { involved: false, method: 'electric', minutes: 10 },
    transport: { involved: false, mode: 'petrol_diesel', distanceKm: 5, fuelLiters: 0 },
    packaging: { involved: false, plasticQty: 0, cardboardQty: 0, aluminiumQty: 0, styrofoamQty: 0 },
    waste: { involved: false, size: 'small' }
  });
  const [confirming, setConfirming] = useState(false);

  // Tab state: 'text' | 'voice' | 'manual'
  const [logTab, setLogTab] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Manual bill states
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualCategory, setManualCategory] = useState('Utilities');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualUsageDetails, setManualUsageDetails] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // Fetch initial expense history
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleRowClick = (expense) => {
    setInsight({
      merchant: expense.merchant,
      amount: expense.amount,
      category: expense.category,
      carbonScore: expense.carbonScore,
      co2SavedKg: expense.co2SavedKg,
      sustainabilityResult: expense.sustainabilityResult,
      items: expense.items,
      cookingEmissions: expense.cookingEmissions || 0,
      transportEmissions: expense.transportEmissions || 0,
      packagingEmissions: expense.packagingEmissions || 0,
      wasteEmissions: expense.wasteEmissions || 0,
      suggestion: expense.sustainabilityResult?.explanation || `This transaction has a verified carbon score of ${expense.carbonScore}/100.`
    });
    setShowInsight(true);
  };

  useEffect(() => {
    fetchExpenses();

    // Initialize web speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setNotification({ type: 'info', message: 'Listening to your voice...' });
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuickLogText(transcript);
        setIsRecording(false);
        setNotification(null);
      };

      rec.onerror = (event) => {
        console.warn('Speech error', event.error);
        setIsRecording(false);
        setNotification({ type: 'error', message: `Speech recognition error: ${event.error}` });
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      // Simulator fallback if Web Speech isn't supported/available in sandbox
      setIsRecording(true);
      setNotification({ type: 'info', message: 'Simulating speech transcript capture...' });
      
      setTimeout(() => {
        const samples = [
          "Paid standard electricity bill of five hundred rupees at electricity board",
          "Bought vegan burger at Organic Cafe for 250 rupees",
          "Booked metro transit card ticket for 80 rupees",
          "Gas bill paid for six hundred rupees"
        ];
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        setQuickLogText(randomSample);
        setIsRecording(false);
        setNotification(null);
      }, 2500);
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setQuickLogText('');
      recognition.start();
    }
  };

  // Handle Drag Over
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process Receipt Upload
  const handleUploadFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setDragActive(false);
    setNotification(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('/api/expenses/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error processing receipt');
      }

      if (data.isPending) {
        setPendingExpense(data.parsedData);
        setLifecycleDetails({
          cooking: { involved: false, method: 'electric', minutes: 10 },
          transport: { involved: false, mode: 'petrol_diesel', distanceKm: 5, fuelLiters: 0 },
          packaging: { involved: false, plasticQty: 0, cardboardQty: 0, aluminiumQty: 0, styrofoamQty: 0 },
          waste: { involved: false, size: 'small' }
        });
        setQuestionnaireStep(1);
        setShowQuestionnaire(true);
      } else {
        setExpenses(prev => [data.expense, ...prev]);
        updateUserMetrics(data.user);
        triggerSuccessInsights(data.expense);
      }

    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Parsing failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Process Drop Event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Process manual file selector
  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  // Submit text quick log
  const handleQuickLogSubmit = async (e) => {
    e.preventDefault();
    if (!quickLogText.trim()) return;

    setQuickLogLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/expenses/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickLogText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error parsing quick text');
      }

      if (data.isPending) {
        setPendingExpense(data.parsedData);
        setLifecycleDetails({
          cooking: { involved: false, method: 'electric', minutes: 10 },
          transport: { involved: false, mode: 'petrol_diesel', distanceKm: 5, fuelLiters: 0 },
          packaging: { involved: false, plasticQty: 0, cardboardQty: 0, aluminiumQty: 0, styrofoamQty: 0 },
          waste: { involved: false, size: 'small' }
        });
        setQuestionnaireStep(1);
        setShowQuestionnaire(true);
      } else {
        setExpenses(prev => [data.expense, ...prev]);
        updateUserMetrics(data.user);
        triggerSuccessInsights(data.expense);
      }
      setQuickLogText('');
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Quick log failed.' });
    } finally {
      setQuickLogLoading(false);
    }
  };

  // Submit Manual utility bill logger
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualMerchant || !manualCategory || !manualAmount) return;

    setManualLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/expenses/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: manualMerchant,
          category: manualCategory,
          amount: Number(manualAmount),
          date: manualDate,
          usageDetails: manualUsageDetails
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error parsing manual bill');
      }

      if (data.isPending) {
        setPendingExpense(data.parsedData);
        setLifecycleDetails({
          cooking: { involved: false, method: 'electric', minutes: 10 },
          transport: { involved: false, mode: 'petrol_diesel', distanceKm: 5, fuelLiters: 0 },
          packaging: { involved: false, plasticQty: 0, cardboardQty: 0, aluminiumQty: 0, styrofoamQty: 0 },
          waste: { involved: false, size: 'small' }
        });
        setQuestionnaireStep(1);
        setShowQuestionnaire(true);
      } else {
        setExpenses(prev => [data.expense, ...prev]);
        updateUserMetrics(data.user);
        triggerSuccessInsights(data.expense);
      }
      
      // Clear fields
      setManualMerchant('');
      setManualAmount('');
      setManualUsageDetails('');
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Manual logging failed.' });
    } finally {
      setManualLoading(false);
    }
  };

  // Submit LCA confirmation
  const handleConfirmSubmit = async () => {
    if (!pendingExpense) return;
    setConfirming(true);
    setNotification(null);

    try {
      const response = await fetch('/api/expenses/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: pendingExpense.merchant,
          amount: pendingExpense.amount,
          category: pendingExpense.category,
          items: pendingExpense.items,
          co2SavedKg: pendingExpense.co2SavedKg,
          lifecycleDetails
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error saving confirmed expense');
      }

      setExpenses(prev => [data.expense, ...prev]);
      updateUserMetrics(data.user);
      setShowQuestionnaire(false);
      setPendingExpense(null);

      // Set state to trigger the high impact Poetic environmental statement modal
      setInsight({
        merchant: data.expense.merchant,
        amount: data.expense.amount,
        category: data.expense.category,
        carbonScore: data.expense.carbonScore,
        co2SavedKg: data.expense.co2SavedKg,
        sustainabilityResult: data.expense.sustainabilityResult,
        items: data.expense.items,
        cookingEmissions: data.expense.cookingEmissions,
        transportEmissions: data.expense.transportEmissions,
        packagingEmissions: data.expense.packagingEmissions,
        wasteEmissions: data.expense.wasteEmissions,
        suggestion: data.expense.sustainabilityResult?.explanation || `This transaction has a verified carbon score of ${data.expense.carbonScore}/100.`
      });
      setShowInsight(true);

      if (data.expense.carbonScore >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      }

      setNotification({ type: 'success', message: 'Environmental impact logged successfully!' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Confirmation failed.' });
    } finally {
      setConfirming(false);
    }
  };

  // Custom Success Insights & Confetti Trigger
  const triggerSuccessInsights = (expense) => {
    if (expense.carbonScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    let suggestion = '';
    if (expense.category === 'Dining') {
      suggestion = 'Alternative Identified: Switching your daily coffee item to a reusable container will save you ₹240 and 1.2kg CO₂ next week!';
    } else if (expense.category === 'Transit') {
      suggestion = expense.carbonScore < 50 
        ? 'Carbon Saver Tip: Commuting via Metro/Bus instead of private cabs cuts travel emissions by 80% and saves ₹400/week.'
        : 'Amazing Job! Your public transit selection saved 1.8kg of CO₂ emissions compared to standard fuel cabs.';
    } else if (expense.category === 'Groceries') {
      suggestion = 'Eco Shopping Tip: Substituting 1kg of red meat with plant-based protein saves roughly 27kg of CO₂ emissions.';
    } else {
      suggestion = `Carbon score computed at ${expense.carbonScore}/100. Reduce non-reusable purchases to earn bonus points.`;
    }

    setInsight({
      merchant: expense.merchant,
      amount: expense.amount,
      category: expense.category,
      carbonScore: expense.carbonScore,
      co2SavedKg: expense.co2SavedKg,
      suggestion: expense.sustainabilityResult?.explanation || suggestion,
      sustainabilityResult: expense.sustainabilityResult,
      items: expense.items
    });
    setShowInsight(true);
  };

  // Download PDF certificate
  const downloadCertificate = async () => {
    try {
      setNotification({ type: 'info', message: 'Generating certificate PDF, please wait...' });
      const response = await fetch('/api/reports/certificate');
      if (!response.ok) throw new Error('Could not download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sustainability_certificate_${user.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotification(null);
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Failed to download certificate PDF.' });
    }
  };

  const currentPoints = user?.ecoPoints || 0;
  const isUnlocked = currentPoints >= 50;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Green Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time environmental diagnostics & AI financial ledger.
          </p>
        </div>
        
        {isUnlocked ? (
          <button
            onClick={downloadCertificate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-200 cursor-pointer text-sm"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Download Eco-Certificate</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-sm select-none">
            <Lock className="w-4.5 h-4.5 text-slate-400" />
            <span>Unlocks at 50 pts (needs {50 - currentPoints} more)</span>
          </div>
        )}
      </div>

      {/* Alert Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
            : notification.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-705 dark:text-blue-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DUAL-AXIS METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Expenditure card */}
        <div 
          onClick={() => document.getElementById('recent-transactions-ledger')?.scrollIntoView({ behavior: 'smooth' })}
          className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all select-none group"
        >
          <div className="absolute right-4 top-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 dark:text-slate-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenditures</span>
            <div className="group/tooltip relative inline-block cursor-help" onClick={(e) => e.stopPropagation()}>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover/tooltip:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 z-50 leading-relaxed font-normal normal-case tracking-normal">
                The total money you spent across all logged invoices. Click this card to view your ledger.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
          </h3>
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              From {expenses.length} logged invoices
            </span>
            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View ledger <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Total Carbon Offset card */}
        <div 
          onClick={() => document.getElementById('recent-transactions-ledger')?.scrollIntoView({ behavior: 'smooth' })}
          className="glass-panel rounded-3xl p-6 shadow-sm border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-emerald-550/30 transition-all select-none group"
        >
          <div className="absolute right-4 top-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Offset</span>
            <div className="group/tooltip relative inline-block cursor-help" onClick={(e) => e.stopPropagation()}>
              <HelpCircle className="w-3.5 h-3.5 text-emerald-550/80 hover:text-emerald-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover/tooltip:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 z-50 leading-relaxed font-normal normal-case tracking-normal">
                The amount of greenhouse gas (CO₂) you saved by choosing greener alternatives. Click this card to view.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-emerald-400 mt-2">
            {(user?.totalCarbonOffset || 0).toFixed(1)} <span className="text-base font-medium">kg CO₂</span>
          </h3>
          <div className="text-[10px] font-bold text-emerald-605 dark:text-emerald-400 mt-0.5">
            ≈ {Math.ceil((user?.totalCarbonOffset || 0) * 16)} pine tree-absorption days
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              Mitigated cumulative footprint
            </span>
            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View ledger <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </div>
        </div>

        {/* Cumulative EcoPoints card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden hover:scale-[1.02] transition-all group">
          <div className="absolute right-4 top-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Eco Points</span>
            <div className="group/tooltip relative inline-block cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover/tooltip:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 z-50 leading-relaxed font-normal normal-case tracking-normal">
                Points earned for making sustainable choices. Use these to unlock and download certificates!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            {user?.ecoPoints || 0}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2.5">
            Login Streak: {user?.loginStreak || 1} 🔥
          </p>
        </div>

        {/* Weekly Eco Score card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden hover:scale-[1.02] transition-all group">
          <div className="absolute right-4 top-4 bg-amber-500/10 p-2 rounded-xl text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Eco Score</span>
            <div className="group/tooltip relative inline-block cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover/tooltip:block bg-slate-950 text-white text-[10px] p-2.5 rounded-xl shadow-xl border border-slate-800 z-50 leading-relaxed font-normal normal-case tracking-normal">
                Your average environmental score this week. Aim for 70+ by logging low carbon invoices.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-950"></div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            {user?.weeklyScore || 100} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/100</span>
          </h3>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2.5 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Targeting &lt; 20kg weekly emissions</span>
          </div>
        </div>
      </div>

      {/* FILE DROPZONE & LOGGING PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COMPONENT: RECEIPT SCANNER */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-panel rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 transition-opacity duration-300">
                <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shimmer-loader"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded shimmer-loader"></div>
                      <div className="h-3 w-20 rounded shimmer-loader"></div>
                    </div>
                  </div>
                  <div className="h-32 w-full rounded-xl shimmer-loader"></div>
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-semibold animate-pulse pt-2">
                    AI extracting receipt & reconciling CO₂ metrics...
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <span>AI Receipt Scanner</span>
              </h2>
            </div>

            {/* Drop Zone Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer min-h-[180px] ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/2'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                Drag and drop your receipt image here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-center">
                or click to browse local files
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: INTEGRATED TABS LOGGER */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Tab Header Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 gap-4">
              <button
                onClick={() => setLogTab('text')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'text' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Text Log
              </button>
              <button
                onClick={() => setLogTab('voice')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'voice' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Voice / Speech Log
              </button>
              <button
                onClick={() => setLogTab('manual')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'manual' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Manual Bill Form
              </button>
            </div>

            {/* TAB CONTENT: TEXT LOG */}
            {logTab === 'text' && (
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  Describe your transaction in plain English. Gemini extracts category, merchant, amount and CO₂ footprints.
                </p>
                <form onSubmit={handleQuickLogSubmit} className="space-y-4">
                  <textarea
                    value={quickLogText}
                    onChange={(e) => setQuickLogText(e.target.value)}
                    placeholder="Examples:&#13;• Bought vegan burger for ₹240 at BioCafe&#13;• Metro card recharge 500 rupees"
                    rows={4}
                    className="w-full p-4 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm leading-normal resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={quickLogLoading || !quickLogText.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    {quickLogLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Parse & Log Expense</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: VOICE LOG */}
            {logTab === 'voice' && (
              <div className="text-center space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed text-left">
                  Speak clearly to describe your transaction. We will record your voice, transcribe it, and analyze the carbon impact using Gemini.
                </p>

                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all cursor-pointer transform active:scale-95 ${
                      isRecording 
                        ? 'bg-rose-500 border-rose-300 text-white animate-pulse' 
                        : 'bg-emerald-500 border-emerald-300 text-white'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-3">
                    {isRecording ? 'Listening (Click to stop)' : 'Click to Speak'}
                  </span>
                </div>

                {quickLogText && (
                  <div className="bg-slate-50 dark:bg-emerald-950/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Transcript Capture</p>
                    <p className="text-sm text-slate-800 dark:text-white leading-relaxed">"{quickLogText}"</p>
                  </div>
                )}

                <button
                  onClick={handleQuickLogSubmit}
                  disabled={quickLogLoading || !quickLogText.trim() || isRecording}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-4"
                >
                  {quickLogLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Analyze Voice Expense</span>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: MANUAL BILL FORM */}
            {logTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Manually register utility bills or invoices that don't have transaction receipts (e.g. Electric Grid bills, water pipeline bills, gas line bills).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Provider / Merchant</label>
                    <input
                      type="text"
                      required
                      value={manualMerchant}
                      onChange={(e) => setManualMerchant(e.target.value)}
                      placeholder="e.g. Tata Power, Aqua Water Co"
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Utilities">Utilities (Electricity/Power)</option>
                      <option value="Water">Water Bill</option>
                      <option value="Gas">Gas Bill</option>
                      <option value="Transit">Transit/Fuel bill</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bill Amount (INR)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="₹"
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billing Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Usage Description (Optional)</label>
                  <input
                    type="text"
                    value={manualUsageDetails}
                    onChange={(e) => setManualUsageDetails(e.target.value)}
                    placeholder="e.g. 150 kWh consumed, solar panels active, etc."
                    className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {manualLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Analyze & Audit Bill</span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2.5 items-start text-[11px] text-slate-400 dark:text-slate-505">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Audit algorithms underpinned by Google Gemini 1.5 Flash.</span>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTION LEDGER LOG */}
      <div id="recent-transactions-ledger" className="glass-panel rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Click on any row to view its detailed environmental diagnostics and lifecycle audit breakdown.
            </p>
          </div>
          {/* Carbon Score Legend */}
          <div className="flex items-center flex-wrap gap-4 text-[11px] bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 px-4 py-2 rounded-2xl select-none">
            <span className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[9px]">Carbon Score:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Excellent (75+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20"></span>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Moderate (45-74)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20"></span>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">High Impact (&lt;45)</span>
            </div>
          </div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 dark:text-slate-500">No transactions recorded yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Upload a receipt image or submit a Log above to start tracking!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">Merchant</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Carbon Score</th>
                  <th className="pb-3 px-4">Carbon Impact</th>
                  <th className="pb-3 px-4 text-right">CO₂ Mitigated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {expenses.map((expense) => (
                  <tr 
                    key={expense._id} 
                    onClick={() => handleRowClick(expense)}
                    className="hover:bg-slate-50/50 dark:hover:bg-emerald-950/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 pr-4 font-semibold text-slate-800 dark:text-white">
                      {expense.merchant}
                      <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                        {new Date(expense.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{expense.category}</td>
                    <td className="py-3.5 px-4 font-medium">₹{expense.amount}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          expense.carbonScore >= 75 ? 'bg-emerald-500' : expense.carbonScore >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        <span>{expense.carbonScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        expense.carbonImpact === 'low' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : expense.carbonImpact === 'medium' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {expense.carbonImpact}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {expense.co2SavedKg > 0 ? `+${expense.co2SavedKg.toFixed(1)} kg` : '0 kg'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ENVIRONMENTAL IMPACT DISCLAIMER MODAL */}
      {showInsight && insight && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-8 text-white relative animate-fade-in no-scrollbar">
            
            {/* Close button */}
            <button 
              onClick={() => setShowInsight(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header section with Sad/Leaf Emoji */}
            <div className="text-center space-y-4">
              {insight.sustainabilityResult?.totalCarbonEmissionKg > 2 ? (
                <>
                  <div className="text-7xl animate-bounce">😭</div>
                  <h3 className="text-2xl font-black text-rose-500 tracking-tight">
                    ENVIRONMENTAL IMPACT STATEMENT
                  </h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    We must face the truth of our footprints. Your transaction for <span className="text-white font-bold">{insight.merchant}</span> has exacted a cost from the Earth.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-7xl animate-pulse">🍃</div>
                  <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
                    A GENTLE TRACE LEFT BEHIND
                  </h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    A light touch upon the soil. Your transaction for <span className="text-white font-bold">{insight.merchant}</span> shows care for our environment.
                  </p>
                </>
              )}
            </div>

            {/* Footprint Value Display */}
            <div className="my-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Total Carbon Footprint</span>
              <span className="text-4xl font-black text-rose-500">
                {(insight.sustainabilityResult?.totalCarbonEmissionKg || 0).toFixed(2)} <span className="text-lg">kg CO₂e</span>
              </span>
              <div className="text-xs text-slate-400 mt-2 font-medium">
                Mitigated: {insight.co2SavedKg?.toFixed(2) || '0.00'} kg CO₂ | Score: {insight.carbonScore || 1}/100
              </div>
              <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold leading-relaxed flex items-center justify-center gap-1.5 px-3">
                <span className="text-sm">💡</span>
                <span>With a smaller budget, you can fill your tummy, spend less money, and emit a lower carbon footprint! Swap high-carbon items for green alternatives to save both your pocket and the planet.</span>
              </div>
            </div>

            {/* Poetic Disclaimer & Integrated Alternative */}
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
              <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> The Cost of Delivery & Consumption
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {insight.sustainabilityResult?.totalCarbonEmissionKg > 10 ? (
                  "You've left a deep scar on the Earth today. The atmosphere groans under the weight of this transaction. The ice caps weep, and the future holds its breath."
                ) : insight.sustainabilityResult?.totalCarbonEmissionKg > 2 ? (
                  "A silent whisper of damage. Though not a mountain, every gram of carbon builds the wall between us and a green future. We must strive to walk lighter."
                ) : (
                  "A gentle footstep. You walked lightly upon the Earth today, leaving only a soft trace. The forests thank you, and the winds carry a softer toll."
                )}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-505 block uppercase font-bold text-[9px] text-slate-500">Coal Burned Equivalent</span>
                  <span className="font-extrabold text-orange-400 text-sm">
                    {((insight.sustainabilityResult?.totalCarbonEmissionKg || 0) * 0.45).toFixed(2)} kg of coal
                  </span>
                </div>
                <div>
                  <span className="text-slate-505 block uppercase font-bold text-[9px] text-slate-500">Pine Tree Absorption Days</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {Math.ceil((insight.sustainabilityResult?.totalCarbonEmissionKg || 0) * 16)} days
                  </span>
                </div>
              </div>

              {/* INTEGRATED DYNAMIC ECO-ALTERNATIVE */}
              {(() => {
                const alternativeInfo = getPersonalizedAlternative(insight);
                return alternativeInfo.costReductionPct > 0 ? (
                  <div className="mt-3 pt-3 border-t border-rose-500/10 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        AI Eco-Alternative Recommendation
                      </span>
                      {insight.amount && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Spent: <span className="text-white font-extrabold">₹{Number(insight.amount).toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-slate-950/40 border border-emerald-500/15 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-300">
                          {alternativeInfo.name}
                        </p>
                        <p className="text-[10px] text-slate-350 leading-relaxed">
                          {alternativeInfo.description}
                        </p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg text-center shrink-0 w-full sm:w-auto">
                        <span className="block text-[8px] uppercase font-bold text-emerald-400">Potential Savings</span>
                        <span className="text-xs font-black text-emerald-300 block">
                          -{alternativeInfo.costReductionPct}% Cost
                        </span>
                        {insight.amount && (
                          <span className="block text-[8px] text-slate-400">
                            (Save ₹{Math.round(Number(insight.amount) * (alternativeInfo.costReductionPct / 100))})
                          </span>
                        )}
                        <span className="block text-[8px] text-emerald-400 font-semibold mt-0.5">
                          -{alternativeInfo.carbonReductionPct}% CO₂
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Itemized bar chart / breakdown */}
            <div className="my-6 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lifecycle Process Breakdown</h4>
              <div className="space-y-3">
                {(() => {
                  const total = insight.sustainabilityResult?.totalCarbonEmissionKg || 1;
                  const cook = insight.cookingEmissions || 0;
                  const trans = insight.transportEmissions || 0;
                  const pack = insight.packagingEmissions || 0;
                  const waste = insight.wasteEmissions || 0;
                  const ingredients = Math.max(0, total - cook - trans - pack - waste);

                  const parts = [
                    { name: '🌾 Raw Ingredients (Production)', value: ingredients, color: 'bg-sky-400' },
                    { name: '🔥 Cooking Energy (Preparation)', value: cook, color: 'bg-orange-400' },
                    { name: '🚚 Transport & Delivery (Logistics)', value: trans, color: 'bg-yellow-400' },
                    { name: '📦 Packaging Materials (Wrapping)', value: pack, color: 'bg-purple-400' },
                    { name: '🗑️ Waste Disposal (End of Life)', value: waste, color: 'bg-pink-400' }
                  ];

                  return parts.map((part, index) => {
                    if (part.value === 0 && index > 0) return null; // hide empty stages except raw ingredients
                    const pct = (part.value / total) * 100;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">{part.name}</span>
                          <span className="font-bold text-slate-200">
                            {part.value.toFixed(2)} kg CO₂e ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`${part.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* AI Sustainability Counsel */}
            {insight.sustainabilityResult?.explanation && (
              <div className="my-6 p-4 rounded-xl bg-slate-950/45 border border-slate-800 text-[11px] text-slate-400 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                <strong className="text-emerald-400 block mb-1">AI Sustainability Counsel:</strong>
                {insight.sustainabilityResult.explanation}
              </div>
            )}

            {/* Detailed Item Breakdowns */}
            {insight.items && insight.items.length > 0 && (
              <div className="my-4 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scored Items Summary</span>
                <div className="max-h-24 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/20 custom-scrollbar">
                  {insight.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs pb-1.5 last:pb-0 border-b border-slate-800/40 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base shrink-0 select-none">{getItemEmoji(item.name)}</span>
                        <div>
                          <span className="block font-semibold text-slate-300">{item.name}</span>
                          <span className="block text-[9px] text-slate-500 italic">Normalized: {item.normalizedName || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="block font-bold text-rose-500">{(item.carbonEmissionKg || 0).toFixed(2)} kg CO₂</span>
                        <span className="block text-[9px] text-emerald-500 font-semibold">Score: {item.sustainabilityScore || 50}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close button at bottom */}
            <button
              onClick={() => setShowInsight(false)}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* LIFECYCLE QUESTIONNAIRE MODAL */}
      {showQuestionnaire && pendingExpense && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-white no-scrollbar animate-fade-in">
            
            {/* Title */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                Lifecycle Audit Step {questionnaireStep} of 4
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Complete Environmental Audit
              </h3>
              <p className="text-slate-400 text-xs">
                Help us measure the true lifecycle footprint of <span className="font-bold text-white">{pendingExpense.merchant}</span>.
              </p>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    s <= questionnaireStep ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Step Contents */}
            <div className="min-h-[220px] flex flex-col justify-between">
              <div>
                {/* STEP 1: COOKING */}
                {questionnaireStep === 1 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300">
                      Was any cooking or electricity involved in preparing this?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          cooking: { ...prev.cooking, involved: true }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          lifecycleDetails.cooking.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Yes, Cooking/Electricity
                      </button>
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          cooking: { ...prev.cooking, involved: false }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          !lifecycleDetails.cooking.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        No Cooking
                      </button>
                    </div>

                    {lifecycleDetails.cooking.involved && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Energy / Cooking Method</label>
                          <select
                            value={lifecycleDetails.cooking.method}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              cooking: { ...prev.cooking, method: e.target.value }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="electric">Electric Stove / Oven (Grid Power)</option>
                            <option value="gas">LPG Gas Stove</option>
                            <option value="solar">Solar Cooker / Inductions (Clean Energy)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5 flex justify-between">
                            <span>Cooking Duration</span>
                            <span className="text-emerald-400 font-bold">{lifecycleDetails.cooking.minutes} mins</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="120"
                            value={lifecycleDetails.cooking.minutes}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              cooking: { ...prev.cooking, minutes: parseInt(e.target.value) }
                            }))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: TRANSPORT */}
                {questionnaireStep === 2 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300">
                      Was there any home delivery or vehicle transport involved?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          transport: { ...prev.transport, involved: true }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          lifecycleDetails.transport.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Yes, Delivery/Transport
                      </button>
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          transport: { ...prev.transport, involved: false }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          !lifecycleDetails.transport.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        No Transport
                      </button>
                    </div>

                    {lifecycleDetails.transport.involved && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Vehicle Type / Transport Mode</label>
                          <select
                            value={lifecycleDetails.transport.mode}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              transport: { ...prev.transport, mode: e.target.value }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="petrol_diesel">Petrol / Diesel Delivery Ride (Zepto/Zomato/etc.)</option>
                            <option value="ev">Electric Vehicle (EV Delivery)</option>
                            <option value="cng">CNG Vehicle</option>
                            <option value="bicycle">Bicycle / Walking / Runner</option>
                          </select>
                        </div>
                        {lifecycleDetails.transport.mode !== 'bicycle' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Distance (Km)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="e.g. 5.5"
                                value={lifecycleDetails.transport.distanceKm || ''}
                                onChange={(e) => setLifecycleDetails(prev => ({
                                  ...prev,
                                  transport: { ...prev.transport, distanceKm: parseFloat(e.target.value) || 0 }
                                }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            {lifecycleDetails.transport.mode === 'petrol_diesel' && (
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Or Fuel used (Liters)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.05"
                                  placeholder="e.g. 0.5"
                                  value={lifecycleDetails.transport.fuelLiters || ''}
                                  onChange={(e) => setLifecycleDetails(prev => ({
                                    ...prev,
                                    transport: { ...prev.transport, fuelLiters: parseFloat(e.target.value) || 0 }
                                  }))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: PACKAGING */}
                {questionnaireStep === 3 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300">
                      Did the items include single-use packaging?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          packaging: { ...prev.packaging, involved: true }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          lifecycleDetails.packaging.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Yes, Single-Use Packaging
                      </button>
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          packaging: { ...prev.packaging, involved: false }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          !lifecycleDetails.packaging.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        No Packaging / Reuse
                      </button>
                    </div>

                    {lifecycleDetails.packaging.involved && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Plastic Wrappers / Bags</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={lifecycleDetails.packaging.plasticQty || ''}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              packaging: { ...prev.packaging, plasticQty: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Cardboard / Paper boxes</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={lifecycleDetails.packaging.cardboardQty || ''}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              packaging: { ...prev.packaging, cardboardQty: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Aluminium Foil / Cans</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={lifecycleDetails.packaging.aluminiumQty || ''}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              packaging: { ...prev.packaging, aluminiumQty: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Styrofoam Containers</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={lifecycleDetails.packaging.styrofoamQty || ''}
                            onChange={(e) => setLifecycleDetails(prev => ({
                              ...prev,
                              packaging: { ...prev.packaging, styrofoamQty: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: WASTE */}
                {questionnaireStep === 4 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300">
                      Did this generate any waste or scraps?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          waste: { ...prev.waste, involved: true }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          lifecycleDetails.waste.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Yes, Generated Waste
                      </button>
                      <button
                        type="button"
                        onClick={() => setLifecycleDetails(prev => ({
                          ...prev,
                          waste: { ...prev.waste, involved: false }
                        }))}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                          !lifecycleDetails.waste.involved 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        No Waste / Composted
                      </button>
                    </div>

                    {lifecycleDetails.waste.involved && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs text-slate-400">Estimate Waste Size</label>
                        <div className="space-y-2">
                          {[
                            { size: 'small', title: 'Small', desc: 'Single wrapper, minor tissues or scraps' },
                            { size: 'medium', title: 'Medium', desc: 'Cardboard takeout boxes, residual left-overs' },
                            { size: 'large', title: 'Large', desc: 'Bulk disposal, multi-person box piles, food wastage' }
                          ].map(item => (
                            <button
                              key={item.size}
                              type="button"
                              onClick={() => setLifecycleDetails(prev => ({
                                ...prev,
                                waste: { ...prev.waste, size: item.size }
                              }))}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                                lifecycleDetails.waste.size === item.size
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <span className="block font-bold text-xs text-white">{item.title}</span>
                                <span className="text-[10px] text-slate-400">{item.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800/80">
                {questionnaireStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setQuestionnaireStep(prev => prev - 1)}
                    className="px-4 py-3 border border-slate-800 bg-slate-950/30 text-slate-400 font-bold rounded-xl text-xs uppercase hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {questionnaireStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setQuestionnaireStep(prev => prev + 1)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={confirming}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {confirming ? 'Calculating Footprint...' : 'Submit LCA Audit'}
                    {!confirming && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
