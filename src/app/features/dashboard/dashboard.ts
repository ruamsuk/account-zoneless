import { Component, inject, signal } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { LoadingService } from '../../services/loading.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgClass,
    DecimalPipe,
    ThaiDatePipe
  ],
  template: `
    <!--<div class="flex flex-col items-center justify-center text-center pt-24 md:pt-32">
      <h1 class="text-5xl md:text-6xl text-white font-bold font-serif text-shadow-lg">
        Welcome to Your Site
      </h1>
      <p class="mt-4 text-white/90 text-lg md:text-xl font-sans text-shadow">
        A comprehensive solution for all your accounting needs.
      </p>
    </div>-->

    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold text-white text-shadow">Dashboard</h1>
        <button (click)="openModal()" class="btn-primary inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 mr-2">
            <path fill-rule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                  clip-rule="evenodd"/>
          </svg>
          เพิ่มรายการ
        </button>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center text-center">
      <h1 class="text-4xl md:text-5xl text-white font-bold font-serif text-shadow-lg">
        Welcome to Your Site
      </h1>
      <p class="mt-4 text-white/90 text-lg md:text-xl font-sans text-shadow">
        A comprehensive solution for all your accounting needs.
      </p>
    </div>

    <div class="p-4 sm:p-6 lg:p-8">
      <div class="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-8 max-w-6xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">รายการล่าสุด</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
            <tr class="border-b-2 border-gray-400 dark:border-gray-600 dark:text-gray-200">
              <th class="p-3 text-left text-lg font-semibold">วันที่</th>
              <th class="p-3 text-left text-lg font-semibold">รายการ</th>
              <th class="p-3 text-right text-lg font-semibold">จำนวนเงิน</th>
              <th class="p-3 text-left text-lg font-semibold">ประเภท</th>
              <th class="p-3 text-center text-lg font-semibold">Actions</th>
            </tr>
            </thead>
            <tbody>
              @for (acc of accounts(); track acc.id) {
                <tr class="border-b dark:border-gray-700 hover:bg-white/50 dark:hover:bg-black/50 dark:text-gray-200">
                  <td class="p-3" [ngClass]="acc.isInCome ? ['text-green-400'] : ['']">{{ acc.date | thaiDate }}</td>
                  <td class="p-3" [ngClass]="acc.isInCome ? ['text-green-400'] : ['']">{{ acc.details }}</td>
                  <td class="p-3 text-right font-medium"
                      [ngClass]="acc.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                    {{ acc.isInCome ? '+' : '-' }} {{ acc.amount | number:'1.2-2' }}
                  </td>

                  <td class="p-3 font-medium text-green-600 dark:text-green-400">
                    @if (acc.isInCome) {
                      <span>รายรับ</span>
                    }
                  </td>

                  <td class="p-3">
                    <div class="flex items-center justify-center gap-2">
                      <button title="ดูรายละเอียด" class="btn-icon text-sky-500">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button title="แก้ไข" class="btn-icon text-amber-400">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/>
                        </svg>
                      </button>
                      <button title="ลบ" class="btn-icon text-red-500">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class Dashboard {
  isModalOpen = signal(false);

  private accountService = inject(AccountService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  accounts = this.getAccounts();

  private getAccounts() {
    this.loadingService.show(); // 👈 1. เปิด loading ก่อน

    return toSignal(
      (this.accountService.getAccounts() as Observable<Account[]>)
        .pipe(
          tap(() => {
            this.loadingService.hide();
          }),
          catchError((err: any) => {
            this.toastService.show('Error', 'Error loading accounts' + err.message, 'error');
            console.error(err);
            return throwError(() => err);
          }),
          finalize(() => this.loadingService.hide())
        ),
      {
        initialValue: [],
      }
    );
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }
}
