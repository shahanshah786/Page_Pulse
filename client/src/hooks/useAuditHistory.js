import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'page-pulse:history';
const MAX_ENTRIES = 25;

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    
  }
}

export function useAuditHistory() {
  const [history, setHistory] = useState(() => readHistory());

  useEffect(() => {
    writeHistory(history);
  }, [history]);

  const addEntry = useCallback((auditResponse) => {
    setHistory((prev) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url: auditResponse.data.requestedUrl,
        finalUrl: auditResponse.data.finalUrl,
        statusCode: auditResponse.data.statusCode,
        https: auditResponse.data.https,
        title: auditResponse.data.seo?.title || null,
        cached: auditResponse.cached,
        auditedAt: auditResponse.data.auditedAt,
        result: auditResponse.data,
      };
      const deduped = prev.filter((item) => item.url !== entry.url);
      return [entry, ...deduped].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { history, addEntry, clearHistory, removeEntry };
}
