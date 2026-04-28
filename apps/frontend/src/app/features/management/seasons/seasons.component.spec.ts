import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeasonsComponent } from './seasons.component';

describe('SeasonsComponent', () => {
  let component: SeasonsComponent;
  let fixture: ComponentFixture<SeasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
