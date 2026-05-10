import { useState, useEffect } from 'react';
import { Challenge, UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Trophy, CheckCircle2, Circle, Sparkles, RefreshCw } from 'lucide-react';

interface ChallengeSectionProps {
  profile: UserProfile;
}

const PREDEFINED_CHALLENGES = [
  { text: "拍一张窗外的风景分享", label: "分享风景" },
  { text: "问一下对方午饭吃了什么", label: "关心午餐" },
  { text: "分享一首你此刻正在听的歌", label: "分享音乐" },
  { text: "说一件今天觉得开心的小事", label: "分享喜悦" },
  { text: "给对方发一个可爱的表情包", label: "发送表情" },
  { text: "夸夸对方最近的一个优点", label: "真诚夸奖" },
  { text: "约好周末一起去吃个好吃的", label: "周末约定" },
  { text: "分享一个你最近看到的冷知识", label: "冷知识分享" },
  { text: "拍一张今天最满意的照片", label: "今日照片" },
  { text: "问问对方今天心情打几分", label: "心情打分" },
  { text: "分享一个你想去旅游的地方", label: "远方期待" },
  { text: "互相推荐一部最近看的电影", label: "电影推荐" },
  { text: "分享一个你最近的小尴尬", label: "小尴尬" },
  { text: "约好下次见面的第一个拥抱", label: "约定抱抱" },
  { text: "说出对方的一个最让你感动的时刻", label: "感动瞬间" },
  { text: "分享一个你觉得很有道理的句子", label: "金句分享" },
  { text: "一起看一张小时候的照片", label: "儿时回忆" },
  { text: "互相交换一个最近的小秘密", label: "交换秘密" },
];

export function ChallengeSection({ profile }: ChallengeSectionProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [suggestedChallenges, setSuggestedChallenges] = useState<typeof PREDEFINED_CHALLENGES>([]);

  useEffect(() => {
    // Initial random selection
    refreshSuggestions();
  }, []);

  const refreshSuggestions = () => {
    const shuffled = [...PREDEFINED_CHALLENGES].sort(() => 0.5 - Math.random());
    setSuggestedChallenges(shuffled.slice(0, 4));
  };

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#DDA15E]" />
          <h3 className="font-semibold text-[#283618]">家庭小挑战</h3>
        </div>
        <button 
          onClick={refreshSuggestions}
          className="p-2 rounded-full hover:bg-[#FDFCFB] text-[#A3B18A] transition-all"
          title="换一批词项"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {challenges.length === 0 && (
          <p className="text-xs text-[#A3B18A] italic mb-4 text-center">开启一个小挑战，增进彼此了解。</p>
        )}
        
        {challenges.map((c) => (
          <button 
            key={c.id}
            onClick={() => toggleChallenge(c)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
              c.status === 'completed' 
                ? 'bg-[#FDFCFB]/50 border-[#F0EBE3] opacity-60' 
                : 'bg-white border-[#E2E8CE] hover:border-[#606C38] shadow-sm'
            }`}
          >
            {c.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-[#606C38]" />
            ) : (
              <Circle className="w-5 h-5 text-[#A3B18A] group-hover:text-[#606C38]" />
            )}
            <span className={`text-sm ${c.status === 'completed' ? 'line-through text-[#A3B18A]' : 'text-[#4A4A4A] font-medium'}`}>
              {c.content}
            </span>
          </button>
        ))}

        <div className="pt-4 border-t border-[#F0EBE3] mt-6">
          <p className="text-[10px] text-[#A3B18A] mb-3 font-bold uppercase tracking-wider text-center">点选下方开启新挑战</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedChallenges.map((suggested, idx) => (
              <motion.div
                key={`${suggested.label}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <QuickAddBtn 
                  onClick={() => createChallenge(suggested.text)} 
                  label={suggested.label} 
                />
              </motion.div>
            ))}
          </div>
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
