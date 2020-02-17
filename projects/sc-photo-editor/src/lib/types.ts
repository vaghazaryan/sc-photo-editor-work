export type Mode = 'crop' | 'blur';
export type MimeType = 'jpg' | 'png' | 'gif';
export type Orientation = 'landscape' | 'portrait' | 'square';

export interface Position {
  top: number;
  left: number;
}

export interface ComputedStyle extends Position {
  width: number;
  height: number;
}

export interface CircleComputedStyle extends Position {
  radius: number;
  scaleX: number;
  scaleY: number;
}
