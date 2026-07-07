import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFloorComponent } from './manage-floor.component';

describe('ManageFloorComponent', () => {
  let component: ManageFloorComponent;
  let fixture: ComponentFixture<ManageFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFloorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
