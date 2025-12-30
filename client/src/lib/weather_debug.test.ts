import { describe, expect, it } from 'vitest';

describe('Weather API Debug', () => {
  const API_KEY = process.env.CWA_API_KEY;
  const BASE_URL = 'https://opendata.cwa.gov.tw/api';

  it('should list available stations in Taipei', async () => {
    if (!API_KEY) {
      console.warn('No API Key provided, skipping test');
      return;
    }

    // O-A0003-001: 局屬氣象測站
    const url = `${BASE_URL}/v1/rest/datastore/O-A0003-001?Authorization=${API_KEY}&format=JSON`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success === "true") {
        const stations = data.records.Station;
        const taipeiStations = stations.filter((s: any) => s.GeoInfo.CountyName === "臺北市");
        
        console.log('Found Taipei Stations (O-A0003-001):', taipeiStations.map((s: any) => s.StationName));
        
        // Check specifically for "臺北"
        const taipeiStation = stations.find((s: any) => s.StationName === "臺北");
        if (taipeiStation) {
          console.log('Taipei Station Data:', JSON.stringify(taipeiStation.WeatherElement, null, 2));
        } else {
          console.error('Station "臺北" not found in O-A0003-001');
        }
      } else {
        console.error('API Error:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  });
});
