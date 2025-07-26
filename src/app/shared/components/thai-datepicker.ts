import { Component, computed, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-thai-datepicker',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ThaiDatepicker),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <!-- ==================== DATE SELECTOR VIEW ==================== -->
      @if (!isYearPickerOpen()) {
        <div class="flex gap-2">
          <!-- Dropdown สำหรับ "วัน" -->
          <select [disabled]="disabled()" (change)="onDayChange($event)" [value]="selectedDay() || ''"
                  class="form-select">
            <option value="" disabled>-- วัน --</option>
            @for (day of daysInMonth(); track day) {
              <option [value]="day">{{ day }}</option>
            }
          </select>

          <!-- Dropdown สำหรับ "เดือน" -->
          <select [disabled]="disabled()" (change)="onMonthChange($event)" [value]="selectedMonth() ?? ''"
                  class="form-select">
            <option value="" disabled>-- เดือน --</option>
            @for (month of months; track month.value) {
              <option [value]="month.value">{{ month.name }}</option>
            }
          </select>

          <!-- ++ ปุ่มสำหรับเปิด Year Picker ++ -->
          <button type="button" [disabled]="disabled()" (click)="toggleYearPicker()"
                  class="form-select text-left w-full">
            {{ selectedYear() || '-- ปี พ.ศ. --' }}
          </button>
        </div>
      }

      <!-- ==================== YEAR PICKER VIEW ==================== -->
      @if (isYearPickerOpen()) {
        <div
          class="absolute top-0 left-0 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 p-2">
          <!-- Header for Year Navigation -->
          <div class="flex justify-between items-center mb-2 px-2">
            <button type="button" (click)="changeYearPickerDecade(-12)"
                    class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">&lt;
            </button>
            <span class="font-semibold text-sm">{{ yearPickerGrid()[0] }} - {{ yearPickerGrid()[11] }}</span>
            <button type="button" (click)="changeYearPickerDecade(12)"
                    class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">&gt;
            </button>
          </div>

          <!-- Grid of Years -->
          <div class="grid grid-cols-4 gap-1">
            @for (year of yearPickerGrid(); track year) {
              <button
                type="button"
                (click)="selectYear(year)"
                class="year-button"
                [class.selected]="year === selectedYear()">
                {{ year }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ThaiDatepicker implements ControlValueAccessor {
  // --- Signals สำหรับเก็บค่าที่ผู้ใช้เลือก ---
  selectedDay = signal<number | null>(null);
  selectedMonth = signal<number | null>(null);
  selectedYear = signal<number | null>(null);

  // --- Signals และข้อมูลสำหรับสร้าง Dropdowns ---
  daysInMonth = signal<number[]>([]);
  readonly months = [
    {value: 0, name: 'มกราคม'}, {value: 1, name: 'กุมภาพันธ์'},
    {value: 2, name: 'มีนาคม'}, {value: 3, name: 'เมษายน'},
    {value: 4, name: 'พฤษภาคม'}, {value: 5, name: 'มิถุนายน'},
    {value: 6, name: 'กรกฎาคม'}, {value: 7, name: 'สิงหาคม'},
    {value: 8, name: 'กันยายน'}, {value: 9, name: 'ตุลาคม'},
    {value: 10, name: 'พฤศจิกายน'}, {value: 11, name: 'ธันวาคม'}
  ];

  // ++ Signals ใหม่สำหรับ Year Picker ++
  isYearPickerOpen = signal(false);
  yearPickerStartYear = signal(new Date().getFullYear() + 543 - 11); // เริ่มต้นให้แสดงทศวรรษปัจจุบัน

  // ++ Computed Signal ใหม่สำหรับสร้าง Grid ของปี ++
  yearPickerGrid = computed(() => {
    const start = this.yearPickerStartYear();
    return Array.from({length: 12}, (_, i) => start + i); // แสดง 12 ปี (4x3 grid)
  });

  // --- Implementation ของ ControlValueAccessor ---
  onChange: (value: Date | null) => void = () => {
  };
  onTouched: () => void = () => {
  };
  disabled = signal(false);

  constructor() {
    this.updateDaysInMonth();
  }

  writeValue(value: Date | null): void {
    if (value && !isNaN(value.getTime())) {
      this.selectedDay.set(value.getDate());
      this.selectedMonth.set(value.getMonth());
      this.selectedYear.set(value.getFullYear() + 543);
      this.updateDaysInMonth();
    } else {
      this.selectedDay.set(null);
      this.selectedMonth.set(null);
      this.selectedYear.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // --- เมธอดสำหรับจัดการการเปลี่ยนแปลงค่า ---
  onDayChange(event: Event) {
    this.selectedDay.set(Number((event.target as HTMLSelectElement).value));
    this.updateValue();
  }

  onMonthChange(event: Event) {
    this.selectedMonth.set(Number((event.target as HTMLSelectElement).value));
    this.updateDaysInMonth();
    this.updateValue();
  }

  // ++ เมธอดใหม่สำหรับ Year Picker ++
  toggleYearPicker(): void {
    if (this.disabled()) return;
    // เมื่อเปิด picker, ให้ grid เริ่มต้นที่ปีที่ถูกเลือกอยู่ (ถ้ามี)
    if (!this.isYearPickerOpen() && this.selectedYear()) {
      this.yearPickerStartYear.set(this.selectedYear()! - 4); // จัดให้อยู่กลางๆ grid
    }
    this.isYearPickerOpen.update(value => !value);
  }

  changeYearPickerDecade(amount: number): void {
    this.yearPickerStartYear.update(year => year + amount);
  }

  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.isYearPickerOpen.set(false); // ปิด picker ทันทีที่เลือก
    this.updateDaysInMonth();
    this.updateValue();
  }

  private updateDaysInMonth() {
    const month = this.selectedMonth();
    const yearBE = this.selectedYear();

    if (month === null || yearBE === null) {
      const days = Array.from({length: 31}, (_, i) => i + 1);
      this.daysInMonth.set(days);
      return;
    }

    const yearCE = yearBE - 543;
    const daysInSelectedMonth = new Date(yearCE, month + 1, 0).getDate();
    const days = Array.from({length: daysInSelectedMonth}, (_, i) => i + 1);
    this.daysInMonth.set(days);

    if (this.selectedDay() && this.selectedDay()! > daysInSelectedMonth) {
      this.selectedDay.set(null);
    }
  }

  private updateValue() {
    this.onTouched();
    const day = this.selectedDay();
    const month = this.selectedMonth();
    const year = this.selectedYear();

    if (day !== null && month !== null && year !== null) {
      const christianYear = year - 543;
      const newDate = new Date(christianYear, month, day);
      this.onChange(newDate);
    } else {
      this.onChange(null);
    }
  }
}
