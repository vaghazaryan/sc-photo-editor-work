/**
 * @fileoverview added by tsickle
 * Generated from: lib/helpers.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
export class HelpersService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3NjLXBob3RvLWVkaXRvci8iLCJzb3VyY2VzIjpbImxpYi9oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxNQUFNLE9BQU8sY0FBYzs7Ozs7SUFFbEIsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQW1COztZQUMvQyxNQUFNO1FBQ1YsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7OztZQVJGLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBIZWxwZXJzU2VydmljZSB7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlQ2FudmFzRWxlbWVudChpZGVudGlmaWVyPzogc3RyaW5nKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgbGV0IGNhbnZhcztcclxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY2FudmFzLmlkID0gaWRlbnRpZmllciB8fCBEYXRlLm5vdygpO1xyXG4gICAgcmV0dXJuIGNhbnZhcztcclxuICB9XHJcbn1cclxuIl19