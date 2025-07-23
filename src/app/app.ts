import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Loading } from './shared/loading';
import { ToastContainer } from './components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header';
import { AccountForm } from './features/accounts/account-form';
import { Account } from './models/account.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading, ToastContainer, ConfirmDialogComponent, Header, AccountForm],
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
              <h3 class="text-xl font-semibold">
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

    } @else {
      <router-outlet></router-outlet>
    }

  `,
  styles: [],
})
export class App {
  public authService = inject(AuthService);
  private router = inject(Router);

  editingAccount = signal<Account | null>(null); // Signal สำหรับส่งข้อมูลไปแก้ไข
  isModalOpen = signal(false);

  onActivate(component: any) {
    // เช็คว่า component ที่โหลดมี event ที่ชื่อ requestOpenModal หรือไม่
    if (component.requestOpenModal) {
      // ถ้ามี ให้ subscribe เพื่อรอรับ event
      component.requestOpenModal.subscribe(() => {
        this.editingAccount.set(null); // เคลียร์ข้อมูลเก่า
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
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth/login']).then();
    });
  }
}
