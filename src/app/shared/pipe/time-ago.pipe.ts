import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    // Convert JSON DateTime string safely into a JS Date object
    const d = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 29) return 'Just now';

    // Definition of time intervals in seconds
    const intervals: { [key: string]: number } = {
      'month': 2592000,
      'day': 86400,
      'hour': 3600,
      'minute': 60
    };

    let counter;
    for (const i in intervals) {
      counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) {
        if (counter === 1) {
          return `${counter} ${i} ago`; // Singular: "1 day ago"
        } else {
          return `${counter} ${i}s ago`; // Plural: "3 days ago"
        }
      }
    }
    return 'Just now';
  }
}
