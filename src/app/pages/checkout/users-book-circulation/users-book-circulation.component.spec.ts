import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersBookCirculationComponent } from './users-book-circulation.component';

describe('UsersBookCirculationComponent', () => {
  let component: UsersBookCirculationComponent;
  let fixture: ComponentFixture<UsersBookCirculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersBookCirculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersBookCirculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
