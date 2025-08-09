import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Monthly } from '../models/monthly.model';
import { map } from 'rxjs/operators';
import { DateUtilityService } from './date-utility.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlyService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly monthlyCollection = collection(this.firestore, 'monthly');
  private readonly dateUtilityService = inject(DateUtilityService);

  /**
   * ดึงข้อมูลรอบบัญชีทั้งหมดแบบเรียลไทม์
   */
  getAll(): Observable<Monthly[]> {
    const q = query(this.monthlyCollection);

    return (collectionData(q, {idField: 'id'}) as Observable<Monthly[]>).pipe(
      map((data: Monthly[]) => {
          return data.sort((a: Monthly, b: Monthly) => {
            const yearA = Number(a.year);
            const yearB = Number(b.year);

            // 3. เรียกใช้ข้อมูลเดือนจาก service ที่เดียว
            const thaiMonthOrder = this.dateUtilityService.getMonths().map(m => m.name);
            const monthA = thaiMonthOrder.indexOf(a.month);
            const monthB = thaiMonthOrder.indexOf(b.month);

            if (yearA !== yearB) {
              return yearB - yearA;
            } else {
              return monthA - monthB;
            }
          });
        }
      )
    );
  }

  /**
   * เพิ่มข้อมูลใหม่
   */
  add(data: Partial<Monthly>): Promise<any> {
    return addDoc(this.monthlyCollection, {...data, created: new Date()});
  }

  /**
   * อัปเดตข้อมูล
   */
  update(item: Monthly): Promise<void> {
    const docInstance = doc(this.firestore, `monthly/${item.id}`);
    return updateDoc(docInstance, {...item, updated: new Date()});
  }

  /**
   * ลบข้อมูล
   */
  delete(id: string): Promise<void> {
    const docInstance = doc(this.firestore, 'monthly', id);
    return deleteDoc(docInstance);
  }
}
