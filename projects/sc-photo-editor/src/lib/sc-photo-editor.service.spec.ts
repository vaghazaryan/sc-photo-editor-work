import { TestBed } from '@angular/core/testing';

import { ScPhotoEditorService } from './sc-photo-editor.service';

describe('ScPhotoEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScPhotoEditorService = TestBed.get(ScPhotoEditorService);
    expect(service).toBeTruthy();
  });
});
