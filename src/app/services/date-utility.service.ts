import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilityService {
  /**
   * คืนค่า array ของ object เดือนภาษาไทย
   */
  getMonths(): { value: number, name: string }[] {
    return [
      {value: 0, name: 'มกราคม'}, {value: 1, name: 'กุมภาพันธ์'},
      {value: 2, name: 'มีนาคม'}, {value: 3, name: 'เมษายน'},
      {value: 4, name: 'พฤษภาคม'}, {value: 5, name: 'มิถุนายน'},
      {value: 6, name: 'กรกฎาคม'}, {value: 7, name: 'สิงหาคม'},
      {value: 8, name: 'กันยายน'}, {value: 9, name: 'ตุลาคม'},
      {value: 10, name: 'พฤศจิกายน'}, {value: 11, name: 'ธันวาคม'}
    ];
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
