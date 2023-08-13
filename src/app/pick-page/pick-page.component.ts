import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../api.service";
import {CookieService} from "ngx-cookie-service";
import {gsap} from 'gsap';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-pick-page',
  templateUrl: './pick-page.component.html',
  styleUrls: ['./pick-page.component.scss']
})
export class PickPageComponent implements OnInit {

  playerUuid;
  roomId;
  currentStep // : Step
  validButtonSrc;
  shareButtonSrc = '/assets/buttons/kmButtonUnactivatedYellow.png';
  validPickSelection = false;
  validBanSelection = false;
  Step = Step

  instructions

  UNKNOWN_GODS = [
    {...rushuCard(), id: 1},
    {...rushuCard(), id: 2},
    {...rushuCard(), id: 3}
  ]

  ALL_GODS: Card[] = [
    {...godCard('cra'), id: 0},
    {...godCard('ecaflip'), id: 1},
    {...godCard('eniripsa'), id: 2},
    {...godCard('enutrof'), id: 3},
    {...godCard('feca'), id: 4},
    {...godCard('iop'), id: 5},
    {...godCard('sacrieur'), id: 6},
    {...godCard('sadida'), id: 7},
    {...godCard('sram'), id: 8},
    {...godCard('xelor'), id: 9},
  ]

  leftPlayerGods: Card[] = []
  rightPlayerGods: Card[] = []

  constructor(private route: ActivatedRoute,
              private cookieService: CookieService,
              private apiService: ApiService,
              private _snackBar: MatSnackBar) {
  }

  flipAnimationGenerator(classe: string) {
    let timeline = gsap.timeline();

    let duration = 0.5
    timeline.to(classe, {
      duration,
      rotateY: 90,
      rotateX: 20,
    })
    timeline.to(classe, {
      duration,
      rotateY: 180,
      rotateX: 0,
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
        this.playerUuid = this.cookieService.get('playerUuid')
        this.roomId = params['uuid'];
        this.apiService.getRoom(this.playerUuid, this.roomId).subscribe(roomProperties => {
          this.loadRoom(roomProperties, false, false);
        })
      }
    );
  }


