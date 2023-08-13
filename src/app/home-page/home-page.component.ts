import { Component, OnInit } from '@angular/core';
import {ApiService} from "../api.service";
import * as uuid from 'uuid';
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  playerName;

  constructor(private apiService: ApiService,
              private cookieService: CookieService,
              private router: Router) { }

  ngOnInit(): void {
  }

  createRoom(){
    const roomUuid = uuid.v4();
    const playerUuid = this.cookieService.get('playerUuid');
    this.apiService.createRoom(playerUuid, roomUuid).subscribe(
      uuid => this.router.navigate(['/room'],  { queryParams: { uuid }})
    )
  }

}
