import {Component} from '@angular/core';
import {ApiService} from "../api.service";
import * as uuid from 'uuid';
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {Meta} from "@angular/platform-browser";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  constructor(private apiService: ApiService,
              private cookieService: CookieService,
              private router: Router,
              private metaService: Meta) {
    this.metaService.addTags([
      {
        name: 'description',
        content:
          'Créer une nouvelle draft',
      },
    ]);
  }

  createRoom() {
    let playerUuid = this.cookieService.get('playerUuid');
    const roomUuid = uuid.v4();
    this.apiService.createRoom(playerUuid, roomUuid).subscribe(
      uuid => this.router.navigate(['/room'], {queryParams: {uuid}})
    )
  }

}
