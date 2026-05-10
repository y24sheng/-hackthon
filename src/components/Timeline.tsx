import { MessageRecord as RecordType } from '../types';
import { RecordCard } from './RecordCard';
import { motion } from 'motion/react';

interface TimelineProps {
  records: RecordType[];
  familyId: string;
  role: 'mother' | 'child';
  currentUserUid: string;
}

export function Timeline({ records, familyId, role, currentUserUid }: TimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-white border border-[#F0EBE3]">
        <p className="text-[#A3B18A] italic">暂无记录，开启您的第一段温馨对话吧。</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F0EBE3]">
      {records.map((record, index) => (
        <motion.div 
          key={record.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-12"
        >
          <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-[#F0EBE3] flex items-center justify-center z-10 shadow-sm">
             <div className={`w-3 h-3 rounded-full ${record.type === 'hold' ? 'bg-[#BC6C25]' : 'bg-[#606C38]'}`} />
          </div>
          <RecordCard 
            record={record} 
            familyId={familyId} 
            role={role} 
            currentUserUid={currentUserUid} 
          />
        </motion.div>
      ))}
    </div>
  );
}
