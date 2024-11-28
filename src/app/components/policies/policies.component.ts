import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hotel, HotelPolicies } from '../../models/types';
import { HotelService } from '../../services/hotel.service';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css'
})
export class PoliciesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel: Hotel | null = null;
  
  policies: HotelPolicies | null = null;
  hotelDescription: string = '';
  private subscriptions: Subscription[] = [];

  // Modal related properties
  showModal = false;
  modalTitle = '';
  modalFormFields: any[] = [];
  modalInitialValues: { [key: string]: any } = {};
  currentEditMode: 'description' | 'cancellation' | 'checkInOut' = 'description';

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel'] && !changes['hotel'].firstChange) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData() {
    if (this.hotel) {
      // Load hotel description
      const descSub = this.hotelService.getHotelDescription().subscribe(
        description => this.hotelDescription = description || ''
      );
      
      // Load hotel policies
      const policiesSub = this.hotelService.getHotelPolicies().subscribe(
        policies => this.policies = policies
      );

      this.subscriptions.push(descSub, policiesSub);
    }
  }

  openDescriptionModal() {
    this.currentEditMode = 'description';
    this.modalTitle = 'Edit Hotel Description';
    this.modalFormFields = [
      {
        name: 'description',
        label: 'Hotel Description',
        type: 'textarea',
        required: true,
        rows: 10
      }
    ];
    this.modalInitialValues = {
      description: this.hotelDescription
    };
    this.showModal = true;
  }

  openPolicyModal(type: 'cancellation' | 'checkInOut') {
    this.currentEditMode = type;
    if (type === 'cancellation') {
      this.modalTitle = 'Edit Cancellation Policy';
      this.modalFormFields = [
        {
          name: 'policy',
          label: 'Cancellation Policy',
          type: 'textarea',
          required: true,
          rows: 10
        }
      ];
      this.modalInitialValues = {
        policy: this.policies?.cancellation || ''
      };
    } else {
      this.modalTitle = 'Edit Check-In/Out Policy';
      this.modalFormFields = [
        {
          name: 'checkIn',
          label: 'Check-In Policy',
          type: 'textarea',
          required: true,
          rows: 5
        },
        {
          name: 'checkOut',
          label: 'Check-Out Policy',
          type: 'textarea',
          required: true,
          rows: 5
        }
      ];
      this.modalInitialValues = {
        checkIn: this.policies?.checkIn || '',
        checkOut: this.policies?.checkOut || ''
      };
    }
    this.showModal = true;
  }

  handleModalSubmit(formData: any) {
    if (!this.hotel) return;

    switch (this.currentEditMode) {
      case 'description':
        this.hotelService.saveHotelData(this.hotel.id, 'description', formData.description).subscribe(
          () => {
            this.hotelDescription = formData.description;
            this.showModal = false;
          }
        );
        break;

      case 'cancellation':
        const updatedCancellationPolicies: HotelPolicies = {
          ...this.policies,
          cancellation: formData.policy
        } as HotelPolicies;
        this.hotelService.saveHotelPolicies(this.hotel.id, updatedCancellationPolicies);
        this.policies = updatedCancellationPolicies;
        this.showModal = false;
        break;

      case 'checkInOut':
        const updatedCheckInOutPolicies: HotelPolicies = {
          ...this.policies,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        } as HotelPolicies;
        this.hotelService.saveHotelPolicies(this.hotel.id, updatedCheckInOutPolicies);
        this.policies = updatedCheckInOutPolicies;
        this.showModal = false;
        break;
    }
  }

  handleModalCancel() {
    this.showModal = false;
  }

  applyTemplate(type: 'cancellation' | 'checkInOut', template: string) {
    if (!this.hotel) return;

    let updatedPolicies: HotelPolicies;
    
    switch (template) {
      case 'standard':
        if (type === 'cancellation') {
          updatedPolicies = {
            ...this.policies,
            cancellation: 'Standard cancellation policy:\n' +
              '- Free cancellation up to 48 hours before check-in\n' +
              '- Cancellations within 48 hours of check-in will be charged one night\'s stay\n' +
              '- No-shows will be charged the full amount of the stay'
          } as HotelPolicies;
        } else {
          updatedPolicies = {
            ...this.policies,
            checkIn: '3:00 PM - Early check-in subject to availability',
            checkOut: '11:00 AM - Late check-out available for additional fee'
          } as HotelPolicies;
        }
        break;
      
      case 'flexible':
        if (type === 'cancellation') {
          updatedPolicies = {
            ...this.policies,
            cancellation: 'Flexible cancellation policy:\n' +
              '- Free cancellation up to 24 hours before check-in\n' +
              '- Same-day cancellations will be charged 50% of one night\'s stay\n' +
              '- No-shows will be charged one night\'s stay'
          } as HotelPolicies;
        } else {
          return; // No flexible template for check-in/out
        }
        break;

      default:
        return;
    }

    this.hotelService.saveHotelPolicies(this.hotel.id, updatedPolicies);
    this.policies = updatedPolicies;
  }
}