import { Link } from 'react-router-dom';
import PulseMonitor from '../components/PulseMonitor';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
      <div className="h-16 mb-6 opacity-70">
        <PulseMonitor state="done" tone="error" className="w-full h-full" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-slate-50 mb-2">Flatline: 404</h1>
      <p className="text-slate-500 mb-8">
        This page didn't respond. Head back and audit something that does.
      </p>
      <Link
        to="/"
        className="inline-block text-sm px-5 py-2.5 rounded-lg bg-pulse-500 text-ink-950 font-medium hover:bg-pulse-400 transition-colors"
      >
        Back to Page Pulse
      </Link>
    </div>
  );
}
