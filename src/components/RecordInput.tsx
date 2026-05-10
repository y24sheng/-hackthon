import { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { analyzeMessage, enhanceDaughterMessage, generateEncouragementCard } from '../services/gemini';
import { EncouragementCard } from './EncouragementCard';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Loader2, AlertCircle, Heart, Check, Smile, Mic, MicOff } from 'lucide-react';

interface RecordInputProps {
  profile: UserProfile;
  onClose: () => void;
}

export function RecordInput({ profile, onClose }: RecordInputProps) {
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'analysis' | 'success'>('input');
  const [isHoldBack, setIsHoldBack] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'gentle' | 'humorous'>('gentle');
  const [isRecording, setIsRecording] = useState(false);
  const [showAnxiety, setShowAnxiety] = useState(false);
  const [encouragement, setEncouragement] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setContent((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音转文字功能。请使用 Chrome 浏览器尝试。');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const isMother = profile.role === 'mother';

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeMessage(content, profile.role as 'mother' | 'child', selectedStyle);
      setAnalysis(result);
      setStep('analysis');
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSend = async (useEnhanced: boolean) => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const recordData = {
        authorId: profile.uid,
        authorRole: profile.role,
        familyId: profile.familyId,
        type: isHoldBack ? 'hold' : 'mood',
        content: useEnhanced ? analysis.enhancedMessage : content,
        originalContent: content,
        anxietyScore: analysis?.anxietyScore || 0,
        anxietyWords: analysis?.anxietyWords || [],
        isSent: !isHoldBack,
        createdAt: serverTimestamp(),
      };
      const path = `families/${profile.familyId}/records`;
      await addDoc(collection(db, path), recordData);
      
      // Fetch encouragement after successful save
      setStep('success');
      try {
        const result = await generateEncouragementCard(recordData.content, profile.role as 'mother' | 'child');
        setEncouragement(result);
      } catch (e) {
        console.error("Failed to fetch encouragement", e);
        // If AI fails, we still show the success screen, and user can close it manually or it closes after some time
        setTimeout(() => onClose(), 3000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `families/${profile.familyId}/records`);
      setSaveError("发送失败，请检查网络或权限设置。");
    } finally {
      setIsSaving(false);
    }
  };

  if (step === 'success') {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Falling leaves animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 200 - 100, rotate: 0, opacity: 0 }}
                animate={{ 
                  y: 300, 
                  x: Math.random() * 200 - 100, 
                  rotate: 360, 
                  opacity: [0, 1, 0] 
                }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="absolute top-0 text-[#94A684]"
              >
                <Heart className="w-4 h-4 fill-current" />
              </motion.div>
            ))}
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#FEFAE0] flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-[#606C38]" />
              </div>
              <h3 className="text-xl font-semibold text-[#283618] mb-2">已收录到树洞</h3>
              <p className="text-[#6B705C] mb-6">您的关心已经温润如叶，悄悄落入。辛苦了。</p>
              
              {!encouragement && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#A3B18A]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  正在为您生成疗愈卡片...
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {encouragement && (
            <EncouragementCard 
              data={encouragement} 
              onClose={onClose} 
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">

      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-xl bg-[#FDFCFB] rounded-3xl overflow-hidden shadow-2xl border border-[#F0EBE3]"
      >
        <div className="p-6 border-b border-[#F0EBE3] flex justify-between items-center bg-white">
          <h3 className="font-semibold text-[#283618] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#DDA15E]" />
            情绪树洞
          </h3>
          <button onClick={onClose} className="p-1 text-[#A3B18A] hover:text-[#4A4A4A]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <motion.div 
                key="step-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={isMother ? "在这里写下您想对女儿说的话..." : "给妈妈发一段关心的话 (我们会帮您润色成不沉重的风格)..."}
                      className="w-full h-40 p-5 rounded-2xl bg-white border border-[#F0EBE3] focus:ring-2 focus:ring-[#94A684] focus:border-transparent outline-none resize-none text-lg leading-relaxed shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-[#FEFAE0] text-[#606C38] hover:bg-[#E2E8CE]'
                      }`}
                      title={isRecording ? "停止录音" : "点击语音录入"}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">正在聆听...</span>
                      </div>
                    )}
                  </div>
                  
                  {!isMother && (
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setSelectedStyle('gentle')}
                         className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedStyle === 'gentle' ? 'bg-[#606C38] text-white border-[#606C38]' : 'bg-white text-[#606C38] border-[#F0EBE3]'}`}
                       >
                         温柔版本
                       </button>
                       <button 
                         onClick={() => setSelectedStyle('humorous')}
                         className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedStyle === 'humorous' ? 'bg-[#DDA15E] text-white border-[#DDA15E]' : 'bg-white text-[#DDA15E] border-[#F0EBE3]'}`}
                       >
                         海绵宝宝(幽默)
                       </button>
                    </div>
                  )}

                  {isMother && (
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isHoldBack} 
                        onChange={(e) => setIsHoldBack(e.target.checked)}
                        className="w-5 h-5 rounded border-[#A3B18A] text-[#606C38] focus:ring-[#606C38]"
                      />
                      <span className="text-sm text-[#6B705C] group-hover:text-[#4A4A4A] transition-colors">
                        我只是想记录一下，这次我「忍住」了不直接发给她
                      </span>
                    </label>
                  )}
                </div>

                <button 
                  disabled={!content.trim() || analyzing}
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-[#606C38] text-white rounded-xl font-medium hover:bg-[#283618] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI 正在温柔解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      分析并优化建议
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step-analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {analysis.anxietyScore > 0 && (
                  <div className="p-5 rounded-2xl bg-[#FEFAE0] border border-[#E2E8CE]">
                    <button 
                      onClick={() => setShowAnxiety(!showAnxiety)}
                      className="w-full flex justify-between items-center text-[#BC6C25]"
                    >
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          焦虑指数评估
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">{showAnxiety ? '点击收起' : '点击展开查看'}</span>
                    </button>
                    
                    <AnimatePresence>
                      {showAnxiety && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-[#E2E8CE]/50">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-[#BC6C25]">AI 评估分值 (1-10)</span>
                                <span className="text-2xl font-bold text-[#BC6C25]">{analysis.anxietyScore}</span>
                            </div>
                            <div className="w-full h-2 bg-[#E2E8CE] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${analysis.anxietyScore * 10}%` }}
                                  className="h-full bg-[#BC6C25]"
                                />
                            </div>
                            {analysis.anxietyWords.length > 0 && (
                              <div className="mt-4">
                                  <span className="text-xs text-[#6B705C] mb-2 block">{isMother ? '可能让孩子感到压力的词：' : '可能让妈妈感到压力的词：'}</span>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.anxietyWords.map((word: string) => (
                                      <span key={word} className="px-2 py-1 rounded-md bg-white/60 text-[#BC6C25] text-xs border border-[#F0EBE3]">
                                        {word}
                                      </span>
                                    ))}
                                  </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#F0EBE3] relative">
                    <span className="absolute -top-3 left-4 px-2 bg-white text-[10px] text-[#A3B18A] uppercase tracking-wider">原文</span>
                    <p className="text-[#6B705C] italic">{content}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#F0EBE3] border border-[#D5CCB6] relative">
                    <span className="absolute -top-3 left-4 px-2 bg-[#F0EBE3] text-[10px] text-[#606C38] uppercase tracking-wider font-bold">
                      {selectedStyle === 'humorous' ? '海绵宝宝版建议' : '温柔版建议'}
                    </span>
                    <p className="text-[#283618] leading-relaxed font-medium">{analysis.enhancedMessage}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    disabled={isSaving}
                    onClick={() => handleSend(false)}
                    className="flex-1 py-4 rounded-xl border border-[#D5CCB6] text-[#6B705C] font-medium hover:bg-white transition-all disabled:opacity-50"
                  >
                    按原样发送
                  </button>
                  <button 
                    disabled={isSaving}
                    onClick={() => handleSend(true)}
                    className="flex-[2] py-4 rounded-xl bg-[#606C38] text-white font-medium hover:bg-[#283618] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {isSaving ? '正在发送...' : '发送温柔版'}
                  </button>
                </div>

                {saveError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {saveError}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
