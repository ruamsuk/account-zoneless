import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BloodPressure } from '../../models/blood-pressure.model';
import { BpMask } from '../../shared/directives/bp-mask';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';

@Component({
  selector: 'app-blood-add-edit-modal',
  imports: [
    ReactiveFormsModule,
    BpMask,
    ThaiDatepicker
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="onDialogContentClick($event)"
             class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-xl mx-auto dark:bg-gray-800">
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
            {{ isEditing() ? 'แก้ไขบันทึกความดัน' : 'เพิ่มบันทึกความดันใหม่' }}
          </h2>
          <form [formGroup]="bpForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="form-label">วันที่</label>
              <app-thai-datepicker
                [shouldClose]="shouldClose()"
                (closed)="onCloseFromChild()"
                formControlName="date"></app-thai-datepicker>
            </div>

            <!-- Morning Readings -->
            <fieldset class="border p-4 rounded-md mb-4 dark:border-gray-600">
              <legend class="px-2 font-semibold text-green-600 dark:text-green-400">ช่วงเช้า (Morning)</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" formGroupName="morning">
                <div>
                  <label class="form-label">ครั้งที่ 1 (BP1)</label>
                  <!--  1. ส่ง "ป้ายชื่อ" ของ input ตัวถัดไป  -->
                  <input type="text" formControlName="bp1" class="form-input" placeholder="SYS/DIA P..." bpMask
                         [nextInput]="morningBp2Input">
                </div>
                <div>
                  <label class="form-label">ครั้งที่ 2 (BP2)</label>
                  <!--  2. "ป้ายชื่อ" ถูกติดไว้ที่นี่ และส่งต่อไปยังตัวถัดไป  -->
                  <input #morningBp2Input type="text" formControlName="bp2" class="form-input"
                         placeholder="SYS/DIA P..." bpMask [nextInput]="eveningBp1Input">
                </div>
              </div>
            </fieldset>

            <!-- Evening Readings -->
            <fieldset class="border p-4 rounded-md mb-6 dark:border-gray-600">
              <legend class="px-2 font-semibold text-yellow-600 dark:text-yellow-400">ช่วงเย็น (Evening)</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" formGroupName="evening">
                <div>
                  <label class="form-label">ครั้งที่ 1 (BP1)</label>
                  <input #eveningBp1Input type="text" formControlName="bp1" class="form-input"
                         placeholder="SYS/DIA P..." bpMask [nextInput]="eveningBp2Input">
                </div>
                <div>
                  <label class="form-label">ครั้งที่ 2 (BP2)</label>
                  <input #eveningBp2Input type="text" formControlName="bp2" class="form-input"
                         placeholder="SYS/DIA P..." bpMask>
                </div>
              </div>
            </fieldset>

            <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
              <button type="button" (click)="onClose()" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="bpForm.invalid" class="btn-primary">
                {{ isEditing() ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class BloodAddEditModal {
  private fb = inject(FormBuilder);

  // --- Inputs & Outputs (Signal-based) ---
  shouldClose = signal(false);
  isOpen = input<boolean>(false);
  itemToEdit = input<BloodPressure | null>(null);
  close = output<void>();
  save = output<any>();

  // --- Component State ---
  isEditing = computed(() => !!this.itemToEdit());
  bpForm!: FormGroup;

  onDialogContentClick(event: MouseEvent) {
    this.shouldClose.set(true);
    event.stopPropagation();
  }

  onCloseFromChild(): void {
    this.shouldClose.set(false);
  }

  constructor() {
    this.initializeForm(); // Initialize form structure once

    // Effect จะคอย "จับตาดู" input signals และอัปเดตฟอร์มโดยอัตโนมัติ
    effect(() => {
      // effect นี้จะทำงานทุกครั้งที่ isOpen() หรือ itemToEdit() เปลี่ยนแปลง
      if (this.isOpen()) {
        const item = this.itemToEdit();
        this.initializeForm(item);
      }
    });
  }

  private initializeForm(data: BloodPressure | null = null): void {
    const dateValue = data?.date || new Date();

    this.bpForm = this.fb.group({
      date: [dateValue, Validators.required],
      morning: this.fb.group({
        bp1: [data?.morning?.bp1 || '', Validators.required], // ทำงานกับ string
        bp2: [data?.morning?.bp2 || '', Validators.required]
      }),
      evening: this.fb.group({
        bp1: [data?.evening?.bp1 || '', Validators.required],
        bp2: [data?.evening?.bp2 || '', Validators.required]
      })
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.bpForm.invalid) return;
    const formValue = this.bpForm.value;
    const dataToSave = {...formValue};
    this.save.emit(dataToSave);
  }
}
