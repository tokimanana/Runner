import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { HotelSelectorComponent } from '../hotel-selector/hotel-selector.component';
import { ContentEditorComponent } from '../content-editor/content-editor.component';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MenuItem, MenuItemId } from '../../models/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    HotelSelectorComponent,
    ContentEditorComponent
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  selectedTabIndex = 0;
  selectedHotel: Hotel | null = null;
  currentMenuItem: MenuItemId = 'description';
  private subscription: Subscription = new Subscription();

  navigationTabs = [
    { id: 'hotel', label: 'Hotel Management', icon: 'business' },
    { id: 'setup', label: 'Configuration', icon: 'settings' },
    { id: 'rates', label: 'Rate Management', icon: 'attach_money' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' }
  ];

  defaultMenuItems: { [key: string]: MenuItemId } = {
    'hotel': 'description',
    'setup': 'age-categories',
    'rates': 'contract',
    'inventory': 'roomInventory'
  };

  menuItems: { [key: string]: MenuItem[] } = {
    'hotel': [
      { id: 'description', icon: 'info', label: 'Basic Information' },
      { id: 'policies', icon: 'policy', label: 'Policies' },
      { id: 'capacity', icon: 'hotel', label: 'Room Types' },
      { id: 'mealPlan', icon: 'restaurant', label: 'Meal Plans' }
    ],
    'setup': [
      { id: 'age-categories', icon: 'people', label: 'Age Categories' },
      { id: 'currency', icon: 'currency_exchange', label: 'Currency Settings' },
      { id: 'markets', icon: 'public', label: 'Markets' },
      { id: 'periodAndMlos', icon: 'calendar_today', label: 'Periods & MLOS' }
    ],
    'rates': [
      { id: 'contract', icon: 'description', label: 'Contract Management' },
      { id: 'ratesConfig', icon: 'price_change', label: 'Rate Configuration' },
      { id: 'supplements', icon: 'add_circle', label: 'Supplements' }
    ],
    'inventory': [
      { id: 'capacity', icon: 'hotel', label: 'Room Inventory' },
      { id: 'mealPlan', icon: 'event_seat', label: 'Room Types' }
    ]
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.hotelService.selectedHotel$.subscribe((hotel: Hotel | null) => {
        this.selectedHotel = hotel;
      })
    );

    this.subscription.add(
      this.hotelService.selectedMenuItem$.subscribe((menuItem: string | null) => {
        if (menuItem && this.isValidMenuItem(menuItem)) {
          this.currentMenuItem = menuItem;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onHotelSelect(hotel: Hotel): void {
    this.hotelService.setSelectedHotel(hotel);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    const tabId = this.navigationTabs[index].id;
    this.hotelService.setActiveTab(tabId);
    // Set the default menu item for the selected tab
    const defaultMenuItem = this.defaultMenuItems[tabId];
    if (defaultMenuItem) {
      this.hotelService.setSelectedMenuItem(defaultMenuItem);
    }
  }

  getCurrentMenuItems(): MenuItem[] {
    return this.menuItems[this.navigationTabs[this.selectedTabIndex].id] || [];
  }

  onMenuItemClick(item: MenuItem): void {
    this.hotelService.setSelectedMenuItem(item.id);
  }

  isMenuItemActive(itemId: string): boolean {
    return this.currentMenuItem === itemId;
  }

  private isValidMenuItem(item: string): item is MenuItemId {
    return Object.values(this.menuItems)
      .flat()
      .some(menuItem => menuItem.id === item);
  }
}