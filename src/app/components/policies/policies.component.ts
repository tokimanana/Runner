import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/types';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="policies-container">
      <div class="policy-section">
        <h3>Cancellation Policy</h3>
        <textarea
          [(ngModel)]="cancellationPolicy"
          (blur)="savePolicies()"
          rows="8"
          placeholder="Enter cancellation policy details..."
          class="policy-textarea"
        ></textarea>
      </div>

      <div class="policy-section">
        <h3>Check-In/Out Policy</h3>
        <textarea
          [(ngModel)]="checkInOutPolicy"
          (blur)="savePolicies()"
          rows="8"
          placeholder="Enter check-in/out policy details..."
          class="policy-textarea"
        ></textarea>
      </div>

      <div class="policy-templates">
        <h3>Quick Templates</h3>
        <div class="template-buttons">
          <button (click)="applyTemplate('cancellation', 'standard')" class="template-btn">
            Standard Cancellation
          </button>
          <button (click)="applyTemplate('cancellation', 'flexible')" class="template-btn">
            Flexible Cancellation
          </button>
          <button (click)="applyTemplate('checkInOut', 'standard')" class="template-btn">
            Standard Check-In/Out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policies-container {
      padding: 1rem;
      display: grid;
      gap: 2rem;
    }

    .policy-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .policy-textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      line-height: 1.5;
      resize: vertical;
    }

    .policy-templates {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .template-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .template-btn {
      padding: 0.5rem 1rem;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .template-btn:hover {
      background: #0b5ed7;
    }

    h3 {
      margin-bottom: 1rem;
      color: #333;
    }
  `]
})
export class PoliciesComponent implements OnInit {
  @Input() hotel!: Hotel;
  cancellationPolicy: string = '';
  checkInOutPolicy: string = '';

  private templates = {
    cancellation: {
      standard: `Cancellations made:
- More than 30 days prior to arrival: Full refund
- 15-30 days prior to arrival: 50% charge
- Less than 15 days prior to arrival: No refund
- No-show: Full charge for the entire stay`,
      flexible: `Flexible Cancellation Policy:
- Free cancellation up to 48 hours before arrival
- Less than 48 hours: First night charge
- No-show: First night charge`
    },
    checkInOut: {
      standard: `Check-in: 3:00 PM
Check-out: 11:00 AM

Early check-in and late check-out available upon request and subject to availability.
Additional fees may apply.`
    }
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      const policies = this.hotelService.getHotelPolicies(this.hotel.id);
      this.cancellationPolicy = policies.cancellation;
      this.checkInOutPolicy = policies.checkInOut;
    }
  }

  savePolicies() {
    if (this.hotel) {
      this.hotelService.saveHotelPolicies(this.hotel.id, {
        cancellation: this.cancellationPolicy,
        checkInOut: this.checkInOutPolicy
      });
    }
  }

  applyTemplate(policyType: 'cancellation' | 'checkInOut', template: string) {
    if (policyType === 'cancellation') {
      this.cancellationPolicy = this.templates.cancellation[template as keyof typeof this.templates.cancellation];
    } else {
      this.checkInOutPolicy = this.templates.checkInOut[template as keyof typeof this.templates.checkInOut];
    }
    this.savePolicies();
  }
}