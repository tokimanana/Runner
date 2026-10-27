import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferPeriodDialogComponent } from './offer-period-dialog.component';

describe('OfferPeriodDialogComponent', () => {
  let component: OfferPeriodDialogComponent;
  let fixture: ComponentFixture<OfferPeriodDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferPeriodDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
