import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksManageSourceComponent } from './books-manage-source.component';

describe('BooksManageSourceComponent', () => {
  let component: BooksManageSourceComponent;
  let fixture: ComponentFixture<BooksManageSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksManageSourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BooksManageSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
