import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: any[];
  fields?: FormField[]; // For nested fields
  rows?: number; // For textarea
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  // Input signals
  show = input.required<boolean>({ alias: 'show' });

  title = input<string>('');
  initialValues = input<Record<string, any>>({});
  fields = input<FormField[]>([]);
  
  // Internal state signals
  formData = signal<Record<string, any>>({});
  
  // Computed signals
  isVisible = computed(() => this.show());
  
  // Output signals
  close = output<void>();
  submit = output<Record<string, any>>();
  onCancel = output<void>();
  onSubmit = output<Record<string, any>>();
  
  // Initialize form data when initialValues changes
  constructor() {
    // Watch for changes in initialValues
    // effect(() => {
    //   this.formData.update(() => ({...this.initialValues()}));
    // });
  }

  ngOnChanges() {
    if (this.show()) {
      this.formData.set({...this.initialValues()});
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.close.emit();
    }
  }

  updateFormData(key: string, value: any) {
    this.formData.update(current => ({
      ...current,
      [key]: value
    }));
  }

  handleSubmit() {
    if (this.isValid()) {
      this.submit.emit(this.formData());
    }
  }

  private isValid(): boolean {
    // Add validation logic here
    return Object.keys(this.formData()).length > 0;
  }
}
