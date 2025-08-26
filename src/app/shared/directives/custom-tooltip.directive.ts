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

  @HostListener('click')
  toggleTooltip(): void {
    const tooltipText = this.text();
    if (!tooltipText) return;

    if (this.overlayRef) {
      // ถ้า overlay กำลังแสดงอยู่ ให้ซ่อนมัน
      this.hide();
    } else {
      // ถ้ายังไม่แสดง ให้สร้างและแสดง overlay
      this.show();
    }
  }

  // ใช้ event 'mouseenter' และ 'mouseleave' สำหรับการ hover บน desktop เท่านั้น
  @HostListener('mouseenter')
  onMouseEnter(): void {
    // ถ้าไม่มี overlay อยู่ และหน้าจอไม่ใช่ mobile
    if (!this.overlayRef && !this.isMobile()) {
      this.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // ซ่อน tooltip เมื่อออกจากพื้นที่ของ element
    // แต่ให้ delay เล็กน้อย เผื่อเมาส์เผลอขยับ
    setTimeout(() => {
      if (this.overlayRef) {
        this.hide();
      }
    }, 100);
  }

  private show(): void {
    const tooltipText = this.text();
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

    // เมื่อมีการคลิกที่ใดก็ได้นอก overlay ให้ซ่อน tooltip
    this.overlayRef.outsidePointerEvents().subscribe(() => this.hide());
  }

  private hide(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private isMobile(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent);
  }
}
