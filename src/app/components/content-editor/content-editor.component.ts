import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MenuItem, MenuItemId } from '../../models/types';
import { DescriptionComponent } from '../description/description.component';
import { PoliciesComponent } from '../policies/policies.component';
import { RoomTypesComponent } from '../room-types/room-types.component';
import { MealPlanComponent } from '../meal-plan/meal-plan.component';
import { PeriodMlosComponent } from '../period-mlos/period-mlos.component';
import { RatesConfigComponent } from '../rates-config/rates-config.component';
import { MarketConfigComponent } from '../market-config/market-config.component';
import { CurrencyComponent } from '../currency/currency.component';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    DescriptionComponent,
    PoliciesComponent,
    RoomTypesComponent,
    MealPlanComponent,
    PeriodMlosComponent,
    RatesConfigComponent,
    MarketConfigComponent,
    CurrencyComponent
  ],
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit {
  selectedHotel: Hotel | null = null;
  currentMenuItem: MenuItemId = 'description';
  activeTab = 'general';

  menuItems: { [key: string]: MenuItem[] } = {
    general: [
      { id: 'description', icon: 'description', label: 'Description' },
      { id: 'policies', icon: 'policy', label: 'Policies' },
      { id: 'capacity', icon: 'people', label: 'Room Types' },
      { id: 'mealPlan', icon: 'restaurant', label: 'Meal Plan' }
    ],
    rates: [
      { id: 'markets', icon: 'public', label: 'Markets' },
      { id: 'currency', icon: 'currency_exchange', label: 'Currency Settings' },
      { id: 'periodAndMlos', icon: 'calendar_today', label: 'Period and MLOS' },
      { id: 'ratesConfig', icon: 'tune', label: 'Pricing Configuration' },
      { id: 'rateSeasons', icon: 'date_range', label: 'Seasonal Rates' }
    ],
    inventory: [
      { id: 'roomInventory', icon: 'hotel', label: 'Room Inventory' }
    ],
    offers: [
      { id: 'specialOffers', icon: 'star', label: 'Special Offers' }
    ]
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.hotelService.getSelectedHotel().subscribe(hotel => {
      this.selectedHotel = hotel;
    });

    this.hotelService.getSelectedMenuItem().subscribe(menuItem => {
      this.currentMenuItem = menuItem;
    });

    this.hotelService.getActiveTab().subscribe(tab => {
      this.activeTab = tab;
    });
  }

  getCurrentMenuItems(): MenuItem[] {
    return this.menuItems[this.activeTab] || [];
  }

  onMenuItemClick(item: MenuItem): void {
    this.hotelService.setActiveMenuItem(item.id);
  }
}