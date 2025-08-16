import { NgClass, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-user-management',
  imports: [
    TitleCasePipe,
    NgClass,
    CustomTooltipDirective,
    NgOptimizedImage
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <div class="flex justify-between items-center px-1.5">
        <h1 class="text-3xl md:text-4xl font-bold font-leera text-gray-800 dark:text-gray-200 mb-6">User Role
          Management</h1>
        <button (click)="router.navigate(['/'])"
                class="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-800 transition duration-300 ml-2">
          Back
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 leading-10 ">
            <tr>
              <th scope="col" class="table-header">User</th>
              <th scope="col" class="table-header">Email</th>
              <th scope="col" class="table-header whitespace-nowrap">Current Role</th>
              <th scope="col" class="table-header whitespace-nowrap">Change Role</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (user of users(); track user.uid) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="p-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full"
                             [ngSrc]="user.photoURL || 'https://i.pravatar.cc/150?u=' + user.uid" alt="" width="40"
                             height="40">
                      </div>
                      <div class="ml-4">
                        <div class="text-md font-medium text-gray-900 dark:text-gray-200">{{ user.displayName }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 whitespace-nowrap text-md text-gray-500 dark:text-gray-400">{{ user.email }}</td>
                  <td class="p-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-sm leading-6 font-semibold rounded-full"
                          [ngClass]="getRoleBadgeClass(user.role)">
                      {{ user.role | titlecase }}
                    </span>
                  </td>
                  <td class="p-4 whitespace-nowrap text-md text-gray-800 dark:text-gray-300 font-medium">
                    <select #roleSelect [value]="user.role" (change)="changeRole(user, roleSelect.value)"
                            class="form-select text-gray-800 dark:text-gray-300">
                      <option class="text-gray-700" value="user">User</option>
                      <option class="text-gray-700" value="member">Member</option>
                      <option class="text-gray-700" value="manager">Manager</option>
                      <option class="text-gray-700" value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination Controls -->
          @if (totalPages() > 1) {
            <div class="mt-6 flex items-center justify-center gap-2">
              <button (click)="firstPage()" [disabled]="currentPage() === 1"
                      class="btn-paginator" customTooltip="หน้าแรก">«
              </button>
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                      class="btn-paginator" customTooltip="หน้าก่อนหน้า">‹
              </button>
              <span class="text-gray-600 dark:text-gray-300">
                หน้า {{ currentPage() }} ของ {{ totalPages() }}
              </span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-paginator" customTooltip="หน้าถัดไป">›
              </button>
              <button (click)="lastPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-paginator" customTooltip="หน้าสุดท้าย">»
              </button>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: `

  `
})
export class UserManagement {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  public router = inject(Router);

  users = signal<AppUser[]>([]);

  // -- Pagination --
  //transactions: Signal<User[]> | undefined;
  currentPage = signal(1);
  itemsPerPage = signal(15);

  constructor() {
    this.getUsers();
    this.transactions = computed(() => {
      const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
      const endIndex = startIndex + this.itemsPerPage();
      return this.users()?.slice(startIndex, endIndex) ?? [];
    });

  }

  transactions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.users()?.slice(startIndex, endIndex) ?? [];
  });

  totalPages = computed(() => Math.ceil(this.users()?.length / this.itemsPerPage()));

  /**
   * Get all users from the database
   * @returns A signal containing the list of users
   * @throws Error if there is an issue fetching the users
   * @example
   * const users = this.getUsers();
   * console.log(users()); // Output: Array of AppUser objects
   * */
  private getUsers(): Signal<AppUser[]> {
    this.loadingService.show();

    return toSignal(
      (this.authService.getAllUsers() as Observable<AppUser[]>)
        .pipe(
          tap((data) => this.users.set(data)),
          tap(() => this.loadingService.hide()),
          catchError(err => {
            this.toastService.show('Error', 'Failed to load users.', 'error');
            this.loadingService.hide();
            console.error(err);
            return throwError(() => err);
          })
        ),
      {
        initialValue: []
      }
    );
  }

  /**
   * Change the role of a user
   * @param user - The user whose role is to be changed
   * @param newRole - The new role to assign to the user
   */
  async changeRole(user: AppUser, newRole: string) {
    if (!user.uid) return;
    const role = newRole as 'admin' | 'manager' | 'member' | 'user';

    this.loadingService.show();
    try {
      await this.authService.updateUserRole(user.uid, role);
      this.toastService.show('Success', `Updated ${user.displayName}'s role to ${role}`, 'success');
      this.users.update((currentUsers: any[]) => {
        return currentUsers.map(u =>
          u.uid === user.uid ? {...u, role: role} : u
        );
      });
    } catch (error) {
      this.toastService.show('Error', 'Failed to update role.', 'error');
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }

  getRoleBadgeClass(role: AppUser['role']): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  // ++ เพิ่มเมธอดใหม่สำหรับ Paginator ++
  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages());
  }
}
