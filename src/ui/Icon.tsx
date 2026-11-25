const paths = {
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M15 18l-6-6 6-6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3',
  redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3',
  flip: 'M12 3v18M8 7l-5 5 5 5zM16 7l5 5-5 5z',
  front: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  duplicate: 'M8 8h12v12H8zM16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3',
  trash: 'M4 7h16M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 12l5 5 9-10',
  rotate: 'M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5',
  image: 'M3 3h18v18H3zM9 7a2 2 0 100 4 2 2 0 000-4zM21 15l-5-5L5 21',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v7h14v-7',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  none: 'M12 3a9 9 0 100 18 9 9 0 000-18zM5.6 18.4L18.4 5.6',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5',
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