  loadRoom(roomProperties, ignoreAnimLeft, ignoreAnimRight) {
    let players: Player[] = roomProperties.player;
    let currentPlayer = players.find(player => player.uuid != null)
    let otherPlayer = players.find(player => player.uuid == null)
    // Par défaut tout le monde est en "rushu"
    // this.leftPlayerGods = [...this.UNKNOWN_GODS]
    this.rightPlayerGods = [...this.UNKNOWN_GODS]
    if (currentPlayer == null) {
      this.currentStep = Step.SPECTATING
      if (players[0]?.d1 != null) {
        this.leftPlayerGods = [
          {...rushuCard(godFromId(players[0].d1)), id: 0},
          {...rushuCard(godFromId(players[0].d2)), id: 1},
          {...rushuCard(godFromId(players[0].d3)), id: 2},
        ]
      }
      if (players[1]?.d1 != null) {
        this.rightPlayerGods = [
          {...rushuCard(godFromId(players[1].d1)), id: 0},
          {...rushuCard(godFromId(players[1].d2)), id: 1},
          {...rushuCard(godFromId(players[1].d3)), id: 2},
        ]
      }

    } else if (currentPlayer.d1 == null) {
      this.currentStep = Step.PICK_NEEDED;
      this.instructions = 'Sélectionne 3 dieux'
      this.leftPlayerGods = [...this.ALL_GODS];
    } else if (otherPlayer?.d1 == null) {
      this.currentStep = Step.PICK_DONE;
      this.instructions = 'En attente de la sélection adverse...'
      if (ignoreAnimLeft) { // Si on est dans le workflow de base : je sélectionne et je valide, on veut pas l'anim
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), back: frontPath(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), back: frontPath(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), back: frontPath(godFromId(currentPlayer.d3)), id: 2},
        ]
      } else { // Si on revient via un refresh
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), id: 2},
        ]
      }
    } else if (currentPlayer.ban == null) {
      this.currentStep = Step.PICKS_DONE;
      this.instructions = 'Banni un dieu adverse'
      if (ignoreAnimLeft) { // Si on est dans le workflow de base : je sélectionne et je valide, on veut pas l'anim
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), back: frontPath(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), back: frontPath(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), back: frontPath(godFromId(currentPlayer.d3)), id: 2},
        ]
      } else { // Si on revient via un refresh
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), id: 2},
        ]
      }
      this.rightPlayerGods = [
        {...rushuCard(godFromId(otherPlayer.d1)), id: 0},
        {...rushuCard(godFromId(otherPlayer.d2)), id: 1},
        {...rushuCard(godFromId(otherPlayer.d3)), id: 2},
      ]
    } else if (otherPlayer.ban == null) {
      this.currentStep = Step.BAN_DONE;
      this.instructions = 'En attente du ban adverse'
      if (ignoreAnimLeft) { // Si on est dans le workflow de base : je sélectionne et je valide, on veut pas l'anim
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), back: frontPath(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), back: frontPath(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), back: frontPath(godFromId(currentPlayer.d3)), id: 2},
        ]
      } else { // Si on revient via un refresh
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), id: 2},
        ]
      }
      if (ignoreAnimRight) {
        this.rightPlayerGods = [
          {...rushuCard(godFromId(otherPlayer.d1)),back: frontPath(godFromId(otherPlayer.d1)) ,id: 0},
          {...rushuCard(godFromId(otherPlayer.d2)),back: frontPath(godFromId(otherPlayer.d2)) ,id: 1},
          {...rushuCard(godFromId(otherPlayer.d3)),back: frontPath(godFromId(otherPlayer.d3)) ,id: 2},
        ]
      } else {
        this.rightPlayerGods = [
          {...rushuCard(godFromId(otherPlayer.d1)), id: 0},
          {...rushuCard(godFromId(otherPlayer.d2)), id: 1},
          {...rushuCard(godFromId(otherPlayer.d3)), id: 2},
        ]
      }

      this.rightPlayerGods[currentPlayer.ban].banned = true;
    } else {
      this.currentStep = Step.BANS_DONE;
      if (ignoreAnimLeft) { // Si on est dans le workflow de base : je sélectionne et je valide, on veut pas l'anim
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), back: frontPath(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), back: frontPath(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), back: frontPath(godFromId(currentPlayer.d3)), id: 2},
        ]
      } else { // Si on revient via un refresh
        this.leftPlayerGods = [
          {...rushuCard(godFromId(currentPlayer.d1)), id: 0},
          {...rushuCard(godFromId(currentPlayer.d2)), id: 1},
          {...rushuCard(godFromId(currentPlayer.d3)), id: 2},
        ]
      }
      if (ignoreAnimRight) {
        this.rightPlayerGods = [
          {...rushuCard(godFromId(otherPlayer.d1)),back: frontPath(godFromId(otherPlayer.d1)) ,id: 0},
          {...rushuCard(godFromId(otherPlayer.d2)),back: frontPath(godFromId(otherPlayer.d2)) ,id: 1},
          {...rushuCard(godFromId(otherPlayer.d3)),back: frontPath(godFromId(otherPlayer.d3)) ,id: 2},
        ]
      } else {
        this.rightPlayerGods = [
          {...rushuCard(godFromId(otherPlayer.d1)), id: 0},
          {...rushuCard(godFromId(otherPlayer.d2)), id: 1},
          {...rushuCard(godFromId(otherPlayer.d3)), id: 2},
        ]
      }
      this.leftPlayerGods[otherPlayer.ban].banned = true;
      this.rightPlayerGods[currentPlayer.ban].banned = true;

      this.leftPlayerGods.sort((g1, g2) => g1.banned ? 1 : -1)
      this.rightPlayerGods.sort((g1, g2) => g1.banned ? 1 : -1)

      this.instructions = 'Draft terminée, que les dieux soient en ta faveur !'
    }

    this.updateValidButtonImage(false)

    // sans setTimeout, ça se déclenche sur un html pas à jour et donc ça n'anime rien.
    setTimeout(() => {
      // n'animer que si les données sont connues
      if (JSON.stringify(this.leftPlayerGods) != JSON.stringify(this.UNKNOWN_GODS) && !ignoreAnimLeft)
        this.flipAnimationGenerator('.leftPlayerGods')
      if (JSON.stringify(this.rightPlayerGods) != JSON.stringify(this.UNKNOWN_GODS) && !ignoreAnimRight)
        this.flipAnimationGenerator('.rightPlayerGods')
    }, 1)


  }

  displayButton() {
    return [Step.PICK_NEEDED, Step.PICKS_DONE].includes(this.currentStep);
  }


  submit() {
    if (this.currentStep == Step.PICK_NEEDED) {
      let selectedIds = this.ALL_GODS.filter(god => god.selected).map(god => god.id)
      this.apiService.pickGods(this.playerUuid, this.roomId, selectedIds).subscribe(room => this.loadRoom(room, true, false));
    } else if (this.currentStep == Step.PICKS_DONE) {
      let selectedId = this.rightPlayerGods.find(god => god.selected).id
      this.apiService.banGod(this.playerUuid, this.roomId, selectedId).subscribe(room => this.loadRoom(room, true, true));
      // document.querySelector("#opponentSelected").children[i].style.animation = "shake 0.10s 3";
    }
    // document.querySelector('#godSelected3').parentNode.parentNode.parentNode.style.animation = "shake 0.10s 3";
  }

  pick(id) {
    if (this.currentStep === Step.PICK_NEEDED) {
      this.leftPlayerGods[id].selected = !this.leftPlayerGods[id].selected;
      this.validPickSelection = this.leftPlayerGods.filter(god => god.selected).length === 3;
      this.updateValidButtonImage(false)
    }
  }

  ban(id) {
    if (this.currentStep === Step.PICKS_DONE) {
      this.rightPlayerGods[id].selected = !this.rightPlayerGods[id].selected;
      this.validBanSelection = this.rightPlayerGods.filter(god => god.selected).length === 1
      this.updateValidButtonImage(false)
    }
  }

  updateValidButtonImage(hover) {
    if (this.validPickSelection && this.currentStep === Step.PICK_NEEDED || this.validBanSelection && this.currentStep === Step.PICKS_DONE) {
      if (hover) {
        this.validButtonSrc = '/assets/buttons/kmButton.png'
      } else {
        this.validButtonSrc = '/assets/buttons/kmButtonUnactivated.png'
      }
    } else {
      this.validButtonSrc = 'assets/buttons/kmButtonDisabled.png';
    }
  }


  updateShareButtonImage(hover) {
    if (hover) {
      this.shareButtonSrc = '/assets/buttons/kmButtonYellow.png'
    } else {
      this.shareButtonSrc = '/assets/buttons/kmButtonUnactivatedYellow.png'
    }
  }

  getLink() {
    return window.location.toString()
  }

  copyMessage() {
    this._snackBar.open('Url copiée dans le presse papier', null, {
      duration: 3000
    });
  }

}

