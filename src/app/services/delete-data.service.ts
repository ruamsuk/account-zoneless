import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs, limit, orderBy, query, where, writeBatch } from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';

@Injectable({providedIn: 'root'})
export class DeleteDataService {
  private readonly firestore: Firestore = inject(Firestore);

  /**
   * (ตัวอย่าง) ดึงรายการ Collection ที่อนุญาตให้ลบได้
   * สามารถเปลี่ยน Logic นี้ให้ดึงข้อมูลจากที่อื่น หรือกำหนดค่าตายตัวได้
   */
  getAvailableCollections(): Promise<{ key: string, label: string }[]> {
    return Promise.resolve([
      {key: 'accounts', label: 'ข้อมูลเงินสด (Accounts)'},
      {key: 'credit', label: 'ข้อมูลบัตรเครดิต (Credit)'},
      {key: 'bloodPressureRecords', label: 'ข้อมูลความดัน (Blood Pressure)'},
      {key: 'monthly', label: 'ข้อมูลรอบบัญชี (Billing Period)'},
    ]);
  }

  /**
   * ลบข้อมูลบัญชีทั้งหมดในปีที่ระบุ
   * โดยจะลบข้อมูลจาก Collection 'accounts' ที่มีวันที่อยู่ใน
   * ช่วงวันที่ของปีนั้น ที่กำหนดไว้ใน Collection 'monthly'
   * @param year
   * */
  async deleteAccountsByYear(year: number): Promise<void> {
    console.log(`Starting deletion for accounts in year ${year}`);
    // 1. ค้นหาช่วงวันที่เริ่มต้นและสิ้นสุดของปีนั้นๆ จาก collection 'monthly'
    const monthlyCollection = collection(this.firestore, 'monthly');

    // หาวันเริ่มต้น (ของเดือนแรกสุดในปีนั้น)
    const startQuery = query(monthlyCollection, where('year', '==', year), orderBy('datestart', 'asc'), limit(1));
    const startSnap = await getDocs(startQuery);
    if (startSnap.empty) throw new Error(`No monthly data found for year ${year}`);
    const startDate = (startSnap.docs[0].data()['datestart'] as Timestamp).toDate();

    // หาวันสิ้นสุด (ของเดือนสุดท้ายในปีนั้น)
    const endQuery = query(monthlyCollection, where('year', '==', year), orderBy('dateend', 'desc'), limit(1));
    const endSnap = await getDocs(endQuery);
    const endDate = (endSnap.docs[0].data()['dateend'] as Timestamp).toDate();

    console.log(`Accounts date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    await this.deleteCollectionByDateRange('accounts', startDate, endDate);
  }

  /**
   * ลบข้อมูลบัตรเครดิตทั้งหมดในปีที่ระบุ
   * โดยจะลบข้อมูลจาก Collection 'credit'
   * ช่วงวันที่ 13 ธ.ค.ของปีก่อนหน้าปีที่ระบุ ถึงวันที่ 12 ของเดือนถัดมา
   * @example
   * 1. ปี 2023 จะลบข้อมูลตั้งแต่ 13 ธ.ค. 2022 ถึง 12 ธ.ค. 2023
   * 2. ปี 2024 จะลบข้อมูลตั้งแต่ 13 ธ.ค. 2023 ถึง 12 ธ.ค. 2024
   * @param year
   * */
  async deleteCreditByYear(year: number): Promise<void> {
    console.log(`Starting deletion for credit in billing year ${year}`);
    // รอบบิลของปี 'year' จะเริ่มต้นวันที่ 13 ธ.ค. ของปีก่อนหน้า
    const startDate = new Date(year - 1, 11, 13); // 11 คือเดือนธันวาคม
    // และสิ้นสุดวันที่ 12 ธ.ค. ของปีที่เลือก
    const endDate = new Date(year, 11, 12, 23, 59, 59);

    await this.deleteCollectionByDateRange('credit', startDate, endDate);
  }

  /**
   * ลบข้อมูลความดันโลหิตทั้งหมดในปีที่ระบุ
   * โดยจะลบข้อมูลจาก Collection 'bloodPressureRecords'
   * ช่วงวันที่ 1 มกราคม ถึง 31 ธันวาคม ของปีที่ระบุ
   * @param year
   * */
  async deleteBloodPressureByYear(year: number): Promise<void> {
    console.log(`Starting deletion for bloodPressureRecords in year ${year}`);
    const startDate = new Date(year, 0, 1); // 1 มกราคม
    const endDate = new Date(year, 11, 31, 23, 59, 59); // 31 ธันวาคม
    await this.deleteCollectionByDateRange('bloodPressureRecords', startDate, endDate);
  }

  /**
   * ลบข้อมูลจาก Collection 'monthly'
   * ตามปีที่ระบุ
   * @param year
   * */
  async deleteMonthlyByYear(year: number): Promise<void> {
    console.log(`Starting deletion for monthly in year ${year}`);
    const collectionRef = collection(this.firestore, 'monthly');
    const q = query(collectionRef, where('year', '==', year));
    await this.deleteQueryResults(q);
  }

  /**
   * ลบข้อมูลจาก Collection ที่ระบุ
   * ตามช่วงวันที่ที่กำหนด
   * @param collectionName ชื่อ Collection ที่ต้องการลบ
   * @param startDate วันที่เริ่มต้น
   * @param endDate วันที่สิ้นสุด
   */
  private async deleteCollectionByDateRange(collectionName: string, startDate: Date, endDate: Date): Promise<void> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(
      collectionRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    await this.deleteQueryResults(q);
  }

  /**
   * ลบเอกสารทั้งหมดที่ตรงกับ Query ที่ระบุ
   * @param q Query ที่ต้องการลบเอกสาร
   */
  private async deleteQueryResults(q: any): Promise<void> {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`No documents found to delete.`);
      return;
    }
    const batch = writeBatch(this.firestore);
    querySnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.size} documents.`);
  }
}
