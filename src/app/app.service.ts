import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http : HttpClient) { }

  getDates(): Observable<any> {
    return this.http.get<any>('http://localhost:3001/api/get/settings');
  }

  postDates(settings: string) {
    const options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    const body = JSON.stringify({dates : settings});
    console.log(body);
    return this.http.post('http://localhost:3001/api/post/settings', body, options);
  }

}
