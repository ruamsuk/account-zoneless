import { Directive, ElementRef, forwardRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
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

  // Formatter สำหรับจัดรูปแบบตอนแสดงผล (onBlur)
  private finalFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- CVA Implementation ---
  writeValue(value: number | null): void {
    // เมธอดนี้จะถูกเรียกโดยฟอร์มเพื่ออัปเดตหน้าตาของ input
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

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    // 1. เมื่อผู้ใช้พิมพ์, เราจะ "ทำความสะอาด" ข้อมูล
    const numericValue = this.unformat(value);

    // 2. อัปเดตค่าที่ "แท้จริง" (เป็น number) กลับไปที่ form control
    this.onChange(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    // 3. จัดรูปแบบให้สวยงามก็ต่อเมื่อผู้ใช้ออกจากช่องกรอก
    const value = this.unformat(this.el.nativeElement.value);
    this.el.nativeElement.value = this.formatForBlur(value);
    this.onTouched();
  }

  @HostListener('focus')
  onFocus(): void {
    // 4. เมื่อผู้ใช้กลับเข้ามา, ให้แสดงเป็นตัวเลขดิบๆ เพื่อให้แก้ไขง่าย
    const value = this.unformat(this.el.nativeElement.value);
    this.el.nativeElement.value = value !== null ? String(value) : '';
  }

  // --- Formatting Logic ---
  private formatForBlur(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return this.finalFormatter.format(value);
  }

  private unformat(value: string): number | null {
    if (!value) {
      return null;
    }
    // อนุญาตให้มีแค่ตัวเลขและจุดทศนิยมเดียว
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      // ถ้ามีจุดทศนิยมมากกว่า 1 จุด, ให้ใช้แค่ 2 ส่วนแรก
      const validValue = parts[0] + '.' + parts[1];
      const numericValue = parseFloat(validValue);
      return isNaN(numericValue) ? null : numericValue;
    }

    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? null : numericValue;
  }

}
