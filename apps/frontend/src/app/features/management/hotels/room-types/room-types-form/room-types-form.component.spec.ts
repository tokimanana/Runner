import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomTypesFormComponent } from './room-types-form.component';

describe('RoomTypesFormComponent', () => {
  let component: RoomTypesFormComponent;
  let fixture: ComponentFixture<RoomTypesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomTypesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
