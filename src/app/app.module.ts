import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {ScPhotoEditorModule} from '../../projects/sc-photo-editor/src/lib/sc-photo-editor.module';

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        ScPhotoEditorModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
