import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  Download, 
  Flame, 
  Leaf, 
  Lock, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHALLENGES } from './Challenges';

const PREDEFINED_AVATARS = [
  {
    name: 'Leaf Steward',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2310b981"/><path d="M50 20 C65 20 75 35 70 55 C65 75 50 80 50 80 C50 80 35 75 30 55 C25 35 35 20 50 20 Z" fill="white"/><path d="M50 20 L50 80 M50 40 L65 30 M50 50 L35 40 M50 60 L60 52" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round"/></svg>'
  },
  {
    name: 'Earth Guardian',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%233b82f6"/><path d="M30 40 C35 30 45 35 45 45 C45 55 35 60 30 50 Z M65 55 C70 45 75 55 70 65 C65 75 55 75 60 65 Z" fill="%2310b981"/><path d="M20 55 Q35 40 50 50 T80 40" fill="none" stroke="%2310b981" stroke-width="8" stroke-linecap="round"/></svg>'
  },
  {
    name: 'Solar Pioneer',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f59e0b"/><circle cx="50" cy="50" r="20" fill="white"/><path d="M50 12 L50 22 M50 78 L50 88 M12 50 L22 50 M78 50 L88 50 M23 23 L30 30 M70 70 L77 77 M23 78 L30 71 M70 21 L77 28" stroke="white" stroke-width="4.5" stroke-linecap="round"/></svg>'
  },
  {
    name: 'Wind Champion',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2314b8a6"/><path d="M50 50 L50 85 M50 50 L30 35 M50 50 L70 35" stroke="white" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="7" fill="white"/></svg>'
  },
  {
    name: 'Water Drops',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236366f1"/><path d="M50 22 C50 22 65 42 65 55 C65 65 58 72 50 72 C42 72 35 65 35 55 C35 42 50 22 50 22 Z" fill="white"/></svg>'
  },
  {
    name: 'Abhilasya Kothapalli',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%238b5cf6"/><text x="50" y="58" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">AK</text></svg>'
  },
  {
    name: 'Aarav Sharma',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2306b6d4"/><text x="50" y="58" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">AS</text></svg>'
  },
  {
    name: 'Sarah Chen',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ec4899"/><text x="50" y="58" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="white" text-anchor="middle">SC</text></svg>'
  }
];

