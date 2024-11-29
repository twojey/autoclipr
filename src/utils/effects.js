import { interpolate, spring } from 'remotion';

export const TRANSITIONS = {
  FADE: 'fade',
  SLIDE: 'slide',
  ZOOM: 'zoom',
  NONE: 'none'
};

export const EFFECTS = {
  BLUR: 'blur',
  GRAYSCALE: 'grayscale',
  SEPIA: 'sepia',
  BRIGHTNESS: 'brightness',
  NONE: 'none'
};

export const applyEffect = (effect, intensity = 1) => {
  switch (effect) {
    case EFFECTS.BLUR:
      return { filter: `blur(${intensity * 5}px)` };
    case EFFECTS.GRAYSCALE:
      return { filter: `grayscale(${intensity})` };
    case EFFECTS.SEPIA:
      return { filter: `sepia(${intensity})` };
    case EFFECTS.BRIGHTNESS:
      return { filter: `brightness(${1 + intensity})` };
    default:
      return {};
  }
};

export const applyTransition = (transition, frame, fps) => {
  const progress = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  switch (transition) {
    case TRANSITIONS.FADE:
      return { opacity: progress };
    case TRANSITIONS.SLIDE:
      return { transform: `translateX(${interpolate(progress, [0, 1], [-100, 0])}%)` };
    case TRANSITIONS.ZOOM:
      return { transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})` };
    default:
      return {};
  }
};
