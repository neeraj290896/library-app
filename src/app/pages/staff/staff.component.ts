import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css'
})
export class StaffComponent {
  staffMembers = signal([
    { id: '#001', name: 'Allison Smith', role: 'Librarian', email: 'allison@library.com', status: 'Active' },
    { id: '#002', name: 'John Doe', role: 'Assistant', email: 'john@library.com', status: 'Active' },
    { id: '#003', name: 'Sarah Johnson', role: 'Assistant', email: 'sarah@library.com', status: 'Active' },
    { id: '#004', name: 'Mike Wilson', role: 'Intern', email: 'mike@library.com', status: 'Inactive' },
  ]);
}
