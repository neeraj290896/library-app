import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReturnedBooksComponent } from './manage-returned-books.component';

describe('ManageReturnedBooksComponent', () => {
  let component: ManageReturnedBooksComponent;
  let fixture: ComponentFixture<ManageReturnedBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageReturnedBooksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReturnedBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
