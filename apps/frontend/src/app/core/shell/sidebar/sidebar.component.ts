import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { selectUserRole } from '../../auth/store/auth.selectors';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly store = inject(Store);
  readonly userRole$ = this.store.select(selectUserRole);

  readonly isPinned = signal(false);
  readonly isExpanded = signal(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
    },
    {
      label: 'hotels',
      icon: 'pi pi-building',
      route: '/management/hotels',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'seasons',
      icon: 'pi pi-calendar',
      route: '/management/seasons',
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  onMouseEnter(): void {
    if (!this.isPinned()) this.isExpanded.set(true);
  }

  onMouseLeave(): void {
    if (!this.isPinned()) this.isExpanded.set(false);
  }

  togglePin(): void {
    this.isPinned.update((v) => !v);
    this.isExpanded.set(this.isPinned());
  }

  collapse(): void {
    if (!this.isPinned()) this.isExpanded.set(false);
  }
}
