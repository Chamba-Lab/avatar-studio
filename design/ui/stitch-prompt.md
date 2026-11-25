# UI prompt (Stitch or similar)

Attach `home/brand/discord/avatar-christmas-1024.png` (mascot and illustration style reference).
Avatar Studio has its own palette; it does not reuse the chambalab.org colors.

```
Design a mobile-first web app called "Avatar Studio" (a small product by the Chamba Lab tech community). People upload a profile photo, decorate it with a frame and stickers, and save it for Discord. It must feel like a playful, premium creative tool with personality, in the spirit of Arc, Linear or Apple Clips, not a generic template. Minimal text, icon-driven, everything sized for thumbs.

Screens (iPhone, 390x844):
1. Start: a bold headline ("Dress up your avatar.") with a hand-drawn underline on "avatar", a fan of three floating cards showing decorated example avatars (Christmas wreath, string lights, a "LAB" ring), small stickers drifting around them. Primary action "Choose a photo" (large pill with an arrow), secondary round camera button. Privacy note with a small mint dot: "Your photo never leaves your device".
2. Editor: the avatar is the hero, as large as possible, shown in a circle like Discord, on a subtle dotted grid with a soft warm glow behind it; the square export area is a faint dashed outline. A floating chip at the bottom-left shows the avatar at chat size. Header: close, undo/reset, and a prominent "Save" button. A selected sticker shows marching-ants dashed bounds and round corner handles; under the canvas, a floating action pill appears (flip, rotate, bigger, duplicate, delete, done). Bottom sheet with a grab handle, a segmented control with a sliding indicator (Photo / Frame / Stickers), theme chips with colored dots (Christmas, Chamba Lab, "More soon" dashed), and a 4-column grid of sticker tiles.
3. Save: the final avatar large with a slowly rotating dotted ring around it, falling confetti, headline "Looking festive.", a chat-message mock using the avatar, primary "Share or save", secondary "Download" and "Start over".

Visual direction: dark, warm-neutral UI so the photo's colors stand out. Background #121016, surfaces #1C1922 and #27232F, hairlines at 8% white, text #F6F1EA, secondary text #A59FB0. One accent: tangerine #FF7A3D (text on it #1B0B02). Mint #7CE0C3 only for small positive signals. Fonts: Bricolage Grotesque (headings, tight tracking) and Inter (UI). Large radii (18 to 30 px), tactile buttons, soft depth, no gradients behind content. Stickers and frames are bold-outline flat illustrations like the attached mascot (a fluffy black-and-white raccoon called Rakim).

Motion (annotate on the design): sticker tiles stagger in when the sheet opens; tapping a tile pops the sticker onto the avatar with a spring; the segmented indicator slides with a slight overshoot; the frame scales in when chosen; selection bounds animate (marching ants); buttons compress on press; on Save, the avatar lands with a bounce and confetti falls. Respect reduced motion.

Accessibility: 44 px minimum touch targets, 4.5:1 text contrast, a label on every icon button.
```

Stitch generates static screens: motion is implemented in code, the annotations make the design
account for it.
