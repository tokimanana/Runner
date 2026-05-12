import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HotelsListComponent } from './hotels-list.component';

describe('HotelsListComponent', () => {
  let component: HotelsListComponent;
  let fixture: ComponentFixture<HotelsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
