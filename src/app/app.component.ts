import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

type ProjectCategory = 'All' | 'Angular' | 'React' | 'Mobile';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('firefly') firefly?: ElementRef<HTMLElement>;

  menuOpen = false;
  activeCategory: ProjectCategory = 'All';
  readonly categories: ProjectCategory[] = ['All', 'Angular', 'React', 'Mobile'];
  private cursor = { x: -100, y: -100 };
  private position = { x: -100, y: -100 };
  private velocity = { x: 0, y: 0 };
  private movementDirection = { x: 1, y: 0 };
  private lastMoveAt = 0;
  private frameId = 0;
  private observeTimer?: ReturnType<typeof setTimeout>;
  private sleepTimer?: ReturnType<typeof setTimeout>;
  private hasPositioned = false;
  private fireflyState: 'awake' | 'landing' | 'observing' | 'sleeping' = 'sleeping';
  private rotation = 0;
  private hasArrived = false;
  private arrivalTimer?: ReturnType<typeof setTimeout>;
  private cursorSpeed = 0;
  private lastPointerTime = performance.now();
  private currentChaseDistance = 25;

  readonly projects = [
    {
      code: '01',
      category: 'Angular',
      title: 'Industrial Control Platform',
      company: 'Watlow / Torry Harris',
      summary: 'A real-time control and monitoring experience engineered for industrial hardware, embedded touchscreens, and mission-critical operations.',
      impact: '40%',
      impactLabel: 'faster response',
      tags: ['Angular 20', 'Nx Monorepo', 'SignalR', 'ASP.NET'],
      accent: 'lime'
    },
    {
      code: '02',
      category: 'React',
      title: 'Creator Marketplace',
      company: 'Ultraviral / Zapbuild',
      summary: 'A creator economy platform with bookings, escrow-based payments, multi-party splits, and low-latency messaging.',
      impact: '30%',
      impactLabel: 'higher retention',
      tags: ['ReactJS', 'ExpressJS', 'MongoDB', 'Socket.io'],
      accent: 'violet'
    },
    {
      code: '03',
      category: 'Angular',
      title: 'Event Discovery & Ticketing',
      company: 'CityWoofer / Zapbuild',
      summary: 'A search-friendly event platform rebuilt with SSR, lazy routing, service workers, and reliable offline booking workflows.',
      impact: '35%',
      impactLabel: 'faster load speed',
      tags: ['Angular 15', 'Node.js', 'SSR', 'PWA'],
      accent: 'orange'
    },
    {
      code: '04',
      category: 'Mobile',
      title: 'Enterprise CRM Suite',
      company: 'Abacus Desk',
      summary: 'Multi-client CRM and mobile applications modernized across Angular versions while maintaining feature parity and offline support.',
      impact: '30%',
      impactLabel: 'higher engagement',
      tags: ['Angular', 'Ionic', 'Firebase', 'AngularJS'],
      accent: 'blue'
    }
  ];

  get filteredProjects() {
    return this.activeCategory === 'All'
      ? this.projects
      : this.projects.filter((project) => project.category === this.activeCategory);
  }

  setCategory(category: ProjectCategory) {
    this.activeCategory = category;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  ngAfterViewInit() {
    if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    window.addEventListener('pointermove', this.trackCursor, { passive: true });
    this.frameId = requestAnimationFrame(this.animateFirefly);
  }

  ngOnDestroy() {
    window.removeEventListener('pointermove', this.trackCursor);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.observeTimer);
    clearTimeout(this.sleepTimer);
  }

  private trackCursor = (event: PointerEvent) => {
    const deltaX = event.clientX - this.cursor.x;
    const deltaY = event.clientY - this.cursor.y;
    const distance = Math.hypot(deltaX, deltaY);
    const now = performance.now();

    const dt = now - this.lastPointerTime;

    this.lastPointerTime = now;

    const speed = dt > 0
      ? distance / dt
      : 0;

    this.cursorSpeed =
      this.cursorSpeed * 0.8 +
      speed * 0.2;
    if (distance > 2 && this.hasPositioned) {
      this.movementDirection = { x: deltaX / distance, y: deltaY / distance };
    }

    this.cursor.x = event.clientX;
    this.cursor.y = event.clientY;
    this.lastMoveAt = performance.now();
    this.hasArrived = false;

    if (!this.hasPositioned) {
      this.position = { x: event.clientX - 18, y: event.clientY + 12 };
      this.hasPositioned = true;
    }

    if (this.fireflyState === 'sleeping') {
      this.setFireflyState('observing');

      clearTimeout(this.observeTimer);

      this.observeTimer = setTimeout(() => {
        this.setFireflyState('awake');
      }, 300);
    } else {
      this.setFireflyState('awake');
    }
    clearTimeout(this.observeTimer);
    clearTimeout(this.sleepTimer);
    this.observeTimer = setTimeout(() => this.setFireflyState('observing'), 700);
    this.sleepTimer = setTimeout(() => this.setFireflyState('sleeping'), 2400);
  };

  private animateFirefly = (time: number) => {
    const element = this.firefly?.nativeElement;

    if (element && this.lastMoveAt) {
      if (this.fireflyState === 'sleeping') {
        this.frameId = requestAnimationFrame(this.animateFirefly);
        return;
      }
      const desiredChaseDistance =
        this.fireflyState === 'awake'
          ? Math.min(220, Math.max(25, this.cursorSpeed * 180))
          : 0;

      this.currentChaseDistance +=
        (desiredChaseDistance - this.currentChaseDistance) * 0.03;

      const chaseDistance = this.currentChaseDistance;
      const targetX = this.cursor.x - this.movementDirection.x * chaseDistance;
      const targetY = this.cursor.y - this.movementDirection.y * chaseDistance;
      const spring =
      this.fireflyState === 'awake'
        ? 0.012
        : 0.03;

    const friction =
      this.fireflyState === 'awake'
        ? 0.92
        : 0.85;
      const remainingDistance = Math.hypot(
        targetX - this.position.x,
        targetY - this.position.y
      );
      let adjustedSpring = spring;

      if (remainingDistance < 100) {
        adjustedSpring *= 0.4;
      }
      if (
        remainingDistance < 8 &&
        !this.hasArrived &&
        this.fireflyState === 'awake'
      ) {
        this.hasArrived = true;

        this.velocity.x = 0;
        this.velocity.y = 0;

        this.setFireflyState('landing');

        clearTimeout(this.arrivalTimer);

        this.arrivalTimer = setTimeout(() => {
          this.setFireflyState('observing');
        }, 500);
      }

      this.velocity.x =
        (this.velocity.x + (targetX - this.position.x) * adjustedSpring) * friction;

      this.velocity.y =
        (this.velocity.y + (targetY - this.position.y) * spring) * friction;

      if (remainingDistance < 8) {
        this.velocity.x *= 0.5;
        this.velocity.y *= 0.5;
      } else {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }

      const lookX = this.cursor.x - this.position.x;
      const lookY = this.cursor.y - this.position.y;

      const targetAngle =
        Math.atan2(lookY, lookX) * 180 / Math.PI + 180;

      let diff = targetAngle - this.rotation;

      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;

      this.rotation += diff * 0.12;

      element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotate(${this.rotation}deg)`;
    }

    this.frameId = requestAnimationFrame(this.animateFirefly);
  };

  private setFireflyState(state: 'awake' | 'landing' | 'observing' | 'sleeping') {
    if (state === this.fireflyState) return;
    this.fireflyState = state;
    this.firefly?.nativeElement.setAttribute('data-state', state);
  }
}
