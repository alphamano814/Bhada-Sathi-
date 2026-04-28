/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SHORT_DISTANCE_DATA, LONG_DISTANCE_DATA } from '../data/fareData';
import { FareRoute, LongDistanceFare } from '../types';

export class FareService {
  /**
   * Fetches short distance routes for a specific city.
   * Works offline using local data.
   */
  static getShortDistanceRoutes(city: string): FareRoute[] {
    return SHORT_DISTANCE_DATA[city] || [];
  }

  /**
   * Calculates long distance fare between two cities.
   */
  static getLongDistanceFare(from: string, to: string): number | null {
    const result = LONG_DISTANCE_DATA.find(
      f => f.from === from && f.to === to
    );
    return result ? result.fare : null;
  }

  /**
   * Placeholder for future online updates.
   */
  static async fetchFareFromAPI(): Promise<void> {
    console.log("Fetching latest fares from API...");
    // Future implementation: Fetch and update local storage
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}
