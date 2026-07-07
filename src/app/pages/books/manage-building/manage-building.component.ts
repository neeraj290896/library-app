import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AreaDetails, BuildingDetails, CityDetails, DistrictDetails, StateDetails, UserDetails } from '@app/shared/models/api.models';
import { AreaService } from '@app/shared/services/area.service';
import { AuthService } from '@app/shared/services/auth.service';
import { BuildingService } from '@app/shared/services/building.service';
import { CityService } from '@app/shared/services/city.service';
import { DistrictService } from '@app/shared/services/district.service';
import { StateService } from '@app/shared/services/state.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-building',
  imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-building.component.html',
  styleUrl: './manage-building.component.scss'
})
export class ManageBuildingComponent {

  private messageService = inject(MessageService);
  private buildingService = inject(BuildingService);
  public _authService = inject(AuthService);
  public _stateService = inject(StateService);
  public _districtService = inject(DistrictService);
  public _cityService = inject(CityService);  
  public _areaService = inject(AreaService);
  @ViewChild('dt') dataTable: Table | undefined;

    public buildings: BuildingDetails[] = [];
    public showFt: boolean = false;
    public buildingList: { label: string, value: string }[] = [];    
    public stateList: { label: string, value: string }[] = [];
    public districtList: { label: string, value: string }[] = [];
    public cityList: { label: string, value: string }[] = [];
    public areaList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedBuildingNameList: string[] = [];
    public selectedStateNameList: string[] = [];
    public selectedDistrictNameList: string[] = [];
    public selectedCityNameList: string[] = [];
    public selectedAreaNameList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public stateOptions: { label: string; value: number; }[] = [];
    public districtOptions: { label: string; value: number; }[] = [];
    public cityOptions: { label: string; value: number; }[] = [];
    public areaOptions: { label: string; value: number; }[] = [];
    public buildingDialogVisible = false;
    public header: string = '';
    public currentBuilding: BuildingDetails = { BuildingId: 0, BuildingName: '', AddressLine1:'', AddressLine2:'', AddressLine3:'', StateId:0, DistrictId:0, CityId:0, 
                                                AreaId:0, CreatedByUserId : 0, CreatedByUserName : '', IsActive: true };
    public errors: { BuildingName: string, AddressLine1: string, StateId: string, DistrictId: string, CityId: string, AreaId: string, IsActive: string } = { 
        BuildingName: '', 
        AddressLine1:'',
        StateId:'',
        DistrictId: '',
        CityId: '',
        AreaId: '',
        IsActive: '' 
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];
    public loggedInUserDetails: UserDetails | null = null;
    public stateDetails: StateDetails[] = [];
    public districtDetails: DistrictDetails[] = [];
    public cityDetails: CityDetails[] = [];
    public areaDetails: AreaDetails[] = [];

    ngOnInit(): void {
      this.loggedInUserDetails = this._authService.userData() ?? this._authService.userDataTemp;
      this.loadBuildingDetails();
      this.loadStateDetails();      
    }

    loadStateDetails(): void {
      this._stateService.getStateDetails().subscribe({
          next: (data: StateDetails[]) => {
              this.stateDetails = data;
              this.stateOptions = data.map(author => {
                  return { label: author.StateName ?? '', value: author.StateId };
              });
          },
          error: (err) => {
              console.error('Error loading state details:', err);
          }
      });
    }

    loadDistrictDetailsById(stateId: number): void {
      this._districtService.getDistrictDetailsById(stateId).subscribe({
          next: (data: DistrictDetails[]) => {
              this.districtDetails = data;
              this.districtOptions = data.map(author => {
                  return { label: author.DistrictName ?? '', value: author.DistrictId };
              });
          },
          error: (err) => {
              console.error('Error loading District details:', err);
          }
      });
    }

    loadCityDetailsById(stateId: number, districtId: number): void {
      this._cityService.getCityDetailsById(stateId,districtId).subscribe({
          next: (data: CityDetails[]) => {
              this.cityDetails = data;
              this.cityOptions = data.map(author => {
                  return { label: author.CityName ?? '', value: author.CityId };
              });
          },
          error: (err) => {
              console.error('Error loading authors:', err);
          }
      });
    }

