import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private readonly KEY = 'skiox_selected_station';
  
  private stationSubject = new BehaviorSubject<any>(this.loadFromStorage());
  public station$ = this.stationSubject.asObservable();

  constructor(private http: HttpClient) {}

  getStations(): Observable<any[]> {
    return this.http.get<any>('/api/stations').pipe(
      map(response => response.data || [])
    );
  }

  private loadFromStorage(): any {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setStation(station: any) {
    localStorage.setItem(this.KEY, JSON.stringify(station));
    this.stationSubject.next(station);
  }

  getStation(): any {
    return this.stationSubject.value;
  }

  clearStation() {
    localStorage.removeItem(this.KEY);
    this.stationSubject.next(null);
  }
}