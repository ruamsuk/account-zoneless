import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { Timestamp } from 'firebase/firestore';
import { Transaction } from '../models/transection.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private firestore: Firestore = inject(Firestore);
  private accountsCollection = collection(this.firestore, 'accounts');
  private readonly transactionsCollection = collection(this.firestore, 'accounts');
  private readonly monthlyCollection = collection(this.firestore, 'monthly'); // <-- อ้างอิงถึง collection ใหม่
  private readonly toastService = inject(ToastService);

  // ++ เพิ่ม Helper Function สำหรับแปลง index เป็นชื่อเดือน ++
  private getThaiMonthName(monthIndex: number): string {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return thaiMonths[monthIndex];
  }

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
   * ++ เพิ่มเมธอดใหม่สำหรับดึงช่วงวันที่ ++
   * ค้นหา startdate และ enddate จาก collection 'monthly'
   */
  async getMonthlyDateRange(monthIndex: number, year: number): Promise<{ startDate: Date, endDate: Date } | null> {
    // 1. แปลง month index (0-11) เป็นชื่อเดือนภาษาไทย
    const thaiMonthName = this.getThaiMonthName(monthIndex);

    // 2. สร้าง Query โดยใช้ "ชื่อเดือน" และ "ปี"
    const q = query(
      this.monthlyCollection,
      where('month', '==', thaiMonthName),
      where('year', '==', year),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No date range found for month: ${thaiMonthName}, year: ${year}`);
      this.toastService.show('Warning', `ไม่พบช่วงวันที่สำหรับเดือน: ${thaiMonthName}, ปี: ${year}`, 'warning');
      return null;
    }

    const monthlyData = querySnapshot.docs[0].data();
    return {
      startDate: (monthlyData['datestart'] as Timestamp).toDate(),
      endDate: (monthlyData['dateend'] as Timestamp).toDate()
    };
  }

  /**
   * ดึงข้อมูลธุรกรรมตามเดือน, ปี, และรายละเอียดที่เลือก
   * @param startDate
   * @param endDate
   * @param detail - (Optional) รายละเอียดที่ต้องการกรอง
   * @returns Promise ที่จะคืนค่าเป็น array ของธุรกรรม
   */
  async getTransactionsByFilter(startDate: Date, endDate: Date, detail: string | null): Promise<Transaction[]> {
    let conditions = [
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    ];

    if (detail) {
      conditions.push(where('details', '==', detail));
    }

    const q = query(this.transactionsCollection, ...conditions);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Transaction));
  }

  /**
   * ดึงรายละเอียดที่ไม่ซ้ำกันจากธุรกรรมทั้งหมด
   * @returns Promise ที่จะคืนค่าเป็น array ของรายละเอียดที่ไม่ซ้ำกัน
   */
  async getUniqueDetails(): Promise<string[]> {
    const querySnapshot = await getDocs(this.transactionsCollection);
    const details = new Set<string>();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data['details']) {
        details.add(data['details']);
      }
    });
    return Array.from(details).sort();
  }
}
