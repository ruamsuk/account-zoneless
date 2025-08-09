import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilityService {
  // 1. เราจะใช้ array นี้เป็น "แหล่งข้อมูลจริง" เพียงที่เดียว
  private readonly months = [
    {value: 0, name: 'มกราคม'}, {value: 1, name: 'กุมภาพันธ์'},
    {value: 2, name: 'มีนาคม'}, {value: 3, name: 'เมษายน'},
    {value: 4, name: 'พฤษภาคม'}, {value: 5, name: 'มิถุนายน'},
    {value: 6, name: 'กรกฎาคม'}, {value: 7, name: 'สิงหาคม'},
    {value: 8, name: 'กันยายน'}, {value: 9, name: 'ตุลาคม'},
    {value: 10, name: 'พฤศจิกายน'}, {value: 11, name: 'ธันวาคม'}
  ];

  /**
   * คืนค่า array ของ object เดือนภาษาไทย
   */
  getMonths(): { value: number, name: string }[] {
    return this.months;
  }

  /**
   * ++ เพิ่มเมธอดใหม่สำหรับคืนค่าชื่อเดือนจาก index ++
   */
  getMonthName(monthIndex: number): string {
    // 2. ค้นหาชื่อเดือนจาก array ที่เรามีอยู่
    const month = this.months.find(m => m.value === monthIndex);
    return month ? month.name : ''; // ถ้าไม่เจอ ให้คืนค่าเป็น string ว่าง
  }

  /**
   * คืนค่า array ของปี พ.ศ. โดยนับจากปีปัจจุบันย้อนหลังไป
   * @param yearsToGoBack จำนวนปีที่ต้องการให้ย้อนหลัง (ค่าเริ่มต้นคือ 10 ปี)
   */
  getYearRange(yearsToGoBack: number = 10): number[] {
    const yearRange: number[] = [];
    const currentYearBE = new Date().getFullYear() + 543;
    for (let i = 0; i < yearsToGoBack; i++) {
      yearRange.push(currentYearBE - i);
    }
    return yearRange;
  }
}
