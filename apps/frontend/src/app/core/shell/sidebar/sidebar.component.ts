import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
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
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly store = inject(Store);
  readonly userRole$ = this.store.select(selectUserRole);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
    },
    {
      label: 'Hôtels',
      icon: 'pi pi-building',
      route: '/hotels',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Saisons',
      icon: 'pi pi-calendar',
      route: '/saisons',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Contrats',
      icon: 'pi pi-file',
      route: '/contrats',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Offres',
      icon: 'pi pi-tag',
      route: '/offres',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Booking',
      icon: 'pi pi-ticket',
      route: '/booking',
      roles: ['ADMIN', 'MANAGER', 'AGENT'],
    },
  ];
}
