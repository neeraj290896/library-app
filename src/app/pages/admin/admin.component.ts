import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, PaginatorModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    staffMembers = signal([
        { id: '#001', name: 'Allison Smith', role: 'Librarian', email: 'allison@library.com', status: 'Active' },
        { id: '#002', name: 'John Doe', role: 'Assistant', email: 'john@library.com', status: 'Active' },
        { id: '#003', name: 'Sarah Johnson', role: 'Assistant', email: 'sarah@library.com', status: 'Active' },
        { id: '#004', name: 'Mike Wilson', role: 'Intern', email: 'mike@library.com', status: 'Inactive' },
    ]);
}
