import { lazy, Suspense, useRef, useState } from 'react';
import {
  createHistory,
  emptyScene,
  type History as SceneHistory,
  type Scene,
} from './editor/scene.ts';
import {
  loadPhoto,
  PhotoError,
  type LoadedPhoto,
  type PhotoErrorReason,
} from './photo/loadPhoto.ts';
import { SaveScreen } from './screens/SaveScreen.tsx';
import { StartScreen } from './screens/StartScreen.tsx';
import demoPhotoUrl from './assets/demo/rakim-demo.webp';
import { LoadingScreen, PhotoErrorScreen } from './screens/StatusScreens.tsx';
import { color } from './ui/tokens.ts';

// Konva and the editor load only once a photo is chosen, keeping the start screen light.
const EditorScreen = lazy(() =>
  import('./editor/EditorScreen.tsx').then((m) => ({ default: m.EditorScreen })),
);

type View =
  | { name: 'start' }
  | { name: 'loading' }
  | { name: 'error'; reason: PhotoErrorReason }
  | { name: 'editor' }
  | { name: 'save'; png: Blob };

export default function App() {
  const [view, setView] = useState<View>({ name: 'start' });
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  // The whole undo history survives editor ↔ save, so going back loses nothing. A new photo
  // starts a fresh history; a replaced photo keeps the decorations.
  const [history, setHistory] = useState<SceneHistory>(() => createHistory(emptyScene()));
  const replaceInput = useRef<HTMLInputElement>(null);

  const openPhoto = async (file: File, keepScene = false, startScene?: Scene) => {
    setView({ name: 'loading' });
    // Start fetching the editor while the photo decodes.
    void import('./editor/EditorScreen.tsx');
    try {
      const loaded = await loadPhoto(file);
      setPhoto(loaded);
      setHistory((h) =>
        createHistory(
          startScene ?? (keepScene ? { ...h.present, photo: emptyScene().photo } : emptyScene()),
        ),
      );
      setView({ name: 'editor' });
    } catch (e) {
      setView({ name: 'error', reason: e instanceof PhotoError ? e.reason : 'decode-failed' });
    }
  };

  /** Sample transparent photo, so people can explore without uploading anything. */
  const openDemo = async () => {
    let blob: Blob;
    try {
      const res = await fetch(demoPhotoUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      blob = await res.blob();
    } catch {
      // Offline, or a new deploy replaced the file since this page loaded.
      setView({ name: 'error', reason: 'decode-failed' });
      return;
    }
    const file = new File([blob], 'rakim.webp', { type: blob.type || 'image/webp' });
    // A solid color shows off the background option, which a blur barely changes on a cut-out.
    await openPhoto(file, false, {
      ...emptyScene(),
      background: { kind: 'color', color: color.accent },
    });
  };

  const startOver = () => {
    setPhoto(null);
    setHistory(createHistory(emptyScene()));
    setView({ name: 'start' });
  };

  return (
    <>
      {view.name === 'start' && (
        <StartScreen onPhoto={(f) => void openPhoto(f)} onDemo={() => void openDemo()} />
      )}
      {view.name === 'loading' && <LoadingScreen />}
      {view.name === 'error' && <PhotoErrorScreen reason={view.reason} onRetry={startOver} />}
      {view.name === 'editor' && photo && (
        <Suspense fallback={<LoadingScreen />}>
          <EditorScreen
            // Remount when the photo changes so the history starts from the new photo.
            key={photo.id}
            photo={photo}
            initialHistory={history}
            onClose={startOver}
            onReplacePhoto={() => replaceInput.current?.click()}
            onSaved={(png, latest) => {
              setHistory(latest);
              setView({ name: 'save', png });
            }}
          />
        </Suspense>
      )}
      {view.name === 'save' && (
        <SaveScreen
          png={view.png}
          onBack={() => setView({ name: 'editor' })}
          onStartOver={startOver}
        />
      )}
      <input
        ref={replaceInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void openPhoto(file, true);
        }}
      />
    </>
  );
}
