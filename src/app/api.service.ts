import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  BASE_API = environment.JAVA_API;
  KM_API = '/km';
  API_URL: string;

  constructor(private http: HttpClient) {
    this.API_URL = this.BASE_API + this.KM_API;
  }

  createRoom(uuidPlayer: string, uuidRoom: string) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post(`${this.API_URL}/room/${uuidRoom}`, null, {headers, responseType: 'text'});
  }

  getRoom(uuidPlayer: string, uuidRoom: string) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.get<any>(`${this.API_URL}/room/${uuidRoom}`, {headers});
  }

  getRoomForCrawlers(uuidRoom: string) {
    return this.http.get<any>(`${this.API_URL}/meta/${uuidRoom}`);
  }

  pickGods(uuidPlayer: string, roomId: string, picks: number[], name: string) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post<any>(`${this.API_URL}/gods`,{roomId, picks, name}, {headers});
  }

  banGod(uuidPlayer: string, roomId: string, ban: number, name: string) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post<any>(`${this.API_URL}/ban`,{roomId, ban, name}, {headers});
  }

  updateUsername(uuidPlayer: string, roomId: string, name: string) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post<any>(`${this.API_URL}/username`,{roomId, name}, {headers});
  }

}
