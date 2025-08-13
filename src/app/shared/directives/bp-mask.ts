import { Directive, ElementRef, forwardRef, HostListener, inject, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[bpMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BpMask),
      multi: true
    }
  ]
})
export class BpMask {
  private elementRef = inject(ElementRef<HTMLInputElement>);

  @Input() nextInput?: HTMLInputElement;

  private onChange: (value: string | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  // ดักจับทุกครั้งที่มีการพิมพ์ใน input
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    const {formattedValue, isComplete} = this.formatValue(value);
    inputElement.value = formattedValue;
    this.onChange(formattedValue);

    // Autofocus to the next input when complete
    if (isComplete && this.nextInput) {
      setTimeout(() => this.nextInput?.focus(), 0);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  // ทำงานเมื่อ formControl มีการตั้งค่ามาให้ (เช่น ตอนเปิดโหมดแก้ไข)
  writeValue(value: string | null): void {
    this.elementRef.nativeElement.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  // ฟังก์ชันสำหรับแปลง object กลับเป็น string
  private formatValue(value: string): { formattedValue: string, isComplete: boolean } {
    const nums = value.replace(/[^\d]/g, '');
    let sys = '', dia = '', pulse = '';
    let formatted = '';
    let isComplete = false;

    if (nums.length > 0) sys = nums.substring(0, 3);
    if (nums.length > 3) dia = nums.substring(3, 5);
    if (nums.length > 5) pulse = nums.substring(5, 7);

    if (sys) formatted += sys;
    if (dia) formatted += `/${dia}`;
    if (pulse) formatted += ` P${pulse}`;

    // SYS มี 2-3 หลัก, DIA 2-3 หลัก, PULSE 2 หลัก (รวมอย่างน้อย 7 ตัว)
    if (nums.length >= 7) {
      isComplete = true;
    }

    return {formattedValue: formatted, isComplete};
  }
}
