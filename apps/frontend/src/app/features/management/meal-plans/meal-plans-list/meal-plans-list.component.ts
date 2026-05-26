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
import { take } from 'rxjs';
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

  confirmDelete(mealPlan: MealPlan): void {
    this.confirmationService.confirm({
      header: 'Delete Meal Plan',
      message: `Are you sure you want to delete "${mealPlan.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mealPlansService
          .remove(mealPlan.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: `"${mealPlan.name}" has been deleted.`,
              });
            },
            error: (err) => {
              this.messageService.add({
                severity: err.status === 409 ? 'warn' : 'error',
                summary: err.status === 409 ? 'Cannot delete' : 'Error',
                detail:
                  err.status === 409
                    ? `"${mealPlan.name}" is used in existing contracts.`
                    : 'An unexpected error occurred. Please try again.',
              });
            },
          });
      },
    });
  }
}
