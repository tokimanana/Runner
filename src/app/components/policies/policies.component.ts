import { Component, OnInit, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hotel, HotelPolicies, PolicyType, CancellationPolicy, TimePolicy, ChildPolicy, PetPolicy, DressCodePolicy, CancellationChargeType } from '../../models/types';
import { Subject, takeUntil } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';
import { PolicyService } from '../../services/policy.service';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css'
})
export class PoliciesComponent implements OnInit, OnDestroy {
  @Input() hotel: Hotel | null = null;
  
  policies: HotelPolicies | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Make enums available in template
  readonly PolicyType = PolicyType;
  readonly CancellationChargeType = CancellationChargeType;

  // Modal related properties
  showModal = false;
  modalTitle = '';
  modalFormFields: any[] = [];
  modalInitialValues: { [key: string]: any } = {};
  currentEditMode: PolicyType | 'description' = PolicyType.CANCELLATION;

  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel'] && !changes['hotel'].firstChange) {
      this.loadPolicies();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPolicies() {
    if (this.hotel?.id) {
      this.loading = true;
      this.error = null;
      
      this.policyService.getPolicies(this.hotel.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (policies) => {
            this.policies = policies;
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load policies. Please try again.';
            this.loading = false;
            console.error('Error loading policies:', error);
          }
        });
    }
  }

  openPolicyModal(type: PolicyType) {
    this.currentEditMode = type;
    
    switch (type) {
      case PolicyType.CANCELLATION:
        this.setupCancellationModal();
        break;
      case PolicyType.CHECK_IN:
      case PolicyType.CHECK_OUT:
        this.setupTimeModal(type);
        break;
      case PolicyType.CHILD:
        this.setupChildPolicyModal();
        break;
      case PolicyType.PET:
        this.setupPetPolicyModal();
        break;
      case PolicyType.DRESS_CODE:
        this.setupDressCodeModal();
        break;
    }
    
    this.showModal = true;
  }

  private setupCancellationModal() {
    const policy = this.policies?.cancellation;
    this.modalTitle = 'Edit Cancellation Policy';
    this.modalFormFields = [
      {
        name: 'description',
        label: 'Policy Description',
        type: 'textarea',
        required: true,
        rows: 3
      },
      {
        name: 'rules',
        label: 'Cancellation Rules',
        type: 'array',
        fields: [
          {
            name: 'daysBeforeArrival',
            label: 'Days Before Arrival',
            type: 'number',
            required: true
          },
          {
            name: 'charge',
            label: 'Charge',
            type: 'number',
            required: true
          },
          {
            name: 'chargeType',
            label: 'Charge Type',
            type: 'select',
            options: Object.values(CancellationChargeType),
            required: true
          }
        ]
      },
      {
        name: 'noShowCharge',
        label: 'No Show Charge',
        type: 'number',
        required: true
      },
      {
        name: 'noShowChargeType',
        label: 'No Show Charge Type',
        type: 'select',
        options: Object.values(CancellationChargeType),
        required: true
      }
    ];

    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(PolicyType.CANCELLATION);
  }

  private setupTimeModal(type: PolicyType.CHECK_IN | PolicyType.CHECK_OUT) {
    const policy = type === PolicyType.CHECK_IN ? this.policies?.checkIn : this.policies?.checkOut;
    const title = type === PolicyType.CHECK_IN ? 'Check-In' : 'Check-Out';
    this.modalTitle = `Edit ${title} Policy`;
    
    this.modalFormFields = [
      {
        name: 'standardTime',
        label: `Standard ${title} Time`,
        type: 'time',
        required: true
      },
      {
        name: type === PolicyType.CHECK_IN ? 'earliestTime' : 'latestTime',
        label: type === PolicyType.CHECK_IN ? 'Earliest Possible Time' : 'Latest Possible Time',
        type: 'time'
      },
      {
        name: 'requirements',
        label: 'Requirements',
        type: 'array',
        fields: [
          {
            name: 'requirement',
            label: 'Requirement',
            type: 'text',
            required: true
          }
        ]
      }
    ];

    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(type);
  }

  private setupChildPolicyModal() {
    const policy = this.policies?.child;
    this.modalTitle = 'Edit Child Policy';
    
    this.modalFormFields = [
      {
        name: 'allowChildren',
        label: 'Allow Children',
        type: 'checkbox',
        required: true
      },
      {
        name: 'maxChildAge',
        label: 'Maximum Child Age',
        type: 'number',
        required: true
      },
      {
        name: 'maxInfantAge',
        label: 'Maximum Infant Age',
        type: 'number',
        required: true
      },
      {
        name: 'childrenStayFree',
        label: 'Children Stay Free',
        type: 'checkbox'
      },
      {
        name: 'maxChildrenFree',
        label: 'Maximum Children Free',
        type: 'number'
      },
      {
        name: 'requiresAdult',
        label: 'Requires Adult',
        type: 'checkbox',
        required: true
      },
      {
        name: 'minAdultAge',
        label: 'Minimum Adult Age',
        type: 'number',
        required: true
      }
    ];

    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(PolicyType.CHILD);
  }

  private setupPetPolicyModal() {
    const policy = this.policies?.pet;
    this.modalTitle = 'Edit Pet Policy';
    
    this.modalFormFields = [
      {
        name: 'allowPets',
        label: 'Allow Pets',
        type: 'checkbox',
        required: true
      },
      {
        name: 'maxPets',
        label: 'Maximum Pets',
        type: 'number',
        required: true
      },
      {
        name: 'petTypes',
        label: 'Accepted Pet Types',
        type: 'array',
        fields: [
          {
            name: 'type',
            label: 'Pet Type',
            type: 'text',
            required: true
          }
        ]
      },
      {
        name: 'restrictions',
        label: 'Restrictions',
        type: 'array',
        fields: [
          {
            name: 'restriction',
            label: 'Restriction',
            type: 'text',
            required: true
          }
        ]
      }
    ];

    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(PolicyType.PET);
  }

  private setupDressCodeModal() {
    const policy = this.policies?.dressCode;
    this.modalTitle = 'Edit Dress Code Policy';
    
    this.modalFormFields = [
      {
        name: 'general',
        label: 'General Dress Code',
        type: 'textarea',
        required: true,
        rows: 3
      },
      {
        name: 'restaurants',
        label: 'Restaurant Dress Codes',
        type: 'array',
        fields: [
          {
            name: 'name',
            label: 'Restaurant Name',
            type: 'text',
            required: true
          },
          {
            name: 'code',
            label: 'Dress Code',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2
          }
        ]
      },
      {
        name: 'publicAreas',
        label: 'Public Area Dress Codes',
        type: 'array',
        fields: [
          {
            name: 'area',
            label: 'Area Name',
            type: 'text',
            required: true
          },
          {
            name: 'code',
            label: 'Dress Code',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 2
          }
        ]
      }
    ];

    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(PolicyType.DRESS_CODE);
  }

  // Array field handling methods
  addArrayItem(fieldName: string, defaultValue: any = '') {
    if (!this.modalInitialValues[fieldName]) {
      this.modalInitialValues[fieldName] = [];
    }
    this.modalInitialValues[fieldName].push(defaultValue);
  }

  removeArrayItem(fieldName: string, index: number) {
    if (this.modalInitialValues[fieldName] && Array.isArray(this.modalInitialValues[fieldName])) {
      this.modalInitialValues[fieldName].splice(index, 1);
    }
  }

  handleModalSubmit(formData: any) {
    if (!this.hotel?.id) return;

    this.loading = true;
    this.policyService.updatePolicy(
      this.hotel.id,
      this.currentEditMode as PolicyType,
      formData
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (policies) => {
        this.policies = policies;
        this.loading = false;
        this.showModal = false;
      },
      error: (error) => {
        this.error = 'Failed to update policy. Please try again.';
        this.loading = false;
        console.error('Error updating policy:', error);
      }
    });
  }

  handleModalCancel() {
    this.showModal = false;
  }

  applyTemplate(type: PolicyType) {
    if (!this.hotel?.id) return;

    const template = this.policyService.getPolicyTemplate(type);
    this.handleModalSubmit(template);
  }
}