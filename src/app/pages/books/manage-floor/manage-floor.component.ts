import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuildingDetails, FloorDetails } from '@app/shared/models/api.models';
import { BuildingService } from '@app/shared/services/building.service';
import { FloorService } from '@app/shared/services/floor.service';
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
  selector: 'app-manage-floor',
  imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-floor.component.html',
  styleUrl: './manage-floor.component.scss'
})
export class ManageFloorComponent {

  private messageService = inject(MessageService);
  private floorService = inject(FloorService);
  private buildingService = inject(BuildingService);

  @ViewChild('dt') dataTable: Table | undefined;

    public floors: FloorDetails[] = [];
    public allBuildings: BuildingDetails[] = [];
    public buildingOptions: { label: string; value: number; }[] = [];
    public showFt: boolean = false;
    public buildingNameList: { label: string, value: string }[] = [];
    public floorNumberList: { label: string, value: string }[] = [];
    public floorNameList: { label: string, value: string }[] = [];
    public statusList: { label: string, value: boolean }[] = [];
    public selectedFloorNameList: string[] = [];
    public selectedBuildingNameList: string[] = [];
    public selectedFloorNumberList: string[] = [];
    public selectedStatusList: boolean[] = [];
    public floorDialogVisible = false;
    public header: string = '';
    public currentFloor: FloorDetails = { FloorId: 0, BuildingId:0, BuildingName:'', FloorNumber:'', FloorName: '', IsActive: true };
    public errors: { BuildingId: string, FloorNumber: string, FloorName: string, IsActive: string } = { 
      BuildingId: '',
      FloorNumber:'',
      FloorName: '', 
      IsActive: '' 
    };
    public options: { label: string; value: boolean; }[] = [
        { label: 'Active', value: true },
        { label: 'In-Active', value: false }
    ];    

    ngOnInit(): void {
        this.loadFloorDetails();
        this.loadBuildingDetails();
    }

    loadFloorDetails(): void {
        this.floorService.getAllFloorDetails().subscribe({
            next: (data: FloorDetails[]) => {
                this.floors = data;
                this.initializeFilterLists();
            },
            error: (err :any) => {
                console.error('Error loading Floors:', err);
            }
        });
    }

    loadBuildingDetails(): void {
        this.buildingService.getAllBuildingDetails().subscribe({
            next: (data: BuildingDetails[]) => {
                this.allBuildings = data;
                
            },
            error: (err :any) => {
                console.error('Error loading Building details:', err);
            }
        });
    }

    initializeFilterLists(): void {
        this.buildingNameList = [...new Set(this.floors.map(Floor => Floor.BuildingName))]
            .map(e => ({ label: e!, value: e! }));
        this.floorNumberList = [...new Set(this.floors.map(Floor => Floor.FloorNumber))]
            .map(e => ({ label: e!, value: e! }));
        this.floorNameList = [...new Set(this.floors.map(Floor => Floor.FloorName))]
            .map(e => ({ label: e!, value: e! }));
        this.statusList = [...new Set(this.floors.map(Floor => Floor.IsActive))]
            .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
    }

    showFilter(): void {
        this.showFt = !this.showFt;
    }

    clear(): void {
        this.dataTable?.reset();
        this.selectedFloorNameList = [];
        this.selectedBuildingNameList = [];
        this.selectedFloorNumberList = [];
        this.selectedStatusList = [];
        this.showFt = false;
    }

    getStatusSeverity(isActive: boolean): 'success' | 'danger' {
        return isActive ? 'success' : 'danger';
    }

    onBuildingChange(): void {        

        const building = this.buildingOptions.find(b => b.value === this.currentFloor.BuildingId);
        if (building) {
            this.currentFloor.BuildingName = building.label;
        }

        this.validateInput('BuildingId');
    }

