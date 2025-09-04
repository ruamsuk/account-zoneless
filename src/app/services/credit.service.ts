import { inject, Injectable, signal } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  DocumentSnapshot,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { CreditData } from '../models/credit.model';
import { Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly creditCollection = collection(this.firestore, 'credit');

  progress = signal<{ processed: number; total: number } | null>(null);

  /**
   * ดึงข้อมูลธุรกรรมบัตรเครดิตตามรอบบัญชี (วันที่ 13 ถึง 12 ของเดือนถัดไป)
   * @param month - เดือน (0 = มกราคม, 11 = ธันวาคม)
   * @param year - ปี ค.ศ.
   * @returns Promise ที่จะคืนค่าเป็น array ของธุรกรรมบัตรเครดิต
   */
  async getTransactionsByMonth(month: number, year: number): Promise<CreditData[]> {
    // คำนวณวันเริ่มต้นของรอบบัญชี (วันที่ 13 ของเดือนที่เลือก)
    const startDate = new Date(year, month - 1, 13);

    // คำนวณวันสิ้นสุดของรอบบัญชี (วันที่ 12 ของเดือนถัดไป)
    // JavaScript Date object ฉลาดพอที่จะจัดการกับเดือนธันวาคม (11 + 1 = 12) ให้เป็นเดือนมกราคมของปีถัดไปได้เอง
    const endDate = new Date(year, month, 12, 23, 59, 59);

    const q = query(
      this.creditCollection,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as CreditData));
  }

  /**
   * ++ เพิ่มเมธอดใหม่สำหรับดึงข้อมูลทั้งปีในครั้งเดียว ++
   * @param year - ปี ค.ศ. ที่ต้องการ
   * @returns Promise ที่จะคืนค่าเป็น array ของธุรกรรมทั้งหมดในรอบบิลปีนั้นๆ
   */
  async getTransactionsByBillingYear(year: number): Promise<CreditData[]> {
    // รอบบิลของปี 'year' จะเริ่มต้นวันที่ 13 ธ.ค. ของปีก่อนหน้า
    const startDate = new Date(year - 1, 11, 13); // 11 คือเดือนธันวาคม

    // และสิ้นสุดวันที่ 12 ธ.ค. ของปีที่เลือก
    const endDate = new Date(year, 11, 12, 23, 59, 59);

    const q = query(
      this.creditCollection,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as CreditData));

    return transactions.sort((a, b) => (b.date as any).toDate().getTime() - (a.date as any).toDate().getTime());
  }

  /**
   * ดึงข้อมูลธุรกรรมทั้งหมดแบบเรียลไทม์
   */
  getAllTransactions(): Observable<CreditData[]> {
    const q = query(this.creditCollection, orderBy('date', 'desc'));
    return (collectionData(q, {idField: 'id'}) as Observable<CreditData[]>).pipe(
      map(transactions => transactions.filter(tx => !!tx.id))
    );
  }

  /**
   * เพิ่มธุรกรรมใหม่
   */
  addTransaction(data: Partial<CreditData>) {
    return addDoc(this.creditCollection, {...data, created: new Date()});
  }

  /**
   * อัปเดตธุรกรรม
   */
  updateTransaction(transaction: CreditData): Promise<void> {
    const docInstance = doc(this.firestore, `credit/${transaction.id}`);
    return updateDoc(docInstance, {...transaction, modify: new Date()});
  }

  /**
   * ลบธุรกรรม
   */
  deleteTransaction(id: string): Promise<void> {
    const docInstance = doc(this.firestore, 'credit', id);
    return deleteDoc(docInstance);
  }

  /**
   * 1. ดึงรายละเอียดธุรกรรมที่ไม่ซ้ำกัน
   * 2. แปลงเป็น array และเรียงลำดับ
   * 3. คืนค่าเป็น Promise ที่จะให้ array ของรายละเอียดธุรกรรมที่ไม่ซ้ำกัน
   *  @returns Promise<string[]> - รายละเอียดธุรกรรมที่ไม่ซ้ำกัน
   */
  async getUniqueDetails(): Promise<string[]> {
    const querySnapshot = await getDocs(this.creditCollection);
    const details = new Set<string>();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data['details'] && typeof data['details'] === 'string') {
        const trimmedDetail = data['details'].trim();
        if (trimmedDetail) {
          details.add(trimmedDetail);
        }
      }
    });
    return Array.from(details).sort();
  }


  /**
   * อัปเดตฟิลด์ details เฉพาะเอกสารที่มีค่าที่ต้องการ โดยแบ่งเป็น batch
   * @param {string} oldValue - ค่าเก่าที่ต้องการค้นหา
   * @param {string} newValue - ค่าใหม่ที่ต้องการแทนที่
   * @param {string} total
   */
  async updateCreditDetailsWithProgress(oldValue: string | null, newValue: string | null, total: number): Promise<void> {
    const baseQuery = query(
      collection(this.firestore, 'credit'),
      where('details', '==', oldValue)
    );
    let lastVisible: DocumentSnapshot | null = null;
    let documentsProcessed = 0;

    try {
      while (documentsProcessed < total) {
        let q = query(baseQuery, limit(500));
        if (lastVisible) {
          q = query(baseQuery, limit(500), startAfter(lastVisible));
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) break;

        const batch = writeBatch(this.firestore);
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, {details: newValue});
        });
        await batch.commit();

        documentsProcessed += snapshot.size;

        // อัปเดต signal แทนการ next()
        this.progress.set({processed: documentsProcessed, total});

        lastVisible = snapshot.docs[snapshot.docs.length - 1];
      }

      // ทำงานเสร็จ
      this.progress.set({processed: total, total});
    } catch (error) {
      console.error('Update failed', error);
      throw error;
    }
  }

}
