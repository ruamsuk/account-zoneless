import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgClass,
    NgOptimizedImage
  ],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-900  p-8 rounded-xl shadow-lg w-full max-w-md">
        <div class="flex justify-center">
          <img ngSrc="/images/primeng-logo.png" alt="logo" height="43" width="40">
        </div>
        <div class="flex justify-center text-900 dark:text-gray-300 text-2xl font-medium my-5">
          Ruamsuk Acc.
        </div>

        @if (successMessage()) {
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span class="block sm:inline">{{ successMessage() }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="email"
                   [ngClass]="email?.invalid && email?.touched ? ['text-red-500'] : ['text-gray-600 dark:text-gray-400']"
                   class="block text-gray-800 dark:text-gray-400 font-medium mb-2">Email
            </label>
            <input
              type="email" id="email" formControlName="email"
              class="form-input"
              [ngClass]="email?.invalid && email?.touched ?
              ['border-red-500 focus:ring-red-500'] :
              ['border-gray-300 focus:ring-blue-500 dark:border-gray-400']" autocomplete="email">

            @if (email?.invalid && email?.touched) {
              <p class="mt-1 text-sm text-red-600">กรุณากรอกอีเมลให้ถูกต้อง</p>
            }
          </div>
          <div class="mb-6">
            <label for="password"
                   [ngClass]="password?.invalid && password?.touched ? ['text-red-500'] : ['text-gray-600 dark:text-gray-400']"
                   class="block text-gray-800 dark:text-gray-400 font-medium mb-2">Password
            </label>
            <div class="relative">
              <input [type]="passwordVisible() ? 'text' : 'password'" id="password" formControlName="password"
                     class="form-input" placeholder="Password"
                     [ngClass]="password?.invalid && password?.touched ?
                     ['border-red-500 focus:ring-red-500'] :
                     ['border-gray-300 focus:ring-blue-500 dark:border-gray-400']" autocomplete="current-password">

              <button type="button" (click)="togglePasswordVisibility()"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                @if (passwordVisible()) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228"/>
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                       class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"/>
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
              </button>
            </div>
            @if (password?.invalid && password?.touched) {
              <p class="mt-1 text-sm text-red-600">กรุณากรอกรหัสผ่าน</p>
            }
          </div>

          <div class="text-right mb-6">
            <a routerLink="/forgot-password" class="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          @if (errorMessage()) {
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span class="block sm:inline">{{ errorMessage() }}</span>
            </div>
          }

          <div class="flex items-start justify-center">
            @if (loading()) {
              <button type="button"
                      class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed"
              >
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </button>
            } @else {
              <button type="submit" [disabled]="loginForm.invalid" [ngClass]="{'btn-disabled': loginForm.invalid}"
                      class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150">
                Login
              </button>
            }
          </div>
        </form>
        <div class="relative flex py-5 items-center">
          <div class="flex-grow border-t border-gray-400"></div>
          <span class="flex-shrink mx-4 text-gray-400">Or</span>
          <div class="flex-grow border-t border-gray-400"></div>
        </div>

        <button (click)="googleSignIn()" [disabled]="loading()"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
          <img class="w-5 h-5 mr-3" height="20" width="20" ngSrc="https://www.svgrepo.com/show/475656/google-color.svg"
               alt="Google logo">
          Sign in with Google
        </button>
        <p class="text-center mt-6 text-gray-600 dark:text-gray-300">
          Don't have an account?
          <a routerLink="/register" class="text-blue-600 hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  `,
  styles: ``
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal(false);
  passwordVisible = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // ++ ตรวจสอบ query param ตอนที่หน้าถูกโหลด ++
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['verification'] === 'sent') {
        this.successMessage.set(
          'Registration successful! A verification link has been sent to your email. Please verify before logging in.'
        );
      }
    });
  }

  // ++ Getter สำหรับเข้าถึงฟิลด์ในฟอร์ม ++
  get email() {
    return this.loginForm.get('email');
  }

  // ++ Getter สำหรับเข้าถึงฟิลด์รหัสผ่านในฟอร์ม ++
  get password() {
    return this.loginForm.get('password');
  }

  // ++ ฟังก์ชันสำหรับสลับการแสดงรหัสผ่าน ++
  togglePasswordVisibility() {
    this.passwordVisible.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const credentials = {
      email: this.loginForm.value.email,
      pass: this.loginForm.value.password
    };
    this.loading.set(true);

    this.authService.login(credentials)
      .then(() => {
        this.loading.set(false);
        this.toastService.show('Success', 'Login successful!', 'success');
        this.router.navigate(['/']).then();
      })
      .catch(error => {
        // ++ จัดการ error ที่เราโยนมาจาก service ++
        if (error.code === 'auth/email-not-verified') {
          this.errorMessage.set('Your email is not verified. Please check your inbox for the verification link.');
        } else {
          this.errorMessage.set('Invalid email or password. Please try again.');
        }
        this.toastService.show('Error', `${this.errorMessage}`, 'error');
        console.error('Login error:', error);
        this.loading.set(false);
      }).finally(() => {
      this.loading.set(false);
      this.router.navigateByUrl('/').catch(err => {
        console.error('Navigation error:', err);
      });
    });
  }

  async googleSignIn(): Promise<void> {
    this.loading.set(true);

    try {
      await this.authService.signInWithGoogle()
        .then(() => this.router.navigate(['/account'])); // เปลี่ยนเส้นทางไปยังหน้า accounts หลังจากล็อกอินสำเร็จ
    } catch (error) {
      console.error('Google Sign-In error:', error);
      this.toastService.show('Error', `${error}`, 'error');
    } finally {
      this.loading.set(false);
    }
  }

}
