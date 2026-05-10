import { useState, useEffect } from 'react';
import { UserProfile, Record as RecordType } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { summarizeForDaughter } from '../services/gemini';
import { Timeline } from './Timeline';
import { RecordInput } from './RecordInput';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Sparkles, Loader2, Info, Plus } from 'lucide-react';

interface DaughterDashboardProps {
  profile: UserProfile;
}

export function DaughterDashboard({ profile }: DaughterDashboardProps) {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'families', profile.familyId, 'records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecordType));
      // Daughter doesn't see "hold" records from mother, but the PRD says Mother can select "make child aware" or "private".
      // For now, let's filter out 'hold' records for the child.
      setRecords(data.filter(r => r.type !== 'hold'));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `families/${profile.familyId}/records`);
    });

    return unsubscribe;
  }, [profile.familyId]);

  const handleSummarize = async () => {
    if (records.length === 0) return;
    setSummarizing(true);
    const contentList = records.slice(0, 5).map(r => r.content);
    const result = await summarizeForDaughter(contentList);
    setSummary(result);
    setSummarizing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-10 text-center">
        <h2 className="text-2xl font-semibold text-[#283618] mb-2">嘿，亲爱的女儿</h2>
        <p className="text-[#6B705C]">妈妈的留言都在这里，我们一起用爱化解焦虑。</p>
      </header>

      <div className="grid grid-cols-1 gap-6 mb-12">
        <button 
          onClick={() => setShowInput(true)}
          className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#A3B18A] hover:border-[#606C38] transition-all flex flex-col items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E2E8CE] flex items-center justify-center text-[#606C38] group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-center">
            <span className="block font-medium text-[#283618]">向妈妈传递关心</span>
            <span className="text-xs text-[#BC6C25]">AI 会帮您转译风格，告别沉重对话</span>
          </div>
        </button>
      </div>

      {records.length > 0 && (
        <section className="mb-12">
          <div className="p-6 rounded-3xl bg-white border border-[#F0EBE3] shadow-sm overflow-hidden relative group">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-[#DDA15E]" />
                   <h3 className="font-semibold text-[#283618]">AI 温情摘要</h3>
                </div>
                {!summary && (
                  <button 
                    onClick={handleSummarize}
                    disabled={summarizing}
                    className="text-xs font-medium text-[#606C38] hover:underline flex items-center gap-1"
                  >
                    {summarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : '点击生成'}
                  </button>
                )}
             </div>
             
             <AnimatePresence mode="wait">
               {summary ? (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                 >
                    <div className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">
                       {summary}
                    </div>
                    <button 
                      onClick={() => setSummary(null)}
                      className="text-[10px] text-[#A3B18A] hover:text-[#606C38]"
                    >
                      重新生成
                    </button>
                 </motion.div>
               ) : (
                 <p className="text-sm text-[#A3B18A] italic">
                   妈妈发了几条比较长的消息，需要我帮您提炼核心诉求吗？
                 </p>
               )}
             </AnimatePresence>
          </div>
        </section>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#606C38]" />
            <h3 className="font-semibold text-[#283618]">妈妈的讯息</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FEFAE0] border border-[#E2E8CE] text-[10px] text-[#BC6C25] font-bold">
            {records.length} 条待读
          </div>
        </div>
        <Timeline 
          records={records} 
          familyId={profile.familyId} 
          role="child" 
          currentUserUid={profile.uid} 
        />
      </div>

      {showInput && (
        <RecordInput 
          profile={profile} 
          onClose={() => setShowInput(false)} 
        />
      )}
    </div>
  );
}
