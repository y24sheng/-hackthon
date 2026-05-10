import { useState, useEffect } from 'react';
import { UserProfile, MessageRecord as RecordType } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Plus, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { RecordInput } from './RecordInput';
import { Timeline } from './Timeline';

interface MotherDashboardProps {
  profile: UserProfile;
}

export function MotherDashboard({ profile }: MotherDashboardProps) {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'families', profile.familyId, 'records'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecordType));
      setRecords(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `families/${profile.familyId}/records`);
    });

    return unsubscribe;
  }, [profile.familyId, profile.uid]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-10 text-center">
        <h2 className="text-2xl font-semibold text-[#283618] mb-2">欢迎回来，妈妈</h2>
        <p className="text-[#6B705C]">在这里，您的每一份关心都会被温柔对待。</p>
      </header>

      <div className="grid grid-cols-1 gap-6 mb-12">
        <button 
          onClick={() => setShowInput(true)}
          className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#A3B18A] hover:border-[#606C38] transition-all flex flex-col items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#FEFAE0] flex items-center justify-center text-[#606C38] group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-center">
            <span className="block font-medium text-[#283618]">向女儿说说心事</span>
            <span className="text-xs text-[#BC6C25]">AI 会帮您剔除焦虑词，让关心更纯粹</span>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#606C38]" />
            <h3 className="font-semibold text-[#283618]">沟通足迹</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FEFAE0] border border-[#E2E8CE] text-[10px] text-[#BC6C25] font-bold">
            {records.length} 条记录
          </div>
        </div>
        <Timeline 
          records={records} 
          familyId={profile.familyId} 
          role="mother" 
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
