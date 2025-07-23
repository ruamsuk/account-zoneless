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
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private firestore: Firestore = inject(Firestore);
  private accountsCollection = collection(this.firestore, 'accounts');

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

  updateAccount(account: Account) {
    const accountDocRef = doc(this.firestore, `accounts/${account.id}`);
    const {id, ...data} = account;
    // อัปเดต modify date
    const dataToUpdate = {
      ...data,
      modify: new Date()
    };
    return updateDoc(accountDocRef, dataToUpdate);
  }

  deleteAccount(id: string) {
    const accountDocRef = doc(this.firestore, `accounts/${id}`);
    return deleteDoc(accountDocRef);
  }
}
