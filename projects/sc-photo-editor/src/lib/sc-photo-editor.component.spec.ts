import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScPhotoEditorComponent } from './sc-photo-editor.component';

describe('ScPhotoEditorComponent', () => {
  let component: ScPhotoEditorComponent;
  let fixture: ComponentFixture<ScPhotoEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScPhotoEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScPhotoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
