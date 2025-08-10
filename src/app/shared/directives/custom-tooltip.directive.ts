import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Tooltip } from '../components/tooltip';

@Directive({
  selector: '[customTooltip]'
})
export class CustomTooltipDirective {
  private elementRef = inject(ElementRef);
  private overlay = inject(Overlay);

  private overlayRef: OverlayRef | null = null;

  text = input<string>('', {alias: 'customTooltip'});

  @HostListener('mouseenter')
  show(): void {
    const tooltipText = this.text(); // <-- 3. เรียกใช้ signal เพื่อเอาค่า
    if (this.overlayRef || !tooltipText) return;

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -1
      }]);

    this.overlayRef = this.overlay.create({positionStrategy});

    const tooltipPortal = new ComponentPortal(Tooltip);
    const componentRef = this.overlayRef.attach(tooltipPortal);
    componentRef.instance.text = tooltipText;
  }

  @HostListener('mouseleave')
  hide(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

}
