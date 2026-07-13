import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuildingDetails, FloorDetails, RackDetails } from '@app/shared/models/api.models';
import { BuildingService } from '@app/shared/services/building.service';
import { FloorService } from '@app/shared/services/floor.service';
import { RackService } from '@app/shared/services/rack.service';
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
  selector: 'app-manage-rack',
  imports: [CommonModule, ButtonModule, TableModule, TagModule,
        PaginatorModule, MultiSelectModule, DialogModule, InputTextModule,
        SelectModule, FormsModule, TooltipModule],
  templateUrl: './manage-rack.component.html',
  styleUrl: './manage-rack.component.scss'
})
export class ManageRackComponent {

  private messageService = inject(MessageService);
  private floorService = inject(FloorService);
  private rackService = inject(RackService);
  private buildingService = inject(BuildingService);

  @ViewChild('dt') dataTable: Table | undefined;

  public racks: RackDetails[] = [];
  public allBuildings: BuildingDetails[] = [];
  public allFloors: FloorDetails[] = [];
  public buildingOptions: { label: string; value: number; }[] = [];
  public floorOptions: { label: string; value: number; }[] = [];
  public showFt: boolean = false;
  public buildingNameList: { label: string, value: string }[] = [];
  public floorNameList: { label: string, value: string }[] = [];
  public rackNumberList: { label: number, value: number }[] = [];
  public rackNameList: { label: string, value: string }[] = [];
  public statusList: { label: string, value: boolean }[] = [];  
  public selectedBuildingNameList: string[] = [];
  public selectedFloorNameList: string[] = [];
  public selectedRackNumberList: string[] = [];
  public selectedRackNameList: string[] = [];
  public selectedStatusList: boolean[] = [];
  public rackDialogVisible = false;
  public header: string = '';
  public currentRack: RackDetails = { RackId: 0, BuildingId:0, BuildingName:'', FloorId: 0, FloorName:'', FloorNumber:'', RackNumber: 0, RackLabel: '', IsActive: true };
  public errors: { BuildingId: string, FloorId: string, RackNumber: string, RackLabel: string, IsActive: string } = { 
    BuildingId: '',
    FloorId: '',
    RackNumber:'',
    RackLabel: '', 
    IsActive: '' 
  };
  public options: { label: string; value: boolean; }[] = [
      { label: 'Active', value: true },
      { label: 'In-Active', value: false }
  ];    

  ngOnInit(): void {
      this.loadFloorDetails();
      this.loadBuildingDetails();
      this.loadRackDetails();
  }

