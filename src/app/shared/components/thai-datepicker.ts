import { Component, computed, effect, ElementRef, forwardRef, HostListener, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thai-datepicker',
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ThaiDatepicker),
      multi: true
    }
  ],
  template: `
    <div class="relative" #datepickerContainer>
      <!-- ==================== INPUT DISPLAY ==================== -->
      <input
        type="text"
        [value]="formattedSelectedDate()"
        (click)="togglePicker()"
        class="form-select"
        placeholder="-- เลือกวันที่ --"
        readonly>

      <!-- ==================== DATEPICKER POPUP ==================== -->
      @if (isPickerOpen()) {
        <div
          class="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 p-2">

          <!-- +++ DAY VIEW +++ -->
          @if (pickerView() === 'days') {
            <!-- Header: Month/Year Navigation -->
            <div class="flex justify-between items-center mb-2 px-2">
              <button type="button" (click)="changeMonth(-1)" class="btn-nav">&lt;</button>
              <div>
                <button type="button" (click)="pickerView.set('months')"
                        class="dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400">{{ months[viewDate().getMonth()].name }}
                </button>
                <button type="button" (click)="pickerView.set('years')"
                        class="dark:text-gray-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 ml-2">{{ viewDate().getFullYear() + 543 }}
                </button>
              </div>
              <button type="button" (click)="changeMonth(1)" class="btn-nav">&gt;</button>
            </div>
            <!-- Day of Week Headers -->
            <div class="grid grid-cols-7 text-center text-md text-gray-500 dark:text-gray-300 mb-1">
              @for (day of weekDays; track day) {
                <span>{{ day }}</span>
              }
            </div>
            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
              @for (day of calendarGrid(); track $index) {
                <button
                  type="button"
                  (click)="selectDate(day.date)"
                  class="day-cell"
                  [disabled]="!day.isCurrentMonth"
                  [class.other-month]="!day.isCurrentMonth"
                  [class.selected]="day.isCurrentMonth && isSameDay(day.date, selectedDate())"
                  [class.today]="day.isCurrentMonth && isSameDay(day.date, today)">
                  @if (day.isCurrentMonth) {
                    <span>{{ day.day }}</span>
                  }
                </button>
              }
            </div>
          }

          <!-- +++ MONTH VIEW +++ -->
          @if (pickerView() === 'months') {
            <div class="grid grid-cols-3 gap-1 text-gray-800 dark:text-gray-300">
              @for (month of months; track month.value) {
                <button type="button" (click)="selectMonth(month.value)" class="month-button">
                  {{ month.name }}
                </button>
              }
            </div>
          }

          <!-- +++ YEAR VIEW +++ -->
          @if (pickerView() === 'years') {
            <div class="flex justify-between items-center mb-2 px-2 text-gray-800 dark:text-gray-300">
              <button type="button" (click)="changeYearPickerDecade(-10)" class="btn-nav">&lt;</button>
              <span class="font-semibold text-sm">{{ yearPickerGrid()[0] }} - {{ yearPickerGrid()[9] }}</span>
              <button type="button" (click)="changeYearPickerDecade(10)" class="btn-nav">&gt;</button>
            </div>
            <div class="grid grid-cols-4 gap-1 dark:text-gray-200">
              @for (year of yearPickerGrid(); track year) {
                <button
                  type="button"
                  (click)="selectYear(year)"
                  class="year-button"
                  [class.selected]="selectedDate() && year === (selectedDate()!.getFullYear() + 543)">
                  {{ year }}
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ThaiDatepicker implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  // --- State Signals ---
  isPickerOpen = signal(false);
  selectedDate = signal<Date | null>(null);
  viewDate = signal(new Date()); // เดือน/ปี ที่กำลังแสดงในปฏิทิน
  pickerView = signal<'days' | 'months' | 'years'>('days');
  today = new Date();

  valueFromParent = signal<any | null>(null);

  // --- Data ---
  readonly months = [
    {value: 0, name: 'มกราคม'}, {value: 1, name: 'กุมภาพันธ์'},
    {value: 2, name: 'มีนาคม'}, {value: 3, name: 'เมษายน'},
    {value: 4, name: 'พฤษภาคม'}, {value: 5, name: 'มิถุนายน'},
    {value: 6, name: 'กรกฎาคม'}, {value: 7, name: 'สิงหาคม'},
    {value: 8, name: 'กันยายน'}, {value: 9, name: 'ตุลาคม'},
    {value: 10, name: 'พฤศจิกายน'}, {value: 11, name: 'ธันวาคม'}
  ];
  readonly weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // --- Computed Signals ---
  formattedSelectedDate = computed(() => {
    const date = this.selectedDate();
    if (!date) return '';
    const day = date.getDate();
    const month = this.months[date.getMonth()].name;
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  });

  calendarGrid = computed(() => {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon,...
    const daysInMonth = lastDayOfMonth.getDate();

    const grid: { day: number, date: Date, isCurrentMonth: boolean }[] = [];

    // Add blank days for the start of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      grid.push({day: 0, date: new Date(), isCurrentMonth: false}); // Placeholder
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({day, date: new Date(year, month, day), isCurrentMonth: true});
    }
    return grid;
  });

  yearPickerGrid = computed(() => {
    const year = this.viewDate().getFullYear() + 543;
    const startYear = Math.floor((year - 1) / 10) * 10 + 1; // Start of the decade
    return Array.from({length: 10}, (_, i) => startYear + i);
  });

  // --- CVA Implementation ---
  onChange: any = () => {
  };
  onTouched: any = () => {
  };
  disabled = signal(false);

  constructor() {
    effect(() => {
      const value = this.valueFromParent();
      let dateValue: Date | null = null;

      if (value instanceof Date) {
        dateValue = value;
      } else if (value && typeof value.toDate === 'function') {
        // Use type assertion (as any) to bypass incorrect type inference
        dateValue = (value as any).toDate();
      }

      if (dateValue && !isNaN(dateValue.getTime())) {
        this.selectedDate.set(dateValue);
        this.viewDate.set(dateValue);
      } else {
        this.selectedDate.set(null);
      }
    });
  }

  writeValue(value: Date | null): void {
    this.valueFromParent.set(value);
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

  // --- UI Methods ---
  togglePicker(): void {
    if (this.disabled()) return;
    this.isPickerOpen.update(v => !v);
    if (this.isPickerOpen()) {
      this.pickerView.set('days');
      if (this.selectedDate()) {
        this.viewDate.set(this.selectedDate()!);
      } else {   // <--- เพิ่มมาใหม่
        this.viewDate.set(new Date());
      }
    }
  }

  changeMonth(offset: number): void {
    this.viewDate.update(d => new Date(d.getFullYear(), d.getMonth() + offset, 1));
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    this.onChange(date);
    this.isPickerOpen.set(false);
  }

  selectMonth(monthIndex: number): void {
    this.viewDate.update(d => new Date(d.getFullYear(), monthIndex, 1));
    this.pickerView.set('days');
  }

  selectYear(yearBE: number): void {
    const yearCE = yearBE - 543;
    this.viewDate.update(d => new Date(yearCE, d.getMonth(), 1));
    this.pickerView.set('days');
  }

  changeYearPickerDecade(offset: number): void {
    this.viewDate.update(d => new Date(d.getFullYear() + offset, d.getMonth(), 1));
  }

  // --- Helper Methods ---
  isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  // Click outside to close
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    console.log('Clicked outside the datepicker');
    if (this.isPickerOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isPickerOpen.set(false);
    }
  }
}
