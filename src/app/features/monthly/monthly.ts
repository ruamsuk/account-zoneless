import { Component, inject } from '@angular/core';
import { DateUtilityService } from '../../services/date-utility.service';

@Component({
  selector: 'app-monthly',
  imports: [],
  template: `
    <p>
      monthly works!
    </p>
  `,
  styles: ``
})
export class Monthly {
  private dateUtilityService = inject(DateUtilityService);
}
