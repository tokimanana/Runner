import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HotelService } from '../../services/hotel.service';
import { MenuItemId } from '../../models/types';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <nav class="nav-container">
      <div class="main-tabs">
        <div
          *ngFor="let tab of mainTabs; let tabIndex = index"
          class="tab-item"
          [class.active]="activeTab === tab.id"
          (click)="onTabClick(tab)"
        >
          <div class="tab-content">
            <mat-icon>{{tab.icon}}</mat-icon>
            <span>{{tab.label}}</span>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-container {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 1rem;
    }

    .main-tabs {
      display: flex;
      gap: 1rem;
    }

    .tab-item {
      padding: 1rem 1.5rem;
      color: #4b5563;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      font-size: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      user-select: none;
      position: relative;
    }

    .tab-item:hover {
      color: #0284c7;
    }

    .tab-item.active {
      color: #0284c7;
      border-bottom-color: #0284c7;
      font-weight: 500;
    }

    .tab-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      line-height: 20px;
      opacity: 0.8;
    }

    .tab-item:hover mat-icon,
    .tab-item.active mat-icon {
      opacity: 1;
    }
  `]
})
export class NavigationComponent implements OnInit {
  mainTabs: TabItem[] = [
    { id: 'general', label: 'General Information', icon: 'dashboard' },
    { id: 'rates', label: 'Rates', icon: 'tune' },
    { id: 'offers', label: 'Offers', icon: 'local_offer' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' }
  ];

  activeTab = 'general';

  private defaultMenuItems: { [key: string]: MenuItemId } = {
    general: 'description',
    rates: 'currency',
    inventory: 'roomInventory',
    offers: 'specialOffers'
  } as const;

  constructor(private hotelService: HotelService) {
    this.hotelService.getActiveTab().subscribe(tab => {
      this.activeTab = tab;
    });
    
    // Initialize with default menu item
    this.hotelService.setActiveTab(this.activeTab);
    this.hotelService.setSelectedMenuItem(this.defaultMenuItems[this.activeTab]);
  }

  ngOnInit() {
    // Subscribe to active tab changes
    this.hotelService.getActiveTab().subscribe(tab => {
      this.activeTab = tab;
    });
    
    // Initialize with default menu item
    this.hotelService.setActiveTab(this.activeTab);
    this.hotelService.setSelectedMenuItem(this.defaultMenuItems[this.activeTab]);
  }

  onTabClick(tab: TabItem) {
    this.hotelService.setActiveTab(tab.id);
    this.hotelService.setSelectedMenuItem(this.defaultMenuItems[tab.id]);
  }

  onTabChange(tabIndex: number): void {
    this.hotelService.setSelectedMenuItem(this.defaultMenuItems[tabIndex]);
  }

  setDefaultTab(tabIndex: number): void {
    this.hotelService.setSelectedMenuItem(this.defaultMenuItems[tabIndex]);
  }
}