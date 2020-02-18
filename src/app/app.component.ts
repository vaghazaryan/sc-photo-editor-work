import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sc-photo-editor-work';
  mode = 'crop';
  source = '';

  changMode() {
    this.mode = this.mode === 'crop' ? 'blur' : 'crop';
  }
}