    loadAreaDetailsById(stateId: number, districtId: number, cityId: number): void {
      this._areaService.getAreaDetailsById(stateId, districtId, cityId).subscribe({
          next: (data: AreaDetails[]) => {
              this.areaDetails = data;
              this.areaOptions = data.map(author => {
                  return { label: author.AreaName ?? '', value: author.AreaId };
              });
          },
          error: (err) => {
              console.error('Error loading Area details:', err);
          }
      });
    }

    loadBuildingDetails(): void {
        this.buildingService.getAllBuildingDetails().subscribe({
            next: (data: BuildingDetails[]) => {
                this.buildings = data;
                this.initializeFilterLists();
            },
            error: (err :any) => {
                console.error('Error loading buildings:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.buildingList = [...new Set(this.buildings.map(building => building.BuildingName))]
            .map(e => ({ label: e!, value: e! }));
        this.stateList = [...new Set(this.buildings.map(building => building.StateName))]
            .map(e => ({ label: e!, value: e! }));
        this.districtList = [...new Set(this.buildings.map(building => building.DistrictName))]
            .map(e => ({ label: e!, value: e! }));
        this.cityList = [...new Set(this.buildings.map(building => building.CityName))]
            .map(e => ({ label: e!, value: e! }));
        this.areaList = [...new Set(this.buildings.map(building => building.AreaName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.buildings.map(building => building.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedBuildingNameList = [];
        this.selectedStateNameList = [];
        this.selectedDistrictNameList = [];
        this.selectedCityNameList = [];
        this.selectedAreaNameList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    editbuilding(building: BuildingDetails | null = null): void {
        if (building) {
            this.currentBuilding = { ...building };
            this.header = 'Edit Building details';
        } 
        else {
            this.currentBuilding = { BuildingId: 0, BuildingName: '', AddressLine1:'', AddressLine2:'', AddressLine3:'', StateId:0, StateName:'', DistrictId:0, DistrictName:'',
                                      CityId:0, CityName:'', AreaId: 0, AreaName:'', CreatedByUserId: this.loggedInUserDetails?.UserId ?? 0, 
                                      CreatedByUserName: this.loggedInUserDetails?.FullName, IsActive: true };

            this.header = 'Add New Building details';
        }
        this.errors = { BuildingName: '', AddressLine1:'', StateId:'', DistrictId: '', CityId: '', AreaId: '', IsActive: '' };
        this.buildingDialogVisible = true;
    }    

    onStateChange():void{
        const _state = this.stateOptions.find(l => l.value === this.currentBuilding.StateId);
        if (_state) {
            this.currentBuilding.StateName = _state.label;
        }

        this.loadDistrictDetailsById(this.currentBuilding.StateId);

        this.validateInput('StateId');
    }

    onDistrictChange():void{
      const _district = this.districtOptions.find(l => l.value === this.currentBuilding.DistrictId);
        if (_district) {
            this.currentBuilding.DistrictName = _district.label;
        }

        this.loadCityDetailsById(this.currentBuilding.StateId, this.currentBuilding.DistrictId );
        this.validateInput('DistrictId');
    }

    onCityChange():void{
      const _city = this.cityOptions.find(l => l.value === this.currentBuilding.CityId);
        if (_city) {
            this.currentBuilding.CityName = _city.label;
        }

        this.loadAreaDetailsById(this.currentBuilding.StateId, this.currentBuilding.DistrictId, this.currentBuilding.CityId );

        this.validateInput('CityId');
    }

    onAreaChange():void{
      const _area = this.areaOptions.find(l => l.value === this.currentBuilding.AreaId);
        if (_area) {
            this.currentBuilding.AreaName = _area.label;
        }

        this.validateInput('AreaId');
    }

    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BuildingName':
                if (!this.currentBuilding.BuildingName?.trim()) {
                    this.errors.BuildingName = 'Building name is required.';
                    isValid = false;
                } else {
                    this.errors.BuildingName = '';
                }
                break;
            case 'AddressLine1':
                if (!this.currentBuilding.AddressLine1?.trim()) {
                    this.errors.AddressLine1 = 'AddressLine1 is required.';
                    isValid = false;
                } else {
                    this.errors.AddressLine1 = '';
                }
                break;
            case 'StateId':
                if (!(this.currentBuilding.StateId != null && this.currentBuilding.StateId > 0)) {
                    this.errors.StateId = 'Please select State.';
                    isValid = false;
                } else {
                    this.errors.StateId = '';
                }
                break;
            case 'DistrictId':
                if (!(this.currentBuilding.DistrictId != null && this.currentBuilding.DistrictId > 0)) {
                    this.errors.DistrictId = 'Please select District.';
                    isValid = false;
                } else {
                    this.errors.DistrictId = '';
                }
                break;
            case 'CityId':
                if (!(this.currentBuilding.CityId != null && this.currentBuilding.CityId > 0)) {
                    this.errors.CityId = 'Please select City.';
                    isValid = false;
                } else {
                    this.errors.CityId = '';
                }
                break;
            case 'AreaId':
                if (!(this.currentBuilding.AreaId != null && this.currentBuilding.AreaId > 0)) {
                    this.errors.AreaId = 'Please select Area.';
                    isValid = false;
                } else {
                    this.errors.AreaId = '';
                }
                break;

            case 'IsActive':
                if (this.currentBuilding.IsActive === null) {
                    this.errors.IsActive = 'Status is required.';
                    isValid = false;
                } else {
                    this.errors.IsActive = '';
                }
                break;

            default:
                break;
        }

        return isValid;
    }

    validateBuilding(): boolean {
        const isBuildingNameValid = this.validateInput('BuildingName');
        const isAddressLine1Valid = this.validateInput('AddressLine1');
        const isStateIdValid = this.validateInput('StateId');
        const isDistrictIdValid = this.validateInput('DistrictId');
        const isCityIdValid = this.validateInput('CityId');
        const isAreaIdValid = this.validateInput('AreaId');
        const isStatusValid = this.validateInput('IsActive');
        return isBuildingNameValid && isAddressLine1Valid && isStateIdValid && isDistrictIdValid && isCityIdValid && isAreaIdValid && isStatusValid;
    }

    saveBuilding(): void {
        if (!this.validateBuilding()) {
            return;
        }

        var isBuildingExists = this.buildings.filter( x => x.StateId == this.currentBuilding.StateId && x.DistrictId == this.currentBuilding.DistrictId && x.CityId == this.currentBuilding.CityId
                                && x.AreaId == this.currentBuilding.AreaId && x.BuildingName?.trim() == this.currentBuilding.BuildingName?.trim()).map( build => 
                                   build.BuildingId ?? 0
                                );
        
        if(this.currentBuilding.BuildingId == 0 && isBuildingExists !=null && isBuildingExists.length >0)
        {
          this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Building - Failed',
                        detail: 'Building details exists already.'
                    });
            return;
        }
        else if (this.currentBuilding.BuildingId >0 && isBuildingExists.includes(this.currentBuilding.BuildingId))
        {
          this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Building - Failed',
                        detail: 'Building details exists already.'
                    });
            return;
        }
       

        if(this.currentBuilding.BuildingId>0)
        {
            this.updateBuildingDetails(this.currentBuilding);
        }
        else
        {          
            this.addNewBuildingDetails(this.currentBuilding);
        }        
    }

    addNewBuildingDetails(building: BuildingDetails): void { 

      this.buildingService.addBuildingDetails(building).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage building - Failed',
                        detail: res ? res.Message : 'Failed to Add new building details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage building - Success',
                        detail: 'Building Details Added successfully.'
                    });

                     this.loadBuildingDetails();
                    this.buildingDialogVisible = false;

                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage building - Failed',
                    detail: 'Failed to Add New Building details. Please try again.'
                });
            }
        });

    }

    updateBuildingDetails(building: BuildingDetails): void { 

      this.buildingService.updateBuildingDetails(building).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage building - Failed',
                        detail: res ? res.Message : 'Failed to Update building details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage building - Success',
                        detail: 'Building Details Update successfully.'
                    });

                     this.loadBuildingDetails();
                    this.buildingDialogVisible = false;

                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage building - Failed',
                    detail: 'Failed to Update Building details. Please try again.'
                });
            }
        });
    }

    deletebuilding(building: BuildingDetails): void { 

        building.IsActive = false;        

        this.buildingService.deleteBuildingDetails(building).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Building - Failed',
                        detail: res ? res.Message : 'Failed to delete building details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Building - Success',
                        detail: 'Building deleted successfully.'
                    });

                     this.loadBuildingDetails();
                }               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Building - Failed',
                    detail: 'Failed to delete building details. Please try again.'
                });
            }
        });
    }
}
