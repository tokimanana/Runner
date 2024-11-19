import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MenuItemId } from '../../models/types';
import { DescriptionComponent } from '../description/description.component';
import { PoliciesComponent } from '../policies/policies.component';
import { RoomTypesComponent } from '../room-types/room-types.component';
import { MealPlanComponent } from '../meal-plan/meal-plan.component';
import { PeriodMlosComponent } from '../period-mlos/period-mlos.component';
import { CurrencyComponent } from '../currency/currency.component';
import { RatesConfigComponent } from '../rates-config/rates-config.component';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DescriptionComponent,
    PoliciesComponent,
    RoomTypesComponent,
    MealPlanComponent,
    PeriodMlosComponent,
    CurrencyComponent,
    RatesConfigComponent
  ],
  template: `
    <div class="content-editor" *ngIf="selectedHotel; else noHotel">
      <div [ngSwitch]="currentMenuItem">
        <app-description 
          *ngSwitchCase="'description'"
          [hotel]="selectedHotel"
        ></app-description>
        
        <app-policies
          *ngSwitchCase="'policies'"
          [hotel]="selectedHotel"
        ></app-policies>
        
        <app-room-types
          *ngSwitchCase="'capacity'"
          [hotel]="selectedHotel"
        ></app-room-types>
        
        <app-meal-plan
          *ngSwitchCase="'mealPlan'"
          [hotel]="selectedHotel"
        ></app-meal-plan>
        
        <app-period-mlos
          *ngSwitchCase="'periodAndMlos'"
          [hotel]="selectedHotel"
        ></app-period-mlos>
        
        <app-currency
          *ngSwitchCase="'currency'"
          [hotel]="selectedHotel"
        ></app-currency>
        
        <app-rates-config
          *ngSwitchCase="'ratesConfig'"
          [hotel]="selectedHotel"
        ></app-rates-config>
      </div>
    </div>

    <ng-template #noHotel>
      <div class="no-hotel">
        Please select a hotel to begin editing
      </div>
    </ng-template>
  `,
  styles: [`
    .content-editor {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .no-hotel {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #6c757d;
    }
  `]
})
export class ContentEditorComponent implements OnInit {
  selectedHotel: Hotel | null = null;
  currentMenuItem: MenuItemId = 'description';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.hotelService.getSelectedHotel().subscribe(hotel => {
      this.selectedHotel = hotel;
    });

    this.hotelService.getSelectedMenuItem().subscribe(menuItem => {
      this.currentMenuItem = menuItem;
    });
  }
}