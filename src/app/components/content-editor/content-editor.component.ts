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
import { MarketConfigComponent } from '../market-config/market-config.component';
import { CurrencyComponent } from '../currency/currency.component';
import { SpecialOffersComponent } from '../special-offers/special-offers.component';
import { AgeCategoryComponent } from "../age-category/age-category.component";
import { ContractComponent } from "../contract/contract.component";

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
    MarketConfigComponent,
    CurrencyComponent,
    SpecialOffersComponent,
    AgeCategoryComponent,
    ContractComponent
  ],
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit {
  selectedHotel: Hotel | null = null;
  currentMenuItem: MenuItemId = 'description';  // Default to description
  activeTab = 'general';

  menuItems: { [key: string]: MenuItem[] } = {
    general: [
      { id: 'description', icon: 'description', label: 'Description' },
      { id: 'policies', icon: 'policy', label: 'Policies' },
      { id: 'capacity', icon: 'hotel', label: 'Capacity' },
      { id: 'mealPlan', icon: 'fastfood', label: 'Meal Plans' }
    ],
    configuration: [
      { id: 'age-categories', icon: 'people', label: 'Age Categories' },
      { id: 'currency', icon: 'monetization_on', label: 'Currency' },
      { id: 'periodAndMlos', icon: 'date_range', label: 'Periods & MLOS' },
      { id: 'markets', icon: 'public', label: 'Markets' }
    ],
    contracts: [
      { id: 'contract', icon: 'receipt_long', label: 'Contract Management' },
      { id: 'ratesConfig', icon: 'settings', label: 'Rate Configuration' },
      { id: 'rateSeasons', icon: 'calendar_today', label: 'Rate Seasons' }
    ],
    inventory: [
      { id: 'roomInventory', icon: 'inventory_2', label: 'Room Inventory' }
    ],
    offers: [
      { id: 'specialOffers', icon: 'local_offer', label: 'Special Offers' }
    ]
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    // Subscribe to selected hotel changes
    this.hotelService.getSelectedHotel().subscribe(hotel => {
      console.log('Selected hotel changed:', hotel);
      this.selectedHotel = hotel;
    });

    // Subscribe to selected menu item changes
    this.hotelService.getSelectedMenuItem().subscribe(menuItem => {
      console.log('Selected menu item changed:', menuItem);
      // Always ensure we have a valid menu item
      this.currentMenuItem = menuItem || 'description';
    });

    // Subscribe to active tab changes
    this.hotelService.getActiveTab().subscribe(tab => {
      console.log('Active tab changed:', tab);
      this.activeTab = tab;
    });
  }

  getCurrentMenuItems(): MenuItem[] {
    return this.menuItems[this.activeTab] || [];
  }

  onMenuItemClick(item: MenuItem): void {
    console.log('Menu item clicked:', item);
    this.hotelService.setSelectedMenuItem(item.id);
  }
}