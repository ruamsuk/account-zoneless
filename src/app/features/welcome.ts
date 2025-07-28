import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center text-center pt-24 md:pt-32">
      <h1 class="text-5xl md:text-6xl text-white font-bold font-serif text-shadow-lg">
        Welcome to Your Site
      </h1>
      <p class="mt-4 text-white/90 text-lg md:text-xl font-sans text-shadow">
        A comprehensive solution for all your accounting needs.
      </p>
    </div>
  `,
  styles: ``
})
export class Welcome {

}
