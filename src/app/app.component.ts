import { Component, ViewChild } from '@angular/core';
import { IRotateOption, IScPhotoEditor } from '../../projects/sc-photo-editor/src/lib/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements IScPhotoEditor {
  @ViewChild('scPhotoEditor') scPhotoEditor: IScPhotoEditor;

  constructor() {}
  title = 'sc-photo-editor-work';
  mode = 'crop';
  source = '';
  aspect = 3 / 4;

  changMode() {
    this.mode = this.mode === 'crop' ? 'blur' : 'crop';
  }

  changed(event) {
    this.source = event.source;
  }

  cancelBlur(): void {
    this.scPhotoEditor.cancelBlur();
  }

  setScaleLevel(scaleLevel: number): void {
    this.scPhotoEditor.setScaleLevel(scaleLevel);
  }

  rotate(option: IRotateOption): void {
    this.scPhotoEditor.rotate(option);
  }

  applyBlur() {
    this.scPhotoEditor.applyBlur();
  }

  scale(event) {
    console.log(event.target.value);
    this.scPhotoEditor.setScaleLevel(event.target.value);
  }

  rotateLeft() {
    this.rotate(IRotateOption.Left);
  }

  rotateRight() {
    this.rotate(IRotateOption.Right);
  }
}
