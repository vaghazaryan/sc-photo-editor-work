import { fabric } from 'fabric';
import { combineLatest, ReplaySubject } from 'rxjs';
import { Injectable, NgModule, Component, EventEmitter, Input, Output, defineInjectable } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * Generated from: lib/sc-photo-editor.service.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class ScPhotoEditorService {
    constructor() { }
}
ScPhotoEditorService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
/** @nocollapse */
ScPhotoEditorService.ctorParameters = () => [];
/** @nocollapse */ ScPhotoEditorService.ngInjectableDef = defineInjectable({ factory: function ScPhotoEditorService_Factory() { return new ScPhotoEditorService(); }, token: ScPhotoEditorService, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * Generated from: lib/helpers.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class HelpersService {
    /**
     * @param {?=} identifier
     * @return {?}
     */
    static createCanvasElement(identifier) {
        /** @type {?} */
        let canvas;
        canvas = document.createElement('canvas');
        canvas.id = identifier || Date.now();
        return canvas;
    }
}
HelpersService.decorators = [
    { type: Injectable }
];

/**
 * @fileoverview added by tsickle
 * Generated from: lib/sc-photo-editor.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class ScPhotoEditorComponent {
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

/**
 * @fileoverview added by tsickle
 * Generated from: lib/sc-photo-editor.module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class ScPhotoEditorModule {
}
ScPhotoEditorModule.decorators = [
    { type: NgModule, args: [{
                declarations: [ScPhotoEditorComponent],
                imports: [],
                exports: [ScPhotoEditorComponent]
            },] }
];

/**
 * @fileoverview added by tsickle
 * Generated from: public_api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: sc-photo-editor.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { ScPhotoEditorService, ScPhotoEditorComponent, ScPhotoEditorModule, HelpersService as ɵa };

//# sourceMappingURL=sc-photo-editor.js.map