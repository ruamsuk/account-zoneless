import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs, limit, query, where } from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { Transaction } from '../models/transection.model';
import { MonthlyData } from '../models/account.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private firestore: Firestore = inject(Firestore);
  private readonly accountsCollection = collection(this.firestore, 'accounts');
  private readonly monthlyCollection = collection(this.firestore, 'monthly'); // อ้างอิงถึง collection ใหม่
  private readonly toastService = inject(ToastService);

  // ++ เพิ่ม Helper Function สำหรับแปลง index เป็นชื่อเดือน ++
  private thaiMonthOrder = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  private getThaiMonthName(monthIndex: number): string {
    return this.thaiMonthOrder[monthIndex];
  }

  /**
   *  ดึงช่วงวันที่สำหรับเดือนและปีที่ระบุ
   *  @param monthIndex - ดัชนีของเดือน (0-11)
   *  @param year - ปีที่ต้องการ (เช่น 2023)
   *  @returns Promise ที่จะคืนค่าเป็นวัตถุที่มี startDate และ endDate
   *  หรือ null หากไม่พบข้อมูล
   * */
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

    const q = query(this.accountsCollection, ...conditions);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Transaction));
  }

  /**
   * ดึงรายละเอียดที่ไม่ซ้ำกันจากธุรกรรมทั้งหมด
   * @returns Promise ที่จะคืนค่าเป็น array ของรายละเอียดที่ไม่ซ้ำกัน
   */
  async getUniqueDetails(): Promise<string[]> {
    const querySnapshot = await getDocs(this.accountsCollection);
    const details = new Set<string>();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data['details']) {
        details.add(data['details']);
      }
    });
    return Array.from(details).sort();
  }

  /**
   *  ดึงช่วงวันที่สำหรับปีที่ระบุ
   *  @param year - ปีที่ต้องการ (เช่น 2023)
   *  @returns Promise ที่จะคืนค่าเป็น array ของวัตถุ MonthlyData
   *  แต่ละวัตถุจะมี id, month, datestart, dateend, และ year
   *  หรือคืนค่าเป็น array ว่าง หากไม่พบข้อมูล
   *  @description
   *  ฟังก์ชันนี้จะดึงข้อมูลช่วงวันที่สำหรับแต่ละเดือนในปีที่ระบุ
   *  โดยจะเรียงลำดับตามลำดับเดือนในภาษาไทย
   *  และจะคืนค่าเป็น array ของวัตถุ MonthlyData ที่มีข้อมูลเกี่ยวกับเดือน, วันที่เริ่มต้น, วันที่สิ้นสุด, และปี
   *  หากไม่พบข้อมูลสำหรับปีที่ระบุ จะคืนค่าเป็น array ว่าง
   *  @example
   *  const monthlyRanges = await financialService.getAnnualMonthlyRanges(2023);
   *  console.log(monthlyRanges);
   *  // Output: [
   *  //   { id: '1', month: 'มกราคม', datestart: Date, dateend: Date, year: 2023 },
   *  //   { id: '2', month: 'กุมภาพันธ์', datestart: Date, dateend: Date, year: 2023 },
   *  //   ...
   *  // ]
   * */
  async getAnnualMonthlyRanges(year: number): Promise<MonthlyData[]> { // <-- 1. เปลี่ยน Return Type
    const q = query(
      this.monthlyCollection,
      where('year', '==', year)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const ranges = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // <-- เพิ่ม id เข้ามา
        month: data['month'],
        datestart: (data['datestart'] as Timestamp).toDate(), // <-- 2. ใช้ชื่อที่ถูกต้อง
        dateend: (data['dateend'] as Timestamp).toDate(),   // <-- 2. ใช้ชื่อที่ถูกต้อง
        year: data['year']
      } as MonthlyData; // <-- ใช้ Type ที่ถูกต้อง
    });

    return ranges.sort((a, b) => this.thaiMonthOrder.indexOf(a.month) - this.thaiMonthOrder.indexOf(b.month));
  }
}
