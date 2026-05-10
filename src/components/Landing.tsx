import { motion } from 'motion/react';
import { Heart, MessageSquareHeart, Sparkles } from 'lucide-react';

interface LandingProps {
  onSignIn: () => void;
}

export function Landing({ onSignIn }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E2E8CE] rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2] 
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F0EBE3] rounded-full blur-3xl -z-10"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#606C38] text-white mb-8 shadow-lg">
          <MessageSquareHeart className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-semibold text-[#283618] mb-6 tracking-tight">
          让爱被看见，让焦虑被分解
        </h1>
        
        <p className="text-lg text-[#6B705C] mb-12 leading-relaxed">
          「Moments · 之间」是一个专为东亚母女设计的轻量沟通工具。
          我们存放说不出口的爱，翻译听不懂的焦虑，沉淀忘不掉的回忆。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onSignIn}
            className="px-8 py-4 bg-[#606C38] text-white rounded-full font-medium hover:bg-[#283618] transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            开启温情对话
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <Feature 
            icon={<Heart className="w-5 h-5 text-[#BC6C25]" />}
            title="去焦虑化"
            desc="AI 智能解析妈妈的嘱托，剥离焦虑，留下最纯粹的关心。"
          />
          <Feature 
            icon={<MessageSquareHeart className="w-5 h-5 text-[#BC6C25]" />}
            title="低能耗反馈"
            desc="女儿一键回应，让妈妈瞬间感受到「我被看见了」。"
          />
          <Feature 
            icon={<Sparkles className="w-5 h-5 text-[#BC6C25]" />}
            title="爱的证据"
            desc="自动生成家庭回忆录，让琐碎的生活点滴汇聚成幸福年轮。"
          />
        </div>
      </motion.div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#F0EBE3]">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-[#283618] mb-2">{title}</h3>
      <p className="text-sm text-[#6B705C] leading-relaxed">{desc}</p>
    </div>
  );
}
