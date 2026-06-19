import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingDetails, UserDetails } from '@app/shared/models/api.models';
import { AdminService } from '@app/shared/services/admin.service';
import { AuthService } from '@app/shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ButtonModule, FormsModule, InputTextModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

private messageService = inject(MessageService);
private _authService = inject(AuthService);
private _adminService = inject(AdminService);
public loggedInUserDetails: any = {};
public settingDetails: SettingDetails = {SettingId: 0, CutOffDays: 90, FinePercentage: 1, EnableFineRule: true, EnableEmailNotification: true, EnableWishlistNotification: true,
    EnableMobileNotification: false, IsActive : true};

  ngOnInit(): void {
    this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
    this.loadSettingDetails();
  }

  loadSettingDetails(): void {
    this._adminService.getSettingDetails().subscribe({
        next: (data: SettingDetails[]) => {                  
            const filteredData = data.filter(x => x.IsActive == true);
            if(filteredData !=null)
            {
              this.settingDetails = filteredData[0];
            }           
        },
        error: (err) => {
            console.error('Error loading role:', err);
        }
    });
  }

  
}
