import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ApiService} from "../api.service";
import {CookieService} from "ngx-cookie-service";
import {gsap} from 'gsap';
import {MatSnackBar} from "@angular/material/snack-bar";
import {Meta, Title} from "@angular/platform-browser";
import {isPlatformBrowser} from "@angular/common";
import {environment} from "../../environments/environment";
import {ProgressWebsocketService} from "../ws-impl.service";

@Component({
  selector: 'app-pick-page',
  templateUrl: './pick-page.component.html',
  styleUrls: ['./pick-page.component.scss']
})
export class PickPageComponent implements OnInit, OnDestroy {

  playerUuid;
  roomId;
  previousSpectatingStep
  currentStep
  validButtonSrc;
  shareButtonSrc = '/assets/buttons/kmButtonUnactivatedYellow.png';
  validNameButtonSrc = '/assets/buttons/kmButtonUnactivated.png';
  validPickSelection = false;
  validBanSelection = false;
  usernameError = false
  usernameUpdate = false
  Step = Step

  shareButtonText = 'PARTAGER'

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
  leftPlayerName: string;
  rightPlayerGods: Card[] = []
  rightPlayerName: string;

  // subscription


  constructor(private route: ActivatedRoute,
              private router: Router,
              private cookieService: CookieService,
              private apiService: ApiService,
              private _snackBar: MatSnackBar,
              private metaService: Meta,
              private titleService: Title,
              private progressWebsocketService: ProgressWebsocketService,
              @Inject(PLATFORM_ID)
              private platformId: any) {

    this.roomId = getParameterByName('uuid', this.router.url)
    if (isPlatformBrowser(this.platformId)) {
      this.playerUuid = this.cookieService.get('playerUuid')
      this.apiService.getRoom(this.playerUuid, this.roomId).subscribe(roomProperties => {
        this.loadRoom(roomProperties, true);
      })
    } else {
      this.apiService.getRoomForCrawlers(this.roomId).subscribe(room => {
        let title;
        if (room.player[1] == null) {
          console.log(room.player[1])
          title = `Rejoins la draft de ${room.player[0].name}`
        } else {
          title = `Draft de ${room.player[0].name} vs ${room.player[1].name}`
        }
        this.titleService.setTitle(title)
        this.metaService.removeTag("name='description'");
        this.metaService.addTags([
          {
            name: 'description',
            content: title,
          },
          {
            property: 'og:image',
            content: `/assets/${this.roomId}.png`
          }, {
            property: 'twitter:image',
            content: `/assets/${this.roomId}.png`
          },
        ]);
      })
    }
  }

  private initProgressWebSocket = (roomId, playerId) => {
    this.progressWebsocketService.startWS(roomId, playerId)
    const obs = this.progressWebsocketService.getObservable();
    obs.subscribe({
      next: this.onNewProgressMsg,
      error: err => {
        console.log(err);
      }
    });
  }

  private onNewProgressMsg = receivedMsg => {
    if (receivedMsg.type === 'SUCCESS') {
      this.loadRoom(receivedMsg.message, false);
    }
  }

  flipAnimationGenerator(classe: string) {
    let timeline = gsap.timeline();

    let duration = 0.25
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

    // ça c'est dégueulasse.
    // Sur Firefox on a vu que   backface-visibility: hidden; ne fonctionne pas.
    // donc ajout d'un décalage, transparence, rétrécissement sur le dos de la carte pour compenser.
    if ([Step.BANS_DONE, Step.SPECTATING].includes(this.currentStep)) {
      gsap.timeline().delay(duration * 2.65).to('.flip-box-front > .grey', {
        duration,
        opacity: '0',
        width: '50',
        marginLeft: '-4vw',
      })
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initProgressWebSocket(this.roomId, this.playerUuid);
      // le délai de refresh doit matcher avec la durée d'anim du floating floating  + '10s
      // let source = interval(10000);
      // this.subscription = source.subscribe(_ => {
      //   if ([Step.BAN_DONE, Step.PICK_DONE].includes(this.currentStep) || this.currentStep === Step.SPECTATING && this.previousSpectatingStep != Step.BANS_DONE)
      //     this.apiService.getRoom(this.playerUuid, this.roomId).subscribe(roomProperties => {
      //       this.loadRoom(roomProperties, false);
      //     })
      // });
    }
  }

