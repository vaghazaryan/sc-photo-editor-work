import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';

import { HelpersService } from './helpers';

import {
  ComputedStyle,
  ICircleScaleProps,
  IRotateOption,
  IScPhotoEditor,
  IScPhotoEditorEvent,
  Mode,
  Orientation,
  ScPhotoEditorEventType
} from './types';
import {ScPhotoEditorService} from './sc-photo-editor.service';
import {take, takeUntil, tap} from 'rxjs/operators';
import {IDataURLOptions} from 'fabric/fabric-impl';

export const Default_Export_Format = 'jpeg';
export const FCircleInitialOpts: Partial<fabric.ICircleOptions> = {
  top: 2,
  left: 2,
  scaleX: 1,
  scaleY: 1,
  radius: 50,
  fill: '#ffffff',
  opacity: 0.4,
  transparentCorners: false,
  hasBorders: true,
  cornerColor: 'white',
  cornerSize: 4,
  cacheProperties: [],
  absolutePositioned: true,
};

@Component({
  selector: 'sc-photo-editor',
  templateUrl: 'sc-photo-editor.component.html',
  styles: [],
  providers: [ HelpersService ]
})
export class ScPhotoEditorComponent implements IScPhotoEditor, AfterViewInit, OnChanges, OnDestroy {

  private _destroyed$ = new Subject();

  private _mode$: ReplaySubject<Mode> = new ReplaySubject<Mode>(1);
  private _source$: ReplaySubject<fabric.Image> = new ReplaySubject<fabric.Image>(1);

  private mode$ = this._mode$.asObservable();
  private source$ = this._source$.asObservable();

  @Input() editorWidth: number;

  @Input() exportWidth: number;

  @Input() aspectRatio: number;

  @Input() blurLevel = 50;

  @Input() source: string;

  @Input() mode: Mode;

  @Output() changed: EventEmitter<IScPhotoEditorEvent> = new EventEmitter();

  @Output() initialized: EventEmitter<null> = new EventEmitter();

  @Output() sourceLoaded: EventEmitter<null> = new EventEmitter();

  private PI2 = Math.PI * 2;

  private canvas: fabric.Canvas;

  private canvasSource: fabric.Image;

  private computedStyle: ComputedStyle;

  private rotationAngleIndex = 0;
  /// store angles (0, 90, 180, 270) in an array
  private angles = [0, 0.5 * Math.PI, Math.PI, 1.5 * Math.PI];

  private fCircle: fabric.Circle;

  private fCircleOpts: Partial<fabric.ICircleOptions> = FCircleInitialOpts;

  private fExportDefaultOpts: IDataURLOptions = {
    quality: 1,
    format: Default_Export_Format
  }

  private originalSource;

  private previewCanvas;

  private circleScalingProperties: ICircleScaleProps = {
    height: 0,
    width: 0,
    scaleY: 0,
    scaleX: 0,
    left: 0,
    top: 0
  };

  minScaleLevel = 0;

  maxScaleLevel = 1;

  scaleLevel: number;


  constructor(private helpers: HelpersService,
              private editorService: ScPhotoEditorService) { }

  ngAfterViewInit(): void {
    this.initWorkspace();
    this.initListeners();
    this.initialized.emit();

    combineLatest(
      this.mode$,
      this.source$
    ).subscribe(([mode]) => this.switchToMode(mode));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'] && changes['source'].currentValue) {
      this.setSource(this.source, () => {
        this.sourceLoaded.emit();
      });
    }

