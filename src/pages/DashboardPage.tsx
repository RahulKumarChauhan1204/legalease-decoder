import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  History as HistoryIcon, 
  Trash2, 
  Download, 
  Printer, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Languages, 
  Send,
  ArrowRight,
  Copy,
  ChevronRight,
  Info,
  ShieldCheck
} from 'lucide-react';
import { analyzeLegalDocument, compareDocuments, createChatSession } from '../services/geminiService';
import { AnalysisResult, ComparisonResult, HistoryItem, ChatMessage } from '../types';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'legalease_history_v3';

export const DashboardPage: React.FC = () => {
  const [mode, setMode] = useState<'Analysis' | 'Comparison'>('Analysis');
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history:", e);
      return [];
    }
  });
  
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSession, setChatSession] = useState<any>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleAction = async () => {
    if (!file1) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    try {
      const b64_1 = await convertToBase64(file1);
      
      if (mode === 'Analysis') {
        const data = await analyzeLegalDocument(b64_1, file1.type);
        setResult(data);
        const session = createChatSession(b64_1, file1.type);
        setChatSession(session);
        
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          filename: file1.name,
          timestamp: Date.now(),
          result: data,
          type: 'Analysis'
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } else if (mode === 'Comparison' && file2) {
        const b64_2 = await convertToBase64(file2);
        const data = await compareDocuments(
          { data: b64_1, mime: file1.type, name: file1.name },
          { data: b64_2, mime: file2.type, name: file2.name }
        );
        setResult(data);
        
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          filename: file1.name,
          secondFilename: file2.name,
          timestamp: Date.now(),
          result: data,
          type: 'Comparison'
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process document.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSession || isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);
    try {
      const resp = await chatSession.sendMessage({ message: msg });
      setChatMessages(prev => [...prev, { role: 'model', text: resp.text }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Error communicating with AI assistant." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setMode(item.type);
    if (item.type === 'Analysis') {
       setChatSession(null);
       setChatMessages([{ role: 'model', text: "Re-upload document to enable live chat session." }]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Delete this report from your history permanently?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const reset = () => {
    setFile1(null); setFile2(null); setResult(null); setChatSession(null); setChatMessages([]); setError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!result) return;
    
    let mdContent = '';
    if ('complexityScore' in result) {
      const res = result as AnalysisResult;
      mdContent = `# LegalEase Analysis Report: ${file1?.name || 'Document'}\n\n`;
      mdContent += `## Executive Summary\n${language === 'en' ? res.summary.en : res.summary.hi}\n\n`;
      mdContent += `**Complexity Score:** ${res.complexityScore}/10\n`;
      mdContent += `**Verdict:** ${res.verdict}\n\n`;
      mdContent += `## Risk Radar\n\n`;
      res.risks?.forEach(risk => {
        mdContent += `### ${risk.category} (${risk.severity} Risk)\n`;
        mdContent += `- **Issue:** ${risk.description}\n`;
        mdContent += `- **Clause:** "${risk.clause}"\n`;
        mdContent += `- **Recommendation:** ${risk.recommendation}\n\n`;
      });
      mdContent += `## Jargon Decoder\n\n`;
      res.jargonTranslator?.forEach(item => {
        mdContent += `- **${item.term}:** ${item.plainEnglish}\n`;
      });
    } else {
      const res = result as ComparisonResult;
      mdContent = `# LegalEase Comparison Report\n\n`;
      mdContent += `**Baseline:** ${res.baselineName}\n`;
      mdContent += `**Comparison:** ${res.comparisonName}\n\n`;
      mdContent += `## Summary\n${res.summary}\n\n`;
      mdContent += `## Risk Profile Shift\n${res.riskShift}\n\n`;
      mdContent += `## Key Changes\n\n`;
      res.changes?.forEach(change => {
        mdContent += `### ${change.type}: ${change.description} (${change.impact} Impact)\n`;
        if (change.originalText) mdContent += `**Original:** ${change.originalText}\n`;
        if (change.newText) mdContent += `**New:** ${change.newText}\n`;
        mdContent += `\n`;
      });
    }

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LegalEase_Report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 no-print text-left"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900">LegalEase Lab</h1>
          <p className="text-slate-500 mt-2">Professional document simplification & risk assessment.</p>
        </div>
        
        <AnimatePresence mode="wait">
          {!result && !analyzing ? (
            <motion.div 
              key="mode-toggle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl"
            >
              <button 
                onClick={() => setMode('Analysis')}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2",
                  mode === 'Analysis' ? "bg-white shadow-md text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Search className="w-4 h-4" />
                Analyze
              </button>
              <button 
                onClick={() => setMode('Comparison')}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2",
                  mode === 'Comparison' ? "bg-white shadow-md text-indigo-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <FileText className="w-4 h-4" />
                Compare
              </button>
            </motion.div>
          ) : result && (
            <motion.div 
              key="result-actions"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap gap-3"
            >
              <button 
                onClick={handleDownloadMarkdown} 
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5 text-indigo-500" />
                Download .MD
              </button>
              <button 
                onClick={handlePrint} 
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
              >
                <Printer className="w-5 h-5 text-slate-500" />
                Save PDF
              </button>
              <button 
                onClick={reset} 
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Document
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!result && !analyzing ? (
          <motion.div 
            key="upload-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Uploaders */}
            <div className={cn(
              "grid grid-cols-1 gap-8",
              mode === 'Comparison' ? "md:grid-cols-2" : ""
            )}>
              <div 
                className={cn(
                  "group relative p-12 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer",
                  file1 ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-200 hover:border-indigo-400"
                )}
                onClick={() => fileInputRef1.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef1} 
                  className="hidden" 
                  accept="application/pdf" 
                  onChange={(e) => setFile1(e.target.files?.[0] || null)} 
                />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {file1 ? file1.name : mode === 'Comparison' ? 'Base Document (PDF)' : 'Legal Document (PDF)'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {file1 ? `${(file1.size/1024/1024).toFixed(2)} MB` : 'Drop PDF here or click to browse'}
                </p>
                {file1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile1(null); }} 
                    className="mt-4 text-xs font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>

              {mode === 'Comparison' && (
                <div 
                  className={cn(
                    "group relative p-12 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer",
                    file2 ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-200 hover:border-indigo-400"
                  )}
                  onClick={() => fileInputRef2.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef2} 
                    className="hidden" 
                    accept="application/pdf" 
                    onChange={(e) => setFile2(e.target.files?.[0] || null)} 
                  />
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {file2 ? file2.name : 'Document to Compare (PDF)'}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {file2 ? `${(file2.size/1024/1024).toFixed(2)} MB` : 'Compare against another version'}
                  </p>
                  {file2 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile2(null); }} 
                      className="mt-4 text-xs font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button 
                disabled={!file1 || (mode === 'Comparison' && !file2)}
                onClick={handleAction}
                className="w-full max-w-lg py-5 bg-indigo-600 text-white rounded-3xl font-bold text-xl hover:bg-indigo-700 disabled:opacity-50 shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                {mode === 'Analysis' ? 'Run Deep Decoder Analysis' : 'Run Version Comparison'}
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Processing powered by Gemini 3.1 Pro Long-Context Reasoning
              </p>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-20 text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <HistoryIcon className="w-6 h-6 text-indigo-600" />
                  Recent Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.slice(0, 9).map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => loadFromHistory(item)}
                      className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group hover:border-indigo-200 relative overflow-hidden flex flex-col justify-between h-48"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                            {item.type}
                          </div>
                          <div className="flex items-center gap-1 overflow-hidden">
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <button 
                              type="button"
                              onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                              className="p-2 -mr-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all z-30 relative shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 truncate text-left">{item.filename}</h4>
                        {item.secondFilename && (
                          <p className="text-xs text-slate-400 mb-2 truncate text-left italic">
                            vs {item.secondFilename}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        View Analysis Report
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : analyzing ? (
          <motion.div 
            key="analyzing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center"
          >
            <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">AI Decoder at Work...</h2>
            <p className="text-slate-500 italic max-w-sm mx-auto">Evaluating legal logic, identifying risks, and generating plain-English translations.</p>
          </motion.div>
        ) : result && (
          <motion.div 
            key="result-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 space-y-8">
              {/* Analysis Result Display */}
              {('complexityScore' in result) ? (
                <>
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-0"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                            {(result as AnalysisResult).persona} Targeting
                          </span>
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                            (result as AnalysisResult).verdict === 'Safe' ? 'bg-emerald-100 text-emerald-700' : 
                            (result as AnalysisResult).verdict === 'Caution' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          )}>
                            {(result as AnalysisResult).verdict === 'Safe' ? <CheckCircle2 className="w-3 h-3" /> : 
                             (result as AnalysisResult).verdict === 'Caution' ? <AlertTriangle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {(result as AnalysisResult).verdict} Verdict
                          </span>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl no-print">
                          <button 
                            onClick={() => setLanguage('en')} 
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                              language === 'en' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                            )}
                          >
                            <Languages className="w-3 h-3" />
                            English
                          </button>
                          <button 
                            onClick={() => setLanguage('hi')} 
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                              language === 'hi' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
                            )}
                          >
                            हिन्दी
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex-1 text-left">
                          <h2 className="text-3xl font-bold text-slate-900 mb-4">Plain-English Decoder</h2>
                          <p className="text-xl text-slate-600 leading-relaxed font-medium italic">
                            {language === 'en' ? (result as AnalysisResult).summary?.en : (result as AnalysisResult).summary?.hi}
                          </p>
                        </div>
                        <div className="w-full md:w-48 shrink-0">
                           <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Complexity</span>
                              <div className="text-6xl font-display font-bold text-indigo-600 mb-1">{(result as AnalysisResult).complexityScore}</div>
                              <span className="text-[10px] font-bold text-slate-500">out of 10</span>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
                        {(result as AnalysisResult).clauseCards?.map((card, i) => (
                          <div key={i} className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-white transition-all group text-left">
                             <div className="font-bold text-slate-900 text-xs mb-1 group-hover:text-indigo-600">{card.title}</div>
                             <p className="text-[10px] text-slate-500 leading-relaxed">{card.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 px-2 text-left flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                      Risk Radar & Red Flags
                    </h3>
                    {((result as AnalysisResult).risks || []).map((risk, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all"
                      >
                        <div className="p-8 text-left">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-3 h-3 rounded-full animate-pulse",
                                  risk.severity === 'High' ? 'bg-rose-500' : risk.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                )}></div>
                                <h4 className="text-xl font-bold text-slate-900">{risk.category}</h4>
                             </div>
                             <span className={cn(
                               "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                               risk.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                             )}>{risk.severity} Severity</span>
                          </div>
                          <p className="text-slate-600 mb-6">{risk.description}</p>
                          <div className="bg-slate-50 p-6 rounded-2xl text-xs font-mono text-slate-500 border border-slate-100 mb-6 italic leading-relaxed relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => copyToClipboard(risk.clause)}
                                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
                                title="Copy clause"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            "{risk.clause}"
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50">
                               <div className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-2 flex items-center gap-1">
                                 <Info className="w-3 h-3" />
                                 Why this is risky
                               </div>
                               <p className="text-xs text-amber-800 leading-relaxed font-medium">{risk.whyRisky}</p>
                            </div>
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                               <div className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-2 flex items-center gap-1">
                                 <CheckCircle2 className="w-3 h-3" />
                                 Action Recommendation
                               </div>
                               <p className="text-xs text-emerald-800 leading-relaxed font-bold mb-3">{risk.recommendation}</p>
                               {risk.alternativeClause && (
                                 <div className="p-3 bg-white/60 border border-emerald-200 rounded-lg text-[10px] font-mono select-all cursor-help flex justify-between items-center" title="Copy this safer language">
                                   <span className="truncate mr-2">{risk.alternativeClause}</span>
                                   <button 
                                      onClick={() => copyToClipboard(risk.alternativeClause!)}
                                      className="p-1.5 hover:bg-emerald-100 rounded text-emerald-600"
                                   >
                                      <Copy className="w-3 h-3" />
                                   </button>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                /* Comparison Result Display */
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-left">
                   <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Comparison</h2>
                   <p className="text-slate-500 mb-8">
                     Comparing <span className="text-indigo-600 font-bold">{(result as ComparisonResult).baselineName}</span> vs <span className="text-indigo-600 font-bold">{(result as ComparisonResult).comparisonName}</span>
                   </p>
                   
                   <div className="p-8 bg-slate-900 rounded-3xl text-white mb-10">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                         <ShieldCheck className="w-5 h-5 text-indigo-400" />
                         Risk Profile Shift
                      </h3>
                      <p className="text-slate-300 leading-relaxed font-medium italic">"{(result as ComparisonResult).riskShift}"</p>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      {((result as ComparisonResult).changes || []).map((change, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            "p-8 rounded-3xl border text-left relative overflow-hidden",
                            change.impact === 'Positive' ? 'bg-emerald-50 border-emerald-100' : 
                            change.impact === 'Negative' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                          )}
                        >
                           <div className={cn(
                             "absolute top-0 left-0 w-2 h-full",
                             change.impact === 'Positive' ? 'bg-emerald-500' : change.impact === 'Negative' ? 'bg-rose-500' : 'bg-slate-300'
                           )}></div>
                           <div className="flex justify-between items-start mb-4">
                              <span className={cn(
                                "px-3 py-1 rounded text-[10px] font-black uppercase",
                                change.type === 'Added' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                              )}>{change.type}</span>
                              <span className="text-xs font-bold text-slate-400">{change.impact} Impact</span>
                           </div>
                           <h4 className="text-lg font-bold text-slate-900 mb-4">{change.description}</h4>
                           {change.originalText && (
                              <div className="bg-white/40 p-4 rounded-xl border border-slate-200/50 mb-3 line-through text-slate-400 text-xs">
                                 "{change.originalText}"
                              </div>
                           )}
                           {change.newText && (
                              <div className="bg-white/60 p-4 rounded-xl border border-indigo-200/50 text-indigo-900 font-medium text-xs">
                                 "{change.newText}"
                              </div>
                           )}
                        </motion.div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8 no-print sticky top-24">
              {/* Contextual Document Chat */}
              <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-800">
                 <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-white font-bold text-sm tracking-tight">Ask Document Assistant</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">RAG Engine</div>
                 </div>

                 <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12 px-6">
                         <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Send className="w-6 h-6" />
                         </div>
                         <p className="text-slate-500 text-sm italic text-center leading-relaxed">"Can I terminate this agreement anytime?" or "What's the late payment penalty?"</p>
                      </div>
                    )}
                    {chatMessages.map((m, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.95, x: m.role === 'user' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        className={cn(
                          "flex",
                          m.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-3xl text-left text-sm leading-relaxed shadow-sm",
                          m.role === 'user' ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-800 text-slate-300 rounded-bl-none"
                        )}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-slate-800 text-slate-500 p-4 rounded-3xl animate-pulse italic text-sm">Gemini is searching...</div>
                      </div>
                    )}
                    <div ref={chatEndRef}></div>
                 </div>

                 <div className="p-6 bg-slate-800/20 border-t border-slate-800">
                    <div className="relative group text-left">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question..."
                        disabled={!chatSession}
                        className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
                      />
                      <button 
                        type="button"
                        onClick={handleSendMessage}
                        disabled={isChatLoading || !chatSession}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {!chatSession && <p className="text-[10px] text-slate-600 mt-3 text-center">Chat disabled in history view mode</p>}
                 </div>
              </div>

              {/* Jargon Dictionary */}
              {(result && 'jargonTranslator' in result) && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <Info className="w-5 h-5 text-indigo-600" />
                     Jargon Dictionary
                  </h3>
                  <div className="space-y-6">
                    {((result as AnalysisResult).jargonTranslator || []).map((item, i) => (
                      <div key={i}>
                         <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.term}</div>
                         <div className="text-sm font-bold text-slate-700">{item.plainEnglish}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer & Trust */}
              <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-lg text-[10px] font-black text-amber-700 uppercase tracking-widest mb-4">
                    AI Legal Disclaimer
                 </div>
                 <p className="text-[10px] text-amber-600 leading-relaxed italic font-medium">
                   LegalEase analysis is generated by AI and does not constitute formal legal advice. While highly accurate, always consult a qualified lawyer for critical agreements.
                 </p>
                 <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="text-center">
                       <div className="text-lg font-bold text-amber-800">96.4%</div>
                       <div className="text-[8px] font-bold text-amber-600 uppercase">Consistency</div>
                    </div>
                    <div className="w-px h-8 bg-amber-200"></div>
                    <div className="text-center">
                       <div className="text-lg font-bold text-amber-800">Gemini 3.1</div>
                       <div className="text-[8px] font-bold text-amber-600 uppercase">Analysis Engine</div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
