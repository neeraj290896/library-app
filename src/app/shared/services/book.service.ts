import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  getOverdueBooks() {
    return [
      { memberId: '#48964', title: 'Magnolia Palace', isbn: '3234', dueDate: '5', fine: '$10' },
      { memberId: '#48964', title: 'Don Quixote', isbn: '3234', dueDate: '5', fine: '$10' },
      { memberId: '#48964', title: 'Alice\'s Adventures in...', isbn: '3234', dueDate: '5', fine: '$10' },
      { memberId: '#48964', title: 'Pride and Prejudice', isbn: '3234', dueDate: '5', fine: '$10' },
      { memberId: '#48964', title: 'Treasure Island', isbn: '3234', dueDate: '5', fine: '$10' },
    ];
  }

  getMembers() {
    return [
      { memberId: '#48964', registerId: '3234', member: 'Alfredo Bergson', type: 'Teacher', email: 'Alfredobergson@example.com' },
      { memberId: '#48965', registerId: '3235', member: 'Roger Schlefer', type: 'Student', email: 'Rogerschlefer@example.com' },
      { memberId: '#48966', registerId: '3236', member: 'Angel Calzoni', type: 'Teacher', email: 'Angelcalzoni@example.com' },
      { memberId: '#48967', registerId: '3237', member: 'Maria Garcia', type: 'Student', email: 'mariagarcia@example.com' },
      { memberId: '#48968', registerId: '3238', member: 'David Lee', type: 'Teacher', email: 'davidlee@example.com' },
      { memberId: '#48969', registerId: '3239', member: 'Emma Wilson', type: 'Student', email: 'emmawilson@example.com' },
      { memberId: '#48970', registerId: '3240', member: 'James Brown', type: 'Student', email: 'jamesbrown@example.com' },
      { memberId: '#48971', registerId: '3241', member: 'Sophia Davis', type: 'Teacher', email: 'sophiadavis@example.com' },
      { memberId: '#48972', registerId: '3242', member: 'Oliver Martinez', type: 'Student', email: 'olivermartinez@example.com' },
    ];
  }
}
