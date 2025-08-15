import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';
import { ToastService } from '../../services/toast.service';
import { NumberFormatDirective } from '../../shared/directives/number-format';

@Component({
  selector: 'app-account-form',
  imports: [
    ReactiveFormsModule,
    ThaiDatepicker,
    NumberFormatDirective,
    NumberFormatDirective
  ],
  template: `
    <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
      <div class="space-y-4">

        <div>
          <label for="details" class="form-label">รายละเอียด</label>
          <input id="details" type="text" formControlName="details" class="form-input">
        </div>

        <div>
          <label for="amount" class="form-label">จำนวนเงิน</label>
          <input id="amount"
                 type="text"
                 inputmode="decimal"
                 formControlName="amount"
                 class="form-input"
                 appNumberFormat>
        </div>

        <div class="flex items-center mt-4">
          <input id="isInCome" type="checkbox" formControlName="isInCome"
                 class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
          <label for="isInCome" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">เป็นรายรับ</label>
        </div>

        <div>
          <label for="date" class="form-label">วันที่</label>
          <app-thai-datepicker id="date" formControlName="date"></app-thai-datepicker>
        </div>

        <div>
          <label for="remark" class="form-label">หมายเหตุ</label>
          <textarea id="remark" formControlName="remark" class="form-input" rows="3"></textarea>
        </div>

      </div>

      <div class="mt-8 flex justify-end gap-4">
        <button type="button" (click)="onCancel()" class="btn-secondary">ยกเลิก</button>
        <button type="submit" [disabled]="accountForm.invalid" class="btn-primary">บันทึก</button>
      </div>
    </form>
  `,
  styles: ``
})
export class AccountForm {
  formClose = output<void>();

  accountToEdit = input<Account | null>(null);

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  accountForm!: FormGroup;

  constructor() {
    effect(() => {
      const account = this.accountToEdit();
      this.initializeForm(account);
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

  onSubmit(): void {
    if (this.accountForm.invalid) return;

    const formData = this.accountForm.value;

    // --- แปลง Timestamp เป็น Date object ---
    if (this.accountToEdit) {
      let finalDate;
      if (formData.date && typeof formData.date.toDate === 'function') {
        finalDate = formData.date.toDate(); // ถ้าใช่, ให้แปลงเป็น JS Date
      } else {
        finalDate = new Date(formData.date); // ถ้าไม่ใช่, ก็สร้าง Date object ตามปกติ
      }

      const updatedData: Account = {
        ...this.accountToEdit,
        ...formData,
        date: finalDate,
      };
      this.accountService.updateAccount(updatedData)
        .then(() => {
          this.toastService.show('Success', 'อัปเดตข้อมูลเรียบร้อย', 'success');
          this.formClose.emit();
        })
        .catch(err => this.toastService.show('Error', 'ไม่สามารถอัปเดตข้อมูลได้' + err, 'error'));
    } else {
      // แปลงค่า amount เป็นตัวเลขก่อนบันทึก
      const amountAsNumber = typeof formData.amount === 'string'
        ? parseFloat(formData.amount)
        : formData.amount;

      const accountData: Omit<Account, 'id'> = {
        details: formData.details,
        amount: amountAsNumber, // <-- ใช้ค่าที่แปลงแล้ว
        isInCome: formData.isInCome,
        date: new Date(formData.date),
        remark: formData.remark
      };
      this.accountService.addAccount(accountData)
        .then(() => {
          this.toastService.show('Success', 'Account added successfully!', 'success');
          this.formClose.emit();
        })
        .catch(error => {
          this.toastService.show('Error', 'ไม่สามารถเพิ่มข้อมูลได้', 'error');
          console.error('Error adding account: ', error);
        });
    }
  }

  onCancel(): void {
    this.formClose.emit();
  }
}
