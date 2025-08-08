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
  private el = inject(ElementRef<HTMLInputElement>);

  // --- ControlValueAccessor Implementation ---
  private onChange: (value: number | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  // --- CVA Implementation ---
  writeValue(value: any): void {
    // Angular calls this method to set the initial value
    this.el.nativeElement.value = this.format(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  // --- Event Listeners ---
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const formattedValue = this.format(inputElement.value);
    const numericValue = this.unformat(formattedValue);

    this.el.nativeElement.value = formattedValue;
    this.onChange(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  // --- Formatting Logic ---
  private format(value: string | number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    // 1. ทำความสะอาดข้อมูล
    let cleanValue = String(value).replace(/[^0-9.]/g, '');

    // 2. จัดการกับจุดทศนิยมที่เกินมา
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }

    const [integerPart, decimalPart] = cleanValue.split('.');
    if (!integerPart) {
      return '';
    }

    // 3. ใส่ comma ให้กับส่วนจำนวนเต็ม
    let formattedValue = new Intl.NumberFormat('en-US')
      .format(parseInt(integerPart, 10));

    // 4. จัดการกับส่วนทศนิยม
    if (decimalPart !== undefined) {
      // บังคับให้มีทศนิยม 2 ตำแหน่งเสมอ
      formattedValue += '.' + decimalPart.padEnd(2, '0')
        .substring(0, 2);
    } else if (cleanValue.includes('.')) {
      formattedValue += '.';
    } else {
      // กรณีเป็นจำนวนเต็ม, เพิ่ม .00 เข้าไป
      formattedValue += '.00';
    }
    return formattedValue;
  }

  private unformat(value: string): number | null {
    if (value === null || value.trim() === '') {
      return null;
    }
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? null : numericValue;
  }
}
