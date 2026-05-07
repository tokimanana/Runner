import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomTypesListComponent } from './room-types-list.component';

describe('RoomTypesListComponent', () => {
  let component: RoomTypesListComponent;
  let fixture: ComponentFixture<RoomTypesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
