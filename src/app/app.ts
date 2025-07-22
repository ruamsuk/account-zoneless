import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Loading } from './shared/loading';
import { ToastContainer } from './components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header';
import { TransactionForm } from './features/transactions/transaction-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading, ToastContainer, ConfirmDialogComponent, Header, TransactionForm],
  template: `
    <app-loading/>
    <app-toast-container/>
    <app-confirm-dialog/>

    @if (authService.currentUser()) {
      <div class="min-h-screen bg-cover bg-center bg-fixed" style="background-image: url('/images/1001.jpg')">
        <app-header (openTransactionModal)="openModal()"/>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 z-40" (click)="closeModal()"></div>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 class="text-xl font-semibold">เพิ่ม/แก้ไข รายการ</h3>
              <button (click)="closeModal()" class="btn-icon-round">
                <svg class="w-6 h-6">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <app-transaction-form (formClose)="closeModal()"></app-transaction-form>
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

  isModalOpen = signal(false);

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