export default function Profile() {
  const { user, uploadPhoto } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Handle Photo upload base64 conversion
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setMsg({ type: 'error', text: 'Invalid file format. Only JPEG, JPG, and PNG are allowed.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Photo must be smaller than 10MB.' });
      return;
    }

    setUploading(true);
    setMsg(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await uploadPhoto(reader.result);
        setMsg({ type: 'success', text: 'Profile photo updated successfully!' });
        confetti({
          particleCount: 50,
          spread: 40,
          colors: ['#10b981', '#fbbf24']
        });
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to upload photo.' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Predefined Avatar Selector Action
  const handleSelectPredefinedAvatar = async (avatarUrl) => {
    setUploading(true);
    setMsg(null);
    try {
      await uploadPhoto(avatarUrl);
      setMsg({ type: 'success', text: 'Profile photo updated successfully!' });
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ['#10b981', '#fbbf24']
      });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update photo.' });
    } finally {
      setUploading(false);
    }
  };

  // Certificate Download Action
  const downloadCert = async (tierName) => {
    try {
      setMsg({ type: 'info', text: `Generating your ${tierName} Certificate PDF...` });
      const response = await fetch('/api/reports/certificate');
      if (!response.ok) throw new Error('Generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sustainability_certificate_${user.name.replace(/\s+/g, '_')}_${tierName.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMsg(null);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to download certificate PDF.' });
    }
  };

  // Streaks calculation (7 days visual layout)
  const streakDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const userStreak = user?.loginStreak || 1;
  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const correctedToday = todayIndex === 0 ? 6 : todayIndex - 1; // Map Sun to index 6

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Profile & Rewards
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor your green milestones, upload profile photos, and view sustainable blogs.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          msg.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
            : msg.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }`}>
          <span className="text-sm font-semibold">{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PROFILE CARD & LOGIN STREAK */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* User details card */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-amber-500"></div>
            
            {/* Avatar circle */}
            <div className="relative mt-4 group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-md flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Photo Upload label/input */}
              <label className="absolute bottom-1 right-1 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 flex items-center justify-center border-2 border-white dark:border-slate-900">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  disabled={uploading}
                  className="hidden" 
                />
                <Camera className="w-4 h-4" />
              </label>
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-4">
              {user?.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>

            {/* BIG ECO POINTS BADGE */}
            <div className="mt-6 flex flex-col items-center p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 w-full relative group hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute right-3 top-3 animate-pulse text-emerald-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <Leaf className="w-7 h-7" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-3">Cumulative Balance</span>
              <span className="text-3xl font-black text-slate-800 dark:text-emerald-400 mt-1">{user?.ecoPoints || 0}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Eco Points Accumulated</span>
            </div>
          </div>

          {/* Predefined Avatars Gallery */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white mb-2">
              Select Profile Photo
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
              Choose from our premium carbon stewardship icons or custom Chrome profiles to update your avatar instantly:
            </p>
            <div className="grid grid-cols-4 gap-3">
              {PREDEFINED_AVATARS.map((avatar) => (
                <button
                  key={avatar.name}
                  onClick={() => handleSelectPredefinedAvatar(avatar.url)}
                  disabled={uploading}
                  className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center bg-slate-50 dark:bg-slate-950 ${
                    user?.profilePhoto === avatar.url 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                  title={avatar.name}
                  type="button"
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  {user?.profilePhoto === avatar.url && (
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-[9px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5 scale-75 font-bold uppercase">Active</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* LeetCode style login streak calendar */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                Daily Streaks
              </h4>
            </div>

            <div className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-4 rounded-2xl mb-5">
              <div>
                <span className="text-2xl font-black text-amber-500">{userStreak} Days</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Current Streak</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                <span className="block font-semibold">+2 points added</span>
                <span>automatically today!</span>
              </div>
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {streakDays.map((day, idx) => {
                const isActiveDay = idx <= correctedToday;
                const isCompleted = idx < correctedToday;
                const isToday = idx === correctedToday;

                return (
                  <div key={day} className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-slate-400 mb-1.5">{day}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                        : isToday
                          ? 'bg-amber-500 border-amber-500 text-white shadow-md animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CERTIFICATE MILESTONES & REDDIT BLOGS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sustainability Certificate Progress Widget */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                Sustainability Certificate
              </h4>
            </div>

            {(() => {
              const totalPoints = user?.ecoPoints || 0;
              const targetPoints = 100;
              const isUnlocked = totalPoints >= targetPoints;
              const percent = Math.min(100, Math.round((totalPoints / targetPoints) * 100));
              const pointsNeeded = Math.max(0, targetPoints - totalPoints);
              
              // Decide the tier name for display
              const tierName = totalPoints >= 250 ? 'Gold' : (totalPoints >= 100 ? 'Silver' : 'Bronze');

              return (
                <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-extrabold text-slate-800 dark:text-white text-base">
                          {isUnlocked ? `${tierName} Tier Certificate` : 'Sustainability Certificate'}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {isUnlocked 
                            ? 'Congratulations! You have unlocked your official Sustainability Certificate.' 
                            : `Accumulate ${targetPoints} EcoPoints to unlock. You need ${pointsNeeded} more points.`
                          }
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-md ${
                          isUnlocked 
                            ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' 
                            : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5 uppercase">
                        <span>Milestone Progress</span>
                        <span>{totalPoints} / {targetPoints} PTS</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {isUnlocked ? (
                      <button
                        onClick={() => downloadCert(tierName)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer hover:shadow-emerald-500/20"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Certificate</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 px-6 py-3 bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-650 font-bold rounded-xl text-sm border border-slate-200 dark:border-slate-800 select-none cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* My Active Challenges Section */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                My Active Challenges
              </h4>
            </div>
            {user?.acceptedChallenges && user.acceptedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.acceptedChallenges.map((challengeName) => {
                  const details = CHALLENGES.find(c => c.title === challengeName || c.id === challengeName);
                  return (
                    <div key={challengeName} className="flex items-center gap-3.5 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                      <span className="text-3xl shrink-0">{details?.icon || '🌱'}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-slate-800 dark:text-white truncate">{details?.title || challengeName}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{details?.description || 'Committed challenge'}</p>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                          📉 Saves {details?.co2Saving || 'some'} CO₂
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  No active challenges. Visit the Eco Challenges page to commit to new green actions!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
