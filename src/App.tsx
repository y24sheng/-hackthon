/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, Role } from './types';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { Landing } from './components/Landing';
import { Loader2, LogOut, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile({ uid: user.uid, ...docSnap.data() } as UserProfile);
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth profile fetch error:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => signOut(auth);

  const toggleRole = async () => {
    if (!user || !profile) return;
    const newRole: Role = profile.role === 'mother' ? 'child' : 'mother';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      setProfile({ ...profile, role: newRole });
    } catch (error) {
      console.error("Toggle role error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#94A684]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#4A4A4A] font-sans selection:bg-[#E2E8CE]">
      <AnimatePresence mode="wait">
        {!user ? (
          <Landing key="landing" onSignIn={signInWithGoogle} />
        ) : !profile ? (
          <Onboarding 
            key="onboarding" 
            user={user} 
            onComplete={(newProfile) => setProfile(newProfile)} 
          />
        ) : (
          <div key="dashboard" className="relative pb-20 md:pb-0">
             <header className="px-6 py-4 flex justify-between items-center border-b border-[#F0EBE3]">
                <h1 className="text-xl font-medium tracking-tight text-[#606C38]">Moments · 之间</h1>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleRole}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FEFAE0] text-[#BC6C25] text-xs font-medium border border-[#FDEBD0] hover:bg-white transition-all shadow-sm"
                    title="切换身份测试"
                  >
                    <RefreshCw className="w-3 h-3" />
                    切换为{profile.role === 'mother' ? '女儿' : '妈妈'} (测试)
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-[#A3B18A] hover:text-[#588157] transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
             </header>
             <Dashboard profile={profile} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

