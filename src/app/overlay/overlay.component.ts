import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../api.service";
import {getParameterByName} from "../pick-page/pick-page.component";

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {
  roomId
  room
  player1
  player2
  style1

  @ViewChild('player1Div') player1Div: ElementRef;
  @ViewChild('player2Div') player2Div: ElementRef;

  constructor(private router: Router,
              private apiService: ApiService,
  ) {
    this.roomId = getParameterByName('uuid', this.router.url)
    this.apiService.getRoomForCrawlers(this.roomId).subscribe(room => {
      this.room = room;
      this.player1 = room.player[0]
      this.player2 = room.player[1]
    });
  }

  ngOnInit(): void {


  }

  dropped(pouet){
    this.style1 = window.getComputedStyle(this.player1Div.nativeElement)
  }
}
