import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRightLeft,
  Copy,
  Download,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import { statusColorClasses, formatBytes, formatMs } from '../utils/format';
import { useToast } from '../context/ToastContext';

function StatItem({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className={`font-mono text-sm font-medium ${accent || 'text-slate-100'}`}>{value}</div>
    </div>
  );
}

function SecurityHeaderRow({ name, present }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-400 font-mono">{name}</span>
      {present ? (
        <span className="flex items-center gap-1 text-xs text-pulse-400">
          <ShieldCheck className="w-3.5 h-3.5" /> present
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <ShieldAlert className="w-3.5 h-3.5" /> missing
        </span>
      )}
    </div>
  );
}

const RECOMMENDED_HEADERS = [
  ['strict-transport-security', 'Strict-Transport-Security'],
  ['content-security-policy', 'Content-Security-Policy'],
  ['x-content-type-options', 'X-Content-Type-Options'],
  ['x-frame-options', 'X-Frame-Options'],
  ['referrer-policy', 'Referrer-Policy'],
];

export default function AuditResultCard({ response }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const { data, cached } = response;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success('Result copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-pulse-${new URL(data.finalUrl).hostname}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded audit as JSON');
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-slate-500 mb-1">Audited target</p>
          <h2 className="font-display text-xl font-semibold text-slate-50 break-all">
            {data.finalUrl}
          </h2>
          {data.seo?.title && <p className="text-sm text-slate-400 mt-1">{data.seo.title}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {cached && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-signal-500/30 text-signal-400 bg-signal-500/10">
              from cache
            </span>
          )}
          <span
            className={`text-sm font-mono font-semibold px-3 py-1 rounded-full border ${statusColorClasses(
              data.statusCode
            )}`}
          >
            {data.statusCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatItem
          label="Response time"
          icon={Clock}
          value={formatMs(data.responseTimeMs)}
          accent={data.responseTimeMs > 2000 ? 'text-warn-400' : 'text-pulse-400'}
        />
        <StatItem
          label="HTTPS"
          icon={data.https ? Lock : Unlock}
          value={data.https ? 'Secure' : 'Not secure'}
          accent={data.https ? 'text-pulse-400' : 'text-danger-400'}
        />
        <StatItem label="Redirects" icon={ArrowRightLeft} value={data.redirectCount} />
        <StatItem label="Content size" value={formatBytes(data.contentLength)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Page metadata</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">Meta description</dt>
              <dd className="text-slate-300 break-words">{data.seo?.metaDescription || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">Canonical URL</dt>
              <dd className="text-slate-300 break-all">{data.seo?.canonicalUrl || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">OG title</dt>
              <dd className="text-slate-300 break-words">{data.seo?.openGraph?.title || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">Robots meta</dt>
              <dd className="text-slate-300">{data.seo?.robotsMeta || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">Server</dt>
              <dd className="text-slate-300">{data.serverHeader || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 shrink-0 w-32">Cache-Control</dt>
              <dd className="text-slate-300 break-words">{data.cacheControl || '—'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Security headers</h3>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4">
            {RECOMMENDED_HEADERS.map(([key, label]) => (
              <SecurityHeaderRow key={key} name={label} present={Boolean(data.securityHeaders?.[key])} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-pulse-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy result'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download JSON
        </button>
      </div>
    </div>
  );
}
