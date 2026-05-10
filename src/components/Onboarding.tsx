import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Role, UserProfile } from '../types';
import { motion } from 'motion/react';
import { UserCircle, UserPlus, Users, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [familyId, setFamilyId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role || !familyId) return;
    setLoading(true);
    try {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        role,
        familyId: familyId.trim().toLowerCase(),
        settings: {},
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      onComplete(newProfile);
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#F0EBE3]"
      >
        <h2 className="text-2xl font-semibold text-[#283618] mb-2 text-center">完善您的档案</h2>
        <p className="text-[#6B705C] mb-8 text-center">为了更好的交流，请告诉我们您的身份。</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <RoleButton 
              active={role === 'mother'} 
              onClick={() => setRole('mother')} 
              icon={<Users className="w-6 h-6" />}
              label="我是妈妈"
            />
            <RoleButton 
              active={role === 'child'} 
              onClick={() => setRole('child')} 
              icon={<UserCircle className="w-6 h-6" />}
              label="我是女儿"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">家庭代码</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="例如: our-sweet-home"
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F0EBE3] focus:ring-2 focus:ring-[#94A684] focus:border-transparent outline-none transition-all"
              />
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3B18A]" />
            </div>
            <p className="text-xs text-[#BC6C25] italic">* 请与家人商定并使用相同的代码</p>
          </div>

          <button 
            disabled={!role || !familyId || loading}
            onClick={handleSubmit}
            className="w-full py-4 bg-[#606C38] text-white rounded-xl font-medium hover:bg-[#283618] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? '保存中...' : '进入空间'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RoleButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
        active ? 'border-[#606C38] bg-[#FEFAE0] text-[#283618]' : 'border-[#F0EBE3] text-[#A3B18A] hover:border-[#DDA15E]'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
