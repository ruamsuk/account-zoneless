import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { Loading } from './shared/loading';
import { ToastContainer } from './components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ProfileModal } from './pages/profile-modal';

@Component({
  selector: 'app-root',
  imports: [
    Loading,
    ToastContainer,
    ConfirmDialogComponent,
    Header,
    RouterOutlet,
    TitleCasePipe,
    ProfileModal
  ],
  template: `
    <app-loading/>
    <app-toast-container/>
    <app-confirm-dialog/>

    @if (authService.currentUser()) {
      <div class="min-h-screen bg-cover bg-center bg-fixed" style="background-image: url('/images/1001.jpg')">
        <app-header (openProfile)="openProfileModal()"/>
        <div class="text-base md:text-2xl text-center font-semibold">
          <h1 class=" text-gray-200 text-shadow-lg  mb-6">
            ({{ authService.currentUser()?.role | titlecase }}
            ) {{ authService.currentUser()?.email || 'User' }}
          </h1>
        </div>
        <main>
          <router-outlet (activate)="onActivate()"></router-outlet>
        </main>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
    <app-profile-modal
      [isOpen]="isProfileModalOpen()"
      (close)="closeProfileModal()">
    </app-profile-modal>
  `,
  styles: [],
})
export class App implements OnDestroy {
  public authService = inject(AuthService);
  private componentSubscription: Subscription | undefined;

  isProfileModalOpen = signal(false);

  openProfileModal(): void {
    this.isProfileModalOpen.set(true);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
  }

  /**
   *  @HostListener
   * ดักฟัง event การขยับเมาส์และการกดคีย์บอร์ดบนหน้าต่างทั้งหมด
   * แล้วไปเรียกใช้ resetTimer() ใน AuthService
   */
  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  resetIdleTimer() {
    this.authService.resetTimer();
  }

  onActivate() {
    if (this.componentSubscription) {
      this.componentSubscription.unsubscribe();
    }

    this.componentSubscription = new Subscription();

  }

  ngOnDestroy(): void {
    if (this.componentSubscription) {
      this.componentSubscription.unsubscribe();
    }
  }
}
