import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../models/account.model';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatepicker } from '../shared/components/thai-datepicker';
import { NumberFormatDirective } from '../shared/directives/number-format';

@Component({
  selector: 'app-account-modal',
  imports: [
    ReactiveFormsModule,
    ThaiDatePipe,
    DecimalPipe,
    NgClass,
    ThaiDatepicker,
    NumberFormatDirective
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-lg mx-auto dark:bg-gray-800">

          @if (mode() === 'view' && accountToEdit()) {
            <!-- +++ VIEW MODE +++ -->
            <div>
              <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">รายละเอียดรายการ</h2>
              <div class="space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>วันที่:</strong> {{ accountToEdit()?.date | thaiDate:'fullMonth' }}</p>
                <p><strong>รายละเอียด:</strong> {{ accountToEdit()?.details }}</p>
                <p><strong>จำนวนเงิน:</strong>
                  <span [ngClass]="accountToEdit()?.isInCome ? ['text-green-600'] : ['text-red-600']">
                    {{ accountToEdit()?.amount | number:'1.2-2' }}
                  </span>
                </p>
                <p><strong>ประเภท:</strong> {{ accountToEdit()?.isInCome ? 'รายรับ' : 'รายจ่าย' }}</p>
                <p><strong>หมายเหตุ:</strong> {{ accountToEdit()?.remark || '-' }}</p>
                <p class="text-base text-gray-400 pt-4 border-t dark:border-gray-600">
                  <strong>บันทึกเมื่อ:</strong> {{ accountToEdit()?.create | thaiDate:'mediumt' }}</p>
                @if (accountToEdit()?.modify) {
                  <p class="text-base text-gray-400">
                    <strong>แก้ไขล่าสุด:</strong> {{ accountToEdit()?.modify | thaiDate:'mediumt' }}
                  </p>
                }
              </div>
              <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                <button type="button" (click)="onClose()" class="btn-secondary">Close</button>
                <button type="button" (click)="switchToEditMode()" class="btn-primary">Edit</button>
              </div>
            </div>
          } @else {
            <!-- +++ FORM MODE (Add/Edit) +++ -->
            <div>
              <h2 class="text-2xl font-thasadith font-semibold text-gray-700 dark:text-gray-200 mb-6">
                {{ isEditing() ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}
              </h2>
              <form [formGroup]="accountForm" (ngSubmit)="onFormSubmit()">
                <div class="mb-4">
                  <label class="form-label">วันที่</label>
                  <app-thai-datepicker formControlName="date"></app-thai-datepicker>
                </div>
                <div class="mb-4">
                  <label class="form-label">รายละเอียด</label>
                  <input type="text" formControlName="details" class="form-input">
                </div>
                <div class="mb-4">
                  <label class="form-label">จำนวนเงิน</label>
                  <input id="amount"
                         type="text"
                         inputmode="decimal"
                         formControlName="amount"
                         class="form-input"
                         appNumberFormat>
                </div>
                <div class="mb-4">
                  <label class="form-label">หมายเหตุ</label>
                  <input type="text" formControlName="remark" class="form-input">
                </div>
                <div class="flex items-center mb-6">
                  <input type="checkbox" id="isInCome" formControlName="isInCome"
                         class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  <label for="isInCome" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">เป็นรายรับ</label>
                </div>
                <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                  <button type="button" (click)="onClose()" class="btn-secondary">Cancel</button>
                  <button type="submit" [disabled]="accountForm.invalid" class="btn-primary">
                    {{ isEditing() ? 'Update' : 'Save' }}
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: ``
})
export class AccountModal {
  private fb = inject(FormBuilder);

  // --- Inputs & Outputs (Signal-based) ---
  isOpen = input<boolean>(false);
  accountToEdit = input<Account | null>(null);
  initialMode = input.required<'view' | 'form'>();
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // --- Component State ---
  mode = signal<'view' | 'form'>('form');
  isEditing = computed(() => !!this.accountToEdit() && this.mode() === 'form');
  accountForm!: FormGroup;

  constructor() {
    this.initializeForm();

    // Effect will react to changes in inputs and update the form/mode
    effect(() => {
      // This runs whenever isOpen, initialMode, or accountToEdit changes
      if (this.isOpen()) {
        this.mode.set(this.initialMode());
        this.initializeForm(this.accountToEdit());
      }
    });
  }

  private initializeForm(data: Account | null = null): void {
    const dateValue = data?.date || new Date();
    this.accountForm = this.fb.group({
      date: [dateValue, Validators.required],
      details: [data?.details || '', Validators.required],
      amount: [data?.amount || 0, [Validators.required, Validators.min(0.01)]],
      isInCome: [data?.isInCome || false],
      remark: [data?.remark || '']
    });
  }

  switchToEditMode(): void {
    this.mode.set('form');
  }

  onClose(): void {
    this.close.emit();
  }

  onFormSubmit(): void {
    if (this.accountForm.invalid) return;
    const formValue = this.accountForm.value;
    const dataToSave = {...formValue};
    this.save.emit(dataToSave);
  }
}
