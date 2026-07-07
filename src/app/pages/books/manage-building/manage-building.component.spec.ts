import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBuildingComponent } from './manage-building.component';

describe('ManageBuildingComponent', () => {
  let component: ManageBuildingComponent;
  let fixture: ComponentFixture<ManageBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBuildingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
