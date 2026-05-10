import { useState, useEffect } from 'react';
import { MessageRecord as RecordType, Feedback, FeedbackType } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Check, Send, Sparkles, MessageCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface RecordCardProps {
  record: RecordType;
  familyId: string;
  role: 'mother' | 'child';
  currentUserUid: string;
}

export function RecordCard({ record, familyId, role, currentUserUid }: RecordCardProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [sending, setSending] = useState(false);
  const [showAnxiety, setShowAnxiety] = useState(false);
  const isAuthor = record.authorId === currentUserUid;

  useEffect(() => {
    const q = query(
      collection(db, 'families', familyId, 'records', record.id, 'feedbacks'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
    });
    return unsubscribe;
  }, [familyId, record.id]);

  const handleFeedback = async (type: FeedbackType) => {
    setSending(true);
    try {
      const messages = {
        read: "我收到了，已经在看了哦。",
        hug: "隔空抱抱您！辛苦啦。",
        thinking: "我在认真想这件事，等我忙完给您回电话。"
      };
      await addDoc(collection(db, 'families', familyId, 'records', record.id, 'feedbacks'), {
        recordId: record.id,
        authorId: 'system', // For simplicity in this demo, usually would be actual user
        type,
        translatedMessage: messages[type],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Feedback error:", error);
    } finally {
      setSending(false);
    }
  };

  const isHold = record.type === 'hold';

  return (
    <div className={cn(
      "p-6 rounded-3xl transition-all shadow-sm border",
      isHold ? "bg-[#FFF9F2] border-[#FDEBD0]" : "bg-white border-[#F0EBE3]"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          {isHold && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md mb-2 inline-block bg-[#FDEBD0] text-[#BC6C25]">
              克制的爱
            </span>
          )}
          <div className="text-xs text-[#A3B18A]">
            {(() => {
              const ts = record.createdAt;
              const date = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date());
              return date.toLocaleString('zh-CN');
            })()}
          </div>
        </div>
        {record.anxietyScore > 0 && (
          <button 
            onClick={() => setShowAnxiety(!showAnxiety)}
            className="flex items-center gap-2 text-[#BC6C25] hover:opacity-80 transition-all p-1.5 rounded-lg border border-transparent hover:border-[#FDEBD0] hover:bg-white/50"
          >
             <Info className="w-3.5 h-3.5" />
             <span className="text-[10px] font-medium">
               {showAnxiety ? `AI 评估焦虑度: ${record.anxietyScore}` : '点击查看焦虑指数'}
             </span>
          </button>
        )}
      </div>

      <p className="text-[#4A4A4A] text-lg leading-relaxed mb-6 whitespace-pre-wrap">
        {record.content}
      </p>

      {isHold && role === 'mother' && (
        <div className="p-4 rounded-xl bg-white/60 border border-[#FDEBD0] mb-6 flex items-start gap-3">
          <Heart className="w-4 h-4 text-[#BC6C25] shrink-0 mt-1" />
          <p className="text-xs text-[#BC6C25] italic">
            您的克制也是一种爱。ta 总有一天会懂。
          </p>
        </div>
      )}

      {/* Feedbacks */}
      <div className="space-y-3 mt-4">
        {feedbacks.map((f) => (
          <motion.div 
            key={f.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#E2E8CE] flex items-center justify-center shrink-0">
               {f.type === 'hug' ? <Heart className="w-4 h-4 text-[#606C38]" /> : <Check className="w-4 h-4 text-[#606C38]" />}
            </div>
            <div className="bg-[#FEFAE0] p-3 rounded-2xl rounded-tl-none border border-[#E2E8CE] shadow-sm">
                <p className="text-sm text-[#283618] font-medium">{f.translatedMessage}</p>
                <p className="text-[9px] text-[#A3B18A] mt-1">
                   {(() => {
                     const ts = f.createdAt;
                     const date = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date());
                     return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                   })()}
                </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons for Recipient */}
      {feedbacks.length === 0 && !isHold && (
        <div className="mt-8 pt-6 border-t border-[#F0EBE3] flex flex-wrap gap-2">
           {role === 'child' && !isAuthor && (
             <>
               <FeedbackButton 
                 onClick={() => handleFeedback('read')}
                 disabled={sending}
                 icon={<Check className="w-4 h-4" />}
                 label="已阅"
                 color="bg-[#F0EBE3] text-[#606C38]"
               />
               <FeedbackButton 
                 onClick={() => handleFeedback('hug')}
                 disabled={sending}
                 icon={<Heart className="w-4 h-4" />}
                 label="拥抱"
                 color="bg-[#FEFAE0] text-[#BC6C25]"
               />
               <FeedbackButton 
                 onClick={() => handleFeedback('thinking')}
                 disabled={sending}
                 icon={<MessageCircle className="w-4 h-4" />}
                 label="思考中"
                 color="bg-[#E2E8CE] text-[#283618]"
               />
             </>
           )}
           {role === 'mother' && !isAuthor && (
             <>
               <FeedbackButton 
                 onClick={() => handleFeedback('read')}
                 disabled={sending}
                 icon={<Check className="w-4 h-4" />}
                 label="已阅"
                 color="bg-[#F0EBE3] text-[#606C38]"
               />
               <FeedbackButton 
                 onClick={() => handleFeedback('hug')}
                 disabled={sending}
                 icon={<Heart className="w-4 h-4" />}
                 label="抱抱"
                 color="bg-[#FEFAE0] text-[#BC6C25]"
               />
               <FeedbackButton 
                 onClick={() => handleFeedback('thinking')}
                 disabled={sending}
                 icon={<Sparkles className="w-4 h-4" />}
                 label="比心"
                 color="bg-[#E2E8CE] text-[#606C38]"
               />
             </>
           )}
        </div>
      )}
    </div>
  );
}

function FeedbackButton({ onClick, disabled, icon, label, color }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm",
        color
      )}
    >
      {icon}
      {label}
    </button>
  );
}
