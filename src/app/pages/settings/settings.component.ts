import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingDetails } from '@app/shared/models/api.models';
import { AdminService } from '@app/shared/services/admin.service';
import { AuthService } from '@app/shared/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AccordionModule } from 'primeng/accordion';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        ButtonModule, FormsModule, InputTextModule, CommonModule, CheckboxModule,
        InputGroupModule, InputGroupAddonModule, AccordionModule
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    private messageService = inject(MessageService);
    private _authService = inject(AuthService);
    private _adminService = inject(AdminService);
    public loggedInUserDetails: any = {};
    public settingDetails: SettingDetails = {
        SettingId: 0, CutOffDays: 90, FinePercentage: 1, EnableFineRule: true, EnableEmailNotification: true, EnableWishlistNotification: true,
        EnableMobileNotification: false, IsActive: true
    };
    public finePercentage: string = "";
    public errors: { CutOffDays: string, FinePercentage: string } = { CutOffDays: '', FinePercentage: '' };

    ngOnInit(): void {
        this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
        this.loadSettingDetails();
    }

    loadSettingDetails(): void {
        this._adminService.getSettingDetails().subscribe({
            next: (data: SettingDetails[]) => {
                const filteredData = data.filter(x => x.IsActive == true);
                if (filteredData != null) {
                    this.settingDetails = filteredData[0];

                    if (this.settingDetails.FinePercentage > 0) {
                        this.finePercentage = (this.settingDetails.FinePercentage * 100).toString();
                    }
                }
            },
            error: (err) => {
                console.error('Error loading role:', err);
            }
        });
    }

    validateInput(key: string, value: any): boolean {
        let isValid = true;

        switch (key) {
            case 'CutOffDays':
                if (!/^\d+$/.test(value?.toString().trim() ?? '') || Number(value) <= 0) {
                    this.errors.CutOffDays = 'Cut-Off Days is required and must be a valid input.';
                    isValid = false;
                } else {
                    this.errors.CutOffDays = '';
                }
                break;

            case 'FinePercentage':
                if (!/^\d+(\.\d+)?$/.test(value?.toString().trim() ?? '') || Number(value) <= 0) {
                    this.errors.FinePercentage = 'Fine Percentage is required  and must be a valid input.';
                    this.settingDetails.FinePercentage = 0.00;
                    isValid = false;
                } else {
                    this.errors.FinePercentage = '';
                    this.settingDetails.FinePercentage = Math.round(((parseInt(value) / 100) + Number.EPSILON) * 100) / 100;
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateAplnSettings(): boolean {
        const isCutOffDays = this.validateInput('CutOffDays', this.settingDetails.CutOffDays);
        const isFinePercentage = this.validateInput('FinePercentage', (this.settingDetails.FinePercentage * 100).toString());

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
