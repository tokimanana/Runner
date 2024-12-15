import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { ContractService } from '../../services/contract.service';
import { Hotel, MenuItem, MenuItemId, Contract } from '../../models/types';
import { DescriptionComponent } from '../description/description.component';
import { PoliciesComponent } from '../policies/policies.component';
import { RoomTypesComponent } from '../room-types/room-types.component';
import { MealPlanComponent } from '../meal-plan/meal-plan.component';
import { PeriodMlosComponent } from '../period-mlos/period-mlos.component';
import { MarketConfigComponent } from '../market-config/market-config.component';
import { AgeCategoryComponent } from "../age-category/age-category.component";
import { ContractListComponent } from '../contract/contract-management/contract-list/contract-list.component';
import { DEFAULT_MENU_ITEM } from '../../config/menu.config';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyComponent } from '../currency/currency.component';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    DescriptionComponent,
    PoliciesComponent,
    RoomTypesComponent,
    MealPlanComponent,
    PeriodMlosComponent,
    AgeCategoryComponent,
    MarketConfigComponent,
    CurrencyComponent,
    ContractListComponent,
  ],
  standalone: true
})
export class ContentEditorComponent implements OnInit {
  selectedHotel: Hotel | null = null;
  currentMenuItem: MenuItemId = DEFAULT_MENU_ITEM;
  selectedContract: Contract | null = null;

  constructor(
    private hotelService: HotelService,
    private contractService: ContractService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to hotel selection changes
    this.hotelService.selectedHotel$.subscribe(hotel => {
      this.selectedHotel = hotel;
      if (!hotel) {
        this.selectedContract = null;
      }
    });

    // Subscribe to menu item changes
    this.hotelService.selectedMenuItem$.subscribe(menuItem => {
      if (menuItem) {
        this.currentMenuItem = menuItem;
        if (menuItem !== 'contract' && menuItem !== 'ratesConfig') {
          this.selectedContract = null;
        }
      }
    });
  }

  goToContractList() {
    this.currentMenuItem = 'contract';
  }
}
