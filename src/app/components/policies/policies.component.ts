import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  Hotel,
  HotelPolicies,
  PolicyType,
  CancellationPolicy,
  TimePolicy,
  ChildPolicy,
  PetPolicy,
  DressCodePolicy,
  CancellationChargeType,
} from "../../models/types";
import { Subject, takeUntil } from "rxjs";
import { ModalComponent } from "../modal/modal.component";
import { PolicyService } from "../../services/policy.service";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'array' | 'select';  // Added 'select'
  required?: boolean;
  rows?: number;
  dependsOn?: string;
  fields?: FormField[];
  options?: any[];  
}

interface PolicyModalConfig {
  title: string;
  type: PolicyType;
  initialValues: any;
  fields: FormField[];
}

const modalFormFields: FormField[] = [
  {
    name: "description",
    label: "Policy Description",
    type: "textarea",
    required: true,
    rows: 3
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: ["Active", "Inactive"]
  }
];

@Component({
  selector: "app-policies",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinner,
    ModalComponent,
  ],
  templateUrl: "./policies.component.html",
  styleUrl: "./policies.component.scss",
})
export class PoliciesComponent implements OnInit, OnDestroy {
  @Input() hotel: Hotel | null = null;

  policies: HotelPolicies | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  restrictions: string[] = [];

  loadingStates: { [key in PolicyType]?: boolean } = {};
  savingStates: { [key in PolicyType]?: boolean } = {};
  expandedSections: Set<PolicyType> = new Set([PolicyType.CHECK_IN]);
  animationState: { [key: string]: "expanded" | "collapsed" } = {};

  readonly PolicyType = PolicyType;
  readonly CancellationChargeType = CancellationChargeType;

