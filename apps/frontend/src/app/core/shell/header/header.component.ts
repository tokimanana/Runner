import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { selectCurrentUser } from '../../auth/store/auth.selectors';
import { AuthActions } from '../../auth/store/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly store = inject(Store);
  readonly currentUser$ = this.store.select(selectCurrentUser);

  getMenuItems(user: {
    firstName: string;
    lastName: string;
    role: string;
  }): MenuItem[] {
    return [
      {
        label: `${user.firstName} ${user.lastName}`,
        items: [
          { label: user.role, icon: 'pi pi-id-card', disabled: true },
          { separator: true },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.store.dispatch(AuthActions.logout()),
          },
        ],
      },
    ];
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  }
}
