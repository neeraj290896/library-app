import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from "primeng/tooltip";

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterModule, ButtonModule, TooltipModule],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    userRole = this.authService.userRole;
    userName = this.authService.userName;
    sidebarCollapsed = signal(false);

    private readonly menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'pi pi-chart-bar' },
        { path: '/books', label: 'Books', icon: 'pi pi-book' },
        { path: '/checkout', label: 'Check-In/Out', icon: 'pi pi-sync' },
        { path: '/admin', label: 'Admin', icon: 'pi pi-shield', librarianOnly: true },
        { path: '/settings', label: 'Settings', icon: 'pi pi-cog' },
        { path: '/help', label: 'Help', icon: 'pi pi-question-circle' },
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

    toggleSidebar(): void {
        this.sidebarCollapsed.update(value => !value);
    }

    isActive(path: string): boolean {
        return this.router.url === path;
    }
}
