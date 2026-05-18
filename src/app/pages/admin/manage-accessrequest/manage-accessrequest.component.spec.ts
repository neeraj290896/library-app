import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccessrequestComponent } from './manage-accessrequest.component';

describe('ManageAccessrequestComponent', () => {
  let component: ManageAccessrequestComponent;
  let fixture: ComponentFixture<ManageAccessrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccessrequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAccessrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
