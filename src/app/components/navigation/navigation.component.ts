import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, MenuItemId } from '../../models/types';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="nav-menu">
      <div
        *ngFor="let item of menuItems"
        class="nav-item"
        [class.active]="activeItem === item.id"
        (click)="onMenuItemClick(item)"
      >
        <i class="material-icons">{{ item.icon }}</i>
        <span>{{ item.label }}</span>
      </div>
    </nav>
  `,
  styles: [`
    .nav-menu {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      transition: background-color 0.3s;
    }
    .nav-item:hover {
      background: #e9ecef;
    }
    .nav-item.active {
      background: #0d6efd;
      color: white;
    }
    .material-icons {
      margin-right: 0.5rem;
    }
  `]
})
export class NavigationComponent implements OnInit {
  menuItems: MenuItem[] = [
    { id: 'description', label: 'Description', icon: 'description' },
    { id: 'policies', label: 'Policies', icon: 'policy' },
    { id: 'capacity', label: 'Room Types', icon: 'hotel' },
    { id: 'mealPlan', label: 'Meal Plans', icon: 'restaurant' },
    { id: 'periodAndMlos', label: 'Periods & MLOS', icon: 'date_range' },
    { id: 'currency', label: 'Currency Settings', icon: 'currency_exchange' },
    { id: 'ratesConfig', label: 'Rates Configuration', icon: 'settings' }
  ];

  activeItem: MenuItemId = 'description';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.hotelService.getSelectedMenuItem().subscribe(
      menuItem => this.activeItem = menuItem
    );
  }

  onMenuItemClick(item: MenuItem): void {
    this.activeItem = item.id;
    this.hotelService.setSelectedMenuItem(item.id);
  }
}