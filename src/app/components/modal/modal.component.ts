import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: any[];
  fields?: FormField[];
  rows?: number;
  disabled?: boolean;
  defaultValue?: any;
  validations?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent {
  // Input signals
  show = input<boolean>(false);
  title = input<string>("");
  initialValues = input<Record<string, any>>({});
  fields = input<FormField[]>([]);

  // Internal state signals
  formData = signal<Record<string, any>>({});
  loading = signal<boolean>(false);

  // Computed signals
  isVisible = computed(() => this.show());

  // Output signals
  close = output<void>();
  submit = output<Record<string, any>>();

  constructor() {
    effect(() => {
      if (this.show()) {
        this.formData.set({ ...this.initialValues() });
      }
    });
  }

  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("modal-backdrop")) {
      this.close.emit();
    }
  }

  updateFormData(key: string, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : (target as HTMLInputElement | HTMLSelectElement).value;

    this.formData.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  handleSubmit(): void {
    if (this.validateForm()) {
      this.submit.emit(this.formData());
    }
  }

  private validateForm(): boolean {
    const currentFields = this.fields();
    if (!currentFields.length) return false;

    return currentFields.every((field) => {
      const value = this.formData()[field.name];
      if (field.required) {
        return value !== undefined && value !== "";
      }
      return true;
    });
  }
}

