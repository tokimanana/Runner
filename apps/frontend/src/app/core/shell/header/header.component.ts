import { ThemeService } from '@/app/shared/services/theme.service';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { AuthActions } from '../../auth/store/auth.actions';
import { selectCurrentUser } from '../../auth/store/auth.selectors';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, AvatarModule, MenuModule, ButtonModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly store = inject(Store);
  readonly theme = inject(ThemeService);
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
