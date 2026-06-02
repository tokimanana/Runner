import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { MealPlan } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MealPlansFormComponent } from '../meal-plans-form/meal-plans-form.component';
import { MealPlansService } from '../meal-plans.service';

@Component({
  selector: 'app-meal-plans-list',
  imports: [
    AsyncPipe,
    TableModule,
    Button,
    ConfirmDialog,
    ToastModule,
    MealPlansFormComponent,
  ],
  templateUrl: './meal-plans-list.component.html',
  styleUrl: './meal-plans-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlansListComponent {
  private readonly mealPlansService = inject(MealPlansService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly mealPlanForm = viewChild(MealPlansFormComponent);
  readonly mealPlans$ = this.mealPlansService.getAll();
  readonly loading$ = this.mealPlansService.loading$;

  onAddMealPlan(): void {
    this.mealPlanForm()?.open();
  }

  onEditMealPlan(mealPlan: MealPlan): void {
    this.mealPlanForm()?.open(mealPlan);
  }

  onMealPlanSaved(): void {
    this.mealPlanForm()?.close();
  }

  confirmDelete(mealPlan: MealPlan): void {
    confirmDelete({
      header: 'Delete Meal Plan',
      entityName: mealPlan.name,
      delete$: this.mealPlansService.remove(mealPlan.id),
      conflictMessage: `"${mealPlan.name}" is used in existing contracts.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }
}
