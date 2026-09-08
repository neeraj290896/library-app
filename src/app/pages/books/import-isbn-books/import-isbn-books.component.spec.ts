import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportIsbnBooksComponent } from './import-isbn-books.component';

describe('ImportIsbnBooksComponent', () => {
  let component: ImportIsbnBooksComponent;
  let fixture: ComponentFixture<ImportIsbnBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportIsbnBooksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportIsbnBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
