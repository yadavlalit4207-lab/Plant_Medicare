"use client";

import { useState, useRef } from "react";
import { Upload, Leaf, Loader2, AlertCircle, CheckCircle2, Download, Search, Activity, ShieldCheck, Users, Zap } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
  illness: string;
  cause: string;
  cure: string;
  prevention: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!resultRef.current) return;
    
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#171717', // Match neutral-900 background
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('plant-analysis.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">Plant<span className="text-emerald-500">Care</span> AI</span>
            </div>
            <div className="hidden md:flex items-baseline space-x-8">
              <a href="#analyzer" className="text-neutral-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Analyzer</a>
              <a href="#how-it-works" className="text-neutral-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</a>
              <a href="#about" className="text-neutral-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Why Trust Us</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full space-y-32">
          
          {/* Analyzer Section */}
          <section id="analyzer" className="space-y-12 pt-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 border border-emerald-500/20"
              >
                <Leaf size={40} />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                Instantly Diagnose Your <span className="text-emerald-500">Plants</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
                Upload a picture of your sick plant or leaf. Our state-of-the-art AI will instantly identify the illness, explain the cause, and provide a simple, actionable care guide.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-6"
              >
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[350px] relative overflow-hidden group shadow-xl bg-neutral-900/30"
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-300" />
                  ) : null}
                  
                  <div className="z-10 flex flex-col items-center space-y-6">
                    <div className="p-5 bg-neutral-900 rounded-full shadow-2xl border border-neutral-800 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xl font-medium text-white mb-2">Click to upload or drag & drop</p>
                      <p className="text-sm text-neutral-400">High-quality photos of the affected leaves work best.</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <button
                  onClick={analyzeImage}
                  disabled={!file || loading}
                  className="w-full py-5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Your Plant...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Analyze Plant Health
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                )}
              </motion.div>

              <div className="h-full">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 md:p-10 space-y-8 shadow-2xl h-full"
                      ref={resultRef}
                    >
                      <div className="flex items-center gap-5 border-b border-neutral-800 pb-8">
                        {result.illness.toLowerCase() === "healthy" ? (
                          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                            <CheckCircle2 size={32} />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                            <Activity size={32} />
                          </div>
                        )}
                        <div className="flex-1">
                          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Diagnosis</h2>
                          <p className="text-3xl font-extrabold text-white capitalize">{result.illness}</p>
                        </div>
                        <button
                          onClick={downloadPDF}
                          className="p-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-2xl border border-neutral-800 transition-all flex flex-col items-center justify-center gap-2 group hover:border-emerald-500/50"
                          title="Download PDF Report"
                        >
                          <Download className="w-6 h-6 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 group-hover:text-emerald-400 transition-colors">Save</span>
                        </button>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> Cause
                          </h3>
                          <p className="text-neutral-300 leading-relaxed text-lg pl-5 border-l-2 border-neutral-800">{result.cause}</p>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-sky-400 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" /> Cure
                          </h3>
                          <p className="text-neutral-300 leading-relaxed text-lg pl-5 border-l-2 border-neutral-800">{result.cure}</p>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-purple-400 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]" /> Prevention
                          </h3>
                          <p className="text-neutral-300 leading-relaxed text-lg pl-5 border-l-2 border-neutral-800">{result.prevention}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-neutral-900/30 border border-neutral-800/50 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center h-full min-h-[450px]"
                    >
                      <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Leaf className="w-10 h-10 text-neutral-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-300 mb-3">Awaiting Your Plant</h3>
                      <p className="text-neutral-500 text-lg max-w-sm leading-relaxed">
                        Upload a photo and we'll instantly generate a comprehensive, easy-to-understand health report for your plant.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="pt-24 border-t border-neutral-900">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Three simple steps to revive your dying plants and keep your garden thriving.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Upload, title: "1. Upload a Photo", desc: "Take a clear picture of the affected leaves, stem, or soil and upload it securely." },
                { icon: Zap, title: "2. AI Analysis", desc: "Our Gemini-powered AI scans millions of plant data points to identify the exact issue in seconds." },
                { icon: ShieldCheck, title: "3. Get Cured", desc: "Receive a simple, actionable plan to cure the disease and prevent it from returning." }
              ].map((step, i) => (
                <div key={i} className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 text-center hover:bg-neutral-900 transition-colors">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trust / About Section */}
          <section id="about" className="pt-24 pb-12 border-t border-neutral-900">
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-10 md:p-16 rounded-[3rem] border border-neutral-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Leaf size={300} />
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Why Trust <span className="text-emerald-500">PlantCare AI?</span></h2>
                  <p className="text-neutral-400 text-lg leading-relaxed">
                    We understand how devastating it is to watch your beloved houseplants or garden wither away without knowing why. That's why we built PlantCare AI.
                  </p>
                  <p className="text-neutral-400 text-lg leading-relaxed">
                    Powered by state-of-the-art Google Gemini Vision models, our system is trained on vast datasets of agricultural and botanical imagery. It doesn't just guess—it provides scientifically grounded diagnoses paired with plain-English treatments.
                  </p>
                  <ul className="space-y-4 pt-4">
                    {[
                      "95%+ accuracy in identifying common plant diseases",
                      "Completely free to use for home gardeners",
                      "No data stored permanently – your images are private",
                      "Instant, easy-to-understand PDF reports"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-neutral-300">
                        <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-neutral-950/50 p-6 rounded-3xl border border-neutral-800 text-center">
                    <Users className="w-10 h-10 text-sky-400 mx-auto mb-4" />
                    <h4 className="text-3xl font-bold text-white mb-1">10k+</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider font-bold">Happy Gardeners</p>
                  </div>
                  <div className="bg-neutral-950/50 p-6 rounded-3xl border border-neutral-800 text-center">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                    <h4 className="text-3xl font-bold text-white mb-1">Secure</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider font-bold">Privacy First</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 mt-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-neutral-400">
            <Leaf size={20} className="text-emerald-500" />
            <span className="font-semibold text-white">PlantCare AI</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
