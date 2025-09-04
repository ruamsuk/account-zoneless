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
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private firestore: Firestore = inject(Firestore);
  private accountsCollection = collection(this.firestore, 'accounts');

  progress = signal<{ processed: number; total: number } | null>(null);

  /**
   *  1. Get all accounts from Firestore
   *  2. Order by date in descending order
   *  3. Return an observable of the accounts
   * */
  getAccounts(): Observable<Account[]> {
    const q = query(this.accountsCollection, orderBy('date', 'desc'));
    return collectionData(q, {idField: 'id'}) as Observable<Account[]>;
  }

  /**
   *  1. Get accounts by date range from Firestore
   *  2. Accept start and end dates as parameters
   *  3. Use where to filter accounts within the date range
   *  4. Order by date in ascending order
   *  5. Return an observable of the accounts
   * */
  getAccountsByDateRange(startDate: Date, endDate: Date): Observable<Account[]> {
    // 1. สร้าง "วันถัดไป" จากวันที่สิ้นสุด
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    // ทำให้เวลาเป็นเที่ยงคืนของวันถัดไป
    nextDay.setHours(0, 0, 0, 0);

    const q = query(
      this.accountsCollection,
      where('date', '>=', startDate),
      // 2. เปลี่ยนเงื่อนไขเป็น "น้อยกว่า" (<) วันถัดไป
      where('date', '<', nextDay),
      orderBy('date', 'asc')
    );
    return collectionData(q, {idField: 'id'}) as Observable<Account[]>;
  }

  /**
   *  1. Add a new account to Firestore
   *  2. Accept an account object without id
   *  3. Set create and modify dates to the current date
   *  4. Use ?? false to set the default value for isInCome if not provided
   *  5. Return an observable of the add operation
   * */
  addAccount(account: Omit<Account, 'id'>) {
    const dataToSave = {
      ...account,
      create: new Date(),
      modify: new Date(),
      // ใช้ ?? false เพื่อกำหนดค่าเริ่มต้นในกรณีที่ไม่มีค่าส่งมา
      isInCome: account.isInCome ?? false,
    };
    return addDoc(this.accountsCollection, dataToSave);

  }

  /**
   *  1. Update an existing account in Firestore
   *  2. Accept an account object with id
   *  3. Remove the id from the data to update
   *  4. Set modify date to the current date
   *  5. Return a promise of the update operation
   * */
  updateAccount(account: Account): Promise<void> {
    const accountDocRef = doc(this.firestore, `accounts/${account.id}`);
    const {id, ...data} = account;
    // อัปเดต modify date
    const dataToUpdate = {
      ...data,
      modify: new Date()
    };
    return updateDoc(accountDocRef, dataToUpdate);
  }

  /**
   *  1. Delete an account from Firestore
   *  2. Accept the id of the account to delete
   *  3. Return a promise of the delete operation
   * */
  deleteAccount(id: string): Promise<void> {
    const accountDocRef = doc(this.firestore, `accounts/${id}`);
    return deleteDoc(accountDocRef);
  }

  /**
   * อัปเดตฟิลด์ details เฉพาะเอกสารที่มีค่าที่ต้องการ โดยแบ่งเป็น batch
   * @param {string} oldValue - ค่าเก่าที่ต้องการค้นหา
   * @param {string} newValue - ค่าใหม่ที่ต้องการแทนที่
   * @param {string} total
   */
  async updateDetailsWithProgress(oldValue: string | null, newValue: string | null, total: number): Promise<void> {
    const baseQuery = query(
      collection(this.firestore, 'accounts'),
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
