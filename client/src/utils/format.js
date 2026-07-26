export function statusTone(statusCode) {
  if (!statusCode) return 'error';
  if (statusCode >= 200 && statusCode < 300) return 'ok';
  if (statusCode >= 300 && statusCode < 400) return 'warn';
  return 'error';
}

export function statusColorClasses(statusCode) {
  const tone = statusTone(statusCode);
  if (tone === 'ok') return 'text-pulse-400 bg-pulse-500/10 border-pulse-500/30';
  if (tone === 'warn') return 'text-warn-400 bg-warn-400/10 border-warn-400/30';
  return 'text-danger-400 bg-danger-400/10 border-danger-400/30';
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMs(ms) {
  if (ms === null || ms === undefined) return '—';
  return `${ms} ms`;
}

export function timeAgo(isoString) {
  if (!isoString) return '—';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const seconds = Math.round(diffMs / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
