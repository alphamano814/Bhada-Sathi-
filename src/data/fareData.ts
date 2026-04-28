/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShortDistanceData, LongDistanceFare } from '../types';

export const SHORT_DISTANCE_DATA: ShortDistanceData = {
  "Kathmandu Valley": [
    { from: "Kalanki", to: "Koteshwor", fare: 25 },
    { from: "Ratnapark", to: "Bhaktapur", fare: 30 },
    { from: "Lagankhel", to: "Koteshwor", fare: 20 },
    { from: "Chabahil", to: "Gongabu", fare: 25 },
    { from: "Balkhu", to: "Dakshinkali", fare: 45 }
  ],
  "Butwal": [
    { from: "Traffic Chowk", to: "Golpark", fare: 15 },
    { from: "Bus Park", to: "Yogikuti", fare: 20 }
  ],
  "Hetauda": [
    { from: "Buddha Chowk", to: "Basamadi", fare: 25 },
    { from: "Hetauda Bazar", to: "Chaughada", fare: 20 }
  ],
  "Biratnagar": [
    { from: "Main Road", to: "Airport", fare: 35 },
    { from: "Rani", to: "Bus Park", fare: 30 }
  ],
  "Pokhara": [
    { from: "Lakeside", to: "Mahendrapul", fare: 30 },
    { from: "Prithvi Chowk", to: "Bagar", fare: 25 }
  ],
  "Dharan": [
    { from: "Bhanu Chowk", to: "Ghopa", fare: 20 },
    { from: "Chatara Lines", to: "Zero Point", fare: 15 }
  ]
};

export const LONG_DISTANCE_DATA: LongDistanceFare[] = [
  { from: "Kathmandu", to: "Pokhara", fare: 800 },
  { from: "Kathmandu", to: "Butwal", fare: 700 },
  { from: "Butwal", to: "Kathmandu", fare: 700 },
  { from: "Kathmandu", to: "Biratnagar", fare: 1200 },
  { from: "Kathmandu", to: "Nepalgunj", fare: 1500 },
  { from: "Kathmandu", to: "Hetauda", fare: 500 },
  { from: "Pokhara", to: "Butwal", fare: 600 },
  { from: "Butwal", to: "Nepalgunj", fare: 800 }
];

export const CITIES = ["Kathmandu", "Pokhara", "Butwal", "Biratnagar", "Nepalgunj", "Hetauda"];
