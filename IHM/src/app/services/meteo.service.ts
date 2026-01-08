import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MeteoData {
    temperature: number;
    condition: string;
    risqueAvalanche: string;
    windSpeed: number;
}

@Injectable({
    providedIn: 'root'
})
export class MeteoService {
    constructor(private http: HttpClient) { }

     
    getMeteoByCity(cityName: string): Observable<MeteoData> {
        return this.getMeteo(cityName);
    }
 
    getMeteo(cityName: string): Observable<MeteoData> {
        const url = `https://wttr.in/${encodeURIComponent(cityName)}?format=j1`;

        return this.http.get<any>(url).pipe(
            map((response) => {
                const current = response.current_condition[0];
                const temp = parseInt(current.temp_C);
                const windSpeed = parseInt(current.windspeedKmph);
                const condition = current.weatherDesc[0].value;

                return {
                    temperature: temp,
                    condition: condition,
                    windSpeed: windSpeed,
                    risqueAvalanche: this.calculateRisqueAvalanche(temp, windSpeed, condition)
                };
            })
        );
    }

    translateCondition(condition: string): string {
        const translations: { [key: string]: string } = {
            'Clear': 'Clair',
            'Sunny': 'Ensoleillé',
            'Partly cloudy': 'Partiellement nuageux',
            'Cloudy': 'Nuageux',
            'Overcast': 'Couvert',
            'Mist': 'Brume',
            'Fog': 'Brouillard',
            'Light drizzle': 'Pluie fine',
            'Light rain': 'Pluie légère',
            'Rain': 'Pluie',
            'Heavy rain': 'Pluie forte',
            'Light snow': 'Neige légère',
            'Snow': 'Neige',
            'Heavy snow': 'Neige forte',
            'Blizzard': 'Tempête de neige',
            'Thunderstorm': 'Orage',
            'Light drizzle and rain': 'Pluie fine',
            'Patchy rain possible': 'Pluie possible'
        };
        return translations[condition] || condition;
    }

    private calculateRisqueAvalanche(temp: number, windSpeed: number, condition: string): string {
        let score = 0;
        if (temp > 0) score += 2;
        else if (temp < -15) score += 2;
        else if (temp < -5) score += 1;

        if (windSpeed > 60) score += 3;
        else if (windSpeed > 40) score += 2;
        else if (windSpeed > 25) score += 1;

        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) score += 2;
        else if (conditionLower.includes('rain')) score += 3;

        if (score >= 5) return 'Très élevé';
        else if (score >= 3) return 'Élevé';
        else if (score >= 1) return 'Modéré';
        else return 'Faible';
    }
}