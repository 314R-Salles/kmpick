import { Component } from '@angular/core';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent {

  constructor() {
    window.location.href = 'https://www.krosmaga.com/fr'
  }
}
