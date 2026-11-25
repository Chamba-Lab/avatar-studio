import { useState } from 'react';
import { StartScreen } from './screens/StartScreen';

export default function App() {
  const [photo, setPhoto] = useState<File | null>(null);

  if (!photo) return <StartScreen onPhoto={setPhoto} />;

  // The editor arrives in the next milestone; this keeps the flow testable meanwhile.
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-2xl font-extrabold">Editor coming soon</p>
      <p className="text-muted">{photo.name}</p>
      <button
        type="button"
        onClick={() => setPhoto(null)}
        className="h-12 rounded-2xl border border-white/12 bg-surface px-5 font-semibold"
      >
        Start over
      </button>
    </main>
  );
}