export class Card {
  id: number;
  front: string
  back: string;
  selected: boolean;
  picked: boolean;
  banned: boolean
}

export class Player {
  bddId: number;
  uuid: string;
  name: string;
  d1: number;
  d2: number;
  d3: number;
  ban: number;
}

export function rushuCard(god?): Card {
  return {
    id: 0,
    front: god ? frontPath(god) : backPath('rushu'),
    back: backPath('rushu'),
    selected: false,
    picked: false,
    banned: false
  }
}

export function godCard(god?: string): Card {
  return {id: 0, front: frontPath(god), back: backPath(god), selected: false, picked: false, banned: false}
}

export function backPath(god) {
  return `/assets/gods/cardback/cardback_${god}.png`
}

export function frontPath(god) {
  return `/assets/gods/card/${god}.png`
}

export enum God {
  CRA = 'cra',
  ECAFLIP = 'ecaflip',
  ENIRIPSA = 'eniripsa',
  ENUTROF = 'enutrof',
  FECA = 'feca',
  IOP = 'iop',
  SACRIEUR = 'sacrieur',
  SADIDA = 'sadida',
  SRAM = 'sram',
  XELOR = 'xelor'
}

export function godFromId(id) {
  return God[Object.keys(God)[id]];
}

export enum Step {
  PICK_NEEDED, // joueur actuel n'a pas pick
  PICK_DONE, // joueur actuel a pick mais pas l'autre
  PICKS_DONE,  // les 2 ont pick mais joueur actuel n'a pas pick
  BAN_DONE, // Joueur actuel a ban
  BANS_DONE, // Les 2 joueurs ont ban
  SPECTATING // un 3eme joueur
}
