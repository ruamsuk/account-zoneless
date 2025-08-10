import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  imports: [],
  template: `
    <div
      class="bg-gray-800/70 text-gray-200 text-base border border-gray-500 font-leera rounded-md px-3 py-1.5 shadow-lg">
      {{ text }}
    </div>
  `,
  styles: ``
})
export class Tooltip {
  tooltipText = input<string>('');
  text = this.tooltipText();
}
