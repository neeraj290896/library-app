import { Component, computed, effect, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userRole = this.authService.userRole;
  userName = this.authService.userName;

  private readonly menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/members', label: 'Members', icon: '👥' },
    { path: '/add-books', label: 'Add Books', icon: '📖' },
    { path: '/checkout-books', label: 'Check-out Books', icon: '📕' },
    { path: '/staff', label: 'Staff', icon: '👔', librarianOnly: true },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/help', label: 'Help', icon: '❓' },
  ];

  filteredMenuItems = computed(() =>
    this.menuItems.filter(item => {
      if (item.librarianOnly && this.userRole() !== 'librarian') {
        return false;
      }
      return true;
    })
  );

  constructor() {
    effect(() => {
      if (!this.userRole()) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
