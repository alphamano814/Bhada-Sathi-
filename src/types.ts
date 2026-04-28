/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FareRoute {
  from: string;
  to: string;
  fare: number;
  operator?: string;
  vehicleType?: string;
  serviceType?: 'Normal' | 'Delux' | 'AC';
}

export interface ShortDistanceData {
  [city: string]: FareRoute[];
}

export interface LongDistanceFare {
  from: string;
  to: string;
  fare: number;
  operator?: string;
  vehicleType?: string;
  serviceType?: 'Normal' | 'Delux' | 'AC';
}
