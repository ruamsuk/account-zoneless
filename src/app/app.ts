import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from './shared/loading';
import { ToastContainer } from './components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header';
import { AccountForm } from './features/accounts/account-form';
import { Account } from './models/account.model';
import { AccountDetail } from './features/accounts/account-detail';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Loading,
    ToastContainer,
    ConfirmDialogComponent,
    Header,
    AccountForm,
    AccountDetail
  ],
  template: `
    <app-loading/>
    <app-toast-container/>
    <app-confirm-dialog/>

    @if (authService.currentUser()) {
      <div class="min-h-screen bg-cover bg-center bg-fixed" style="background-image: url('/images/1001.jpg')">
        <app-header (openTransactionModal)="openModal()"/>
        <main>
          <router-outlet (activate)="onActivate($event)"></router-outlet>
        </main>
      </div>

      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 z-40" (click)="closeModal()"></div>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 class="text-xl font-thasadith text-gray-300 font-semibold">
                {{ editingAccount() ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}
              </h3>
              <button (click)="closeModal()" class="btn-icon-round">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <app-account-form [accountToEdit]="editingAccount()" (formClose)="closeModal()"></app-account-form>
            </div>
          </div>
        </div>
      }
      @if (isDetailModalOpen()) {
        <div class="fixed inset-0 bg-black/60 z-40" (click)="closeDetailModal()"></div>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 class="text-xl font-thasadith text-gray-800 dark:text-gray-100 font-semibold">รายละเอียดรายการ</h3>
              <button (click)="closeDetailModal()" class="btn-icon-round">
                <svg class="w-6 h-6">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <app-account-detail [account]="viewingAccount()" (close)="closeDetailModal()"></app-account-detail>
            </div>
          </div>
        </div>
      }
    } @else {
      <router-outlet></router-outlet>
    }

  `,
  styles: [],
})
export class App {
  public authService = inject(AuthService);

  editingAccount = signal<Account | null>(null); // Signal สำหรับส่งข้อมูลไปแก้ไข
  isModalOpen = signal(false);
  isDetailModalOpen = signal(false);
  viewingAccount = signal<Account | null>(null);

  onActivate(component: any) {
    // เช็คว่า component ที่โหลดมี event ที่ชื่อ requestOpenModal หรือไม่
    if (component.requestOpenModal) {
      component.requestEditModal.subscribe((account: Account) => {
        this.editingAccount.set(account);
        this.openModal();
      });
    }
    // เพิ่มการเชื่อม event สำหรับการแก้ไข
    if (component.requestEditModal) {
      component.requestEditModal.subscribe((account: Account) => {
        this.editingAccount.set(account); // รับข้อมูลที่จะแก้ไข
        this.openModal();
      });
    }

    if (component.requestViewModal) {
      component.requestViewModal.subscribe((account: Account) => {
        this.viewingAccount.set(account);
        this.isDetailModalOpen.set(true);
      });
    }
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
  }
}
