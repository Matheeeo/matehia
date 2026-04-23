export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeOutCubic = (t: number): number =>
  1 - Math.pow(1 - t, 3);

export const easeOutQuart = (t: number): number =>
  1 - Math.pow(1 - t, 4);

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeInExpo = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * t - 10);
