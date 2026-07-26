import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuditResultCard from '../components/AuditResultCard';
import { useAuditHistory } from '../hooks/useAuditHistory';

export default function AuditResult() {
  const { id } = useParams();
  const { history } = useAuditHistory();
  const entry = history.find((item) => item.id === id);

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-24">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-pulse-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to history
      </Link>

      {entry ? (
        <AuditResultCard response={{ data: entry.result, cached: entry.cached }} />
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-300 font-medium mb-1">This audit isn't in your local history</p>
          <p className="text-sm text-slate-500">
            Local history only lives in this browser. Run a fresh audit instead.
          </p>
        </div>
      )}
    </div>
  );
}
