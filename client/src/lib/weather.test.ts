import { describe, expect, it } from 'vitest';

describe('Weather API Integration', () => {
  const API_KEY = process.env.CWA_API_KEY;
  const BASE_URL = 'https://opendata.cwa.gov.tw/api';

  it('should have a valid API key', () => {
    expect(API_KEY).toBeDefined();
    expect(API_KEY?.length).toBeGreaterThan(0);
  });

  it('should fetch general weather forecast successfully', async () => {
    if (!API_KEY) return;

    // F-C0032-001: 一般天氣預報-今明 36 小時天氣預報
    const url = `${BASE_URL}/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&format=JSON&locationName=臺北市`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe("true");
      expect(data.records.location[0].locationName).toBe('臺北市');
    } catch (error) {
      console.error('Weather API fetch failed:', error);
      throw error;
    }
  });
});
