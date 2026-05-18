import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTransactiontypeComponent } from './manage-transactiontype.component';

describe('ManageTransactiontypeComponent', () => {
  let component: ManageTransactiontypeComponent;
  let fixture: ComponentFixture<ManageTransactiontypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTransactiontypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTransactiontypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