  /**
   * Tue l'abonnement aux données de la room chargée pour ne pas conserver des fantomes de connexion,
   * par exemple en passant du spec d'une room à une autre dans un meme onglet
   */
  ngOnDestroy() {
    // if (this.subscription) this.subscription.unsubscribe();
  }

  setPlayersName(p1, p2, initialisation) {
    if (initialisation) this.leftPlayerName = p1?.name
    this.rightPlayerName = p2 ? p2.name : "Joueur 2"
  }

  /**
   * Charge toutes les données à intervalle régulier, + au refresh + sur une action (pick / ban)
   * @param roomProperties les données à jour
   * @param initialisation "est ce que c'est déclenché par un F5" puisque ça nécessite de forcer des animations.
   */

  loadRoom(roomProperties, initialisation) {
    let animLeft, animRight;
    let players: Player[] = roomProperties.player;
    let currentPlayer = players.find(player => player.uuid != null)
    let otherPlayer = players.find(player => player.uuid == null)
    if (currentPlayer == null) {
      this.currentStep = Step.SPECTATING;
      this.setPlayersName(players[0], players[1], initialisation)
      if (players[0]?.d1 == null) {
        this.previousSpectatingStep = Step.PICK_NEEDED
        animLeft = initialisation
        animRight = initialisation
        this.instructions = 'EN ATTENTE DES CHOIX';
        this.leftPlayerGods = [...this.UNKNOWN_GODS]
        this.rightPlayerGods = [...this.UNKNOWN_GODS]
      } else if (players[0]?.ban === null) {
        animLeft = this.previousSpectatingStep != Step.PICKS_DONE
        animRight = this.previousSpectatingStep != Step.PICKS_DONE
        this.previousSpectatingStep = Step.PICKS_DONE
        this.instructions = 'EN ATTENTE DES BANS';
        this.leftPlayerGods = createCards(players[0], animLeft)
        this.rightPlayerGods = createCards(players[1], animRight)
      } else {
        animLeft = initialisation
        animRight = initialisation
        this.previousSpectatingStep = Step.BANS_DONE
        this.instructions = 'DRAFT TERMINEE';
        this.leftPlayerGods = createCards(players[0], animLeft)
        this.rightPlayerGods = createCards(players[1], animRight)
        this.leftPlayerGods[players[1].ban].banned = true;
        this.rightPlayerGods[players[0].ban].banned = true;

        this.leftPlayerGods.sort((g1) => g1.banned ? 1 : -1)
        this.rightPlayerGods.sort((g1) => g1.banned ? 1 : -1)
      }

    } else if (currentPlayer.d1 == null) {
      this.currentStep = Step.PICK_NEEDED;
      this.instructions = 'CHOISI 3 DIEUX'
      this.setPlayersName(currentPlayer, otherPlayer, initialisation)
      this.leftPlayerGods = [...this.ALL_GODS];
      this.rightPlayerGods = [...this.UNKNOWN_GODS]
      animLeft = true;
      animRight = false;
    } else if (otherPlayer?.d1 == null) {
      this.currentStep = Step.PICK_DONE;
      this.instructions = 'ATTENTE DU CHOIX ADVERSE'
      this.setPlayersName(currentPlayer, otherPlayer, initialisation)
      animLeft = initialisation;
      animRight = false;
      this.leftPlayerGods = createCards(currentPlayer, animLeft)
      this.rightPlayerGods = [...this.UNKNOWN_GODS]

    } else if (currentPlayer.ban == null) {
      this.currentStep = Step.PICKS_DONE;
      this.instructions = 'BANNI 1 DIEU ADVERSE'
      this.setPlayersName(currentPlayer, otherPlayer, initialisation)
      animLeft = initialisation;
      animRight = true;
      this.leftPlayerGods = createCards(currentPlayer, animLeft)
      this.rightPlayerGods = createCards(otherPlayer, animRight)

    } else if (otherPlayer.ban == null) {
      this.currentStep = Step.BAN_DONE;
      this.instructions = 'ATTENTE DU BAN ADVERSE'
      this.setPlayersName(currentPlayer, otherPlayer, initialisation)
      animLeft = initialisation;
      animRight = initialisation;
      this.leftPlayerGods = createCards(currentPlayer, animLeft)
      this.rightPlayerGods = createCards(otherPlayer, animRight)

      this.rightPlayerGods[currentPlayer.ban].banned = true;
    } else {
      this.currentStep = Step.BANS_DONE;
      this.instructions = 'DRAFT TERMINÉE'
      this.shareButtonText = 'PARTAGER LE RESULTAT'
      this.setPlayersName(currentPlayer, otherPlayer, initialisation)
      animLeft = initialisation;
      animRight = initialisation;
      this.leftPlayerGods = createCards(currentPlayer, animLeft)
      this.rightPlayerGods = createCards(otherPlayer, animRight)

      this.leftPlayerGods[otherPlayer.ban].banned = true;
      this.rightPlayerGods[currentPlayer.ban].banned = true;

      this.leftPlayerGods.sort((g1) => g1.banned ? 1 : -1)
      this.rightPlayerGods.sort((g1) => g1.banned ? 1 : -1)
    }

    this.updateValidButtonImage(false)

    // sans setTimeout, ça se déclenche sur un html pas à jour et donc ça n'anime rien.
    setTimeout(() => {
      // n'animer que si les données sont connues
      if (JSON.stringify(this.leftPlayerGods) != JSON.stringify(this.UNKNOWN_GODS) && animLeft)
        this.flipAnimationGenerator('.leftPlayerGods')
      if (JSON.stringify(this.rightPlayerGods) != JSON.stringify(this.UNKNOWN_GODS) && animRight)
        this.flipAnimationGenerator('.rightPlayerGods')
    }, 1)


  }

