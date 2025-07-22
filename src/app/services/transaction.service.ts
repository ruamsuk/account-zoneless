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
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transection.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore: Firestore = inject(Firestore);
  private transactionsCollection = collection(this.firestore, 'transactions');

  // ดึงข้อมูลทั้งหมด
  getTransactions(): Observable<Transaction[]> {
    const q = query(this.transactionsCollection, orderBy('date', 'desc'));
    return collectionData(q, {idField: 'id'}) as Observable<Transaction[]>;
  }

  // ดึงข้อมูลตาม description (สำหรับหน้ารายงาน)
  getTransactionsByDescription(description: string): Observable<Transaction[]> {
    const q = query(
      this.transactionsCollection,
      where('description', '==', description),
      orderBy('date', 'asc')
    );
    return collectionData(q, {idField: 'id'}) as Observable<Transaction[]>;
  }

  // เพิ่มข้อมูล
  addTransaction(transaction: Transaction) {
    return addDoc(this.transactionsCollection, transaction);
  }

  // อัปเดตข้อมูล
  updateTransaction(transaction: Transaction) {
    const transactionDocRef = doc(this.firestore, `transactions/${transaction.id}`);
    // ต้องแน่ใจว่าไม่ได้ส่ง id ไปด้วยตอนอัปเดต
    const {id, ...data} = transaction;
    return updateDoc(transactionDocRef, data);
  }

  // ลบข้อมูล
  deleteTransaction(id: string) {
    const transactionDocRef = doc(this.firestore, `transactions/${id}`);
    return deleteDoc(transactionDocRef);
  }
}
