import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from "primeng/tooltip";
import { UserDetails, WishlistDetails } from '@app/shared/models/api.models';
import { WishlistService } from '@app/shared/services/wishlist.service';
import { CommonModule } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TimeAgoPipe } from '@app/shared/pipe/time-ago.pipe';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterModule, ButtonModule, TooltipModule, CommonModule, OverlayPanelModule, TimeAgoPipe ],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {
    public authService = inject(AuthService);
    private router = inject(Router);
    private elementRef = inject(ElementRef);
    private _wishlistService = inject(WishlistService);
    private messageService = inject(MessageService);
    public userRole = this.authService.userRole;
    public userName = this.authService.userName;
    public sidebarCollapsed = signal(true);
    public loggedInUserDetails: UserDetails | null = null;
    // public _wishlistCount : number = 0;
    public wlDetails : WishlistDetails[] = [];

    public readonly menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'pi pi-chart-bar' },
        { path: '/books', label: 'Books', icon: 'pi pi-book' },
        { path: '/transactions', label: 'Transactions', icon: 'pi pi-sync' },
        { path: '/admin', label: 'Admin', icon: 'pi pi-shield' },
        { path: '/settings', label: 'Settings', icon: 'pi pi-cog' },
        { path: '/help', label: 'Help', icon: 'pi pi-question-circle' },
    ];

    ngOnInit(): void {

        this.loggedInUserDetails = this.authService.userData() ?? this.authService.userDataTemp;
        this.authService.setUserDetails(this.loggedInUserDetails);
        this.getWishlistCountDetails();
    }

    getWishlistCountDetails(): void {
          this._wishlistService.getWishlistCount().subscribe({
              next: (data: number) => {
                 this.authService.setWishlistCount(data);
              },
              error: (err) => {
                  console.error('Error loading Wishlist Count details:', err);
              }
          });             
    }

    logout(): void {
        this.authService.logout();

        localStorage.clear(); 
        sessionStorage.clear();

        this.router.navigate(['/login'], { replaceUrl: true });
    }

    toggleSidebar(): void {
        this.sidebarCollapsed.update(value => !value);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.sidebarCollapsed()) {
            const sidebar = this.elementRef.nativeElement.querySelector('.sidebar');
            const toggleBtn = this.elementRef.nativeElement.querySelector('.toggle-btn');
            const target = event.target as HTMLElement;

            // If click is not on sidebar and not on toggle button, collapse sidebar
            if (sidebar && !sidebar.contains(target) && toggleBtn && !toggleBtn.contains(target)) {
                this.sidebarCollapsed.set(true);
            }
        }
    }

    isActive(path: string): boolean {
        return this.router.url === path;
    }

    getWishListDetailsForNotification() : void{
        this._wishlistService.getWishlistDetails().subscribe({
            next: (data: WishlistDetails[]) => {
                this.wlDetails = data.filter(x => x.Status == 'Added').sort((a, b) => b.WishlistId - a.WishlistId);
                
            },
            error: (err) => {
                console.error('Error loading Wishlist details:', err);
            }
        });
    }

    clearAllNotifications() : void{
        this.wlDetails = [];
    }

    markAsRead(readNotification : WishlistDetails):void
    {
        if(readNotification !=null)
        {
            this._wishlistService.updateWishlistNotificationDetails(readNotification).subscribe({
                next: (res: any) => {
                    if (!res || !res.Status) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Notification Update - Failed',
                            detail: res ? res.Message : 'Failed to update Wishlist notification. Please try again.'
                        });
                    }
                    else {
                        
                        readNotification.IsNotificationRead = true;
                        if(this.authService.wishlistCount()  >0 )
                        {
                            this.authService.setWishlistCount((this.authService.wishlistCount() - 1));
                        }                        
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Notification Update - Failed',
                        detail: 'Failed to update Wishlist notification. Please try again.'
                    });
                }
            });
        }
        
    }
}