  // Modal properties
  showModal = false;
  modalTitle = "";
  modalFormFields: FormField[] = [];
  modalInitialValues: { [key: string]: any } = {};
  currentEditMode: PolicyType = PolicyType.CANCELLATION;

  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    this.loadPolicies();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["hotel"] && !changes["hotel"].firstChange) {
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
      this.policyService
        .getPolicies(this.hotel.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (policies) => {
            this.policies = policies;
            this.loading = false;
          },
          error: (error) => this.handleError("load policies", error),
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
    this.modalTitle = "Edit Cancellation Policy";
    this.modalFormFields = [
      {
        name: "description",
        label: "Policy Description",
        type: "textarea",
        required: true,
        rows: 3,
      },
      {
        name: "rules",
        label: "Cancellation Rules",
        type: "array",
        fields: [
          {
            name: "daysBeforeArrival",
            label: "Days Before Arrival",
            type: "number",
            required: true,
          },
          {
            name: "charge",
            label: "Charge",
            type: "number",
            required: true,
          },
          {
            name: "chargeType",
            label: "Charge Type",
            type: "select",
            options: Object.values(CancellationChargeType),
            required: true,
          },
        ],
      },
    ];
    this.modalInitialValues =
      policy || this.policyService.getPolicyTemplate(PolicyType.CANCELLATION);
  }

  private setupTimeModal(type: PolicyType.CHECK_IN | PolicyType.CHECK_OUT) {
    const policy =
      type === PolicyType.CHECK_IN
        ? this.policies?.checkIn
        : this.policies?.checkOut;
    const title = type === PolicyType.CHECK_IN ? "Check-In" : "Check-Out";
    this.modalTitle = `Edit ${title} Policy`;
    this.modalFormFields = [
      {
        name: "standardTime",
        label: "Standard Time",
        type: "text",
        required: true,
      },
      {
        name: type === PolicyType.CHECK_IN ? "earliestTime" : "latestTime",
        label:
          type === PolicyType.CHECK_IN
            ? "Earliest Possible Time"
            : "Latest Possible Time",
        type: "text",
      },
      {
        name: "requirements",
        label: "Requirements",
        type: "array",
        fields: [
          {
            name: "requirement",
            label: "Requirement",
            type: "text",
          },
        ],
      },
    ];
    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(type);
  }

  private setupChildPolicyModal() {
    const policy = this.policies?.child;
    this.modalTitle = "Edit Child Policy";
    this.modalFormFields = [
      {
        name: "allowChildren",
        label: "Allow Children",
        type: "checkbox"  // Note the correct format
      },
      {
        name: "maxChildAge",
        label: "Maximum Child Age",
        type: "number",
        required: true
      },
      {
        name: "maxInfantAge",
        label: "Maximum Infant Age",
        type: "number",
        required: true
      },
      {
        name: "childrenStayFree",
        label: "Children Stay Free",  // Removed the colon and fixed the quotes
        type: "checkbox"  // Correct format for checkbox type
      },
      {
        name: "maxChildrenFree",
        label: "Maximum Children Free",
        type: "number",
        dependsOn: "childrenStayFree"
      },
      {
        name: "requiresAdult",
        label: "Adult Required",
        type: "checkbox"
      },
      {
        name: "minAdultAge",
        label: "Minimum Adult Age",
        type: "number",
        required: true
      }
    ];
    this.modalInitialValues = policy || this.policyService.getPolicyTemplate(PolicyType.CHILD);
}

  private setupPetPolicyModal() {
    const policy = this.policies?.pet;
    this.modalTitle = "Edit Pet Policy";
    this.modalFormFields = [
      {
        name: "allowPets",
        label: "Allow Pets",
        type: "checkbox",
      },
      {
        name: "maxPets",
        label: "Maximum Pets Allowed",
        type: "number",
        dependsOn: "allowPets",
      },
      {
        name: "petTypes",
        label: "Accepted Pet Types",
        type: "array",
        dependsOn: "allowPets",
        fields: [
          {
            name: "type",
            label: "Pet Type",
            type: "text",
          },
        ],
      },
      {
        name: "restrictions",
        label: "Restrictions",
        type: "array",
        fields: [
          {
            name: "restriction",
            label: "Restriction",
            type: "text",
          },
        ],
      },
    ];
    this.modalInitialValues =
      policy || this.policyService.getPolicyTemplate(PolicyType.PET);
  }

  private setupDressCodeModal() {
    const policy = this.policies?.dressCode;
    this.modalTitle = "Edit Dress Code Policy";
    this.modalFormFields = [
      {
        name: "general",
        label: "General Dress Code",
        type: "textarea",
        required: true,
      },
    ];
    this.modalInitialValues =
      policy || this.policyService.getPolicyTemplate(PolicyType.DRESS_CODE);
  }

  addArrayItem(fieldName: string, defaultValue: any = "") {
    if (!this.modalInitialValues[fieldName]) {
      this.modalInitialValues[fieldName] = [];
    }
    this.modalInitialValues[fieldName].push(defaultValue);
  }

  removeArrayItem(fieldName: string, index: number) {
    if (
      this.modalInitialValues[fieldName] &&
      Array.isArray(this.modalInitialValues[fieldName])
    ) {
      this.modalInitialValues[fieldName].splice(index, 1);
    }
  }

  handleModalSubmit(formData: any) {
    if (!this.hotel?.id || !this.currentEditMode) return;

    this.loading = true;
    this.policyService
      .updatePolicy(this.hotel.id, this.currentEditMode, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (policies) => {
          if (policies) {
            this.policies = policies;
            this.showModal = false;
          }
          this.loading = false;
        },
        error: (error) => this.handleError("update policy", error),
      });
  }

  handleModalCancel() {
    this.showModal = false;
    this.currentEditMode = PolicyType.CANCELLATION;
    this.modalInitialValues = {};
  }

  private validatePolicyData(type: PolicyType, data: any): boolean {
    switch (type) {
      case PolicyType.CHECK_IN:
      case PolicyType.CHECK_OUT:
        return !!data.standardTime;
      default:
        return true;
    }
  }

  private setupPolicyModal(config: PolicyModalConfig) {
    this.modalTitle = config.title;
    this.currentEditMode = config.type;
    this.modalInitialValues = config.initialValues;
    this.modalFormFields = config.fields;
  }

  private handleError(operation: string, error: any) {
    this.error = `Failed to ${operation}. Please try again.`;
    this.loading = false;
    console.error(`Error ${operation}:`, error);
  }

  applyTemplate(type: PolicyType) {
    if (!this.hotel?.id) return;

    const template = this.policyService.getPolicyTemplate(type);
    this.handleModalSubmit(template);
  }

  
}