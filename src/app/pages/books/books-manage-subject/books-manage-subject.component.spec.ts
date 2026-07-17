import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksManageSubjectComponent } from './books-manage-subject.component';

describe('BooksManageSubjectComponent', () => {
  let component: BooksManageSubjectComponent;
  let fixture: ComponentFixture<BooksManageSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksManageSubjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BooksManageSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
