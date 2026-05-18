import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBookCirculationComponent } from './manage-book-circulation.component';

describe('ManageBookCirculationComponent', () => {
  let component: ManageBookCirculationComponent;
  let fixture: ComponentFixture<ManageBookCirculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBookCirculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBookCirculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
