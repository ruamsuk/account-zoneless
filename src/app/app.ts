import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { Loading } from './shared/loading';
import { ToastContainer } from './components/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    Loading,
    ToastContainer,
    ConfirmDialogComponent,
    Header,
    RouterOutlet
  ],
  template: `
    <app-loading/>
    <app-toast-container/>
    <app-confirm-dialog/>

    @if (authService.currentUser()) {
      <div class="min-h-screen bg-cover bg-center bg-fixed" style="background-image: url('/images/1001.jpg')">
        <app-header/>
        <main>
          <router-outlet (activate)="onActivate()"></router-outlet>
        </main>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }

  `,
  styles: [],
})
export class App implements OnDestroy {
  public authService = inject(AuthService);
  private componentSubscription: Subscription | undefined;

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
