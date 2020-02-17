/**
 * @fileoverview added by tsickle
 * Generated from: lib/sc-photo-editor.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fabric } from 'fabric';
import { combineLatest, ReplaySubject } from 'rxjs';
import { HelpersService } from './helpers';
var ScPhotoEditorComponent = /** @class */ (function () {
    function ScPhotoEditorComponent(helpers) {
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
    ScPhotoEditorComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.initWorkspace();
        combineLatest(this.mode$, this.source$).subscribe((/**
         * @param {?} __0
         * @return {?}
         */
        function (_a) {
            var _b = tslib_1.__read(_a, 1), mode = _b[0];
            return _this.switchToMode(mode);
        }));
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes['source'] && changes['source'].currentValue) {
            this.setSource(this.source);
        }
        if (changes['mode'] && changes['mode'].currentValue) {
            this.setMode(this.mode);
        }
    };
    /**
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.initWorkspace = /**
     * @return {?}
     */
    function () {
        this.canvas = new fabric.Canvas('sc-canvas');
        this.canvas.setWidth(this.editorWidth);
        this.canvas.setHeight(this.editorWidth / this.aspectRatio);
    };
    /**
     * @param {?} source
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.setSource = /**
     * @param {?} source
     * @return {?}
     */
    function (source) {
        var _this = this;
        fabric.Image.fromURL(source, (/**
         * @param {?} fImg
         * @return {?}
         */
        function (fImg) {
            _this.canvasSource = fImg;
            _this.originalSource = fImg.getElement();
            _this.prepareCanvasImage(fImg);
            _this._source$.next(fImg);
        }));
    };
    /**
     * @param {?} mode
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.setMode = /**
     * @param {?} mode
     * @return {?}
     */
    function (mode) {
        this._mode$.next(mode);
    };
    /**
     * @param {?} mode
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.switchToMode = /**
     * @param {?} mode
     * @return {?}
     */
    function (mode) {
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
    };
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.prepareCanvasImage = /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    function (fImage) {
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
    };
    /**
     * @private
     * @param {?} w
     * @param {?} h
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.getOrientation = /**
     * @private
     * @param {?} w
     * @param {?} h
     * @return {?}
     */
    function (w, h) {
        if (w > h) {
            return 'landscape';
        }
        if (h > w) {
            return 'portrait';
        }
        if (w === h) {
            return 'square';
        }
    };
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.disableImageCorners = /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    function (fImage) {
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
    };
    /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.getMinScaleLevel = /**
     * @private
     * @param {?} fImage
     * @return {?}
     */
    function (fImage) {
        /** @type {?} */
        var canvasOrientation;
        /** @type {?} */
        var imageOrientation;
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
    };
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.sourceMoveListener = /**
     * @private
     * @param {?} e
     * @return {?}
     */
    function (e) {
        /** @type {?} */
        var elem = e.target;
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
    };
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.sourceMoveEndListener = /**
     * @private
     * @param {?} e
     * @return {?}
     */
    function (e) {
        /** @type {?} */
        var cs = this.getComputedStyle();
        console.log(cs);
        this.updatePreviewCanvas(e.target, cs);
        this.changed.next(this.previewCanvas.toDataURL('png'));
    };
    /**
     * @private
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.preparePreviewCanvas = /**
     * @private
     * @return {?}
     */
    function () {
        if (!this.previewCanvas) {
            this.previewCanvas = HelpersService.createCanvasElement();
            console.log(this.computedStyle.width);
            this.previewCanvas.width = this.exportWidth ? this.exportWidth : this.computedStyle.width;
            this.previewCanvas.height = this.exportWidth ? this.exportWidth / this.aspectRatio : this.computedStyle.height;
            /** @type {?} */
            var ctx = this.previewCanvas.getContext('2d');
            ctx.drawImage(this.originalSource, 0, 0);
        }
    };
    /**
     * @private
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.resetPreviewCanvas = /**
     * @private
     * @return {?}
     */
    function () {
        this.previewCanvas = null;
        this.preparePreviewCanvas();
    };
    /**
     * @private
     * @param {?} fImage
     * @param {?} computedStyle
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.updatePreviewCanvas = /**
     * @private
     * @param {?} fImage
     * @param {?} computedStyle
     * @return {?}
     */
    function (fImage, computedStyle) {
        /** @type {?} */
        var ctx;
        ctx = this.previewCanvas.getContext('2d');
        ctx.drawImage(this.originalSource, computedStyle.left, computedStyle.top, computedStyle.width, computedStyle.height, 0, 0, this.previewCanvas.width, this.previewCanvas.height);
    };
    /**
     * @private
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.getComputedStyle = /**
     * @private
     * @return {?}
     */
    function () {
        return {
            left: Math.round(Math.abs(this.canvasSource.left) / this.currentScaleLevel),
            top: Math.round(Math.abs(this.canvasSource.top) / this.currentScaleLevel),
            width: Math.round(this.canvas.getWidth() / this.currentScaleLevel),
            height: Math.round(this.canvas.getHeight() / this.currentScaleLevel),
        };
    };
    /**
     * @param {?} scale
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.setScale = /**
     * @param {?} scale
     * @return {?}
     */
    function (scale) {
        /** @type {?} */
        var sc = scale > 1 ? 1 : scale;
        this.currentScaleLevel = sc;
        this.canvasSource.scale(sc);
        this.computedStyle = this.getComputedStyle();
        this.resetPreviewCanvas();
        this.canvas.renderAll();
    };
    /**
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.initCropper = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.canvasSource.selectable = true;
        this.canvasSource.on('moving', (/**
         * @param {?} e
         * @return {?}
         */
        function (e) { return _this.sourceMoveListener(e); }));
        this.canvasSource.on('moved', (/**
         * @param {?} e
         * @return {?}
         */
        function (e) { return _this.sourceMoveEndListener(e); }));
        this.computedStyle = this.getComputedStyle();
        this.preparePreviewCanvas();
    };
    /**
     * @return {?}
     */
    ScPhotoEditorComponent.prototype.initBlur = /**
     * @return {?}
     */
    function () {
        this.canvasSource.selectable = false;
    };
    ScPhotoEditorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'sc-photo-editor',
                    template: "<div class=\"sc-canvas-wrapper\">\r\n  <canvas id=\"sc-canvas\"></canvas>\r\n</div>\r\n",
                    providers: [HelpersService]
                }] }
    ];
    /** @nocollapse */
    ScPhotoEditorComponent.ctorParameters = function () { return [
        { type: HelpersService }
    ]; };
    ScPhotoEditorComponent.propDecorators = {
        editorWidth: [{ type: Input }],
        exportWidth: [{ type: Input }],
        aspectRatio: [{ type: Input }],
        source: [{ type: Input }],
        mode: [{ type: Input }],
        changed: [{ type: Output }]
    };
    return ScPhotoEditorComponent;
}());
export { ScPhotoEditorComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2MtcGhvdG8tZWRpdG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NjLXBob3RvLWVkaXRvci8iLCJzb3VyY2VzIjpbImxpYi9zYy1waG90by1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXFCLE1BQU0sRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFDdEgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUU3RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBWTNDO0lBcUNFLGdDQUFvQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQTdCbkMsV0FBTSxHQUF3QixJQUFJLGFBQWEsQ0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RCxhQUFRLEdBQWdDLElBQUksYUFBYSxDQUFlLENBQUMsQ0FBQyxDQUFDO1FBRTNFLFVBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ25DLFlBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBWXJDLFlBQU8sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXZDLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO0lBVTZCLENBQUM7Ozs7SUFFaEQsZ0RBQWU7OztJQUFmO1FBQUEsaUJBT0M7UUFOQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsYUFBYSxDQUNYLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FDYixDQUFDLFNBQVM7Ozs7UUFBQyxVQUFDLEVBQU07Z0JBQU4sMEJBQU0sRUFBTCxZQUFJO1lBQU0sT0FBQSxL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b0JBQ1QsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IsbUdBQTZDO29CQUU3QyxTQUFTLEVBQUUsQ0FBRSxjQUFjLENBQUU7aUJBQzlCOzs7O2dCQWpCUSxjQUFjOzs7OEJBMEJwQixLQUFLOzhCQUVMLEtBQUs7OEJBRUwsS0FBSzt5QkFFTCxLQUFLO3VCQUVMLEtBQUs7MEJBRUwsTUFBTTs7SUE2TlQsNkJBQUM7Q0FBQSxBQXJQRCxJQXFQQztTQS9PWSxzQkFBc0I7Ozs7OztJQUVqQyx3Q0FBaUU7Ozs7O0lBQ2pFLDBDQUFtRjs7Ozs7SUFFbkYsdUNBQTJDOzs7OztJQUMzQyx5Q0FBK0M7O0lBRS9DLDZDQUE2Qjs7SUFFN0IsNkNBQTZCOztJQUU3Qiw2Q0FBNkI7O0lBRTdCLHdDQUF3Qjs7SUFFeEIsc0NBQW9COztJQUVwQix5Q0FBdUM7O0lBRXZDLCtDQUFrQjs7SUFDbEIsK0NBQWtCOztJQUVsQix3Q0FBc0I7O0lBQ3RCLG1EQUEwQjs7SUFDMUIsOENBQTJCOztJQUMzQiwrQ0FBNkI7Ozs7O0lBRTdCLGdEQUF1Qjs7Ozs7SUFDdkIsK0NBQXNCOzs7OztJQUVWLHlDQUErQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkNoYW5nZXMsIE9uSW5pdCwgT3V0cHV0LCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGZhYnJpYyB9IGZyb20gJ2ZhYnJpYyc7XG5pbXBvcnQgeyBjb21iaW5lTGF0ZXN0LCBSZXBsYXlTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEhlbHBlcnNTZXJ2aWNlIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuXG5pbXBvcnQge1xuICBNb2RlLFxuICBQb3NpdGlvbixcbiAgTWltZVR5cGUsXG4gIE9yaWVudGF0aW9uLFxuICBDb21wdXRlZFN0eWxlLFxuICBDaXJjbGVDb21wdXRlZFN0eWxlXG59IGZyb20gJy4vdHlwZXMnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzYy1waG90by1lZGl0b3InLFxuICB0ZW1wbGF0ZVVybDogJ3NjLXBob3RvLWVkaXRvci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlczogW10sXG4gIHByb3ZpZGVyczogWyBIZWxwZXJzU2VydmljZSBdXG59KVxuZXhwb3J0IGNsYXNzIFNjUGhvdG9FZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMge1xuXG4gIHByaXZhdGUgX21vZGUkOiBSZXBsYXlTdWJqZWN0PE1vZGU+ID0gbmV3IFJlcGxheVN1YmplY3Q8TW9kZT4oMSk7XG4gIHByaXZhdGUgX3NvdXJjZSQ6IFJlcGxheVN1YmplY3Q8ZmFicmljLkltYWdlPiA9IG5ldyBSZXBsYXlTdWJqZWN0PGZhYnJpYy5JbWFnZT4oMSk7XG5cbiAgcHJpdmF0ZSBtb2RlJCA9IHRoaXMuX21vZGUkLmFzT2JzZXJ2YWJsZSgpO1xuICBwcml2YXRlIHNvdXJjZSQgPSB0aGlzLl9zb3VyY2UkLmFzT2JzZXJ2YWJsZSgpO1xuXG4gIEBJbnB1dCgpIGVkaXRvcldpZHRoOiBudW1iZXI7XG5cbiAgQElucHV0KCkgZXhwb3J0V2lkdGg6IG51bWJlcjtcblxuICBASW5wdXQoKSBhc3BlY3RSYXRpbzogbnVtYmVyO1xuXG4gIEBJbnB1dCgpIHNvdXJjZTogc3RyaW5nO1xuXG4gIEBJbnB1dCgpIG1vZGU6IE1vZGU7XG5cbiAgQE91dHB1dCgpIGNoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgbWluU2NhbGVMZXZlbCA9IDA7XG4gIG1heFNjYWxlTGV2ZWwgPSAxO1xuXG4gIGNhbnZhczogZmFicmljLkNhbnZhcztcbiAgY3VycmVudFNjYWxlTGV2ZWw6IG51bWJlcjtcbiAgY2FudmFzU291cmNlOiBmYWJyaWMuSW1hZ2U7XG4gIGNvbXB1dGVkU3R5bGU6IENvbXB1dGVkU3R5bGU7XG5cbiAgcHJpdmF0ZSBvcmlnaW5hbFNvdXJjZTtcbiAgcHJpdmF0ZSBwcmV2aWV3Q2FudmFzO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaGVscGVyczogSGVscGVyc1NlcnZpY2UpIHsgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmluaXRXb3Jrc3BhY2UoKTtcblxuICAgIGNvbWJpbmVMYXRlc3QoXG4gICAgICB0aGlzLm1vZGUkLFxuICAgICAgdGhpcy5zb3VyY2UkXG4gICAgKS5zdWJzY3JpYmUoKFttb2RlXSkgPT4gdGhpcy5zd2l0Y2hUb01vZGUobW9kZSkpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmIChjaGFuZ2VzWydzb3VyY2UnXSAmJiBjaGFuZ2VzWydzb3VyY2UnXS5jdXJyZW50VmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0U291cmNlKHRoaXMuc291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snbW9kZSddICYmIGNoYW5nZXNbJ21vZGUnXS5jdXJyZW50VmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0TW9kZSh0aGlzLm1vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGluaXRXb3Jrc3BhY2UoKSB7XG4gICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcygnc2MtY2FudmFzJyk7XG4gICAgdGhpcy5jYW52YXMuc2V0V2lkdGgodGhpcy5lZGl0b3JXaWR0aCk7XG4gICAgdGhpcy5jYW52YXMuc2V0SGVpZ2h0KHRoaXMuZWRpdG9yV2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvKTtcbiAgfVxuXG4gIHNldFNvdXJjZShzb3VyY2UpIHtcbiAgICBmYWJyaWMuSW1hZ2UuZnJvbVVSTChzb3VyY2UsIChmSW1nKSA9PiB7XG4gICAgICB0aGlzLmNhbnZhc1NvdXJjZSA9IGZJbWc7XG4gICAgICB0aGlzLm9yaWdpbmFsU291cmNlID0gZkltZy5nZXRFbGVtZW50KCk7XG4gICAgICB0aGlzLnByZXBhcmVDYW52YXNJbWFnZShmSW1nKTtcbiAgICAgIHRoaXMuX3NvdXJjZSQubmV4dChmSW1nKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldE1vZGUobW9kZTogTW9kZSk6IHZvaWQge1xuICAgIHRoaXMuX21vZGUkLm5leHQobW9kZSk7XG4gIH1cblxuICBzd2l0Y2hUb01vZGUobW9kZTogTW9kZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgY2FzZSAnY3JvcCc6IHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2JsdXInOiB7XG4gICAgICAgIHRoaXMuaW5pdEJsdXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVwYXJlQ2FudmFzSW1hZ2UoZkltYWdlOiBmYWJyaWMuSW1hZ2UpIHtcbiAgICBmSW1hZ2Uuc2V0KHtcbiAgICAgIG9yaWdpblg6ICdsZWZ0JyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgd2lkdGg6IHRoaXMub3JpZ2luYWxTb3VyY2Uud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMub3JpZ2luYWxTb3VyY2UuaGVpZ2h0LFxuICAgICAgc2VsZWN0YWJsZTogZmFsc2VcbiAgICB9KTtcblxuICAgIHRoaXMuZGlzYWJsZUltYWdlQ29ybmVycyhmSW1hZ2UpO1xuICAgIHRoaXMuY3VycmVudFNjYWxlTGV2ZWxcbiAgICAgID0gdGhpcy5taW5TY2FsZUxldmVsXG4gICAgICA9IHRoaXMuZ2V0TWluU2NhbGVMZXZlbChmSW1hZ2UpO1xuXG4gICAgZkltYWdlLnNjYWxlKHRoaXMuY3VycmVudFNjYWxlTGV2ZWwpO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkKGZJbWFnZSk7XG4gICAgdGhpcy5jYW52YXMucmVuZGVyQWxsKCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9yaWVudGF0aW9uKHcsIGgpOiBPcmllbnRhdGlvbiB7XG5cbiAgICBpZiAodyA+IGgpIHsgcmV0dXJuICdsYW5kc2NhcGUnOyB9XG5cbiAgICBpZiAoaCA+IHcpIHsgcmV0dXJuICdwb3J0cmFpdCc7IH1cblxuICAgIGlmICh3ID09PSBoKSB7IHJldHVybiAnc3F1YXJlJzsgfVxuXG4gIH1cblxuICBwcml2YXRlIGRpc2FibGVJbWFnZUNvcm5lcnMoZkltYWdlOiBmYWJyaWMuSW1hZ2UpIHtcbiAgICBmSW1hZ2Uuc2V0Q29udHJvbHNWaXNpYmlsaXR5KHtcbiAgICAgIG10OiBmYWxzZSxcbiAgICAgIG1iOiBmYWxzZSxcbiAgICAgIG1sOiBmYWxzZSxcbiAgICAgIG1yOiBmYWxzZSxcbiAgICAgIGJsOiBmYWxzZSxcbiAgICAgIGJyOiBmYWxzZSxcbiAgICAgIG10cjogZmFsc2UsXG4gICAgICB0bDogZmFsc2UsXG4gICAgICB0cjogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TWluU2NhbGVMZXZlbChmSW1hZ2U6IGZhYnJpYy5JbWFnZSk6IG51bWJlciB7XG4gICAgbGV0IGNhbnZhc09yaWVudGF0aW9uOiBPcmllbnRhdGlvbixcbiAgICAgICAgaW1hZ2VPcmllbnRhdGlvbjogT3JpZW50YXRpb247XG5cbiAgICBjYW52YXNPcmllbnRhdGlvbiA9IHRoaXMuZ2V0T3JpZW50YXRpb24odGhpcy5jYW52YXMuZ2V0V2lkdGgoKSwgdGhpcy5jYW52YXMuZ2V0SGVpZ2h0KCkpO1xuICAgIGltYWdlT3JpZW50YXRpb24gPSB0aGlzLmdldE9yaWVudGF0aW9uKGZJbWFnZS53aWR0aCwgZkltYWdlLmhlaWdodCk7XG5cbiAgICBpZiAoXG4gICAgICAoY2FudmFzT3JpZW50YXRpb24gPT09ICdwb3J0cmFpdCcgJiYgaW1hZ2VPcmllbnRhdGlvbiA9PT0gJ2xhbmRzY2FwZScpIHx8XG4gICAgICAoY2FudmFzT3JpZW50YXRpb24gPT09ICdsYW5kc2NhcGUnICYmIGltYWdlT3JpZW50YXRpb24gPT09ICdwb3J0cmFpdCcpIHx8XG4gICAgICAoY2FudmFzT3JpZW50YXRpb24gPT09ICdwb3J0cmFpdCcgJiYgaW1hZ2VPcmllbnRhdGlvbiA9PT0gJ3NxdWFyZScpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYW52YXMuZ2V0SGVpZ2h0KCkgLyBmSW1hZ2UuaGVpZ2h0O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbnZhcy5nZXRXaWR0aCgpIC8gZkltYWdlLndpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc291cmNlTW92ZUxpc3RlbmVyKGUpIHtcbiAgICBjb25zdCBlbGVtID0gZS50YXJnZXQ7XG4gICAgaWYgKGVsZW0ubGVmdCA+PSAwKSB7XG4gICAgICBlbGVtLmxlZnQgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKE1hdGguYWJzKGVsZW0ubGVmdCkgKyBlbGVtLmNhbnZhcy53aWR0aCkgLyBlbGVtLnNjYWxlWCAgPiB0aGlzLm9yaWdpbmFsU291cmNlLndpZHRoKSB7XG4gICAgICAgIGVsZW0ubGVmdCA9IC0oKHRoaXMub3JpZ2luYWxTb3VyY2Uud2lkdGggKiBlbGVtLnNjYWxlWCkgLSBlbGVtLmNhbnZhcy53aWR0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW0udG9wID49IDApIHtcbiAgICAgIGVsZW0udG9wID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKChNYXRoLmFicyhlbGVtLnRvcCkgKyBlbGVtLmNhbnZhcy5oZWlnaHQpIC8gZWxlbS5zY2FsZVkgID4gdGhpcy5vcmlnaW5hbFNvdXJjZS5oZWlnaHQpIHtcbiAgICAgICAgZWxlbS50b3AgPSAtKCh0aGlzLm9yaWdpbmFsU291cmNlLmhlaWdodCAqIGVsZW0uc2NhbGVZKSAtIGVsZW0uY2FudmFzLmhlaWdodCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzb3VyY2VNb3ZlRW5kTGlzdGVuZXIoZSkge1xuICAgIGxldCBjcyA9IHRoaXMuZ2V0Q29tcHV0ZWRTdHlsZSgpO1xuICAgIGNvbnNvbGUubG9nKGNzKTtcbiAgICB0aGlzLnVwZGF0ZVByZXZpZXdDYW52YXMoZS50YXJnZXQsIGNzKTtcbiAgICB0aGlzLmNoYW5nZWQubmV4dCh0aGlzLnByZXZpZXdDYW52YXMudG9EYXRhVVJMKCdwbmcnKSk7XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVQcmV2aWV3Q2FudmFzKCkge1xuICAgIGlmICghdGhpcy5wcmV2aWV3Q2FudmFzKSB7XG4gICAgICB0aGlzLnByZXZpZXdDYW52YXMgPSBIZWxwZXJzU2VydmljZS5jcmVhdGVDYW52YXNFbGVtZW50KCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29tcHV0ZWRTdHlsZS53aWR0aCk7XG5cblxuICAgICAgdGhpcy5wcmV2aWV3Q2FudmFzLndpZHRoID0gdGhpcy5leHBvcnRXaWR0aCA/IHRoaXMuZXhwb3J0V2lkdGggOiB0aGlzLmNvbXB1dGVkU3R5bGUud2lkdGg7XG4gICAgICB0aGlzLnByZXZpZXdDYW52YXMuaGVpZ2h0ID0gdGhpcy5leHBvcnRXaWR0aCA/IHRoaXMuZXhwb3J0V2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvIDogdGhpcy5jb21wdXRlZFN0eWxlLmhlaWdodDtcblxuICAgICAgY29uc3QgY3R4ID0gdGhpcy5wcmV2aWV3Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICBjdHguZHJhd0ltYWdlKHRoaXMub3JpZ2luYWxTb3VyY2UsIDAsIDApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRQcmV2aWV3Q2FudmFzKCkge1xuICAgIHRoaXMucHJldmlld0NhbnZhcyA9IG51bGw7XG4gICAgdGhpcy5wcmVwYXJlUHJldmlld0NhbnZhcygpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVQcmV2aWV3Q2FudmFzKGZJbWFnZTogZmFicmljLkltYWdlLCBjb21wdXRlZFN0eWxlOiBDb21wdXRlZFN0eWxlKSB7XG4gICAgbGV0IGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIGN0eCA9IHRoaXMucHJldmlld0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICB0aGlzLm9yaWdpbmFsU291cmNlLFxuICAgICAgY29tcHV0ZWRTdHlsZS5sZWZ0LFxuICAgICAgY29tcHV0ZWRTdHlsZS50b3AsXG4gICAgICBjb21wdXRlZFN0eWxlLndpZHRoLFxuICAgICAgY29tcHV0ZWRTdHlsZS5oZWlnaHQsXG4gICAgICAwLFxuICAgICAgMCxcbiAgICAgIHRoaXMucHJldmlld0NhbnZhcy53aWR0aCxcbiAgICAgIHRoaXMucHJldmlld0NhbnZhcy5oZWlnaHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb21wdXRlZFN0eWxlICgpOiBDb21wdXRlZFN0eWxlIHtcbiAgICByZXR1cm4gIHtcbiAgICAgIGxlZnQ6IE1hdGgucm91bmQoTWF0aC5hYnModGhpcy5jYW52YXNTb3VyY2UubGVmdCkgLyB0aGlzLmN1cnJlbnRTY2FsZUxldmVsKSxcbiAgICAgIHRvcDogTWF0aC5yb3VuZChNYXRoLmFicyh0aGlzLmNhbnZhc1NvdXJjZS50b3ApIC8gdGhpcy5jdXJyZW50U2NhbGVMZXZlbCksXG4gICAgICB3aWR0aDogTWF0aC5yb3VuZCh0aGlzLmNhbnZhcy5nZXRXaWR0aCgpIC8gdGhpcy5jdXJyZW50U2NhbGVMZXZlbCksXG4gICAgICBoZWlnaHQ6IE1hdGgucm91bmQodGhpcy5jYW52YXMuZ2V0SGVpZ2h0KCkgLyB0aGlzLmN1cnJlbnRTY2FsZUxldmVsKSxcbiAgICB9O1xuICB9XG5cbiAgc2V0U2NhbGUoc2NhbGU6IG51bWJlcikge1xuICAgIGNvbnN0IHNjID0gc2NhbGUgPiAxID8gMSA6IHNjYWxlO1xuICAgIHRoaXMuY3VycmVudFNjYWxlTGV2ZWwgPSBzYztcbiAgICB0aGlzLmNhbnZhc1NvdXJjZS5zY2FsZShzYyk7XG4gICAgdGhpcy5jb21wdXRlZFN0eWxlID0gdGhpcy5nZXRDb21wdXRlZFN0eWxlKCk7XG4gICAgdGhpcy5yZXNldFByZXZpZXdDYW52YXMoKTtcbiAgICB0aGlzLmNhbnZhcy5yZW5kZXJBbGwoKTtcbiAgfVxuXG4gIGluaXRDcm9wcGVyKCkge1xuICAgIHRoaXMuY2FudmFzU291cmNlLnNlbGVjdGFibGUgPSB0cnVlO1xuICAgIHRoaXMuY2FudmFzU291cmNlLm9uKCdtb3ZpbmcnLCBlID0+IHRoaXMuc291cmNlTW92ZUxpc3RlbmVyKGUpKTtcbiAgICB0aGlzLmNhbnZhc1NvdXJjZS5vbignbW92ZWQnLCBlID0+IHRoaXMuc291cmNlTW92ZUVuZExpc3RlbmVyKGUpKTtcblxuICAgIHRoaXMuY29tcHV0ZWRTdHlsZSA9IHRoaXMuZ2V0Q29tcHV0ZWRTdHlsZSgpO1xuICAgIHRoaXMucHJlcGFyZVByZXZpZXdDYW52YXMoKTtcbiAgfVxuXG4gIGluaXRCbHVyKCkge1xuICAgIHRoaXMuY2FudmFzU291cmNlLnNlbGVjdGFibGUgPSBmYWxzZTtcbiAgfVxuXG59XG4iXX0=