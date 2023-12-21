import {Inject, Injectable, InjectionToken, PLATFORM_ID} from '@angular/core';
import {FixedStompConfig, WebSocketService} from "./websocket.service";
import {RxStomp} from "@stomp/rx-stomp";


export const progressStompConfig: FixedStompConfig = {
  webSocketFactory: () => {
    return new WebSocket('ws://localhost:8080/stomp');
  }
};

@Injectable({
  providedIn: 'root'
})
export class ProgressWebsocketService extends WebSocketService {
  constructor(stompService: RxStompService, @Inject(PLATFORM_ID) platformId: InjectionToken<Object>,) {
    super(
      stompService,
      progressStompConfig,
      platformId
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class RxStompService extends RxStomp {
  constructor() {
    super();
  }
}

export function rxStompServiceFactory() {
  const rxStomp = new RxStompService();
  rxStomp.configure(progressStompConfig);
  rxStomp.activate();
  return rxStomp;
}
