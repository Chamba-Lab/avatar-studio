import { useRef } from 'react';
import rakim from '../assets/showcase/rakim.webp';
import rakimChristmas from '../assets/showcase/rakim-christmas.webp';
import { themes } from '../themes/catalog';

type Props = {
  onPhoto: (file: File) => void;
  onDemo: () => void;
};

const frameOf = (themeId: string, frameId: string) =>
  themes.find((t) => t.id === themeId)?.frames.find((f) => f.id === frameId)?.src;

function ShowcaseCard({
  photo,
  frame,
  className,
  sizeClass,
}: {
  photo: string;
  frame?: string;
  className: string;
  sizeClass: string;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-[28px] border border-hairline bg-surface shadow-[0_24px_50px_rgb(0_0_0/0.45)] ${className}`}
    >
      <div className={`relative ${sizeClass}`}>
        <img src={photo} alt="" className="absolute inset-[6%] h-[88%] w-[88%] rounded-full" />
        {frame && <img src={frame} alt="" className="absolute inset-0 h-full w-full" />}
      </div>
    </div>
  );
}

export function StartScreen({ onPhoto, onDemo }: Props) {
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onPhoto(file);
    event.target.value = '';
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] lg:max-w-5xl lg:flex-row lg:items-center lg:gap-16 lg:px-10">
      <header className="flex h-11 items-center justify-between lg:absolute lg:inset-x-0 lg:top-6 lg:mx-auto lg:max-w-5xl lg:px-10">
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold tracking-tight">Avatar Studio</span>
        </div>
        <a
          href="https://chambalab.org"
          className="py-2 text-xs text-muted no-underline hover:text-text"
        >
          by Chamba Lab
        </a>
      </header>

      <div
        className="relative mx-auto mt-3 h-[262px] w-full max-w-[350px] lg:order-2 lg:mt-0 lg:h-[440px] lg:max-w-[460px]"
        aria-hidden="true"
      >
        <ShowcaseCard
          photo={rakim}
          frame={frameOf('chamba-lab', 'lab-ring')}
          sizeClass="h-[104px] w-[104px] lg:h-[150px] lg:w-[150px]"
          className="top-[70px] left-0 h-[170px] w-[140px] -rotate-12 lg:top-[130px] lg:h-[230px] lg:w-[190px]"
        />
        <ShowcaseCard
          photo={rakim}
          frame={frameOf('christmas', 'lights-ring')}
          sizeClass="h-[104px] w-[104px] lg:h-[150px] lg:w-[150px]"
          className="top-[58px] right-0 h-[170px] w-[140px] rotate-[11deg] lg:top-[110px] lg:h-[230px] lg:w-[190px]"
        />
        <ShowcaseCard
          photo={rakimChristmas}
          frame={frameOf('christmas', 'wreath')}
          sizeClass="h-[132px] w-[132px] lg:h-[190px] lg:w-[190px]"
          className="top-2 left-[calc(50%-80px)] h-[200px] w-[160px] animate-float bg-raised lg:left-[calc(50%-115px)] lg:h-[290px] lg:w-[230px]"
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col lg:order-1 lg:flex-none lg:basis-[440px]">
        <h1 className="font-display text-[42px] leading-[0.98] font-extrabold tracking-[-0.03em] lg:text-[64px]">
          Dress up
          <br />
          your <span className="text-accent">avatar.</span>
        </h1>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-muted lg:text-lg">
          Frames and stickers for your Discord profile. Ready in a minute.
        </p>

        <div className="mt-auto flex flex-col gap-3.5 pt-6 lg:mt-10">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              className="flex h-[60px] flex-1 items-center justify-between rounded-[20px] bg-accent pr-2 pl-[22px] text-[17px] font-bold text-on-accent transition-transform duration-150 active:scale-[0.97]"
            >
              Choose a photo
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-on-accent">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              aria-label="Take a photo"
              onClick={() => cameraInput.current?.click()}
              className="flex h-[60px] w-[60px] items-center justify-center rounded-[20px] border border-white/12 bg-surface transition-transform duration-150 active:scale-[0.95] lg:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={onDemo}
            className="self-center py-1.5 text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent lg:self-start"
          >
            or try it with Rakim
          </button>
          <p className="flex items-center gap-2 self-center text-[13px] text-muted lg:self-start">
            <span className="h-2 w-2 rounded-full bg-confirm" />
            Your photo never leaves your device
          </p>
        </div>
      </div>

      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFile}
      />
    </main>
  );
}
