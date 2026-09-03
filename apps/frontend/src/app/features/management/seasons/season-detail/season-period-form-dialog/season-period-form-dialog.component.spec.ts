import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeasonPeriodFormDialogComponent } from './season-period-form-dialog.component';

describe('SeasonPeriodFormDialogComponent', () => {
  let component: SeasonPeriodFormDialogComponent;
  let fixture: ComponentFixture<SeasonPeriodFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonPeriodFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonPeriodFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