  loadRackDetails(): void {
      this.rackService.getAllRackDetails().subscribe({
          next: (data: RackDetails[]) => {
              this.racks = data;
              this.initializeFilterLists();
          },
          error: (err :any) => {
              console.error('Error loading Rack details:', err);
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

  loadFloorDetails(): void {
      this.floorService.getAllFloorDetails().subscribe({
          next: (data: FloorDetails[]) => {
              this.allFloors = data;              
          },
          error: (err :any) => {
              console.error('Error loading Floor details:', err);
          }
      });
  }

  initializeFilterLists(): void {
      this.buildingNameList = [...new Set(this.racks.map(rack => rack.BuildingName))]
          .map(e => ({ label: e!, value: e! }));
      this.floorNameList = [...new Set(this.racks.map(rack => rack.FloorName))]
          .map(e => ({ label: e!, value: e! }));
      this.rackNumberList = [...new Set(this.racks.map(rack => rack.RackNumber))]
          .map(e => ({ label: e!, value: e! }));
      this.rackNameList = [...new Set(this.racks.map(rack => rack.RackLabel))]
          .map(e => ({ label: e!, value: e! }));
      this.statusList = [...new Set(this.racks.map(rack => rack.IsActive))]
          .map(e => ({ label: e ? 'Active' : 'In-Active', value: e }));
  }

  showFilter(): void {
      this.showFt = !this.showFt;
  }

  clear(): void {
      this.dataTable?.reset();
      this.selectedFloorNameList = [];
      this.selectedBuildingNameList = [];
      this.selectedRackNameList = [];
      this.selectedRackNumberList = [];
      this.selectedStatusList = [];
      this.showFt = false;
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
      return isActive ? 'success' : 'danger';
  }

  onBuildingChange(): void {        

      const building = this.buildingOptions.find(b => b.value === this.currentRack.BuildingId);
      if (building) {
          this.currentRack.BuildingName = building.label;
      }

      this.floorOptions = this.allFloors.filter(x => x.BuildingId == this.currentRack.BuildingId && x.IsActive == true).map(floor => {
          return { label: floor.FloorName ?? '', value: floor.FloorId };
      });

      this.validateInput('BuildingId');
  }

  onFloorChange(): void {        

      const floor = this.allFloors.find(f => f.FloorId === this.currentRack.FloorId);
      if (floor) {
          this.currentRack.FloorNumber = floor.FloorNumber;
          this.currentRack.FloorName = floor.FloorName ?? '';
      }

      this.validateInput('FloorId');
    }

  editRack(_rack: RackDetails | null = null): void {
      if (_rack) {
          this.buildingOptions = this.allBuildings.map(building => {
                  return { label: building.BuildingName ?? '', value: building.BuildingId };
              });
          this.floorOptions = this.allFloors.filter(x => x.BuildingId == _rack.BuildingId).map(floor => {
                  return { label: floor.FloorName ?? '', value: floor.FloorId };
              });
          this.currentRack = { ..._rack };
          this.header = 'Edit Rack';
      } 
      else {
            this.buildingOptions = this.allBuildings.filter(x => x.IsActive == true).map(building => {
                  return { label: building.BuildingName ?? '', value: building.BuildingId };
              });
            this.floorOptions = this.allFloors.filter(x => x.IsActive == true).map(floor => {
                  return { label: floor.FloorName ?? '', value: floor.FloorId };
              });
          this.currentRack = { RackId: 0, BuildingId:0, BuildingName:'',  FloorId: 0, FloorNumber:'', FloorName: '', RackNumber:0, RackLabel: '', IsActive: true };
          this.header = 'Add Floor';
      }
      this.errors = { BuildingId: '', FloorId: '', RackNumber:'', RackLabel: '',  IsActive: '' };
      this.rackDialogVisible = true;
  }
  
  validateInput(key: string): boolean {
      let isValid = true;

      switch (key) {
          case 'BuildingId':
              if (!(this.currentRack.BuildingId >0)) {
                  this.errors.BuildingId = 'Building name is required.';
                  isValid = false;
              } else {
                  this.errors.BuildingId = '';
              }
              break;
          case 'FloorId':
              if (!(this.currentRack.FloorId >0)) {
                  this.errors.FloorId = 'Floor name is required.';
                  isValid = false;
              } else {
                  this.errors.FloorId = '';
              }
              break;

          case 'RackNumber':
              if (!(this.currentRack.RackNumber > 0)) {
                  this.errors.RackNumber = 'Rack number is required.';
                  isValid = false;
              } else {
                  this.errors.RackNumber = '';
              }
              break;

          case 'RackName':
              if (!this.currentRack.RackLabel?.trim()) {
                  this.errors.RackLabel = 'Rack name is required.';
                  isValid = false;
              } else {
                  this.errors.RackLabel = '';
              }
              break;

          case 'IsActive':
              if (this.currentRack.IsActive === null) {
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

  validateRack(): boolean {
    const isBuildingIdValid = this.validateInput('BuildingId');
    const isFloorNameValid = this.validateInput('FloorName');
      const isRackNumberValid = this.validateInput('RackNumber');
      const isRackNameValid = this.validateInput('RackName');
      const isStatusValid = this.validateInput('IsActive');

      return isBuildingIdValid && isFloorNameValid && isRackNumberValid && isRackNameValid && isStatusValid;
  }

  saveRack(): void {
      if (!this.validateRack()) {
          return;
      }

      var isRackExistsAlready = this.racks.filter( x => x.BuildingId == this.currentRack.BuildingId && x.FloorId == this.currentRack.FloorId && x.RackNumber == this.currentRack.RackNumber && 
                                                      x.RackLabel?.trim() == this.currentRack.RackLabel?.trim()).map( build => 
                                  build.RackId ?? 0
                              );
      
      if(this.currentRack.RackId == 0 && isRackExistsAlready !=null && isRackExistsAlready.length >0)
      {
        this.messageService.add({
                      severity: 'error',
                      summary: 'Manage Rack - Failed',
                      detail: 'Rack details exists already.'
                  });
          return;
      }
      else if (this.currentRack.FloorId >0 && isRackExistsAlready.includes(this.currentRack.FloorId))
      {
        this.messageService.add({
                      severity: 'error',
                      summary: 'Manage Rack - Failed',
                      detail: 'Rack details exists already.'
                  });
          return;
      }

      const payload = [this.currentRack];
      this.rackService.updateRackDetails(payload).subscribe({
          next: (res: any) => {
              if (!res || !res.Status) {
                  this.messageService.add({
                      severity: 'error',
                      summary: 'Manage Rack - Failed',
                      detail: res ? res.Message : 'Failed to update Rack details. Please try again.'
                  });
              } else {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Manage Rack - Success',
                      detail: 'Rack details updated successfully.'
                  });

                    this.loadRackDetails();
                  this.rackDialogVisible = false;
              }              
          },
          error: () => {
              this.messageService.add({
                  severity: 'error',
                  summary: 'Manage Rack - Failed',
                  detail: 'Failed to update Rack details. Please try again.'
              });
          }
      });
  }

  deleteRack(_rack: RackDetails): void { 

      _rack.IsActive = false;

      const payload = [_rack];

      this.rackService.deleteRackDetails(payload).subscribe({
          next: (res: any) => {
              if (!res || !res.Status) {
                  this.messageService.add({
                      severity: 'error',
                      summary: 'Manage Rack - Failed',
                      detail: res ? res.Message : 'Failed to delete Rack details. Please try again.'
                  });
              } else {
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Manage Rack - Success',
                      detail: 'Rack details deleted successfully.'
                  });

                    this.loadRackDetails();
              }

              
          },
          error: () => {
              this.messageService.add({
                  severity: 'error',
                  summary: 'Manage Rack - Failed',
                  detail: 'Failed to delete Rack details. Please try again.'
              });
          }
      });
  }
}
