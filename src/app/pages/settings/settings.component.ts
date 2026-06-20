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
public finePercentage: string = "";
public errors: { CutOffDays: string, FinePercentage: string } = { CutOffDays: '', FinePercentage: ''};

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

              if(this.settingDetails.FinePercentage > 0)
              {
                this.finePercentage = (this.settingDetails.FinePercentage * 100 ) + ' %';
              }
            }           
        },
        error: (err) => {
            console.error('Error loading role:', err);
        }
    });
  }

  onPercentageChange() : void{
    // console.log('this.finePercentage :', this.finePercentage);
    if(this.finePercentage.trim() !=""  && this.finePercentage.trim() !="%")
    {
      let _fineValue = this.finePercentage.trim().replace('%','');
      this.settingDetails.FinePercentage = (parseInt(_fineValue) / 100);
    }
    else
    {
      this.settingDetails.FinePercentage = 0.0;
    }

    this.validateInput('FinePercentage');
  }

  validateNumberInput(event: KeyboardEvent, allowedKeys : string[]): void {    
    const isNumber = event.key >= '0' && event.key <= '9';

    // If it's not a number and not in our allowed keys list, block the input
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'CutOffDays':
                if (!(this.settingDetails.CutOffDays!=null && this.settingDetails.CutOffDays > 0)) {
                    this.errors.CutOffDays = 'Cut-Off-Days is required.';
                    isValid = false;
                } else {
                    this.errors.CutOffDays = '';
                }
                break;

            case 'FinePercentage':
                if (!(this.settingDetails.FinePercentage != null && this.settingDetails.FinePercentage > 0)) {
                    this.errors.FinePercentage = 'FinePercentage is required.';
                    isValid = false;
                } else {
                    this.errors.FinePercentage = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateAplnSettings(): boolean {
        const isCutOffDays = this.validateInput('CutOffDays');
        const isFinePercentage = this.validateInput('FinePercentage');
        
        return isCutOffDays && isFinePercentage;
    }

    saveAplnSettings(): void {
        if (!this.validateAplnSettings()) {
            return;
        }

        const payload = this.settingDetails;
        this._adminService.updateSettingDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Application Settings - Failed',
                        detail: res ? res.Message : 'Failed to update Application Settings. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Application Settings - Success',
                        detail: 'Application Settings updated successfully.'
                    });
                }               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Application Settings - Failed',
                    detail: 'Failed to update Application Settings. Please try again.'
                });
            }
        });
    }
  
}
