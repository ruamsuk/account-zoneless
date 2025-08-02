import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { CreditData } from '../models/credit.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly creditCollection = collection(this.firestore, 'credit');

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
}
