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
  private fireflyState: 'awake' | 'observing' | 'sleeping' = 'sleeping';

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
    if (distance > 2 && this.hasPositioned) {
      this.movementDirection = { x: deltaX / distance, y: deltaY / distance };
    }

    this.cursor.x = event.clientX;
    this.cursor.y = event.clientY;
    this.lastMoveAt = performance.now();

    if (!this.hasPositioned) {
      this.position = { x: event.clientX - 18, y: event.clientY + 12 };
      this.hasPositioned = true;
    }

    this.setFireflyState('awake');
    clearTimeout(this.observeTimer);
    clearTimeout(this.sleepTimer);
    this.observeTimer = setTimeout(() => this.setFireflyState('observing'), 700);
    this.sleepTimer = setTimeout(() => this.setFireflyState('sleeping'), 2400);
  };

  private animateFirefly = (time: number) => {
    const element = this.firefly?.nativeElement;

    if (element && this.lastMoveAt) {
      const chaseDistance = this.fireflyState === 'awake' ? 100 : 0;
      const targetX = this.cursor.x - this.movementDirection.x * chaseDistance;
      const targetY = this.cursor.y - this.movementDirection.y * chaseDistance;
      const spring = this.fireflyState === 'awake' ? 0.034 : this.fireflyState === 'observing' ? 0.055 : 0.085;
      const friction = this.fireflyState === 'awake' ? 0.82 : 0.72;
      this.velocity.x = (this.velocity.x + (targetX - this.position.x) * spring) * friction;
      this.velocity.y = (this.velocity.y + (targetY - this.position.y) * spring) * friction;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      const angle = Math.atan2(this.velocity.y, this.velocity.x) * 180 / Math.PI;
      const remainingDistance = Math.hypot(targetX - this.position.x, targetY - this.position.y);
      element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) rotate(${remainingDistance > 5 ? angle : 0}deg)`;
    }

    this.frameId = requestAnimationFrame(this.animateFirefly);
  };

  private setFireflyState(state: 'awake' | 'observing' | 'sleeping') {
    if (state === this.fireflyState) return;
    this.fireflyState = state;
    this.firefly?.nativeElement.setAttribute('data-state', state);
  }
}
