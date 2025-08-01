import { Component, ElementRef, EventEmitter, HostListener, inject, OnInit, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  template: `
    <header class="bg-transparent  sticky top-0 z-30 backdrop-blur-sm">
      <nav class="container mx-auto px-4 md:px-8 py-3">
        <div class="flex justify-between items-center">

          <a routerLink="/" class="flex items-center gap-3">
            <img src="/images/primeng-logo.png" alt="logo" class="h-8 w-8">
            <span class="text-2xl text-white text-shadow-lg font-semibold font-serif">Account App</span>
          </a>

          <div class="hidden md:flex items-center gap-4">
            <a routerLink="/dashboard" class="nav-link">Dashboard</a>
            <div class="relative" #transactionsMenu>
              <button (click)="toggleTransactionsMenu()" class="nav-link flex items-center gap-1">
                <span>Transactions</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                        clip-rule="evenodd"/>
                </svg>
              </button>
              @if (isTransactionsMenuOpen()) {
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-40">
                  <a routerLink="/transactions" (click)="closeTransactionsMenu()"
                     class="dropdown-item">รายการทั้งหมด</a>
                  <a href="#" (click)="requestOpenModal()" class="dropdown-item">เพิ่มรายการใหม่</a>
                  <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <a routerLink="/reports/date-range" (click)="closeTransactionsMenu()" class="dropdown-item">
                    รายงานตามช่วงเวลา
                  </a>
                </div>
              }
            </div>

            <button (click)="toggleTheme()" class="btn-icon-round" title="Toggle theme">
              @if (isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                     class="w-6 h-6 text-yellow-400">
                  <path
                    d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 2.25zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.364 5.636a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM18.364 18.364a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM12 21.75a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zM5.636 18.364a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM3.75 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.636 5.636a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L5.636 6.7a.75.75 0 010-1.06z"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6 text-gray-700">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998Z"/>
                </svg>
              }
            </button>
            <button (click)="logout()" class="btn-secondary-sm">Logout</button>
          </div>

          <div class="md:hidden flex items-center gap-2">
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: ``
})
export class Header implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef);

  isTransactionsMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isDarkMode = signal(false);

  // Output สำหรับส่ง Event
  @Output() openTransactionModal = new EventEmitter<void>();

  // เมธอดสำหรับเปิด/ปิด Dropdown
  toggleTransactionsMenu() {
    this.isTransactionsMenuOpen.update(value => !value);
  }

  closeTransactionsMenu() {
    this.isTransactionsMenuOpen.set(false);
  }

  // เมธอดสำหรับส่ง Event ขอเปิด Modal
  requestOpenModal() {
    this.openTransactionModal.emit();
    this.closeTransactionsMenu(); // ปิด Dropdown หลังคลิก
  }

  // ตรวจจับการคลิกนอก Dropdown เพื่อปิดเมนู
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeTransactionsMenu();
    }
  }

  ngOnInit(): void {
    // Check local storage for saved theme and set it
    if (localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.isDarkMode.set(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.isDarkMode.set(false);
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
