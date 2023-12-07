import { useRef } from 'react';

import { ControlShape, init } from './audio.ts';
import audioTrack from './outfoxing.mp3';

export function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsRef = useRef<ControlShape>();
  const initRef = useRef(false);

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioTrack}
        onEnded={() => {
          console.log('done');
        }}
      />
      <button
        type="button"
        data-playing="false"
        role="switch"
        aria-checked="false"
        onClick={async () => {
          if (!initRef.current) {
            initRef.current = true;
            controlsRef.current = init(audioRef.current!);
          }

          await controlsRef.current!.play();
        }}
      >
        <span>Play/Pause</span>
      </button>
    </div>
  );
}
