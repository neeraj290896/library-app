import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReportBookDetailsComponent } from './view-report-book-details.component';

describe('ViewReportBookDetailsComponent', () => {
  let component: ViewReportBookDetailsComponent;
  let fixture: ComponentFixture<ViewReportBookDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReportBookDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReportBookDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
