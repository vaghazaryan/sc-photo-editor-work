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

export interface ICircleScaleProps extends ComputedStyle {
  scaleX: number;
  scaleY: number;
}

export enum IRotateOption {
  Left = 'LEFT',
  Right = 'RIGHT',
  MHorizontal = 'M_HORIZONTAL',
  MVertical = 'M_VERTICAL',
}

export enum ScPhotoEditorEventType {
  Crop = 'CROP',
  Blur = 'BLUR',
  Rotate = 'ROTATE',
  Scale = 'SCALE'
}

export interface IScPhotoEditorEvent {
  type: ScPhotoEditorEventType;
  source: string;
  scaleLevel?: number;
}

export interface IScPhotoCropper {
  rotate(options: IRotateOption): void;
  setScaleLevel(scaleLevel: number): void;
}

export interface IScPhotoBlur {
  applyBlur(): void;
  cancelBlur(): void;
}

export interface IScPhotoEditor extends IScPhotoCropper, IScPhotoBlur {}
