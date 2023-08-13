import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  constructor(private cookieService: CookieService) {
  }

  initApp() {

    const playerUuid = this.cookieService.get('playerUuid');
    if (!playerUuid) {
      const userId = uuid.v4();
      this.cookieService.set('playerUuid', userId, 400);
    }
  }
}
