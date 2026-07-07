import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRackComponent } from './manage-rack.component';

describe('ManageRackComponent', () => {
  let component: ManageRackComponent;
  let fixture: ComponentFixture<ManageRackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
