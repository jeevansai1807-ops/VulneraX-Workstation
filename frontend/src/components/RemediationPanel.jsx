import { X, Copy, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateAIRemediation } from '../api/client';

const getRemediationSnippet = (vuln) => {
  const name = (vuln?.name || '').toLowerCase();
  const category = (vuln?.category || '').toLowerCase();

  if (name.includes('xss') || category.includes('xss')) {
    return `// 1. Content Security Policy (CSP) Header\nHeader set Content-Security-Policy "default-src 'self'; script-src 'self';"\n\n// 2. Output Sanitization with DOMPurify\nconst safeOutput = DOMPurify.sanitize(userInput);\nelement.innerHTML = safeOutput;`;
  }
  if (name.includes('sqli') || name.includes('sql') || category.includes('sqli')) {
    return `// 1. Parameterized Query (Python SQLAlchemy)\nstmt = select(User).where(User.username == bindparam('username'))\n\n// 2. Prepared Statement (Node.js pg driver)\nconst result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`;
  }
  if (name.includes('traversal') || category.includes('traversal')) {
    return `// Secure File Path Resolution (Python)\nimport os\n\nbase_dir = os.path.abspath("/var/www/uploads")\nrequested_path = os.path.abspath(os.path.join(base_dir, filename))\n\nif not requested_path.startswith(base_dir):\n    raise PermissionError("Path Traversal Vector Prevented")`;
  }
  if (name.includes('sensitive') || name.includes('.env') || name.includes('.git') || category.includes('sensitive')) {
    return `# Nginx Protection Block\nlocation ~ /\\.(env|git|htaccess|config) {\n    deny all;\n    return 404;\n}`;
  }
  if (name.includes('redirect') || category.includes('redirect')) {
    return `// Trusted Redirection Whitelist Verification\nconst allowedHosts = ['vulnerax.ai', 'auth.vulnerax.ai'];\nconst targetUrl = new URL(userProvidedRedirect);\n\nif (!allowedHosts.includes(targetUrl.hostname)) {\n    throw new Error("Invalid Unsanitized Redirection");\n}`;
  }
  return `// Standard Vulnerability Remediation:\n// 1. Enforce strict type validation & input boundary checks.\n// 2. Activate HTTPS HSTS with TLS 1.3 encryption.\n// 3. Follow Principle of Least Privilege across all database services.`;
};

export default function RemediationPanel({ vulnerability, onClose, scanId }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRemediation, setAiRemediation] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    setMounted(true);
    setAiRemediation(null);
    setAiError(null);
    return () => setMounted(false);
  }, [vulnerability]);

  if (!vulnerability || !mounted) return null;

  const handleGenerateAI = async () => {
    if (!scanId) {
       setAiError("Scan ID is required for AI remediation.");
       return;
    }
    setIsGenerating(true);
    setAiError(null);
    try {
      const { data } = await generateAIRemediation(
        scanId,
        vulnerability.name,
        vulnerability.description,
        vulnerability.evidence
      );
      setAiRemediation(data.remediation);
    } catch (err) {
      setAiError(err.response?.data?.detail || "AI remediation service unavailable. Verify backend API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const patchCode = getRemediationSnippet(vulnerability);

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (!inline && match) {
        return (
          <div className="relative group mt-4 mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/30 to-purple-600/30 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative rounded-2xl bg-[#090817] border border-rose-500/30 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-rose-500/20">
                <span className="text-[10px] uppercase font-mono text-rose-300 font-bold tracking-widest">{match[1]}</span>
                <button 
                  onClick={() => handleCopy(codeString)}
                  className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-rose-300 transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <div className="p-4 overflow-x-auto text-xs font-mono text-rose-100/90 leading-relaxed">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            </div>
          </div>
        );
      }
      return (
        <code className="bg-rose-500/15 text-rose-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  const panelContent = (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 w-full md:w-[620px] h-full z-50 p-4 pl-0"
      >
        <div className="w-full h-full glass-panel rounded-l-3xl border-l border-y border-rose-500/30 shadow-[-20px_0_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative backdrop-blur-3xl bg-[#090817]/95">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-rose-500/20 bg-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-rose-400 animate-pulse" />
              <div>
                <h2 className="font-black text-base text-foreground font-mono uppercase tracking-wider">
                  AI Remediation & Patch Lab
                </h2>
                <span className="text-[10px] font-mono text-rose-300/80">GEMINI INTELLIGENCE ENGINE</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 border border-destructive/30 text-rose-300 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                {vulnerability.severity} Risk
              </div>
              <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">{vulnerability.name}</h1>
              <p className="text-rose-400 font-mono text-xs break-all">{vulnerability.url || vulnerability.endpoint}</p>
            </div>

            {vulnerability.description && (
              <div className="p-4 rounded-2xl bg-white/5 border border-rose-500/20 text-xs text-foreground/90 space-y-1">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-300 block">Threat Breakdown</span>
                <p className="leading-relaxed">{vulnerability.description}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-300 block">AI Automated Synthesis</span>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="btn-cyber-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {isGenerating ? 'Synthesizing...' : 'AI Generate Patch'}
                </button>
              </div>

              {aiError && (
                <div className="p-3 mb-4 rounded-xl bg-destructive/15 border border-destructive/30 text-rose-300 text-xs font-mono">
                  {aiError}
                </div>
              )}

              {aiRemediation ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 shadow-inner">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 mb-2">Root Cause Analysis</h3>
                    <p className="text-xs text-foreground/90 leading-relaxed font-mono">{aiRemediation.root_cause_analysis}</p>
                  </div>
                  
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 shadow-inner">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 mb-2">Remediation Steps</h3>
                    <ol className="list-decimal pl-4 space-y-2 text-xs text-foreground/90 font-mono">
                      {aiRemediation.remediation_steps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {aiRemediation.code_example && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">Patched Code Implementation</h3>
                        <button
                          onClick={() => handleCopy(aiRemediation.code_example)}
                          className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground"
                        >
                          {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-black/80 font-mono text-xs text-emerald-300 overflow-x-auto border border-emerald-500/20">
                        <code>{aiRemediation.code_example}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : vulnerability.recommendation ? (
                 <ReactMarkdown components={components}>
                   {vulnerability.recommendation}
                 </ReactMarkdown>
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-rose-500/20">
                  <p className="text-muted-foreground text-xs font-mono leading-relaxed">
                    Execute input parameter scrubbing, enable strict CORS headers, and enforce zero-trust policies.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Code Patch Suggestion */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Quick Code Patch Reference
                </span>
                <button
                  onClick={() => handleCopy(patchCode)}
                  className="flex items-center gap-1 text-[11px] font-mono text-rose-300 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'COPIED' : 'COPY PATCH'}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-emerald-500/30 leading-relaxed shadow-inner">
                <code>{patchCode}</code>
              </pre>
            </div>
            
            {/* Evidence Payload */}
            <div className="pt-4 border-t border-rose-500/20">
              <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                Raw Exploit / Proof-of-Concept Payload
              </h3>
              <div className="bg-black/70 border border-rose-500/20 p-4 rounded-2xl font-mono text-xs text-rose-300/80 break-all leading-relaxed shadow-inner">
                {vulnerability.evidence || "No payload evidence captured."}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(panelContent, document.body);
}
