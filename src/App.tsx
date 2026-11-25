import { lazy, Suspense, useRef, useState } from 'react';
import { emptyScene, type Scene } from './editor/scene.ts';
import {
  loadPhoto,
  PhotoError,
  type LoadedPhoto,
  type PhotoErrorReason,
} from './photo/loadPhoto.ts';
import { SaveScreen } from './screens/SaveScreen.tsx';
import { StartScreen } from './screens/StartScreen.tsx';
import { LoadingScreen, PhotoErrorScreen } from './screens/StatusScreens.tsx';

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
  // Kept across editor ↔ save and photo replacement, so nothing is lost going back.
  const [scene, setScene] = useState<Scene>(emptyScene);
  const replaceInput = useRef<HTMLInputElement>(null);

  const openPhoto = async (file: File, keepScene = false) => {
    setView({ name: 'loading' });
    // Start fetching the editor while the photo decodes.
    void import('./editor/EditorScreen.tsx');
    try {
      const loaded = await loadPhoto(file);
      setPhoto(loaded);
      if (!keepScene) setScene(emptyScene());
      else setScene((s) => ({ ...s, photo: emptyScene().photo }));
      setView({ name: 'editor' });
    } catch (e) {
      setView({ name: 'error', reason: e instanceof PhotoError ? e.reason : 'decode-failed' });
    }
  };

  const startOver = () => {
    setPhoto(null);
    setScene(emptyScene());
    setView({ name: 'start' });
  };

  return (
    <>
      {view.name === 'start' && <StartScreen onPhoto={(f) => void openPhoto(f)} />}
      {view.name === 'loading' && <LoadingScreen />}
      {view.name === 'error' && <PhotoErrorScreen reason={view.reason} onRetry={startOver} />}
      {view.name === 'editor' && photo && (
        <Suspense fallback={<LoadingScreen />}>
          <EditorScreen
            // Remount when the photo changes so the history starts from the new photo.
            key={photo.id}
            photo={photo}
            initialScene={scene}
            onClose={startOver}
            onReplacePhoto={() => replaceInput.current?.click()}
            onSaved={(png, latest) => {
              setScene(latest);
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
