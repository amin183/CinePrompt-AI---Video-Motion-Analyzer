
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle, 
  Play,
  Monitor,
  Maximize2,
  Zap,
  Layers,
  Cpu,
  Eye,
  Camera,
  Sun,
  Activity
} from 'lucide-react';
import { AnalysisStatus, VideoSegment, AnalysisResponse, TargetModel } from './types';
import { analyzeVideo } from './services/gemini';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [targetModel, setTargetModel] = useState<TargetModel>(TargetModel.VEO_3);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setError("Sequence too heavy for micro-frame analysis. Keep under 25MB.");
      return;
    }

    setStatus(AnalysisStatus.UPLOADING);
    setError(null);
    setVideoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        setStatus(AnalysisStatus.ANALYZING);
        const analysis = await analyzeVideo(base64Data, file.type, targetModel);
        setResults(analysis);
        setStatus(AnalysisStatus.COMPLETED);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Forensic analysis engine encountered a temporal error.");
        setStatus(AnalysisStatus.ERROR);
      }
    };
    reader.onerror = () => {
      setError("Data stream interrupted during read.");
      setStatus(AnalysisStatus.ERROR);
    };
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const seekTo = (timeStr: string) => {
    if (!videoRef.current) return;
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    else seconds = parts[0];
    
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-500/30">
      <nav className="border-b border-white/5 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter uppercase block leading-none">CinePrompt</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Ultra Deconstruct</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">Frame-Forensics Active</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        {status === AnalysisStatus.IDLE && (
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Powered by Gemini 3 Pro
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
              EVERY FRAME <br />
              <span className="gradient-text">TELLS A STORY</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
              Upload cinematic footage for high-precision motion mapping, lighting deconstruction, and AI-ready prompt generation.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-14">
              {Object.values(TargetModel).map((model) => (
                <button
                  key={model}
                  onClick={() => setTargetModel(model)}
                  className={`px-6 py-3 rounded-2xl border text-xs font-black transition-all uppercase tracking-widest ${
                    targetModel === model 
                      ? 'bg-white border-white text-black shadow-2xl shadow-white/10 scale-105' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
            
            <label className="group relative inline-flex items-center gap-4 px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xl cursor-pointer transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95">
              <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              START DECONSTRUCTION
              <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <p className="mt-8 text-xs text-gray-600 font-bold uppercase tracking-widest italic">
              Pro-Grade Temporal Analysis for Sora 2 & Veo 3
            </p>
          </div>
        )}

        {(status === AnalysisStatus.UPLOADING || status === AnalysisStatus.ANALYZING) && (
          <div className="max-w-4xl mx-auto text-center py-24">
            <div className="relative w-48 h-48 mx-auto mb-12">
              <div className="absolute inset-0 border-[12px] border-indigo-500/5 rounded-full"></div>
              <div className="absolute inset-0 border-[12px] border-indigo-500 border-t-transparent rounded-full animate-spin [animation-duration:0.8s]"></div>
              <div className="absolute inset-8 border-4 border-purple-500/20 border-b-transparent rounded-full animate-spin [animation-duration:2s]"></div>
              <Eye className="w-20 h-20 absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase italic">
              {status === AnalysisStatus.UPLOADING ? "Buffering Data..." : "Forensic Scrubbing..."}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              {["Scene Segmentation", "Light Path Mapping", "Material Physics", `${targetModel} Synthesis`].map((step, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left flex flex-col justify-between h-24">
                  <div className="text-[10px] font-black text-indigo-500/50 uppercase">Step 0{i+1}</div>
                  <div className="text-sm font-bold text-gray-300">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto glass-panel p-12 rounded-[2rem] border-red-500/20 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Analysis Interrupted</h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">{error}</p>
            <button 
              onClick={() => setStatus(AnalysisStatus.IDLE)}
              className="px-10 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg"
            >
              Re-Initiate Sequence
            </button>
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && results && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-700">
            {/* Left Stick: Video & High Level DNA */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/10 sticky top-24 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <video 
                  ref={videoRef}
                  src={videoPreview || ""} 
                  className="w-full aspect-video bg-black object-contain border-b border-white/5"
                  controls
                />
                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Cinematic Architecture</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                      {targetModel} Mode
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
                    <p className="text-xl font-bold text-white leading-relaxed pl-6">
                      "{results.overallStyle}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-12">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Micro-Segments
                      </div>
                      <div className="text-4xl font-black">{results.segments.length}</div>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Fidelity
                      </div>
                      <div className="text-xl font-black text-indigo-400 uppercase italic leading-none">FORENSIC PRO</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStatus(AnalysisStatus.IDLE)}
                    className="w-full mt-10 py-5 rounded-3xl bg-white/5 hover:bg-white text-gray-400 hover:text-black border border-white/10 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.3em]"
                  >
                    RESET SYSTEM
                  </button>
                </div>
              </div>
            </div>

            {/* Right Scroll: Detailed Breakdown */}
            <div className="lg:col-span-7 space-y-10 pb-32">
              <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-2">
                <h2 className="text-5xl font-black tracking-tighter uppercase flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Camera className="text-indigo-500 w-6 h-6" />
                  </div>
                  Sequence Log
                </h2>
              </div>

              {results.segments.map((segment, idx) => (
                <div 
                  key={idx} 
                  className="group relative glass-panel border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 shadow-xl"
                >
                  {/* Header Bar */}
                  <div className="bg-white/5 px-10 py-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-5">
                      <span className="text-4xl font-black text-indigo-500/20 italic tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="px-4 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-black font-mono tracking-widest text-indigo-300">
                        {segment.startTime} <span className="text-white/20 px-2">TO</span> {segment.endTime}
                      </div>
                    </div>
                    <button 
                        onClick={() => seekTo(segment.startTime)}
                        className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center group-hover:scale-110"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="p-10">
                    <h4 className="text-3xl font-black mb-8 leading-tight text-white uppercase group-hover:text-indigo-400 transition-colors">
                      {segment.description}
                    </h4>

                    {/* Frame-by-Frame Forensics */}
                    <div className="mb-10 relative">
                      <div className="p-8 bg-indigo-500/[0.03] rounded-[2rem] border border-indigo-500/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40"></div>
                        <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <Cpu className="w-3 h-3" /> Temporal Frame Progression
                        </div>
                        <p className="text-base text-gray-300 leading-relaxed font-medium">
                          {segment.frameByFrameAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* Technical Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                      <div className="space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                          <Camera className="w-4 h-4 text-indigo-500" /> Optics & Path
                        </div>
                        <div className="text-sm text-gray-400 leading-relaxed font-medium border-l-2 border-white/5 pl-4">{segment.cameraTechnical}</div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                          <Sun className="w-4 h-4 text-orange-500" /> Luminosity
                        </div>
                        <div className="text-sm text-gray-400 leading-relaxed font-medium border-l-2 border-white/5 pl-4">{segment.lightingTechnical}</div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-emerald-500" /> Frame Weight
                        </div>
                        <div className="text-sm text-gray-400 leading-relaxed font-medium border-l-2 border-white/5 pl-4">{segment.composition}</div>
                      </div>
                    </div>

                    {/* Master Replication Prompt */}
                    <div className="relative mt-12 group/prompt">
                      <div className="absolute -top-4 left-8 px-5 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] z-10 shadow-2xl shadow-indigo-600/20">
                        {targetModel} Master Engine String
                      </div>
                      <button 
                        onClick={() => copyToClipboard(segment.aiPrompt, idx)}
                        className="absolute top-6 right-6 p-4 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black transition-all shadow-xl z-20"
                      >
                        {copiedId === idx ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </button>
                      <div className="p-10 pt-14 bg-black/40 rounded-[2.5rem] border border-white/5 text-base font-mono text-indigo-100/60 leading-relaxed italic border-t-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-text select-all">
                        {segment.aiPrompt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
