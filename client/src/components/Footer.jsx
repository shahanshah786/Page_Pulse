export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Page Pulse. Every check, in one heartbeat.</p>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pulse-400 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </div>
    </footer>
  );
}
