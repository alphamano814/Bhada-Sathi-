/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FareRoute {
  from: string;
  to: string;
  fares: {
    normal: number;
    ac: number;
    deluxe: number;
  };
  suggestedYatayat?: string;
  vehicleType?: string;
}

export interface ShortDistanceData {
  [city: string]: FareRoute[];
}

export interface LocalRoute {
  from: string;
  to: string;
  fare: number;
  suggestedYatayat?: string;
  vehicleType?: string;
}

export type AppRoute = FareRoute | LocalRoute;

export interface TravelUpdate {
  id: string;
  date?: string;
  title: string;
  content: string;
  isNew?: boolean;
}
