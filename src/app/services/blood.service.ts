import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { BloodPressure } from '../models/blood-pressure.model';
import { map, Observable } from 'rxjs';

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
    const docInstance = doc(this.firestore, `blood_pressure/${item.id}`);
    return updateDoc(docInstance, {...item, modify: new Date()});
  }

  /**
   * ลบข้อมูล
   */
  delete(id: string): Promise<void> {
    const docInstance = doc(this.firestore, 'blood_pressure', id);
    return deleteDoc(docInstance);
  }
}
