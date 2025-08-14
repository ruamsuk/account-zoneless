import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../shared/services/dialog';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile-modal',
  imports: [
    TitleCasePipe,
    NgClass
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-6 rounded-xl shadow-2xl z-50 w-full max-w-2xl mx-auto dark:bg-gray-800">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">User Profile</h1>

          <!-- Profile Content -->
          <div class="flex flex-col items-center mb-6">
            <div class="relative">
              <img class="h-36 w-36 rounded-full object-cover ring-4 ring-blue-200"
                   [src]="imagePreviewUrl()" alt="Profile Picture">
              @if (isUploading()) {
                <div class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                  <div class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                </div>
              }
              <button (click)="fileInput.click()"
                      class="absolute bottom-0 -right-1 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Change profile picture">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-6 h-6 text-gray-700 dark:text-gray-200">
                  <path
                    d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                </svg>
              </button>
            </div>
            <input #fileInput id="profile-upload" type="file" class="hidden" (change)="onFileSelected($event)"
                   accept="image/png, image/jpeg">
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</label>
              <p class="text-lg text-gray-800 dark:text-gray-200">{{ authService.currentUser()?.displayName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
              <p class="text-lg text-gray-800 dark:text-gray-200">{{ authService.currentUser()?.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
              <p class="text-sm text-gray-500 font-mono dark:text-gray-400">{{ authService.currentUser()?.uid }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
              <p class="text-lg font-semibold"
                 [ngClass]="authService.currentUser()?.emailVerified
                ? ['text-purple-600', 'dark:text-purple-400']
                : ['text-gray-800', 'dark:text-gray-200']">
                {{ authService.currentUser()?.role | titlecase }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</label>

              @if (authService.currentUser()?.emailVerified) {
                <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4.00-5.5Z"
                          clip-rule="evenodd"/>
                  </svg>
                  <span class="font-semibold">Verified</span>
                </div>
              } @else {
                <div class="flex items-center gap-2 text-red-600 dark:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                          clip-rule="evenodd"/>
                  </svg>
                  <span class="font-semibold">Not Verified</span>
                </div>
              }
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="mt-8 border-t-2 border-red-300 dark:border-red-800/50 pt-6">
            <h2 class="text-xl font-semibold text-red-700 dark:text-red-500">Danger Zone</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">These actions are permanent and cannot be
              undone.</p>
            <div class="mt-4 border-b-2 mb-4 pb-4">
              <button (click)="deleteUserAccount()"
                      class="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800 transition duration-300">
                Delete My Account
              </button>
              <button (click)="onClose()"
                      class="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-800 transition duration-300 ml-2">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class ProfileModal {
  isOpen = input<boolean>(false);
  @Output() close = new EventEmitter<void>();

  public authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  isUploading = signal(false);
  // ++ 1. เพิ่ม Signal สำหรับเก็บ URL ภาพตัวอย่าง ++
  imagePreviewUrl = signal<string | null>(null);

  constructor() {
    // ++ 2. ใช้ effect เพื่อตั้งค่าภาพเริ่มต้นเมื่อ Modal เปิด ++
    effect(() => {
      if (this.isOpen()) {
        // เมื่อ Modal เปิด, ให้ใช้รูปโปรไฟล์ปัจจุบันเป็นภาพตัวอย่าง
        this.imagePreviewUrl.set(this.authService.currentUser()?.photoURL || null);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // ++ 3. สร้าง URL ชั่วคราวจากไฟล์ที่เลือก แล้วตั้งค่าให้ signal ++
    this.imagePreviewUrl.set(URL.createObjectURL(file));
    this.isUploading.set(true);

    try {
      const downloadUrl = await this.authService.uploadProfileImage(file);
      await this.authService.updateProfilePicture(downloadUrl);
    } catch (error) {
      console.error('Error during file upload:', error);
    } finally {
      this.isUploading.set(false);
      input.value = '';
    }
  }

  async deleteUserAccount(): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'Delete Your Account',
      message: 'Are you absolutely sure? This action is irreversible.'
    });

    if (confirmed) {
      this.loadingService.show();
      try {
        await this.authService.deleteAccount();
        this.onClose();
        this.router.navigate(['/login']).then();
      } catch (err) {
        console.error('Failed to delete account', err);
        this.toastService.show('Error:', 'Could not delete account. Please try logging out and back in.', 'error');
      } finally {
        this.loadingService.hide();
      }
    }
  }
}
