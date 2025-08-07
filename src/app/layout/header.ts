import { Component, ElementRef, EventEmitter, HostListener, inject, OnInit, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  template: `
    <header class="bg-transparent sticky top-0 backdrop-blur-sm z-50 print-hide">
      <nav class="container mx-auto px-4 md:px-8 py-3">
        <div class="flex justify-between items-center">

          <a routerLink="/" class="flex items-center gap-3">
            <img ngSrc="/images/primeng-logo.png" alt="logo" class="h-8 w-8" height="43" width="40">
            <span class="text-2xl text-white text-shadow-lg font-semibold font-serif">Account App</span>
          </a>

          <div class="hidden md:flex items-center gap-4">

            <!-- Account menu -->
            <div class="relative" #transactionsMenu>
              <button (click)="toggleTransactionsMenu()" class="nav-link flex items-center gap-1">
                <span>Cash</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                        clip-rule="evenodd"/>
                </svg>
              </button>

              <!-- Popup menu for account -->
              @if (isTransactionsMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                  <a routerLink="/dashboard" (click)="closeTransactionsMenu()"
                     class="dropdown-item">รายการทั้งหมด</a>
                  <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <a routerLink="/reports/date-range" (click)="closeTransactionsMenu()" class="dropdown-item">
                    รายงานตามช่วงเวลา
                  </a>
                  <a routerLink="/financial-report" (click)="closeTransactionsMenu()"
                     class="dropdown-item">
                    รายงานรายเดือน/ประเภท
                  </a>
                  <a routerLink="/annual-report" (click)="closeTransactionsMenu()"
                     class="dropdown-item">
                    รายงานรายปี
                  </a>
                </div>
              }
            </div>

            <!-- Credit Menu -->
            <div class="relative">
              <button (click)="toggleCreditMenu($event)" class="nav-link flex items-center gap-1"
                      [class.active]="isCreditMenuOpen()">
                <span>Credit</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                        clip-rule="evenodd"/>
                </svg>
              </button>

              @if (isCreditMenuOpen()) {
                <div
                  class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
                  <div class="py-1">
                    <a routerLink="/credit/list" (click)="closeCreditMenu()" class="dropdown-item">
                      รายการทั้งหมด
                    </a>
                    <a routerLink="/credit/report" (click)="closeCreditMenu()" class="dropdown-item">
                      รายการรายเดือน
                    </a>
                    <a routerLink="/credit/credit-annual-report" (click)="closeCreditMenu()" class="dropdown-item">
                      รายการรายปี
                    </a>
                    <!-- คุณสามารถเพิ่มลิงก์อื่นๆ ได้ที่นี่ -->
                  </div>
                </div>
              }
            </div>

            <!-- Blood Menu -->
            <div class="relative">
              <button routerLink="/blood/list" class="nav-link flex items-center gap-1">
                <span>Blood</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                        clip-rule="evenodd"/>
                </svg>
              </button>
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
            <button (click)="toggleMobileMenu()" class="btn-icon-round">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m4-6h-4"></path>
              </svg>
            </button>
          </div>
        </div>

        <!--@if (isMobileMenuOpen()) {
          <div class="md:hidden mt-4">
            <div class="flex flex-col gap-2 ">
              <span class="mobile-menu-header">รายการเงินสด</span>
              <a routerLink="/" (click)="closeMobileMenu()" class="mobile-menu-item">Dashboard</a>
              <a routerLink="/dashboard" (click)="closeMobileMenu()" class="mobile-menu-item">รายการทั้งหมด</a>
              <a routerLink="/reports/date-range" (click)="closeMobileMenu()"
                 class="mobile-menu-item">รายงานตามช่วงเวลา</a>
              <a routerLink="/financial-report" (click)="closeMobileMenu()"
                 class="mobile-menu-item">
                รายงานรายเดือน/ประเภท
              </a>
              <a routerLink="/annual-report" (click)="closeMobileMenu()"
                 class="mobile-menu-item">
                รายงานรายปี
              </a>
              &lt;!&ndash; ===== เส้นคั่น ===== &ndash;&gt;
              <div class="px-3 py-2">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              &lt;!&ndash; ===== ส่วนบัตรเครดิต (Credit) ===== &ndash;&gt;
              <span class="mobile-menu-header">บัตรเครดิต</span>
              <a routerLink="/credit/list" (click)="closeMobileMenu()" class="mobile-menu-item">รายการบัตรเครดิต</a>
              <a routerLink="/credit/report" (click)="closeMobileMenu()" class="mobile-menu-item">รายงานประจำเดือน</a>
              <a routerLink="/credit/credit-annual-report" (click)="closeMobileMenu()"
                 class="mobile-menu-item">รายงานประจำปี</a>

              &lt;!&ndash; ===== เส้นคั่น ===== &ndash;&gt;
              <div class="px-3 py-2">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              &lt;!&ndash; ===== ส่วนบัญชีและการตั้งค่า ===== &ndash;&gt;
              <a routerLink="/profile" (click)="closeMobileMenu()" class="mobile-menu-item">โปรไฟล์</a>
              @if (authService.currentUser()?.role === 'admin') {
                <a routerLink="/user-management" (click)="closeMobileMenu()" class="mobile-menu-item">จัดการผู้ใช้</a>
              }
              <button (click)="logout()" class="mobile-menu-item text-red-500 w-full text-left">ออกจากระบบ</button>

            </div>
          </div>
        }-->
        <!-- ใน template ของ app.ts -->

        @if (isMobileMenuOpen()) {
          <!-- บล็อกที่แก้ไขแล้ว-->
          <div
            class="md:hidden mt-2 p-2 absolute top-full right-4 w-56 origin-top-right rounded-md bg-gray-100 dark:bg-black/60 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div class="flex flex-col gap-1">

              <!-- ===== ส่วนเงินสด (Cash) ===== -->
              <span class="mobile-menu-header">รายงานเงินสด</span>
              <a routerLink="/dashboard" (click)="closeMobileMenu()"
                 class="mobile-menu-item">รายการทั้งหมด</a>
              <a routerLink="/reports/date-range" (click)="closeMobileMenu()"
                 class="mobile-menu-item ">รายงานตามช่วงเวลา</a>
              <a routerLink="/financial-report" (click)="closeMobileMenu()" class="mobile-menu-item">รายงานรายเดือน</a>
              <a routerLink="/annual-report" (click)="closeMobileMenu()" class="mobile-menu-item">รายงานรายปี</a>

              <!-- ===== เส้นคั่น ===== -->
              <div class="px-3 py-1">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <!-- ===== ส่วนบัตรเครดิต (Credit) ===== -->
              <span class="mobile-menu-header">บัตรเครดิต</span>
              <a routerLink="/credit-list" (click)="closeMobileMenu()" class="mobile-menu-item">รายการบัตรเครดิต</a>
              <a routerLink="/credit-report" (click)="closeMobileMenu()" class="mobile-menu-item">รายงานประจำเดือน</a>
              <a routerLink="/credit-annual-report" (click)="closeMobileMenu()"
                 class="mobile-menu-item">รายงานประจำปี</a>

              <!-- ===== เส้นคั่น ===== -->
              <div class="px-3 py-1">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <!-- ===== เส้นคั่น ===== -->
              <div class="px-3 py-1">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <span class="mobile-menu-header">ความดันโลหิต</span>
              <a routerLink="/blood/list" (click)="closeMobileMenu()" class="mobile-menu-item">ความดันโลหิต</a>

              <!-- ===== เส้นคั่น ===== -->
              <div class="px-3 py-1">
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <!-- ===== ส่วนบัญชีและการตั้งค่า ===== -->
              <a routerLink="/profile" (click)="closeMobileMenu()" class="mobile-menu-item">โปรไฟล์</a>
              @if (authService.currentUser()?.role === 'admin') {
                <a routerLink="/user-management" (click)="closeMobileMenu()" class="mobile-menu-item">จัดการผู้ใช้</a>
              }
              <button (click)="logout()" class="mobile-menu-item text-red-500 w-full text-left">ออกจากระบบ</button>

            </div>
          </div>
        }
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
  isCreditMenuOpen = signal(false);
  // สถานะสำหรับเมนูมือถือ
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

  // เมธอดสำหรับเปิด/ปิดเมนู Credit
  toggleCreditMenu(event: Event): void {
    event.stopPropagation();
    this.isCreditMenuOpen.update(value => !value);
  }

  closeCreditMenu() {
    this.isCreditMenuOpen.set(false);
  }

  // เมธอดสำหรับส่ง Event ขอเปิด Modal
  requestOpenModal() {
    this.openTransactionModal.emit();
    this.closeTransactionsMenu(); // ปิด Dropdown หลังคลิก
  }

  // ตรวจจับการคลิกนอก Dropdown เพื่อปิดเมนู
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isCreditMenuOpen() || !this.eRef.nativeElement.contains(event.target)) {
      this.closeTransactionsMenu();
      this.closeCreditMenu();
      this.closeMobileMenu();
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
      this.router.navigate(['/auth/login']).then();
    });
  }

}
