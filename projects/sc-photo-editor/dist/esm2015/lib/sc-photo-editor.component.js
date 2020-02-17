/**
 * @fileoverview added by tsickle
 * Generated from: lib/sc-photo-editor.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest, ReplaySubject } from 'rxjs';
import { HelpersService } from './helpers';
export class ScPhotoEditorComponent {
    /**
     * @param {?} helpers
     */
    constructor(helpers) {
        this.helpers = helpers;
        this._mode$ = new ReplaySubject(1);
        this._source$ = new ReplaySubject(1);
        this.mode$ = this._mode$.asObservable();
        this.source$ = this._source$.asObservable();
        this.changed = new EventEmitter();
        this.minScaleLevel = 0;
        this.maxScaleLevel = 1;
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.initWorkspace();
        combineLatest(this.mode$, this.source$).subscribe((/**
         * @param {?} __0
         * @return {?}
         */
        ([mode]) => this.switchToMode(mode)));
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['source'] && changes['source'].currentValue) {
            this.setSource(this.source);
        }
        if (changes['mode'] && changes['mode'].currentValue) {
            this.setMode(this.mode);
        }
    }
    /**
     * @return {?}
     */
    initWorkspace() {
        this.canvas = new fabric.Canvas('sc-canvas');
        this.canvas.setWidth(this.editorWidth);
        this.canvas.setHeight(this.editorWidth / this.aspectRatio);
    }
    /**
     * @param {?} source
     * @return {?}
     */
    setSource(source) {
        fabric.Image.fromURL(source, (/**
         * @param {?} fImg
         * @return {?}
         */
        (fImg) => {
            this.canvasSource = fImg;
            this.originalSource = fImg.getElement();
            this.prepareCanvasImage(fImg);
            this._source$.next(fImg);
        }));
    }
    /**
     * @param {?} mode
     * @return {?}
     */
    setMode(mode) {
        this._mode$.next(mode);
    }
    /**
     * @param {?} mode
     * @return {?}
     */
    switchToMode(mode) {
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
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    prepareCanvasImage(fImage) {
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
    /**
     * @private
     * @param {?} w
     * @param {?} h
     * @return {?}
     */
    getOrientation(w, h) {
        if (w > h) {
            return 'landscape';
        }
        if (h > w) {
            return 'portrait';
        }
        if (w === h) {
            return 'square';
        }
    }
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    disableImageCorners(fImage) {
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
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    getMinScaleLevel(fImage) {
        /** @type {?} */
        let canvasOrientation;
        /** @type {?} */
        let imageOrientation;
        canvasOrientation = this.getOrientation(this.canvas.getWidth(), this.canvas.getHeight());
        imageOrientation = this.getOrientation(fImage.width, fImage.height);
        if ((canvasOrientation === 'portrait' && imageOrientation === 'landscape') ||
            (canvasOrientation === 'landscape' && imageOrientation === 'portrait') ||
            (canvasOrientation === 'portrait' && imageOrientation === 'square')) {
            return this.canvas.getHeight() / fImage.height;
        }
        else {
            return this.canvas.getWidth() / fImage.width;
        }
    }
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    sourceMoveListener(e) {
        /** @type {?} */
        const elem = e.target;
        if (elem.left >= 0) {
            elem.left = 0;
        }
        else {
            if ((Math.abs(elem.left) + elem.canvas.width) / elem.scaleX > this.originalSource.width) {
                elem.left = -((this.originalSource.width * elem.scaleX) - elem.canvas.width);
            }
        }
        if (elem.top >= 0) {
            elem.top = 0;
        }
        else {
            if ((Math.abs(elem.top) + elem.canvas.height) / elem.scaleY > this.originalSource.height) {
                elem.top = -((this.originalSource.height * elem.scaleY) - elem.canvas.height);
            }
        }
    }
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    sourceMoveEndListener(e) {
        /** @type {?} */
        let cs = this.getComputedStyle();
        console.log(cs);
        this.updatePreviewCanvas(e.target, cs);
        this.changed.next(this.previewCanvas.toDataURL('png'));
    }
    /**
     * @private
     * @return {?}
     */
    preparePreviewCanvas() {
        if (!this.previewCanvas) {
            this.previewCanvas = HelpersService.createCanvasElement();
            console.log(this.computedStyle.width);
            this.previewCanvas.width = this.exportWidth ? this.exportWidth : this.computedStyle.width;
            this.previewCanvas.height = this.exportWidth ? this.exportWidth / this.aspectRatio : this.computedStyle.height;
            /** @type {?} */
            const ctx = this.previewCanvas.getContext('2d');
            ctx.drawImage(this.originalSource, 0, 0);
        }
    }
    /**
     * @private
     * @return {?}
     */
    resetPreviewCanvas() {
        this.previewCanvas = null;
        this.preparePreviewCanvas();
    }
    /**
     * @private
     * @param {?} fImage
     * @param {?} computedStyle
     * @return {?}
     */
    updatePreviewCanvas(fImage, computedStyle) {
        /** @type {?} */
        let ctx;
        ctx = this.previewCanvas.getContext('2d');
        ctx.drawImage(this.originalSource, computedStyle.left, computedStyle.top, computedStyle.width, computedStyle.height, 0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }
    /**
     * @private
     * @return {?}
     */
    getComputedStyle() {
        return {
            left: Math.round(Math.abs(this.canvasSource.left) / this.currentScaleLevel),
            top: Math.round(Math.abs(this.canvasSource.top) / this.currentScaleLevel),
            width: Math.round(this.canvas.getWidth() / this.currentScaleLevel),
            height: Math.round(this.canvas.getHeight() / this.currentScaleLevel),
        };
    }
    /**
     * @param {?} scale
     * @return {?}
     */
    setScale(scale) {
        /** @type {?} */
        const sc = scale > 1 ? 1 : scale;
        this.currentScaleLevel = sc;
        this.canvasSource.scale(sc);
        this.computedStyle = this.getComputedStyle();
        this.resetPreviewCanvas();
        this.canvas.renderAll();
    }
    /**
     * @return {?}
     */
    initCropper() {
        this.canvasSource.selectable = true;
        this.canvasSource.on('moving', (/**
         * @param {?} e
         * @return {?}
         */
        e => this.sourceMoveListener(e)));
        this.canvasSource.on('moved', (/**
         * @param {?} e
         * @return {?}
         */
        e => this.sourceMoveEndListener(e)));
        this.computedStyle = this.getComputedStyle();
        this.preparePreviewCanvas();
    }
    /**
     * @return {?}
     */
    initBlur() {
        this.canvasSource.selectable = false;
    }
}
ScPhotoEditorComponent.decorators = [
    { type: Component, args: [{
                selector: 'sc-photo-editor',
                template: "<div class=\"sc-canvas-wrapper\">\r\n  <canvas id=\"sc-canvas\"></canvas>\r\n</div>\r\n",
                providers: [HelpersService]
            }] }
];
/** @nocollapse */
ScPhotoEditorComponent.ctorParameters = () => [
    { type: HelpersService }
];
ScPhotoEditorComponent.propDecorators = {
    editorWidth: [{ type: Input }],
    exportWidth: [{ type: Input }],
    aspectRatio: [{ type: Input }],
    source: [{ type: Input }],
    mode: [{ type: Input }],
    changed: [{ type: Output }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype._mode$;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype._source$;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype.mode$;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype.source$;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.editorWidth;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.exportWidth;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.aspectRatio;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.source;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.mode;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.changed;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.minScaleLevel;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.maxScaleLevel;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.canvas;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.currentScaleLevel;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.canvasSource;
    /** @type {?} */
    ScPhotoEditorComponent.prototype.computedStyle;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype.originalSource;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype.previewCanvas;
    /**
     * @type {?}
     * @private
     */
    ScPhotoEditorComponent.prototype.helpers;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2MtcGhvdG8tZWRpdG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NjLXBob3RvLWVkaXRvci8iLCJzb3VyY2VzIjpbImxpYi9zYy1waG90by1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFnQixTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBcUIsTUFBTSxFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUN0SCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBRTdELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFrQjNDLE1BQU0sT0FBTyxzQkFBc0I7Ozs7SUErQmpDLFlBQW9CLE9BQXVCO1FBQXZCLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBN0JuQyxXQUFNLEdBQXdCLElBQUksYUFBYSxDQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pELGFBQVEsR0FBZ0MsSUFBSSxhQUFhLENBQWUsQ0FBQyxDQUFDLENBQUM7UUFFM0UsVUFBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbkMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7UUFZckMsWUFBTyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFFdkMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDbEIsa0JBQWEsR0FBRyxDQUFDLENBQUM7SUFVNkIsQ0FBQzs7OztJQUVoRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLGFBQWEsQ0FDWCxJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxPQUFPLENBQ2IsQ0FBQyxTQUFTOzs7O1FBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENB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OztJQUUvQyw2Q0FBNkI7O0lBRTdCLDZDQUE2Qjs7SUFFN0IsNkNBQTZCOztJQUU3Qix3Q0FBd0I7O0lBRXhCLHNDQUFvQjs7SUFFcEIseUNBQXVDOztJQUV2QywrQ0FBa0I7O0lBQ2xCLCtDQUFrQjs7SUFFbEIsd0NBQXNCOztJQUN0QixtREFBMEI7O0lBQzFCLDhDQUEyQjs7SUFDM0IsK0NBQTZCOzs7OztJQUU3QixnREFBdUI7Ozs7O0lBQ3ZCLCtDQUFzQjs7Ozs7SUFFVix5Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25DaGFuZ2VzLCBPbkluaXQsIE91dHB1dCwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmYWJyaWMgfSBmcm9tICdmYWJyaWMnO1xuaW1wb3J0IHsgY29tYmluZUxhdGVzdCwgUmVwbGF5U3ViamVjdCwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBIZWxwZXJzU2VydmljZSB9IGZyb20gJy4vaGVscGVycyc7XG5cblxuaW1wb3J0IHtcbiAgTW9kZSxcbiAgUG9zaXRpb24sXG4gIE1pbWVUeXBlLFxuICBPcmllbnRhdGlvbixcbiAgQ29tcHV0ZWRTdHlsZSxcbiAgQ2lyY2xlQ29tcHV0ZWRTdHlsZVxufSBmcm9tICcuL3R5cGVzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnc2MtcGhvdG8tZWRpdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICdzYy1waG90by1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZXM6IFtdLFxuICBwcm92aWRlcnM6IFsgSGVscGVyc1NlcnZpY2UgXVxufSlcbmV4cG9ydCBjbGFzcyBTY1Bob3RvRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzIHtcblxuICBwcml2YXRlIF9tb2RlJDogUmVwbGF5U3ViamVjdDxNb2RlPiA9IG5ldyBSZXBsYXlTdWJqZWN0PE1vZGU+KDEpO1xuICBwcml2YXRlIF9zb3VyY2UkOiBSZXBsYXlTdWJqZWN0PGZhYnJpYy5JbWFnZT4gPSBuZXcgUmVwbGF5U3ViamVjdDxmYWJyaWMuSW1hZ2U+KDEpO1xuXG4gIHByaXZhdGUgbW9kZSQgPSB0aGlzLl9tb2RlJC5hc09ic2VydmFibGUoKTtcbiAgcHJpdmF0ZSBzb3VyY2UkID0gdGhpcy5fc291cmNlJC5hc09ic2VydmFibGUoKTtcblxuICBASW5wdXQoKSBlZGl0b3JXaWR0aDogbnVtYmVyO1xuXG4gIEBJbnB1dCgpIGV4cG9ydFdpZHRoOiBudW1iZXI7XG5cbiAgQElucHV0KCkgYXNwZWN0UmF0aW86IG51bWJlcjtcblxuICBASW5wdXQoKSBzb3VyY2U6IHN0cmluZztcblxuICBASW5wdXQoKSBtb2RlOiBNb2RlO1xuXG4gIEBPdXRwdXQoKSBjaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIG1pblNjYWxlTGV2ZWwgPSAwO1xuICBtYXhTY2FsZUxldmVsID0gMTtcblxuICBjYW52YXM6IGZhYnJpYy5DYW52YXM7XG4gIGN1cnJlbnRTY2FsZUxldmVsOiBudW1iZXI7XG4gIGNhbnZhc1NvdXJjZTogZmFicmljLkltYWdlO1xuICBjb21wdXRlZFN0eWxlOiBDb21wdXRlZFN0eWxlO1xuXG4gIHByaXZhdGUgb3JpZ2luYWxTb3VyY2U7XG4gIHByaXZhdGUgcHJldmlld0NhbnZhcztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhlbHBlcnM6IEhlbHBlcnNTZXJ2aWNlKSB7IH1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5pbml0V29ya3NwYWNlKCk7XG5cbiAgICBjb21iaW5lTGF0ZXN0KFxuICAgICAgdGhpcy5tb2RlJCxcbiAgICAgIHRoaXMuc291cmNlJFxuICAgICkuc3Vic2NyaWJlKChbbW9kZV0pID0+IHRoaXMuc3dpdGNoVG9Nb2RlKG1vZGUpKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoY2hhbmdlc1snc291cmNlJ10gJiYgY2hhbmdlc1snc291cmNlJ10uY3VycmVudFZhbHVlKSB7XG4gICAgICB0aGlzLnNldFNvdXJjZSh0aGlzLnNvdXJjZSk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ21vZGUnXSAmJiBjaGFuZ2VzWydtb2RlJ10uY3VycmVudFZhbHVlKSB7XG4gICAgICB0aGlzLnNldE1vZGUodGhpcy5tb2RlKTtcbiAgICB9XG4gIH1cblxuICBpbml0V29ya3NwYWNlKCkge1xuICAgIHRoaXMuY2FudmFzID0gbmV3IGZhYnJpYy5DYW52YXMoJ3NjLWNhbnZhcycpO1xuICAgIHRoaXMuY2FudmFzLnNldFdpZHRoKHRoaXMuZWRpdG9yV2lkdGgpO1xuICAgIHRoaXMuY2FudmFzLnNldEhlaWdodCh0aGlzLmVkaXRvcldpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyk7XG4gIH1cblxuICBzZXRTb3VyY2Uoc291cmNlKSB7XG4gICAgZmFicmljLkltYWdlLmZyb21VUkwoc291cmNlLCAoZkltZykgPT4ge1xuICAgICAgdGhpcy5jYW52YXNTb3VyY2UgPSBmSW1nO1xuICAgICAgdGhpcy5vcmlnaW5hbFNvdXJjZSA9IGZJbWcuZ2V0RWxlbWVudCgpO1xuICAgICAgdGhpcy5wcmVwYXJlQ2FudmFzSW1hZ2UoZkltZyk7XG4gICAgICB0aGlzLl9zb3VyY2UkLm5leHQoZkltZyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXRNb2RlKG1vZGU6IE1vZGUpOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RlJC5uZXh0KG1vZGUpO1xuICB9XG5cbiAgc3dpdGNoVG9Nb2RlKG1vZGU6IE1vZGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgIGNhc2UgJ2Nyb3AnOiB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdibHVyJzoge1xuICAgICAgICB0aGlzLmluaXRCbHVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHJlcGFyZUNhbnZhc0ltYWdlKGZJbWFnZTogZmFicmljLkltYWdlKSB7XG4gICAgZkltYWdlLnNldCh7XG4gICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIHdpZHRoOiB0aGlzLm9yaWdpbmFsU291cmNlLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLm9yaWdpbmFsU291cmNlLmhlaWdodCxcbiAgICAgIHNlbGVjdGFibGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICB0aGlzLmRpc2FibGVJbWFnZUNvcm5lcnMoZkltYWdlKTtcbiAgICB0aGlzLmN1cnJlbnRTY2FsZUxldmVsXG4gICAgICA9IHRoaXMubWluU2NhbGVMZXZlbFxuICAgICAgPSB0aGlzLmdldE1pblNjYWxlTGV2ZWwoZkltYWdlKTtcblxuICAgIGZJbWFnZS5zY2FsZSh0aGlzLmN1cnJlbnRTY2FsZUxldmVsKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZChmSW1hZ2UpO1xuICAgIHRoaXMuY2FudmFzLnJlbmRlckFsbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPcmllbnRhdGlvbih3LCBoKTogT3JpZW50YXRpb24ge1xuXG4gICAgaWYgKHcgPiBoKSB7IHJldHVybiAnbGFuZHNjYXBlJzsgfVxuXG4gICAgaWYgKGggPiB3KSB7IHJldHVybiAncG9ydHJhaXQnOyB9XG5cbiAgICBpZiAodyA9PT0gaCkgeyByZXR1cm4gJ3NxdWFyZSc7IH1cblxuICB9XG5cbiAgcHJpdmF0ZSBkaXNhYmxlSW1hZ2VDb3JuZXJzKGZJbWFnZTogZmFicmljLkltYWdlKSB7XG4gICAgZkltYWdlLnNldENvbnRyb2xzVmlzaWJpbGl0eSh7XG4gICAgICBtdDogZmFsc2UsXG4gICAgICBtYjogZmFsc2UsXG4gICAgICBtbDogZmFsc2UsXG4gICAgICBtcjogZmFsc2UsXG4gICAgICBibDogZmFsc2UsXG4gICAgICBicjogZmFsc2UsXG4gICAgICBtdHI6IGZhbHNlLFxuICAgICAgdGw6IGZhbHNlLFxuICAgICAgdHI6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldE1pblNjYWxlTGV2ZWwoZkltYWdlOiBmYWJyaWMuSW1hZ2UpOiBudW1iZXIge1xuICAgIGxldCBjYW52YXNPcmllbnRhdGlvbjogT3JpZW50YXRpb24sXG4gICAgICAgIGltYWdlT3JpZW50YXRpb246IE9yaWVudGF0aW9uO1xuXG4gICAgY2FudmFzT3JpZW50YXRpb24gPSB0aGlzLmdldE9yaWVudGF0aW9uKHRoaXMuY2FudmFzLmdldFdpZHRoKCksIHRoaXMuY2FudmFzLmdldEhlaWdodCgpKTtcbiAgICBpbWFnZU9yaWVudGF0aW9uID0gdGhpcy5nZXRPcmllbnRhdGlvbihmSW1hZ2Uud2lkdGgsIGZJbWFnZS5oZWlnaHQpO1xuXG4gICAgaWYgKFxuICAgICAgKGNhbnZhc09yaWVudGF0aW9uID09PSAncG9ydHJhaXQnICYmIGltYWdlT3JpZW50YXRpb24gPT09ICdsYW5kc2NhcGUnKSB8fFxuICAgICAgKGNhbnZhc09yaWVudGF0aW9uID09PSAnbGFuZHNjYXBlJyAmJiBpbWFnZU9yaWVudGF0aW9uID09PSAncG9ydHJhaXQnKSB8fFxuICAgICAgKGNhbnZhc09yaWVudGF0aW9uID09PSAncG9ydHJhaXQnICYmIGltYWdlT3JpZW50YXRpb24gPT09ICdzcXVhcmUnKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLmdldEhlaWdodCgpIC8gZkltYWdlLmhlaWdodDtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0V2lkdGgoKSAvIGZJbWFnZS53aWR0aDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNvdXJjZU1vdmVMaXN0ZW5lcihlKSB7XG4gICAgY29uc3QgZWxlbSA9IGUudGFyZ2V0O1xuICAgIGlmIChlbGVtLmxlZnQgPj0gMCkge1xuICAgICAgZWxlbS5sZWZ0ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKChNYXRoLmFicyhlbGVtLmxlZnQpICsgZWxlbS5jYW52YXMud2lkdGgpIC8gZWxlbS5zY2FsZVggID4gdGhpcy5vcmlnaW5hbFNvdXJjZS53aWR0aCkge1xuICAgICAgICBlbGVtLmxlZnQgPSAtKCh0aGlzLm9yaWdpbmFsU291cmNlLndpZHRoICogZWxlbS5zY2FsZVgpIC0gZWxlbS5jYW52YXMud2lkdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtLnRvcCA+PSAwKSB7XG4gICAgICBlbGVtLnRvcCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgoTWF0aC5hYnMoZWxlbS50b3ApICsgZWxlbS5jYW52YXMuaGVpZ2h0KSAvIGVsZW0uc2NhbGVZICA+IHRoaXMub3JpZ2luYWxTb3VyY2UuaGVpZ2h0KSB7XG4gICAgICAgIGVsZW0udG9wID0gLSgodGhpcy5vcmlnaW5hbFNvdXJjZS5oZWlnaHQgKiBlbGVtLnNjYWxlWSkgLSBlbGVtLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc291cmNlTW92ZUVuZExpc3RlbmVyKGUpIHtcbiAgICBsZXQgY3MgPSB0aGlzLmdldENvbXB1dGVkU3R5bGUoKTtcbiAgICBjb25zb2xlLmxvZyhjcyk7XG4gICAgdGhpcy51cGRhdGVQcmV2aWV3Q2FudmFzKGUudGFyZ2V0LCBjcyk7XG4gICAgdGhpcy5jaGFuZ2VkLm5leHQodGhpcy5wcmV2aWV3Q2FudmFzLnRvRGF0YVVSTCgncG5nJykpO1xuICB9XG5cbiAgcHJpdmF0ZSBwcmVwYXJlUHJldmlld0NhbnZhcygpIHtcbiAgICBpZiAoIXRoaXMucHJldmlld0NhbnZhcykge1xuICAgICAgdGhpcy5wcmV2aWV3Q2FudmFzID0gSGVscGVyc1NlcnZpY2UuY3JlYXRlQ2FudmFzRWxlbWVudCgpO1xuXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXG5cbiAgICAgIHRoaXMucHJldmlld0NhbnZhcy53aWR0aCA9IHRoaXMuZXhwb3J0V2lkdGggPyB0aGlzLmV4cG9ydFdpZHRoIDogdGhpcy5jb21wdXRlZFN0eWxlLndpZHRoO1xuICAgICAgdGhpcy5wcmV2aWV3Q2FudmFzLmhlaWdodCA9IHRoaXMuZXhwb3J0V2lkdGggPyB0aGlzLmV4cG9ydFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyA6IHRoaXMuY29tcHV0ZWRTdHlsZS5oZWlnaHQ7XG5cbiAgICAgIGNvbnN0IGN0eCA9IHRoaXMucHJldmlld0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgY3R4LmRyYXdJbWFnZSh0aGlzLm9yaWdpbmFsU291cmNlLCAwLCAwKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlc2V0UHJldmlld0NhbnZhcygpIHtcbiAgICB0aGlzLnByZXZpZXdDYW52YXMgPSBudWxsO1xuICAgIHRoaXMucHJlcGFyZVByZXZpZXdDYW52YXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlUHJldmlld0NhbnZhcyhmSW1hZ2U6IGZhYnJpYy5JbWFnZSwgY29tcHV0ZWRTdHlsZTogQ29tcHV0ZWRTdHlsZSkge1xuICAgIGxldCBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBjdHggPSB0aGlzLnByZXZpZXdDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgdGhpcy5vcmlnaW5hbFNvdXJjZSxcbiAgICAgIGNvbXB1dGVkU3R5bGUubGVmdCxcbiAgICAgIGNvbXB1dGVkU3R5bGUudG9wLFxuICAgICAgY29tcHV0ZWRTdHlsZS53aWR0aCxcbiAgICAgIGNvbXB1dGVkU3R5bGUuaGVpZ2h0LFxuICAgICAgMCxcbiAgICAgIDAsXG4gICAgICB0aGlzLnByZXZpZXdDYW52YXMud2lkdGgsXG4gICAgICB0aGlzLnByZXZpZXdDYW52YXMuaGVpZ2h0KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29tcHV0ZWRTdHlsZSAoKTogQ29tcHV0ZWRTdHlsZSB7XG4gICAgcmV0dXJuICB7XG4gICAgICBsZWZ0OiBNYXRoLnJvdW5kKE1hdGguYWJzKHRoaXMuY2FudmFzU291cmNlLmxlZnQpIC8gdGhpcy5jdXJyZW50U2NhbGVMZXZlbCksXG4gICAgICB0b3A6IE1hdGgucm91bmQoTWF0aC5hYnModGhpcy5jYW52YXNTb3VyY2UudG9wKSAvIHRoaXMuY3VycmVudFNjYWxlTGV2ZWwpLFxuICAgICAgd2lkdGg6IE1hdGgucm91bmQodGhpcy5jYW52YXMuZ2V0V2lkdGgoKSAvIHRoaXMuY3VycmVudFNjYWxlTGV2ZWwpLFxuICAgICAgaGVpZ2h0OiBNYXRoLnJvdW5kKHRoaXMuY2FudmFzLmdldEhlaWdodCgpIC8gdGhpcy5jdXJyZW50U2NhbGVMZXZlbCksXG4gICAgfTtcbiAgfVxuXG4gIHNldFNjYWxlKHNjYWxlOiBudW1iZXIpIHtcbiAgICBjb25zdCBzYyA9IHNjYWxlID4gMSA/IDEgOiBzY2FsZTtcbiAgICB0aGlzLmN1cnJlbnRTY2FsZUxldmVsID0gc2M7XG4gICAgdGhpcy5jYW52YXNTb3VyY2Uuc2NhbGUoc2MpO1xuICAgIHRoaXMuY29tcHV0ZWRTdHlsZSA9IHRoaXMuZ2V0Q29tcHV0ZWRTdHlsZSgpO1xuICAgIHRoaXMucmVzZXRQcmV2aWV3Q2FudmFzKCk7XG4gICAgdGhpcy5jYW52YXMucmVuZGVyQWxsKCk7XG4gIH1cblxuICBpbml0Q3JvcHBlcigpIHtcbiAgICB0aGlzLmNhbnZhc1NvdXJjZS5zZWxlY3RhYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmNhbnZhc1NvdXJjZS5vbignbW92aW5nJywgZSA9PiB0aGlzLnNvdXJjZU1vdmVMaXN0ZW5lcihlKSk7XG4gICAgdGhpcy5jYW52YXNTb3VyY2Uub24oJ21vdmVkJywgZSA9PiB0aGlzLnNvdXJjZU1vdmVFbmRMaXN0ZW5lcihlKSk7XG5cbiAgICB0aGlzLmNvbXB1dGVkU3R5bGUgPSB0aGlzLmdldENvbXB1dGVkU3R5bGUoKTtcbiAgICB0aGlzLnByZXBhcmVQcmV2aWV3Q2FudmFzKCk7XG4gIH1cblxuICBpbml0Qmx1cigpIHtcbiAgICB0aGlzLmNhbnZhc1NvdXJjZS5zZWxlY3RhYmxlID0gZmFsc2U7XG4gIH1cblxufVxuIl19