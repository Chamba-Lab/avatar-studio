import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Circle, Image as KonvaImage, Layer, Rect, Shape, Stage, Transformer } from 'react-konva';
import { blurredBackdrop } from '../photo/blurredBackdrop.ts';
import type { LoadedPhoto } from '../photo/loadPhoto.ts';
import { assets } from '../themes/catalog.ts';
import type { Scene, SceneAction, StickerInstance } from './scene.ts';
import { HELPER } from './exportAvatar.ts';
import { useImage } from './useImage.ts';

// Keep touch events flowing while a node is being dragged, so a second finger can start a pinch.
Konva.hitOnDragEnabled = true;

const ACCENT = '#f7b696';
const coarsePointer =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

type Props = {
  size: number;
  photo: LoadedPhoto;
  scene: Scene;
  selected: string | null;
  onSelect: (uid: string | null) => void;
  onCommit: (action: SceneAction) => void;
  stageRef: RefObject<Konva.Stage | null>;
};

type Pinch = { dist: number; angle: number; center: { x: number; y: number } } | null;

const touchPoint = (stage: Konva.Stage, t: Touch) => {
  const rect = stage.container().getBoundingClientRect();
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
};

function StickerNode({
  sticker,
  size,
  onSelect,
  onCommit,
  onLoaded,
}: {
  sticker: StickerInstance;
  size: number;
  onSelect: (uid: string) => void;
  onCommit: (action: SceneAction) => void;
  onLoaded: () => void;
}) {
  const image = useImage(assets.get(sticker.ref)?.src);
  useEffect(() => {
    if (image) onLoaded();
  }, [image, onLoaded]);
  if (!image) return null;
  const width = size;
  const height = (size * image.naturalHeight) / image.naturalWidth;

  const commitFromNode = (node: Konva.Node) =>
    onCommit({
      type: 'updateSticker',
      uid: sticker.uid,
      patch: {
        x: node.x() / size,
        y: node.y() / size,
        scale: Math.abs(node.scaleY()),
        rotation: node.rotation(),
      },
    });

  return (
    <KonvaImage
      id={sticker.uid}
      name="sticker"
      image={image}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      x={sticker.x * size}
      y={sticker.y * size}
      scaleX={sticker.scale * (sticker.flipX ? -1 : 1)}
      scaleY={sticker.scale}
      rotation={sticker.rotation}
      draggable
      onMouseDown={() => onSelect(sticker.uid)}
      onTouchStart={() => onSelect(sticker.uid)}
      onDragEnd={(e) => commitFromNode(e.target)}
      onTransformEnd={(e) => commitFromNode(e.target)}
    />
  );
}

function FrameNode({ frameKey, size }: { frameKey: string; size: number }) {
  const image = useImage(assets.get(frameKey)?.src);
  if (!image) return null;
  return <KonvaImage image={image} width={size} height={size} listening={false} />;
}

