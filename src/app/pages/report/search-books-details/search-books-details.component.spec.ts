import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBooksDetailsComponent } from './search-books-details.component';

describe('SearchBooksDetailsComponent', () => {
  let component: SearchBooksDetailsComponent;
  let fixture: ComponentFixture<SearchBooksDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBooksDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBooksDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
