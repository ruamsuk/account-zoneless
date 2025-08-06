import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { BloodPressure } from '../models/blood-pressure.model';
import { map, Observable } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class BloodService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly bpCollection = collection(this.firestore, 'bloodPressureRecords');

  /**
   * ดึงข้อมูลความดันทั้งหมดแบบเรียลไทม์
   */
  getAll(): Observable<BloodPressure[]> {
    const q = query(this.bpCollection, orderBy('date', 'desc'));
    return (collectionData(q, {idField: 'id'}) as Observable<BloodPressure[]>).pipe(
      map(items => items.filter(item => !!item.id))
    );
  }

  /**
   * เพิ่มข้อมูลใหม่
   */
  add(data: Partial<BloodPressure>): Promise<any> {
    return addDoc(this.bpCollection, {...data, created: new Date()});
  }

  /**
   * อัปเดตข้อมูล
   */
  update(item: BloodPressure): Promise<void> {
    const docInstance = doc(this.firestore, `bloodPressureRecords/${item.id}`);
    return updateDoc(docInstance, {...item, modify: new Date()});
  }

  /**
   * ลบข้อมูล
   */
  delete(id: string): Promise<void> {
    const docInstance = doc(this.firestore, 'bloodPressureRecords', id);
    return deleteDoc(docInstance);
  }

  /**
   * ดึงข้อมูลความดันตามช่วงวันที่ที่กำหนด
   * เพื่อนำไปพิมพ์รายงาน
   * @param startDate วันที่เริ่มต้น
   * @param endDate วันสิ้นสุด
   * @return Promise ที่จะคืนค่าเป็น array ของ BloodPressure
   * */
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<BloodPressure[]> {
    // ตั้งเวลาสิ้นสุดเป็นท้ายสุดของวัน
    endDate.setHours(23, 59, 59, 999);

    const q = query(
      this.bpCollection,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc') // จัดเรียงจากเก่าไปใหม่สำหรับรายงาน
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as BloodPressure));
  }
}
