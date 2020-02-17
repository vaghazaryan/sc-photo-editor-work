import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';

import { HelpersService } from './helpers';

import {
  Mode,
  Position,
  MimeType,
  Orientation,
  ComputedStyle,
  CircleComputedStyle
} from './types';
import {stackBlurCanvasRGB} from './addons';

export const FCircleInitialOpts: Partial<fabric.ICircleOptions> = {
  top: 2,
  left: 2,
  scaleX: 1,
  scaleY: 1,
  radius: 50
};

@Component({
  selector: 'sc-photo-editor',
  templateUrl: 'sc-photo-editor.component.html',
  styles: [],
  providers: [ HelpersService ]
})
export class ScPhotoEditorComponent implements AfterViewInit, OnChanges {

  private _mode$: ReplaySubject<Mode> = new ReplaySubject<Mode>(1);
  private _source$: ReplaySubject<fabric.Image> = new ReplaySubject<fabric.Image>(1);

  private mode$ = this._mode$.asObservable();
  private source$ = this._source$.asObservable();

  @Input() editorWidth: number;

  @Input() exportWidth: number;

  @Input() aspectRatio: number;

  @Input() blurLevel: number = 50;

  @Input() source: string;

  @Input() mode: Mode;

  @Output() changed = new EventEmitter();

  PI2 = Math.PI * 2;

  minScaleLevel = 0;
  maxScaleLevel = 1;

  canvas: fabric.Canvas;
  currentScaleLevel: number;
  canvasSource: fabric.Image;
  computedStyle: ComputedStyle;

  fCircle: fabric.Circle;
  fCircleOpts: Partial<fabric.ICircleOptions> = FCircleInitialOpts;

  private originalSource;
  private previewCanvas;

  constructor(private helpers: HelpersService) { }

  ngAfterViewInit(): void {
    this.initWorkspace();

    // setTimeout(() => {
    //   this.setMode('blur');
    // }, 3000);

    combineLatest(
      this.mode$,
      this.source$
    ).subscribe(([mode]) => this.switchToMode(mode));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'] && changes['source'].currentValue) {
      this.setSource(this.source);
    }

    if (changes['mode'] && changes['mode'].currentValue) {
      this.setMode(this.mode);
    }
  }

  initWorkspace() {
    this.canvas = new fabric.Canvas('sc-canvas');
    this.canvas.setWidth(this.editorWidth);
    this.canvas.setHeight(this.editorWidth / this.aspectRatio);
  }

  setSource(source) {
    fabric.Image.fromURL(source, (fImg) => {
      this.source = source;
      this.canvasSource = fImg;
      this.originalSource = fImg.getElement();
      this.prepareCanvasImage(fImg);
      this._source$.next(fImg);
    });
  }

  setMode(mode: Mode): void {
    this._mode$.next(mode);
  }

  switchToMode(mode: Mode): void {
    switch (mode) {
      case 'crop': {
        this.initCropper();
        break;
      }
      case 'blur': {
        this.initBlur();
        break;
      }
    }
  }

  private prepareCanvasImage(fImage: fabric.Image) {
    fImage.set({
      originX: 'left',
      originY: 'top',
      width: this.originalSource.width,
      height: this.originalSource.height,
      selectable: false
    });

    this.disableImageCorners(fImage);
    this.currentScaleLevel
      = this.minScaleLevel
      = this.getMinScaleLevel(fImage);

    fImage.scale(this.currentScaleLevel);

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

    if (
      (canvasOrientation === 'portrait' && imageOrientation === 'landscape') ||
      (canvasOrientation === 'landscape' && imageOrientation === 'portrait') ||
      (canvasOrientation === 'portrait' && imageOrientation === 'square')
    ) {
      return this.canvas.getHeight() / fImage.height;

    } else {
      return this.canvas.getWidth() / fImage.width;
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
    this.changed.next(this.previewCanvas.toDataURL('png'));
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
      left: Math.round(Math.abs(this.canvasSource.left) / this.currentScaleLevel),
      top: Math.round(Math.abs(this.canvasSource.top) / this.currentScaleLevel),
      width: Math.round(this.canvas.getWidth() / this.currentScaleLevel),
      height: Math.round(this.canvas.getHeight() / this.currentScaleLevel),
    };
  }

  private getPixelRatio(): number {
    return fabric['window'].devicePixelRatio || fabric['window'].webkitDevicePixelRatio;
  }

  setScale(scale: number) {
    const sc = scale > 1 ? 1 : scale;
    this.currentScaleLevel = sc;
    this.canvasSource.scale(sc);
    this.computedStyle = this.getComputedStyle();
    this.resetPreviewCanvas();
    this.canvas.renderAll();
  }

  initCropper() {
    this.canvasSource.selectable = true;
    this.canvasSource.on('moving', e => this.sourceMoveListener(e));
    this.canvasSource.on('moved', e => this.sourceMoveEndListener(e));

    this.computedStyle = this.getComputedStyle();
    this.preparePreviewCanvas();
  }

  initBlur() {
    this.canvasSource.selectable = false;
    if (this.fCircle) {
      return;
    }

    this.fCircle = new fabric.Circle(this.fCircleOpts);
    this.fCircle.setControlVisible('mtr', false);
    this.fCircle.set({
      absolutePositioned: true
    })

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
    this.canvas.setActiveObject(this.fCircle);
    this.fCircle.on('modified', this.fCircleMoveEndListener);
  }

  fCircleMoveEndListener(event) {
    console.log(event);
  }

  public processBlur() {
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

        const filter = new fabric.Image.filters['Pixelate']({
          // blur: this.blurLevel / 100
          blocksize: 15
        });
        blurredPartImage.filters.push(filter);
        blurredPartImage.applyFilters();
        fCanvas.add(blurredPartImage);
        this.setSource(fCanvas.toDataURL('png'));
      });
      fCanvas.renderAll();
    });
  }

  setContextBlur(ctx, w, h) {
    let canvasSource, csL, csT, csScale;
    let blurCircleSource, bcsL, bcsW, bcsH, bcsT, bcsScale;

    canvasSource = this.canvasSource;
    csL = canvasSource.left;
    csT = canvasSource.top;
    csScale = canvasSource.scaleX;

    blurCircleSource = this.fCircle;
    bcsL = blurCircleSource.left;
    bcsT = blurCircleSource.top;

    bcsW = blurCircleSource['width'];
    bcsH = blurCircleSource['height'];
    bcsScale = blurCircleSource.scaleX;

    let x, y, radius;
    radius =  blurCircleSource.radius / csScale * bcsScale;

    x = ((w / 2) - w) - (csL / csScale) + (bcsL / csScale) + radius;
    y = ((h / 2) - h) - (csT / csScale) + (bcsT / csScale) + radius;

    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  }
}