    if (changes['mode'] && changes['mode'].currentValue) {
      this.setMode(this.mode);
    }
  }

  initWorkspace() {
    this.canvas = new fabric.Canvas('sc-canvas');
    this.setWorkSpaceSizeForCropper();
    this.canvas.on('mouse:down', (e) => {
      if (this.fCircle) {
        this.canvas.setActiveObject(this.fCircle);
      }
    });
  }

  initListeners() {
    this.editorService.applyBlur$.pipe(
      takeUntil(this._destroyed$),
      tap(e => this.applyBlur())
    ).subscribe();

    this.editorService.rotation$.pipe(
      takeUntil(this._destroyed$),
      tap(e => this.rotate(e))
    ).subscribe();
  }

  setWorkSpaceSizeForCropper() {
    this.canvas.setWidth(this.editorWidth);
    this.canvas.setHeight(this.editorWidth / this.aspectRatio);
  }

  setWorkSpaceSizeForBlur() {
    this.canvasSource.left = 0;
    this.canvasSource.top = 0;
    this.canvas.setWidth(this.canvasSource.width * this.scaleLevel);
    this.canvas.setHeight(this.canvasSource.height * this.scaleLevel);
  }

  private setSource(source, callback = null) {
    fabric.Image.fromURL(source, (fImg) => {
      this.source = source;
      this.canvasSource = fImg;
      this.originalSource = fImg.getElement();
      this.prepareCanvasImage(fImg);
      this.centeringSource();
      this._source$.next(fImg);

      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  private setMode(mode: Mode): void {
    this._mode$.next(mode);
  }

  private switchToMode(mode: Mode): void {
    switch (mode) {
      case 'crop': {
        this.setWorkSpaceSizeForCropper();
        this.resetBlurWorkspace();
        this.initCropper();
        break;
      }
      case 'blur': {
        this.setWorkSpaceSizeForBlur();
        this.initBlur();
        break;
      }
    }
  }

  private centeringSource(): void {
    this.canvasSource.center();
  }

  private prepareCanvasImage(fImage: fabric.Image) {
    fImage.set({
      width: this.originalSource.width,
      height: this.originalSource.height,
      centeredRotation: true,
      selectable: false
    });

    this.disableImageCorners(fImage);
    this.scaleLevel
      = this.minScaleLevel
      = this.getMinScaleLevel(fImage);


    fImage.scale(this.scaleLevel);

    this.canvas.add(fImage);
    this.canvas.renderAll();
  }

  private getOrientation(w, h): Orientation {

    if (w > h) { return 'landscape'; }

    if (h > w) { return 'portrait'; }

    if (w === h) { return 'square'; }

  }

  private disableImageCorners(fImage: fabric.Image) {
    fImage.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
      bl: false,
      br: false,
      mtr: false,
      tl: false,
      tr: false
    });
  }

  private getMinScaleLevel(fImage: fabric.Image): number {
    let canvasOrientation: Orientation,
        imageOrientation: Orientation;

    canvasOrientation = this.getOrientation(this.canvas.getWidth(), this.canvas.getHeight());
    imageOrientation = this.getOrientation(fImage.width, fImage.height);

    const xScale = this.canvas.getWidth() / fImage.width;
    const yScale = this.canvas.getHeight() / fImage.height;

    if (
      (canvasOrientation === 'portrait' && imageOrientation === 'landscape') ||
      (canvasOrientation === 'landscape' && imageOrientation === 'portrait') ||
      (canvasOrientation === 'portrait' && imageOrientation === 'square')
    ) {
      return yScale;

    } else {
      return xScale < yScale ? yScale : xScale;
    }
  }

  private sourceMoveListener(e) {
    const elem = e.target;
    if (elem.left >= 0) {
      elem.left = 0;
    } else {
      if ((Math.abs(elem.left) + elem.canvas.width) / elem.scaleX  > this.originalSource.width) {
        elem.left = -((this.originalSource.width * elem.scaleX) - elem.canvas.width);
      }
    }

    if (elem.top >= 0) {
      elem.top = 0;
    } else {
      if ((Math.abs(elem.top) + elem.canvas.height) / elem.scaleY  > this.originalSource.height) {
        elem.top = -((this.originalSource.height * elem.scaleY) - elem.canvas.height);
      }
    }
  }

  private sourceMoveEndListener(e) {
    this.updatePreviewCanvas(e.target, this.getComputedStyle());
    this.changed.emit(new ScPhotoEditorEvent({
      type: ScPhotoEditorEventType.Crop,
      scaleLevel: this.scaleLevel,
      source: this.previewCanvas.toDataURL(this.fExportDefaultOpts)
    }));
  }

  private preparePreviewCanvas() {
    if (!this.previewCanvas) {
      this.previewCanvas = HelpersService.createCanvasElement();
      this.previewCanvas.width = this.exportWidth ? this.exportWidth : this.computedStyle.width;
      this.previewCanvas.height = this.exportWidth ? this.exportWidth / this.aspectRatio : this.computedStyle.height;

      const ctx = this.previewCanvas.getContext('2d');
      ctx.drawImage(this.originalSource, 0, 0);
    }
  }

  private resetPreviewCanvas() {
    this.previewCanvas = null;
    this.preparePreviewCanvas();
  }

  private updatePreviewCanvas(fImage: fabric.Image, computedStyle: ComputedStyle) {
    let ctx: CanvasRenderingContext2D;
    ctx = this.previewCanvas.getContext('2d');
    ctx.drawImage(
      this.originalSource,
      computedStyle.left,
      computedStyle.top,
      computedStyle.width,
      computedStyle.height,
      0,
      0,
      this.previewCanvas.width,
      this.previewCanvas.height);
  }

  private getComputedStyle (): ComputedStyle {
    return  {
      left: Math.round(Math.abs(this.canvasSource.left) / this.scaleLevel),
      top: Math.round(Math.abs(this.canvasSource.top) / this.scaleLevel),
      width: Math.round(this.canvas.getWidth() / this.scaleLevel),
      height: Math.round(this.canvas.getHeight() / this.scaleLevel),
    };
  }

  private resetCropWorkspace() {
    this.canvas.remove(this.canvasSource);
    this.canvasSource = null;
  }

  private resetBlurWorkspace() {
    this.canvas.remove(this.fCircle);
    this.fCircle = null;
  }

  private rotateImage(img, index, angles) {
    const canvas = HelpersService.createCanvasElement('rotationCanvas');
    const ctx = canvas.getContext('2d');

    /// use index to set canvas size
    switch (index) {
      case 0:
      case 2:
        /// for 0 and 180 degrees size = image
        canvas.width = img.width;
        canvas.height = img.height;
        break;
      case 1:
      case 3:
        /// for 90 and 270 canvas width = img height etc.
        canvas.width = img.height;
        canvas.height = img.width;
        break;
    }

    /// get stored angle and center of canvas
    const angle = angles[index];
    const cw = canvas.width * 0.5;
    const ch = canvas.height * 0.5;

    /// rotate context
    ctx.translate(cw, ch);
    ctx.rotate(angle);
    ctx.translate(-img.width * 0.5, -img.height * 0.5);

    /// draw image and reset transform
    ctx.drawImage(img, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL('image/jpg', 1);
  }

  private processBlur(callback = null) {
    if (this.mode !== 'blur' && !this.fCircle) {
      return;
    }
    let fCanvas;
    const canvas = HelpersService.createCanvasElement('blur_canvas');
    fCanvas = new fabric.Canvas(canvas);
    fCanvas.setWidth(this.originalSource.width);
    fCanvas.setHeight(this.originalSource.height);

    fabric.Image.fromURL(this.source, (fImg) => {
      let backgroundImage, blurredPartImage;
      backgroundImage = fImg;
      backgroundImage.set({
        selectable: false
      });

      fImg.clone(clonedImage => {
        blurredPartImage = clonedImage;
        fCanvas.add(backgroundImage);
        blurredPartImage.set({
          selectable: false,
          clipTo: (ctx) => this.setContextBlur(ctx, backgroundImage.width, backgroundImage.height)
        });

        const filter = new fabric.Image.filters['Blur']({
          blur: this.blurLevel / 100
        });

        blurredPartImage.filters.push(filter);
        blurredPartImage.applyFilters();
        fCanvas.add(blurredPartImage);
        const source = fCanvas.toDataURL(this.fExportDefaultOpts);
        this.setSource(source);
        if (callback && typeof callback === 'function') {
          callback(source);
        }
      });

      fCanvas.renderAll();
    });
  }

  private initCropper() {
    this.canvasSource.selectable = true;
    this.canvasSource.on('moving', e => this.sourceMoveListener(e));
    this.canvasSource.on('moved', e => this.sourceMoveEndListener(e));

    this.computedStyle = this.getComputedStyle();
    this.preparePreviewCanvas();
  }

  private initBlur() {
    this.canvasSource.selectable = false;
    if (this.fCircle) {
      return;
    }

    this.fCircle = new fabric.Circle(this.fCircleOpts);
    this.fCircle.setControlVisible('mtr', false);

    // if (this.isExplorer) {
    //   this.circle.setControlVisible('mt', false);
    //   this.circle.setControlVisible('mb', false);
    //   this.circle.setControlVisible('ml', false);
    //   this.circle.setControlVisible('mr', false);
    // }

    // this.circle.top = this.circlePosition.top || this.configs.circleOptions.top;
    // this.circle.left = this.circlePosition.left || this.configs.circleOptions.left;
    // this.circle.scaleX = this.circlePosition.scaleX || 1;
    // this.circle.scaleY = this.circlePosition.scaleY || 1;
    // this.circle.radius = 50;

    this.canvas.add(this.fCircle);
    this.fCircle.center();
    this.canvas.setActiveObject(this.fCircle);
    this.canvas.renderAll();

    this.fCircle.on('moving', (e) => this.fCircleMovingListener(e));
    this.fCircle.on('scaling', (e) => this.fCircleScalingListener(e));
  }

  private fCircleMovingListener(event) {
    const circle = event.target;
    const boundingRect = circle.getBoundingRect();

    if (
      circle.currentHeight > circle.canvas.height ||
      circle.currentWidth > circle.canvas.width) {
      return;
    }

    circle.setCoords();

    if (boundingRect.left < 0 ) {
      circle.left = 0;
    }

    if (boundingRect.top < 0) {
      circle.top = 0;
    }

    if (boundingRect.top + boundingRect.height  > circle.canvas.height) {
      circle.top = circle.canvas.height - boundingRect.height;
    }

    if (boundingRect.left + boundingRect.width  > circle.canvas.width ) {
      circle.left = circle.canvas.width - boundingRect.width;
    }
  }

  private fCircleScalingListener(event) {
    const  obj = event.target;
    obj.setCoords();
    const brNew = obj.getBoundingRect();

    if (
      ((brNew.width + brNew.left) >= obj.canvas.width) ||
      ((brNew.height + brNew.top) >= obj.canvas.height) ||
      ((brNew.left < 0) || (brNew.top < 0))) {
        obj.left = this.circleScalingProperties.left;
        obj.top = this.circleScalingProperties.top;
        obj.scaleX = this.circleScalingProperties.scaleX;
        obj.scaleY = this.circleScalingProperties.scaleY;
        obj.width = this.circleScalingProperties.width;
        obj.height = this.circleScalingProperties.height;
    } else {
      this.circleScalingProperties.left = obj.left;
      this.circleScalingProperties.top = obj.top;
      this.circleScalingProperties.scaleX = obj.scaleX;
      this.circleScalingProperties.scaleY = obj.scaleY;
      this.circleScalingProperties.width = obj.width;
      this.circleScalingProperties.height = obj.height;
    }
  }

  private setContextBlur(ctx, w, h) {
    let canvasSource, csL, csT, csScale;
    let blurCircleSource, bcsL, bcsW, bcsH, bcsT, bcsScaleX, bcsScaleY;

    canvasSource = this.canvasSource;
    csL = canvasSource.left;
    csT = canvasSource.top;
    csScale = canvasSource.scaleX;

    blurCircleSource = this.fCircle;
    bcsL = blurCircleSource.left;
    bcsT = blurCircleSource.top;

    bcsW = blurCircleSource['width'];
    bcsH = blurCircleSource['height'];
    bcsScaleX = blurCircleSource.scaleX;
    bcsScaleY = blurCircleSource.scaleY;

    // Circle
    if (bcsScaleX === bcsScaleY) {
      let x, y, radius;
      radius =  blurCircleSource.radius / csScale * bcsScaleX;

      x = ((w / 2) - w) - (csL / csScale) + (bcsL / csScale) + radius;
      y = ((h / 2) - h) - (csT / csScale) + (bcsT / csScale) + radius;

      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    } else {

      let x1, x2, y1, y2, radiusX, radiusY;
      radiusX =  blurCircleSource.radius / csScale * bcsScaleX;
      radiusY =  blurCircleSource.radius / csScale * bcsScaleY;

      x1 = ((w / 2) - w) - (csL / csScale) + (bcsL / csScale) + radiusX;
      y1 = ((h / 2) - h) - (csT / csScale) + (bcsT / csScale) + radiusY;
      x2 = bcsW * bcsScaleX;
      y2 = bcsH * bcsScaleY;

      ctx.ellipse(x1, y1,  x2, y2, blurCircleSource.angle * Math.PI / 180, 0, this.PI2);
    }
  }

  applyBlur() {
    if (this.mode === 'blur') {
      this.processBlur((source) => {
        this.changed.emit(new ScPhotoEditorEvent({
          type: ScPhotoEditorEventType.Blur,
          source
        }));
      });
    }
  }

  cancelBlur() {

  }

  rotate(option: IRotateOption) {
    if (this.mode === 'crop') {
      switch (option) {
        case IRotateOption.Left: {
          this.rotationAngleIndex = this.angles.length - 1;
          break;
        }
        case IRotateOption.Right: {
          this.rotationAngleIndex = 1;
          break;
        }
      }

      this.resetCropWorkspace();
      const rotatedSource = this.rotateImage(this.originalSource, this.rotationAngleIndex, this.angles);
      this.setSource(rotatedSource);
      this.changed.emit(new ScPhotoEditorEvent({
        type: ScPhotoEditorEventType.Rotate,
        source: rotatedSource
      }));
    }
  }

  setScaleLevel(scale: number) {
    if (this.mode === 'crop') {
      let scaleLevel;
      scaleLevel = scale > this.maxScaleLevel ? this.maxScaleLevel : scale;
      scaleLevel = scale < this.minScaleLevel ? this.minScaleLevel : scale;

      this.scaleLevel = scaleLevel;
      this.canvasSource.scale(scaleLevel);
      this.centeringSource();
      this.computedStyle = this.getComputedStyle();
      this.canvas.renderAll();

      this.updatePreviewCanvas(this.canvasSource, this.computedStyle);
      this.changed.emit(new ScPhotoEditorEvent({
        type: ScPhotoEditorEventType.Scale,
        source: this.previewCanvas.toDataURL(this.fExportDefaultOpts),
        scaleLevel: this.scaleLevel
      }));
    }
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }
}

class ScPhotoEditorEvent implements IScPhotoEditorEvent {
  source: string;
  type: ScPhotoEditorEventType;
  scaleLevel: number;

  constructor(options: IScPhotoEditorEvent) {
    this.type = options.type;
    this.source = options.source;
    this.scaleLevel = options.scaleLevel || 0;
  }
}
