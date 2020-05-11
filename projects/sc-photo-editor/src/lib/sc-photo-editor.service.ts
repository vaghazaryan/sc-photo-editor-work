import { Injectable } from '@angular/core';
import { IRotateOption } from './types';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScPhotoEditorService {
  private _rotation$: Subject<IRotateOption> = new Subject();
  private _applyBlur: Subject<any> = new Subject();

  public rotation$ = this._rotation$.asObservable();
  public applyBlur$ = this._applyBlur.asObservable();

  constructor() { }

  rotate(option: IRotateOption) {
    this._rotation$.next(option);
  }

  applyBlur() {
    this._applyBlur.next();
  }
}
