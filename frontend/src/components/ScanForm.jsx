import { useState, useRef, useEffect } from 'react';
import { Target, Loader2, Settings, ChevronDown, ChevronUp, Sparkles, Shield } from 'lucide-react';
import gsap from 'gsap';

export default function ScanForm({ onScan, isScanning }) {
  const [target, setTarget] = useState('');
  const [headers, setHeaders] = useState('');
  const [cookies, setCookies] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shattered, setShattered] = useState(false);
  const formRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (target.trim()) {
      let parsedHeaders = null;
      let parsedCookies = null;

      try {
        if (headers.trim()) parsedHeaders = JSON.parse(headers);
      } catch (err) {
        alert("Invalid JSON format in Headers. Please provide valid JSON.");
        return;
      }

      try {
        if (cookies.trim()) parsedCookies = JSON.parse(cookies);
      } catch (err) {
        alert("Invalid JSON format in Cookies. Please provide valid JSON.");
        return;
      }

      triggerShatterEffect();
      // Delay the actual scan start so the animation plays out
      setTimeout(() => {
        onScan(target.trim(), parsedHeaders, parsedCookies);
        setTarget('');
      }, 1400);
    }
  };

  const triggerShatterEffect = () => {
    setShattered(true);
    
    // Animate the input scaling out
    gsap.to(formRef.current, {
      opacity: 0,
      scale: 1.08,
      duration: 0.35,
      ease: "power2.out"
    });

    // Create 3D radiant cyber particles
    const rect = formRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const numParticles = 48;
    const colors = ['#f43f5e', '#d946ef', '#8b5cf6', '#fb923c', '#ffffff'];
    
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      particle.className = 'absolute rounded-full shadow-lg z-50 pointer-events-none';
      particle.style.backgroundColor = chosenColor;
      particle.style.boxShadow = `0 0 12px ${chosenColor}`;
      
      const size = Math.random() * 7 + 2.5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      const startX = (Math.random() * rect.width) + (rect.left - containerRect.left);
      const startY = (Math.random() * rect.height) + (rect.top - containerRect.top);
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      containerRef.current.appendChild(particle);
      particlesRef.current.push(particle);

      const tl = gsap.timeline();
      
      // 1. Explode outward with 3D depth feeling
      tl.to(particle, {
        x: (Math.random() - 0.5) * 360,
        y: (Math.random() - 0.5) * 280,
        opacity: Math.random() * 0.5 + 0.5,
        duration: 0.5 + Math.random() * 0.3,
        ease: "expo.out"
      })
      // 2. Swarm upwards into the scanner engine
      .to(particle, {
        x: (containerRect.width / 2) - startX + (Math.random() - 0.5) * 80,
        y: -120 - startY,
        opacity: 0,
        scale: 0.2,
        duration: 0.9 + Math.random() * 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      });
    }
  };

  useEffect(() => {
    if (!isScanning && shattered) {
      setShattered(false);
      gsap.to(formRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.out"
      });
      particlesRef.current = [];
    }
  }, [isScanning, shattered]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto my-6">
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="relative flex flex-col sm:flex-row gap-4 w-full group"
      >
        <div className="relative flex-1">
          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/25 via-fuchsia-500/20 to-purple-600/25 blur-xl rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative flex items-center bg-card/90 border-2 border-rose-500/30 hover:border-rose-500/60 focus-within:border-rose-500 rounded-2xl px-5 py-2.5 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.3)] focus-within:shadow-[0_0_35px_rgba(244,63,94,0.35)]">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mr-2 shrink-0">
              <Target className="h-5 w-5 animate-pulse" />
            </div>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="ENTER TARGET IP OR DOMAIN (e.g. example.com)..."
              className="w-full bg-transparent border-none outline-none text-foreground font-mono text-base placeholder:text-muted-foreground tracking-wider py-3"
              disabled={shattered}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!target.trim() || shattered}
          className={`relative overflow-hidden rounded-2xl px-10 py-4 font-bold tracking-widest uppercase transition-all duration-300 shrink-0 ${
            target.trim() && !shattered
              ? 'btn-cyber-primary cursor-pointer' 
              : 'bg-white/5 text-muted-foreground border border-rose-500/20 opacity-50 cursor-not-allowed'
          }`}
        >
          {shattered ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Engaging
            </span>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Engage Scan
            </span>
          )}
        </button>
      </form>

      {/* Advanced Settings Toggle */}
      {!shattered && (
        <div className="mt-4 flex flex-col items-center">
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground hover:text-rose-400 transition-colors uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <Settings className="h-3.5 w-3.5" />
            Custom Headers & Cookies
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
          {/* Advanced Settings Panel */}
          {showAdvanced && (
            <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-rose-500/20 backdrop-blur-xl">
                <label className="text-xs font-mono font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Custom Headers (JSON)
                </label>
                <textarea 
                  className="w-full bg-white/5 border border-rose-500/20 focus:border-rose-500 rounded-xl p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground min-h-[90px] resize-y outline-none transition-colors"
                  placeholder='{"Authorization": "Bearer token", "X-Custom": "Value"}'
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-purple-500/20 backdrop-blur-xl">
                <label className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" /> Custom Cookies (JSON)
                </label>
                <textarea 
                  className="w-full bg-white/5 border border-purple-500/20 focus:border-purple-500 rounded-xl p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground min-h-[90px] resize-y outline-none transition-colors"
                  placeholder='{"session_id": "12345", "user_prefs": "dark_mode"}'
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target display when shattered */}
      {shattered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-in fade-in zoom-in duration-500 delay-500 bg-card/90 backdrop-blur-xl border border-rose-500/30 px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <h3 className="text-rose-400 font-mono tracking-[0.4em] text-xs mb-1 font-bold uppercase">INITIALIZING SENTINEL ENGINE</h3>
            <p className="text-foreground text-2xl font-black tracking-wider drop-shadow-md">
              {target}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
