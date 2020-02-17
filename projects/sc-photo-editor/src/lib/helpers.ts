import { Injectable } from '@angular/core';

@Injectable()
export class HelpersService {

  public static createCanvasElement(identifier?: string): HTMLCanvasElement {
    let canvas;
    canvas = document.createElement('canvas');
    canvas.id = identifier || Date.now();
    return canvas;
  }
}