    editFloor(_floor: FloorDetails | null = null): void {
        if (_floor) {
            this.buildingOptions = this.allBuildings.map(building => {
                    return { label: building.BuildingName ?? '', value: building.BuildingId };
                });
            this.currentFloor = { ..._floor };
            this.header = 'Edit Floor';
        } 
        else {
             this.buildingOptions = this.allBuildings.filter(x => x.IsActive == true).map(building => {
                    return { label: building.BuildingName ?? '', value: building.BuildingId };
                });
            this.currentFloor = { FloorId: 0, BuildingId:0, BuildingName:'', FloorNumber:'', FloorName: '', IsActive: true };
            this.header = 'Add Floor';
        }
        this.errors = { BuildingId:'', FloorNumber:'', FloorName: '', IsActive: '' };
        this.floorDialogVisible = true;
    }
    
    validateInput(key: string): boolean {
        let isValid = true;

        switch (key) {
            case 'BuildingId':
                if (!(this.currentFloor.BuildingId >0)) {
                    this.errors.BuildingId = 'Building name is required.';
                    isValid = false;
                } else {
                    this.errors.BuildingId = '';
                }
                break;

            case 'FloorNumber':
                if (!this.currentFloor.FloorNumber?.trim()) {
                    this.errors.FloorNumber = 'Floor number is required.';
                    isValid = false;
                } else {
                    this.errors.FloorNumber = '';
                }
                break;

            case 'FloorName':
                if (!this.currentFloor.FloorName?.trim()) {
                    this.errors.FloorName = 'Floor name is required.';
                    isValid = false;
                } else {
                    this.errors.FloorName = '';
                }
                break;

            case 'IsActive':
                if (this.currentFloor.IsActive === null) {
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

    validateFloor(): boolean {
      const isBuildingIdValid = this.validateInput('BuildingId');
        const isFloorNumberValid = this.validateInput('FloorNumber');
        const isNameValid = this.validateInput('FloorName');
        const isStatusValid = this.validateInput('IsActive');
        return isBuildingIdValid && isFloorNumberValid && isNameValid && isStatusValid;
    }

    saveFloor(): void {
        if (!this.validateFloor()) {
            return;
        }

        var isFloorExistsAlready = this.floors.filter( x => x.BuildingId == this.currentFloor.BuildingId && x.FloorNumber?.trim() == this.currentFloor.FloorNumber?.trim() && 
                                                       x.FloorName?.trim() == this.currentFloor.FloorName?.trim()).map( build => 
                                   build.FloorId ?? 0
                                );
        
        if(this.currentFloor.FloorId == 0 && isFloorExistsAlready !=null && isFloorExistsAlready.length >0)
        {
          this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Floor - Failed',
                        detail: 'Floor details exists already.'
                    });
            return;
        }
        else if (this.currentFloor.FloorId >0 && isFloorExistsAlready.includes(this.currentFloor.FloorId))
        {
          this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Floor - Failed',
                        detail: 'Floor details exists already.'
                    });
            return;
        }

        const payload = [this.currentFloor];
        this.floorService.updateFloorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Floor - Failed',
                        detail: res ? res.Message : 'Failed to update Floor details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Floor - Success',
                        detail: 'Floor details updated successfully.'
                    });

                     this.loadFloorDetails();
                    this.floorDialogVisible = false;

                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Floor - Failed',
                    detail: 'Failed to update Floor details. Please try again.'
                });
            }
        });
    }

    deleteFloor(_floor: FloorDetails): void { 

        _floor.IsActive = false;

        const payload = [_floor];

        this.floorService.deleteFloorDetails(payload).subscribe({
            next: (res: any) => {
                if (!res || !res.Status) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Manage Floor - Failed',
                        detail: res ? res.Message : 'Failed to delete Floor details. Please try again.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Manage Floor - Success',
                        detail: 'Floor details deleted successfully.'
                    });

                     this.loadFloorDetails();
                }

               
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Manage Floor - Failed',
                    detail: 'Failed to delete Floor details. Please try again.'
                });
            }
        });
    }
}
