import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import PulseMonitor from '../components/PulseMonitor';
import AuditSkeleton from '../components/AuditSkeleton';
import AuditResultCard from '../components/AuditResultCard';
import { runAudit } from '../api/client';
import { useAuditHistory } from '../hooks/useAuditHistory';
import { useToast } from '../context/ToastContext';
import { timeAgo, statusColorClasses } from '../utils/format';
import { Link } from 'react-router-dom';

function normalizeInput(value) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | scanning | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { history, addEntry } = useAuditHistory();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = normalizeInput(input);
    if (!url) return;

    setStatus('scanning');
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await runAudit(url);
      setResult(response);
      setStatus('done');
      addEntry(response);
      toast.success(response.cached ? 'Loaded from cache' : 'Audit complete');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Audit failed');
      toast.error(err.message || 'Audit failed');
    }
  };

  const tone = status === 'error' ? 'error' : 'ok';

  return (
    <div className="max-w-6xl mx-auto px-6 pt-14 pb-24">
      {/* Hero */}
      <section className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pulse-400 bg-pulse-500/10 border border-pulse-500/20 px-3 py-1 rounded-full mb-6">
          Live URL diagnostics
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
          Every site, one heartbeat away.
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto mb-10">
          Page Pulse reads the vitals of any public URL — status, security headers, SEO
          signals, and response health — in under five seconds.
        </p>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="glass-card flex items-center gap-2 p-2 pl-4">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="example.com or https://example.com/page"
              className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600 py-2"
              aria-label="URL to audit"
            />
            <button
              type="submit"
              disabled={status === 'scanning' || !input.trim()}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-pulse-500 text-ink-950 hover:bg-pulse-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning
                </>
              ) : (
                'Run audit'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 max-w-2xl mx-auto h-[80px]">
          <PulseMonitor
            state={status === 'scanning' ? 'scanning' : status === 'idle' ? 'idle' : 'done'}
            tone={tone}
            className="w-full h-full"
          />
        </div>
      </section>

      {/* Result / skeleton / error */}
      <section className="max-w-3xl mx-auto mb-16">
        {status === 'scanning' && <AuditSkeleton />}
        {status === 'error' && (
          <div className="glass-card border-danger-400/30 p-6 text-center">
            <p className="text-danger-400 font-medium mb-1">Audit couldn't complete</p>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
        )}
        {status === 'done' && result && <AuditResultCard response={result} />}
      </section>

      {/* Recent audits */}
      {history.length > 0 && (
        <section className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-slate-200">Recent audits</h2>
            <Link to="/history" className="text-sm text-pulse-400 hover:text-pulse-300">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {history.slice(0, 4).map((item) => (
              <div key={item.id} className="glass-card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{item.url}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{timeAgo(item.auditedAt)}</p>
                </div>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border shrink-0 ${statusColorClasses(
                    item.statusCode
                  )}`}
                >
                  {item.statusCode}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
