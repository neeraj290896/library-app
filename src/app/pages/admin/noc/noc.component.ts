import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { UserDetails } from '@app/shared/models/api.models';
import { AuthService } from '@app/shared/services/auth.service';
import { UserService } from '@app/shared/services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-noc',
  imports: [ConfirmDialogModule, CommonModule, ButtonModule],
  providers: [ConfirmationService],
  templateUrl: './noc.component.html',
  styleUrl: './noc.component.scss'
})
export class NocComponent {

  @Input() public selectedUserDetails: UserDetails = {};
  @ViewChild('printArea') printArea!: ElementRef;

  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  public authService = inject(AuthService);
  public libraryName : string = environment.OrganizationDetails.OrganizationName;
  public isEmailOptionEnabled: boolean = false;
  public organizationImagePath : string = environment.OrganizationDetails.ImagePath;

  ngOnInit(){
    this.libraryName = this.authService.organizationDetails()?.OrganizationName || environment.OrganizationDetails.OrganizationName;
     if(this.authService.organizationDetails()?.ImagePath) {
          this.organizationImagePath = environment.apiUrl + environment.uploadedFilesPath + this.authService.organizationDetails()?.ImagePath;
      }
      else{
          this.organizationImagePath = 'assets/images/'+ environment.OrganizationDetails.ImagePath;
      }
    this.isEmailOptionEnabled = this.authService.settingsDetails()?.EnableEmailNotification ?? false;
  }

  confirmAndDeActivateUserProfile() {

    if(this.selectedUserDetails.IsActive)
    {
      this.confirmationService.confirm({
                            message: "Do you want to De-Activate User Profile?",
                            header: 'De-Activation Confirmation',
                            icon: 'pi pi-user-minus',
                            acceptLabel: 'Yes',
                            rejectLabel: 'No',
                            accept: () => {
                              
                              this.deleteUser(this.selectedUserDetails);
                              this.printCertificate();

                            },
                            reject: () => {
                                this.printCertificate();
                            }
                        });
    }
    else
    {
      this.printCertificate();
    }    
  }

  printCertificate() {
    const printContents = this.printArea.nativeElement.innerHTML;
    
    let styles = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
      styles += node.outerHTML;
    });

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>&nbsp;</title> <!-- Leaving this blank or &nbsp; hides the top header title text string -->
            ${styles}
            <style>
              /* 1. Remove browser header/footer text by zeroing the page margin */
              @page { 
                margin: 0 !important; 
              }
              
              /* 2. Re-introduce uniform breathing room on the body layout instead */
              body { 
                margin: 0 !important;
                padding: 2.5cm 2cm 2cm 2cm !important; /* Top, Right, Bottom, Left margins for the content */
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                font-family: sans-serif;
              }
              
              .no-print, p-button, button { 
                display: none !important; 
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    }
  }


  deleteUser(_user: UserDetails): void {
    const payload = _user;
    this.userService.deleteUserDetails(payload).subscribe({
        next: (res: any) => {
            if (!res || !res.Status) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'De-Activation of User Profile - Failed',
                    detail: res ? res.Message : "Failed to de-activate user's profile. Please try again."
                });
            } else {
                this.messageService.add({
                    severity: 'success',
                    summary: 'De-Activation of User Profile - Success',
                    detail: 'User profile de-activated successfully.'
                });
            }               
        },
        error: () => {
            this.messageService.add({
                severity: 'error',
                summary: 'De-Activation of User Profile - Failed',
                detail: "Failed to de-activate user's profile. Please try again."
            });
        }
    });
  }

  sendNOC(){
    const payload = this.selectedUserDetails;
    this.userService.sendNOC(payload).subscribe({
        next: (res: any) => {
            if (!res || !res.Status) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Email NOC - Failed',
                    detail: res ? res.Message : "Failed to send NOC. Please try again."
                });
            } else {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Email NOC - Success',
                    detail: 'Sent NOC successfully.'
                });
            }               
        },
        error: () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Email NOC - Failed',
                detail: "Failed to send NOC. Please try again."
            });
        }
    });
  }

}
