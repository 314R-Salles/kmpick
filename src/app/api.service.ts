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

  pickGods(uuidPlayer: string, roomId: string, picks: number[]) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post<any>(`${this.API_URL}/gods`,{roomId, picks}, {headers});
  }

  banGod(uuidPlayer: string, roomId: string, ban: number) {
    let headers = new HttpHeaders();
    headers = headers.append('km_token', uuidPlayer);
    return this.http.post<any>(`${this.API_URL}/ban`,{roomId, ban}, {headers});
  }

}
