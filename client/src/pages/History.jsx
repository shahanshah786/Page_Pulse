import { useMemo, useState } from 'react';
import { Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuditHistory } from '../hooks/useAuditHistory';
import { timeAgo, statusColorClasses } from '../utils/format';

export default function History() {
  const { history, clearHistory, removeEntry } = useAuditHistory();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.trim().toLowerCase();
    return history.filter(
      (item) => item.url.toLowerCase().includes(q) || item.title?.toLowerCase().includes(q)
    );
  }, [history, query]);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-50">Audit history</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stored locally in this browser — {history.length} audit{history.length === 1 ? '' : 's'} saved.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-danger-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      <div className="glass-card flex items-center gap-2 px-4 py-2.5 mb-6">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by URL or page title"
          className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search">
            <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-slate-300 font-medium mb-1">
            {history.length === 0 ? 'No audits yet' : 'No matches found'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            {history.length === 0
              ? 'Run your first audit to start building a history.'
              : 'Try a different search term.'}
          </p>
          {history.length === 0 && (
            <Link
              to="/"
              className="inline-block text-sm px-4 py-2 rounded-lg bg-pulse-500 text-ink-950 font-medium hover:bg-pulse-400 transition-colors"
            >
              Run an audit
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card flex items-center gap-4 px-4 py-3">
              <span
                className={`text-xs font-mono font-semibold px-2 py-1 rounded-full border shrink-0 ${statusColorClasses(
                  item.statusCode
                )}`}
              >
                {item.statusCode}
              </span>
              <Link to={`/audit/${item.id}`} className="min-w-0 flex-1 group">
                <p className="text-sm text-slate-200 truncate group-hover:text-pulse-400 transition-colors">
                  {item.title || item.url}
                </p>
                <p className="text-xs text-slate-500 truncate">{item.url}</p>
              </Link>
              <span className="text-xs text-slate-500 shrink-0">{timeAgo(item.auditedAt)}</span>
              <button
                onClick={() => removeEntry(item.id)}
                aria-label={`Remove ${item.url} from history`}
                className="text-slate-600 hover:text-danger-400 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
