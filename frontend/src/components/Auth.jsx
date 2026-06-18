import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, ArrowRight, X, Sparkles } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogle, setCustomGoogle] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSelect = async (selectedEmail, selectedName) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle(selectedEmail, selectedName);
      setShowGoogleModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Google Authentication failed.');
      setShowGoogleModal(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail || !googleName) return;
    handleGoogleSelect(googleEmail, googleName);
  };

  const mockGoogleAccounts = [
    { name: 'Abhilasya Kothapalli', email: 'abhilasya.kothapalli@gmail.com', avatar: 'AK', desc: 'Active Chrome Profile' },
    { name: 'Aarav Sharma', email: 'aarav@ecospend.ai', avatar: 'AS', desc: 'Syncing to this device' },
    { name: 'Sarah Chen', email: 'sarah.chen@gmail.com', avatar: 'SC', desc: 'Personal account' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/70 dark:bg-slate-950/90 p-4 transition-colors duration-300 relative overflow-hidden">
      {/* BACKGROUND MOTION PICTURE (Nature/Forest video) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-25 dark:opacity-15 pointer-events-none z-0"
      >
        <source
          src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05cba3d767d1c935d54b4c7ad3b3908&profile_id=139&oauth2_token_id=57447761"
          type="video/mp4"
        />
      </video>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20 mb-3 animate-bounce">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-emerald-450">
            EcoSpend <span className="text-emerald-500 dark:text-emerald-300 font-light">AI</span>
          </h1>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1 text-center uppercase tracking-widest animate-pulse">
            "Track Carbon, Change Habits, Protect Tomorrow."
          </p>
        </div>

        {/* Form panel with Glassmorphism */}
        <div className="glass-panel rounded-3xl shadow-xl p-8 backdrop-blur-md">
          {/* Carbon Footprint Educational Description */}
          <div className="mb-6 p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/10 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">🌿 What is a Carbon Footprint?</span>
            The total amount of greenhouse gases released by your daily activities, purchases, and lifestyle choices.
            Understanding your footprint helps you make smarter decisions for a healthier planet. 🌱
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Eco Account'}
          </h2>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl p-3 mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-emerald-950/25 border border-slate-200 dark:border-slate-800/60 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-emerald-950/25 border border-slate-200 dark:border-slate-800/60 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-emerald-950/25 border border-slate-200 dark:border-slate-800/60 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-98 cursor-pointer mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
          </div>

          {/* Continue with Google button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={loading || googleLoading}
            className="w-full bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm active:scale-98 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Toggle form link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              className="text-emerald-600 dark:text-mint-400 hover:underline text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* Fast-login demo profiles utility */}
        {isLogin && (
          <div className="mt-6 text-center bg-white/40 dark:bg-emerald-950/5 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/20">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Seeded Profiles (standard login):
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['aarav@ecospend.ai', 'priya@ecospend.ai'].map((demoEmail) => (
                <button
                  key={demoEmail}
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword('password123');
                  }}
                  className="text-xs px-2.5 py-1 bg-white dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 rounded-lg text-emerald-700 dark:text-emerald-300 transition-all duration-200 cursor-pointer"
                >
                  {demoEmail.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* CLERK GOOGLE ACCOUNT CHOOSER MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Clerk Chooser Header */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Clerk Logo styling - purple */}
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-extrabold text-[10px] tracking-tighter shrink-0">
                  clerk
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Google Login via Clerk</span>
              </div>
              <button 
                onClick={() => {
                  setShowGoogleModal(false);
                  setCustomGoogle(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            <div className="p-6">
              {/* Google/Clerk branding */}
              <div className="flex flex-col items-center mb-6 text-center">
                <svg className="w-9 h-9 mb-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Sign in with Google</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  to continue to <strong className="text-emerald-500 font-bold">EcoSpend AI</strong>
                </p>
                <div className="mt-2.5 text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900 inline-flex items-center gap-1">
                  <span>🔒</span> Secured by Clerk
                </div>
              </div>

              {googleLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold animate-pulse">Syncing credentials securely...</p>
                </div>
              ) : !customGoogle ? (
                <div className="space-y-2.5">
                  {/* Account list */}
                  {mockGoogleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleGoogleSelect(acc.email, acc.name)}
                      className="w-full flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-emerald-500/5 dark:bg-slate-950/20 dark:hover:bg-emerald-500/10 border border-slate-100 dark:border-slate-850 hover:border-emerald-500/20 rounded-2xl transition-all duration-200 text-left cursor-pointer group active:scale-98"
                    >
                      <div className="w-11 h-11 rounded-full bg-emerald-500/10 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                        {acc.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <p className="font-semibold text-sm text-slate-800 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                            {acc.name}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-tight">
                            {acc.desc.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{acc.email}</p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setCustomGoogle(true)}
                    className="w-full text-center py-3 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold border border-dashed border-emerald-500/30 hover:border-emerald-500 rounded-2xl mt-4 transition-all cursor-pointer"
                  >
                    + Use another Google account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                      Google Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Jane Miller"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                      Google Email
                    </label>
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="jane.miller@gmail.com"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCustomGoogle(false)}
                      className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 font-bold rounded-xl text-xs transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer hover:shadow-emerald-500/20 active:scale-95"
                    >
                      Confirm Sign-In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