export function AvatarStage({ size, photo, scene, selected, onSelect, onCommit, stageRef }: Props) {
  const photoRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const pinch = useRef<Pinch>(null);
  const pinchTarget = useRef<Konva.Node | null>(null);
  const wheelTimer = useRef<number | undefined>(undefined);

  const backdrop = useMemo(() => blurredBackdrop(photo), [photo]);

  // Cover-fit: at scale 1 the photo's short side fills the canvas.
  const cover = size / Math.min(photo.width, photo.height);
  const photoW = photo.width * cover;
  const photoH = photo.height * cover;

  // Sticker images load asynchronously, so the selected node may appear after this component
  // renders. Stickers call this when they are ready; it is also run after every render.
  const attachTransformer = useCallback(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = selected ? stage.findOne(`#${selected}`) : undefined;
    if (node !== tr.nodes()[0]) tr.nodes(node ? [node] : []);
  }, [selected, stageRef]);
  useEffect(attachTransformer);

  /** The node a pinch or wheel acts on: the selected sticker, otherwise the photo. */
  const gestureTarget = (): Konva.Node | null =>
    (selected && stageRef.current?.findOne(`#${selected}`)) || photoRef.current;

  const commitNode = (node: Konva.Node) => {
    const patch = {
      x: node.x() / size,
      y: node.y() / size,
      scale: Math.abs(node.scaleY()),
      rotation: node.rotation(),
    };
    if (node === photoRef.current) onCommit({ type: 'updatePhoto', patch });
    else onCommit({ type: 'updateSticker', uid: node.id(), patch });
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const [t1, t2] = [e.evt.touches[0], e.evt.touches[1]];
    const stage = e.target.getStage();
    if (!t1 || !t2 || !stage) return;
    e.evt.preventDefault();

    const target = pinchTarget.current ?? gestureTarget();
    if (!target) return;
    if (!pinchTarget.current) {
      pinchTarget.current = target;
      stage.find('*').forEach((n) => n.isDragging() && n.stopDrag());
    }

    const p1 = touchPoint(stage, t1);
    const p2 = touchPoint(stage, t2);
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    const last = pinch.current;
    pinch.current = { dist, angle, center };
    if (!last) return;

    const ratio = dist / last.dist;
    const signX = Math.sign(target.scaleX()) || 1;
    const nextScale = Math.abs(target.scaleY()) * ratio;
    target.scaleX(signX * nextScale);
    target.scaleY(nextScale);
    target.rotation(target.rotation() + (angle - last.angle));
    target.x(target.x() + center.x - last.center.x);
    target.y(target.y() + center.y - last.center.y);
    transformerRef.current?.forceUpdate();
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length >= 2) return;
    if (pinchTarget.current) commitNode(pinchTarget.current);
    pinch.current = null;
    pinchTarget.current = null;
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const target = gestureTarget();
    if (!target) return;
    const factor = e.evt.deltaY < 0 ? 1.06 : 1 / 1.06;
    const signX = Math.sign(target.scaleX()) || 1;
    const next = Math.abs(target.scaleY()) * factor;
    target.scaleX(signX * next);
    target.scaleY(next);
    transformerRef.current?.forceUpdate();
    window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(() => commitNode(target), 200);
  };

  const deselectOnEmpty = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target === photoRef.current) onSelect(null);
  };

  return (
    <Stage
      ref={stageRef}
      width={size}
      height={size}
      onMouseDown={deselectOnEmpty}
      onTouchStart={deselectOnEmpty}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <Layer>
        {scene.background.kind === 'blur' && (
          <KonvaImage image={backdrop} width={size} height={size} listening={false} />
        )}
        {scene.background.kind === 'color' && (
          <Rect width={size} height={size} fill={scene.background.color} listening={false} />
        )}
        <KonvaImage
          ref={photoRef}
          image={photo.canvas}
          width={photoW}
          height={photoH}
          offsetX={photoW / 2}
          offsetY={photoH / 2}
          x={scene.photo.x * size}
          y={scene.photo.y * size}
          scaleX={scene.photo.scale}
          scaleY={scene.photo.scale}
          rotation={scene.photo.rotation}
          draggable
          onDragEnd={(e) => commitNode(e.target)}
        />
        {scene.frame && <FrameNode frameKey={scene.frame} size={size} />}
        {scene.stickers.map((s) => (
          <StickerNode
            key={s.uid}
            sticker={s}
            size={size}
            onSelect={onSelect}
            onCommit={onCommit}
            onLoaded={attachTransformer}
          />
        ))}

        {/* Editing aids: dim what Discord crops away, outline the circle. */}
        <Shape
          name={HELPER}
          listening={false}
          fill="rgba(12, 11, 15, 0.6)"
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.rect(0, 0, size, size);
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
        />
        <Circle
          name={HELPER}
          listening={false}
          x={size / 2}
          y={size / 2}
          radius={size / 2 - 0.5}
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth={1}
        />
        <Transformer
          ref={transformerRef}
          name={HELPER}
          rotateEnabled
          keepRatio
          flipEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={coarsePointer ? 22 : 12}
          anchorCornerRadius={11}
          anchorStroke={ACCENT}
          anchorStrokeWidth={2}
          anchorFill="#f6f1ea"
          borderStroke={ACCENT}
          borderDash={[6, 4]}
          rotateAnchorOffset={coarsePointer ? 34 : 26}
          padding={6}
          boundBoxFunc={(oldBox, newBox) =>
            Math.abs(newBox.width) < size * 0.06 ? oldBox : newBox
          }
        />
      </Layer>
    </Stage>
  );
}
