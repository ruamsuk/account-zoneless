import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-progress-modal',
  imports: [
    DecimalPipe
  ],
  template: `
    @if (status()) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ title() }}</h3>
          <div class="mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              กำลังประมวลผล... {{ status()?.processed | number }} / {{ status()?.total | number }} รายการ
            </p>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
              <div class="bg-blue-600 h-2.5 rounded-full"
                   [style.width.%]="(status()!.processed / status()!.total) * 100">
              </div>
            </div>
            @if (status()?.processed === status()?.total) {
              <p class="text-sm text-green-500 mt-2">ดำเนินการเสร็จสิ้น!</p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class ProgressModal {
  status = input<{ processed: number; total: number } | null>(null);
  title = input<string>('กำลังดำเนินการอัพเดต');
}
