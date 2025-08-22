// ในไฟล์ src/app/shared/directives/number-format.directive.ts

import { Directive, ElementRef, forwardRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFormatDirective),
      multi: true
    }
  ]
})
export class NumberFormatDirective implements ControlValueAccessor {
  private el: ElementRef<HTMLInputElement> = inject(ElementRef);

  // --- CVA Functions ---
  private onChange: (value: number | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  // Formatter สำหรับจัดรูปแบบ "สุดท้าย" ตอนแสดงผล (onBlur)
  private finalFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- CVA Implementation ---
  writeValue(value: number | null): void {
    // เมธอดนี้จะถูกเรียกโดยฟอร์มเพื่อตั้งค่าเริ่มต้น
    // เราจะแสดงค่าที่จัดรูปแบบแล้วสำหรับสถานะ "ไม่ได้โฟกัส" (blurred)
    this.el.nativeElement.value = this.formatForBlur(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  // --- Event Listeners ---
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const originalValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    // 1. "ทำความสะอาด" ข้อมูลที่ผู้ใช้พิมพ์ และจัดรูปแบบ comma
    const {formattedValue, numericValue} = this.formatForTyping(originalValue);

    // 2. อัปเดตค่าที่ "แท้จริง" (เป็น number) กลับไปที่ form control
    this.onChange(numericValue);

    // 3. อัปเดตค่าที่แสดงใน input
    input.value = formattedValue;

    // 4. คำนวณตำแหน่ง cursor ใหม่เพื่อป้องกันไม่ให้ cursor กระโดด
    const newCursorPosition = cursorPosition + (formattedValue.length - originalValue.length);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  @HostListener('blur')
  onBlur(): void {
    // 5. จัดรูปแบบให้สวยงาม (ใส่ .00) ก็ต่อเมื่อผู้ใช้ออกจากช่องกรอก
    const value = this.unformatToNumber(this.el.nativeElement.value);
    this.el.nativeElement.value = this.formatForBlur(value);
    this.onTouched();
  }

  @HostListener('focus')
  onFocus(): void {
    // 6. เมื่อผู้ใช้กลับเข้ามา, ให้แสดงเป็นตัวเลขดิบๆ (ไม่มี comma) เพื่อให้แก้ไขง่าย
    const value = this.unformatToNumber(this.el.nativeElement.value);
    this.el.nativeElement.value = value !== null ? String(value) : '';
  }

  // --- Helper Functions ---
  private formatForTyping(value: string): { formattedValue: string, numericValue: number | null } {
    if (!value) return {formattedValue: '', numericValue: null};

    const cleanValue = this.unformatToString(value);
    const [integerPart, decimalPart] = cleanValue.split('.');

    if (!integerPart) {
      return {formattedValue: cleanValue, numericValue: this.unformatToNumber(cleanValue)};
    }

    let formattedValue = new Intl.NumberFormat('en-US').format(parseInt(integerPart, 10));

    if (decimalPart !== undefined) {
      formattedValue += '.' + decimalPart.substring(0, 2);
    }

    return {formattedValue, numericValue: this.unformatToNumber(formattedValue)};
  }

  private formatForBlur(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return this.finalFormatter.format(value);
  }

  private unformatToString(value: string): string {
    let clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
  }

  private unformatToNumber(value: string): number | null {
    if (!value) return null;
    const cleanValue = value.replace(/,/g, '');
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? null : numericValue;
  }
}
