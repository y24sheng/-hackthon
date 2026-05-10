import { useState, useEffect } from 'react';
import { Challenge, UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Trophy, CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface ChallengeSectionProps {
  profile: UserProfile;
}

export function ChallengeSection({ profile }: ChallengeSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'families', profile.familyId, 'challenges'),
      where('familyId', '==', profile.familyId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChallenges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge)));
    });
    return unsubscribe;
  }, [profile.familyId]);

  const toggleChallenge = async (challenge: Challenge) => {
    if (challenge.status === 'completed') return;
    try {
      await updateDoc(doc(db, 'families', profile.familyId, 'challenges', challenge.id), {
        status: 'completed',
        completedBy: profile.uid
      });
    } catch (error) {
      console.error("Update challenge error:", error);
    }
  };

  const createChallenge = async (text: string) => {
    try {
      await addDoc(collection(db, 'families', profile.familyId, 'challenges'), {
        familyId: profile.familyId,
        content: text,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Create challenge error:", error);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#F0EBE3] shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-[#DDA15E]" />
        <h3 className="font-semibold text-[#283618]">家庭小挑战</h3>
      </div>

      <div className="space-y-3">
        {challenges.length === 0 && (
          <p className="text-xs text-[#A3B18A] italic mb-4">开启一个小挑战，增进彼此了解。</p>
        )}
        
        {challenges.map((c) => (
          <button 
            key={c.id}
            onClick={() => toggleChallenge(c)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              c.status === 'completed' 
                ? 'bg-[#FDFCFB] border-[#F0EBE3] opacity-60' 
                : 'bg-white border-[#E2E8CE] hover:border-[#606C38] shadow-sm'
            }`}
          >
            {c.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-[#606C38]" />
            ) : (
              <Circle className="w-5 h-5 text-[#A3B18A]" />
            )}
            <span className={`text-sm ${c.status === 'completed' ? 'line-through text-[#A3B18A]' : 'text-[#4A4A4A] font-medium'}`}>
              {c.content}
            </span>
          </button>
        ))}

        <div className="grid grid-cols-2 gap-2 mt-6">
           <QuickAddBtn onClick={() => createChallenge("拍一张窗外的风景分享")} label="分享风景" />
           <QuickAddBtn onClick={() => createChallenge("问一下对方午饭吃了什么")} label="关心午餐" />
        </div>
      </div>
    </div>
  );
}

function QuickAddBtn({ onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className="py-2 px-3 rounded-xl bg-[#FEFAE0] text-[#BC6C25] text-[10px] font-bold border border-[#FDEBD0] hover:bg-white transition-all flex items-center justify-center gap-1"
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </button>
  );
}
