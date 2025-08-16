import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  constructor() {
  }

  /**
   * สร้างระบบแบ่งหน้า (Pagination) จาก Signal ของข้อมูล
   * @param sourceDataSignal - Signal ที่เก็บข้อมูลทั้งหมด (เช่น allItems)
   * @param itemsPerPage - WritableSignal ที่เก็บจำนวนรายการต่อหน้า
   * @returns Object ที่มี signals และ methods สำหรับการแบ่งหน้า
   */
  createPaginator<T>(
    sourceDataSignal: Signal<T[]>,
    itemsPerPage: WritableSignal<number>
  ) {
    // State ของ Paginator
    const currentPage = signal(1);

    // Computed Signals
    const totalPages = computed(() => Math.ceil(sourceDataSignal().length / itemsPerPage()));

    const paginatedItems = computed(() => {
      const allItems = sourceDataSignal();
      const page = currentPage();
      const perPage = itemsPerPage();
      const startIndex = (page - 1) * perPage;
      return allItems.slice(startIndex, startIndex + perPage);
    });

    // Methods สำหรับควบคุม
    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages()) {
        currentPage.set(page);
      }
    };
    const nextPage = () => goToPage(currentPage() + 1);
    const previousPage = () => goToPage(currentPage() - 1);
    const firstPage = () => goToPage(1);
    const lastPage = () => goToPage(totalPages());
    const reset = () => {
      currentPage.set(1);
    };

    // คืนค่าทุกอย่างที่จำเป็นกลับไปให้ Component
    return {
      currentPage,
      totalPages,
      paginatedItems,
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      reset,
    };
  }
}