  submit() {
    if (this.currentStep == Step.PICK_NEEDED) {
      let selectedIds = this.ALL_GODS.filter(god => god.selected).map(god => god.id)
      this.apiService.pickGods(this.playerUuid, this.roomId, selectedIds, this.leftPlayerName)
        .subscribe(room => console.log("this.loadRoom(room, false)"));
    } else if (this.currentStep == Step.PICKS_DONE) {
      let selectedId = this.rightPlayerGods.find(god => god.selected).id
      this.apiService.banGod(this.playerUuid, this.roomId, selectedId, this.leftPlayerName)
        .subscribe(room => console.log("this.loadRoom(room, false)"));
    }
  }

  updateUsername() {
    this.usernameError = false;
    this.usernameUpdate = false;
    this.apiService.updateUsername(this.playerUuid, this.roomId, this.leftPlayerName).subscribe({
      next: err => {
        this.usernameError = false;
        this.usernameUpdate = true;
      },
      error: err => {
        this.usernameError = true;
        this.usernameUpdate = false;
      },
    })
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

  getLink() {
    if (this.currentStep === Step.BANS_DONE) return environment.WEB_URL + this.router.url + '&complete'
    else return environment.WEB_URL + this.router.url
  }

  copyMessage() {
    this._snackBar.open('Url copiée dans le presse papier', null, {
      duration: 3000
    });
  }

  displayShareButton() {
    return [Step.PICK_NEEDED].includes(this.currentStep);
  }

  displayShareResultButton() {
    return [Step.BANS_DONE].includes(this.currentStep);
  }

  displayInputButtons() {
    return ![Step.BAN_DONE, Step.BANS_DONE, Step.SPECTATING].includes(this.currentStep);
  }

  computeFontSize() {
    if (this.instructions) {
      let size = Math.round((4 - 1 / (50) * this.instructions.length) * 100) / 100
      return `${size}vw`
    } else {
      return '4vw'
    }
  }

  computeTop() {
    if (this.instructions) {
      let size = 2.75 + this.instructions.length * 0.25 / (33 - 14) - 0.18
      return `${size}vw`
    } else {
      return '2.75vw'
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

  updateValidNameButtonImage(hover) {
    if (hover) {
      this.validNameButtonSrc = '/assets/buttons/kmButton.png'
    } else {
      this.validNameButtonSrc = '/assets/buttons/kmButtonUnactivated.png'
    }
  }

}

export function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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

export function createCards(player, anim) {
  if (!anim) { // Si on est dans le workflow de base : je sélectionne et je valide, on veut pas l'anim
    return [
      {...rushuCard(godFromId(player.d1)), back: frontPath(godFromId(player.d1)), id: 0},
      {...rushuCard(godFromId(player.d2)), back: frontPath(godFromId(player.d2)), id: 1},
      {...rushuCard(godFromId(player.d3)), back: frontPath(godFromId(player.d3)), id: 2},
    ]
  } else { // Si on revient via un refresh
    return [
      {...rushuCard(godFromId(player.d1)), id: 0},
      {...rushuCard(godFromId(player.d2)), id: 1},
      {...rushuCard(godFromId(player.d3)), id: 2},
    ]
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
  SPECTATING  // un 3eme joueur
}
