import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-thai-datepicker',
  imports: [
    NgClass
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ThaiDatepicker),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full">
      <input
        type="text"
        readonly
        (click)="toggleDatepicker()"
        [value]="displayValue"
        placeholder="เลือกวันที่"
        class="form-input cursor-pointer">

      @if (showDatepicker) {
        <div class="absolute top-full mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4 z-50">
          <div class="flex justify-between items-center mb-2">
            <button type="button" (click)="changeMonth(-1)" class="btn-nav">&lt;</button>
            <span
              class="font-semibold text-gray-800 dark:text-gray-200">{{ MONTH_NAMES[month] }} {{ year + 543 }}</span>
            <button type="button" (click)="changeMonth(1)" class="btn-nav">&gt;</button>
          </div>
          <div class="grid grid-cols-7 text-center text-sm text-gray-300 dark:text-gray-200 mb-1">
            @for (day of DAYS; track day) {
              <div>{{ day }}</div>
            }
          </div>
          <div class="grid grid-cols-7">
            @for (blank of blankdays; track $index) {
              <div></div>
            }
            @for (day of no_of_days; track day) {
              <div class="text-center p-1 text-gray-200">
                <div (click)="getDateValue(day)"
                     class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full text-sm"
                     [ngClass]="isToday(day) ? ['bg-blue-500 text-white'] : ['hover:bg-gray-200 dark:hover:bg-gray-600']"
                >
                  {{ day }}
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ThaiDatepicker {
  MONTH_NAMES = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  showDatepicker = false;
  displayValue = ''; // ค่าที่แสดงผล (dd MMMM yyyy พ.ศ.)

  // --- ค่าที่ใช้คำนวณภายใน (ทั้งหมดเป็น ค.ศ.) ---
  date = new Date();
  month = this.date.getMonth();
  year = this.date.getFullYear();
  no_of_days: number[] = [];
  blankdays: number[] = [];

  // --- ControlValueAccessor implementation ---
  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  writeValue(value: string): void {
    if (value) {
      this.date = new Date(value);
      this.year = this.date.getFullYear();
      this.month = this.date.getMonth();
      this.displayValue = this.formatDisplay(this.date);
    } else {
      // Set to today's date if no initial value
      this.date = new Date();
      this.year = this.date.getFullYear();
      this.month = this.date.getMonth();
    }
    this.getNoOfDays();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // --- Component Logic ---
  toggleDatepicker() {
    this.showDatepicker = !this.showDatepicker;
  }

  getDateValue(day: number) {
    // สร้าง Date object ด้วยปี ค.ศ.
    const selectedDate = new Date(this.year, this.month, day);
    this.displayValue = this.formatDisplay(selectedDate);

    // ส่งค่า YYYY-MM-DD (ค.ศ.) กลับไปให้ Form
    this.onChange(selectedDate.toISOString().substring(0, 10));

    this.showDatepicker = false;
  }

  changeMonth(monthOffset: number) {
    this.month += monthOffset;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    } else if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.getNoOfDays();
  }

  isToday(day: number): boolean {
    const today = new Date();
    const d = new Date(this.year, this.month, day);
    return today.toDateString() === d.toDateString();
  }

  getNoOfDays() {
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const dayOfWeek = new Date(this.year, this.month).getDay();
    this.blankdays = Array(dayOfWeek).fill(null);
    this.no_of_days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  }

  private formatDisplay(date: Date): string {
    const day = date.getDate();
    const monthName = this.MONTH_NAMES[date.getMonth()];
    const yearBE = date.getFullYear() + 543;
    return `${day} ${monthName} ${yearBE}`;
  }
}
