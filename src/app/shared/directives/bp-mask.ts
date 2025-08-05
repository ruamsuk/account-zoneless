import { Directive, ElementRef, forwardRef, HostListener, inject, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BloodPressureReading } from '../../models/blood-pressure.model';

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

  private onChange: (value: BloodPressureReading | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  // ดักจับทุกครั้งที่มีการพิมพ์ใน input
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    const {formattedValue, parsedValue, isComplete} = this.formatAndParse(value);
    this.elementRef.nativeElement.value = formattedValue;
    this.onChange(parsedValue);

    // Autofocus to the next input when complete
    if (isComplete && this.nextInput) {
      this.nextInput.focus();
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  // ทำงานเมื่อ formControl มีการตั้งค่ามาให้ (เช่น ตอนเปิดโหมดแก้ไข)
  writeValue(value: BloodPressureReading | string | null): void {
    let formattedValue = '';
    if (typeof value === 'string') {
      // ถ้าค่าที่ได้รับมาเป็น string (จาก Firestore), ให้จัดรูปแบบใหม่
      formattedValue = this.formatAndParse(value).formattedValue;
    } else if (typeof value === 'object' && value !== null) {
      // ถ้าเป็น object (จากฟอร์ม), ให้จัดรูปแบบตามปกติ
      formattedValue = this.formatReading(value);
    }
    this.elementRef.nativeElement.value = formattedValue;
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

  // ฟังก์ชันสำหรับแปลง string เป็น object และจัดรูปแบบ
  private formatAndParse(value: string): {
    formattedValue: string,
    parsedValue: BloodPressureReading | null,
    isComplete: boolean
  } {
    // 1. เอาทุกอย่างที่ไม่ใช่ตัวเลขออกไปก่อน
    const nums = value.replace(/[^\d]/g, '');
    let sys = '', dia = '', pulse = '';
    let formatted = '';
    let isComplete = false;

    // 2. แยกตัวเลขออกเป็นส่วนๆ
    if (nums.length > 0) sys = nums.substring(0, 3);
    if (nums.length > 3) dia = nums.substring(3, 5);
    if (nums.length > 5) pulse = nums.substring(5, 7);

    // 3. สร้าง string ที่มี mask ขึ้นมาใหม่
    if (sys) formatted += sys;
    if (dia) formatted += `/${dia}`;
    if (pulse) formatted += ` P${pulse}`;

    // 4. สร้าง object ที่จะส่งกลับไปให้ form control
    const parsed: BloodPressureReading = {
      sys: sys ? parseInt(sys, 10) : null,
      dia: dia ? parseInt(dia, 10) : null,
      pulse: pulse ? parseInt(pulse, 10) : null,
    };

    if (nums.length >= 7) {
      isComplete = true;
    }

    return {
      formattedValue: formatted,
      parsedValue: (sys && dia && pulse) ? parsed : null,
      isComplete
    };
  }

  // ฟังก์ชันสำหรับแปลง object กลับเป็น string
  private formatReading(reading: BloodPressureReading | null): string {
    if (!reading || reading.sys === null || reading.dia === null || reading.pulse === null) {
      return '';
    }
    return `${reading.sys}/${reading.dia} P${reading.pulse}`;
  }
}
