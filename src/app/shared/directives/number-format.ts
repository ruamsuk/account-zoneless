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

  // -----------------------------------------
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    this.onTouched(); // Mark the control as touched

    // Format the view value
    const formattedValue = this.format(value);
    this.el.nativeElement.value = formattedValue;

    // Get the numeric model value
    const numericValue = this.unformat(formattedValue);

    // Update the model value using the registered onChange function
    this.onChange(numericValue);
  }

  private format(value: string | number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    let cleanValue = String(value).replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    const [integerPart, decimalPart] = cleanValue.split('.');
    if (!integerPart) {
      return '';
    }
    let formattedValue = new Intl.NumberFormat('en-US').format(parseInt(integerPart, 10));
    if (decimalPart !== undefined) {
      formattedValue += '.' + decimalPart.substring(0, 2);
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
