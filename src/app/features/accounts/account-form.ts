import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-account-form',
  imports: [
    ReactiveFormsModule
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
          <input id="amount" type="number" formControlName="amount" class="form-input">
        </div>

        <div class="flex items-center mt-4">
          <input id="isInCome" type="checkbox" formControlName="isInCome"
                 class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
          <label for="isInCome" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">เป็นรายการรายรับ</label>
        </div>

        <div>
          <label for="date" class="form-label">วันที่</label>
          <input id="date" type="date" formControlName="date" class="form-input">
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
export class AccountForm implements OnInit {
  private fb = inject(FormBuilder);
  // 👇 ใช้ EventEmitter เพื่อส่งข้อมูลกลับไปยัง parent component
  @Output() formClose = new EventEmitter<void>();
  // 👇 ใช้ Input เพื่อรับข้อมูลบัญชีที่จะแก้ไขจาก parent component
  @Input() accountToEdit!: Account | null;

  private accountService = inject(AccountService); // <-- ใช้ service ใหม่
  accountForm!: FormGroup;

  ngOnInit(): void {
    // 👇 ปรับฟอร์มให้ตรงกับ Interface 'Account'
    this.accountForm = this.fb.group({
      details: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      isInCome: [false, Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      remark: ['']
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) return;

    const formData = this.accountForm.value;

    // 👇 แปลงข้อมูล amount ให้เป็น number ที่นี่
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
        console.log('Account added successfully!');
        this.formClose.emit();
      })
      .catch(error => console.error('Error adding account: ', error));
  }

  onCancel(): void {
    this.formClose.emit();
  }
}
