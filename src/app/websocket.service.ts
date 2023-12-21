import {Injectable, InjectionToken} from '@angular/core';

import {Observable} from 'rxjs';
import {RxStompConfig} from "@stomp/rx-stomp";
import {RxStompService} from "./ws-impl.service";
import {isPlatformBrowser} from "@angular/common";


/**
 * Fix annoying TS2345 error when injecting InjectableRxStompConfig into
 * RxStomp.stompClient.configure method who don't need the rxStomp
 * configuration.
 */
export class FixedStompConfig extends RxStompConfig {
  constructor() {
    super();
  }

  override beforeConnect?: () => void | Promise<any>;
}


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private obsStompConnection: Observable<any>;
  private subscribers: Array<any> = [];
  private subscriberIndex = 0;
  private stompConfig: FixedStompConfig = {
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 10000,
    debug: (str) => {
      console.log(str);
    }
  };

  options

  constructor(
    private stompService: RxStompService,
    private updatedStompConfig: FixedStompConfig,
    private platformId: InjectionToken<Object>
  ) {
  }

  startWS(roomId, playerId) {
    this.options = new WebSocketOptions(`/topic/progress/${roomId}/${playerId}`);
    if (isPlatformBrowser(this.platformId)) {
      // Update StompJs configuration.
      this.stompConfig = {...this.stompConfig, ...this.updatedStompConfig};
      // Initialise a list of possible subscribers.
      this.createObservableSocket();
      // Activate subscription to broker.
      this.connect();
    }
  }


  private createObservableSocket = () => {
    this.obsStompConnection = new Observable(observer => {
      const subscriberIndex = this.subscriberIndex++;
      this.addToSubscribers({index: subscriberIndex, observer});
      return () => {
        this.removeFromSubscribers(subscriberIndex);
      };
    });
  }

  private addToSubscribers = subscriber => {
    this.subscribers.push(subscriber);
  }

  private removeFromSubscribers = index => {
    for (let i = 0; i < this.subscribers.length; i++) {
      if (i === index) {
        this.subscribers.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Connect and activate the client to the broker.
   */
  private connect = () => {
    this.stompService.stompClient.configure(this.stompConfig);
    this.stompService.stompClient.onConnect = this.onSocketConnect;
    this.stompService.stompClient.onStompError = this.onSocketError;
    this.stompService.stompClient.activate();
  }

  /**
   * On each connect / reconnect, we subscribe all broker clients.
   */
  private onSocketConnect = frame => {
    this.stompService.stompClient.subscribe(this.options.brokerEndpoint, this.socketListener);
  }

  private onSocketError = errorMsg => {
    console.log('Broker reported error: ' + errorMsg);

    const response: SocketResponse = {
      type: 'ERROR',
      message: errorMsg
    };

    this.subscribers.forEach(subscriber => {
      subscriber.observer.error(response);
    });
  }

  private socketListener = frame => {
    this.subscribers.forEach(subscriber => {
      subscriber.observer.next(this.getMessage(frame));
    });
  }

  private getMessage = data => {
    const response: SocketResponse = {
      type: 'SUCCESS',
      message: JSON.parse(data.body)
    };
    return response;
  }

  /**
   * Return an observable containing a subscribers list to the broker.
   */
  public getObservable = () => {
    return this.obsStompConnection;
  }


}

export class SocketResponse {
  type: string;
  message: any
}

export class WebSocketOptions {
  constructor(public brokerEndpoint: string) {
  }
}
