/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  Bus, 
  MapPin, 
  ArrowRight, 
  Search, 
  ChevronLeft, 
  Info,
  ArrowRightLeft,
  Calendar,
  Languages,
  Lock,
  LogOut,
  Plus,
  Trash2,
  LayoutDashboard,
  TrendingUp,
  X,
  Home,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Bell,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Users,
  Map as MapIcon,
  Compass,
  Navigation
} from 'lucide-react';
import { FareService } from './services/fareService';
import { SHORT_DISTANCE_DATA as INITIAL_SHORT_DATA, LONG_DISTANCE_DATA as INITIAL_LONG_DATA, CITIES } from './data/fareData';
import { TRANSLATIONS, Language } from './i18n';
import { FareRoute, LongDistanceFare } from './types';

type Screen = 'HOME' | 'SHORT_CITY_LIST' | 'SHORT_ROUTES' | 'LONG_DISTANCE' | 'LOGIN' | 'ADMIN' | 'INFO' | 'ALL_UPDATES' | 'MAP';
type AdminTab = 'OVERVIEW' | 'UPDATES' | 'LOCAL' | 'HIGHWAY' | 'TOOLS';

interface TravelUpdate {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [longFrom, setLongFrom] = useState<string>('');
  const [longTo, setLongTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stateful Data with LocalStorage Persistence
  const [shortData, setShortData] = useState<Record<string, FareRoute[]>>(() => {
    const saved = localStorage.getItem('app_short_data');
    return saved ? JSON.parse(saved) : {};
  });
  const [longData, setLongData] = useState<FareRoute[]>(() => {
    const saved = localStorage.getItem('app_long_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [updates, setUpdates] = useState<TravelUpdate[]>(() => {
    const saved = localStorage.getItem('app_travel_updates');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Monsoon Alert',
        content: 'Travelers are advised to check road conditions before heading to hilly regions due to heavy rains.',
        timestamp: Date.now()
      },
      {
        id: '2',
        title: 'Fare Revision',
        content: 'New fare rates for local routes in Kathmandu valley are effective from today.',
        timestamp: Date.now() - 86400000
      }
    ];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('app_short_data', JSON.stringify(shortData));
  }, [shortData]);

  useEffect(() => {
    localStorage.setItem('app_long_data', JSON.stringify(longData));
  }, [longData]);

  useEffect(() => {
    localStorage.setItem('app_travel_updates', JSON.stringify(updates));
  }, [updates]);

  const fileInputRefShort = useRef<HTMLInputElement>(null);
  const fileInputRefLong = useRef<HTMLInputElement>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('OVERVIEW');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (isLocating) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
          alert("Unable to access your location. Using default view.");
        }
      );
    }
  }, [isLocating]);

  // Admin Form States
  const [newCityName, setNewCityName] = useState('');
  const [newShortCity, setNewShortCity] = useState('');
  const [newShortFrom, setNewShortFrom] = useState('');
  const [newShortTo, setNewShortTo] = useState('');
  const [newShortFare, setNewShortFare] = useState('');
  const [newShortOperator, setNewShortOperator] = useState('');
  const [newShortVehicleType, setNewShortVehicleType] = useState('');
  const [newShortServiceType, setNewShortServiceType] = useState<'Normal' | 'Delux' | 'AC'>('Normal');

  const [newLongFrom, setNewLongFrom] = useState('');
  const [newLongTo, setNewLongTo] = useState('');
  const [newLongFare, setNewLongFare] = useState('');
  const [newLongOperator, setNewLongOperator] = useState('');
  const [newLongVehicleType, setNewLongVehicleType] = useState('');
  const [newLongServiceType, setNewLongServiceType] = useState<'Normal' | 'Delux' | 'AC'>('Normal');

  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  
  const [homeSearchFrom, setHomeSearchFrom] = useState('');
  const [homeSearchTo, setHomeSearchTo] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [editingRoute, setEditingRoute] = useState<{type: 'short' | 'long', city?: string, index: number} | null>(null);

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'EN';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const handleHomeSearchNavigation = () => {
    if (searchResults.length === 0) {
      alert("No direct routes found for this search. Try different keywords.");
      return;
    }

    const firstResult = searchResults[0];
    if (firstResult.type === 'Highway') {
      // Use the names the user typed if they are valid endpoints of the found route
      const typedFrom = allAvailablePlaces.find(p => p.toLowerCase() === homeSearchFrom.toLowerCase());
      const typedTo = allAvailablePlaces.find(p => p.toLowerCase() === homeSearchTo.toLowerCase());

      if (typedFrom && typedTo) {
        setLongFrom(typedFrom);
        setLongTo(typedTo);
      } else {
        setLongFrom(firstResult.from);
        setLongTo(firstResult.to);
      }
      setCurrentScreen('LONG_DISTANCE');
    } else {
      setSelectedCity(firstResult.city || null);
      setSearchQuery(`${homeSearchFrom} ${homeSearchTo}`);
      setCurrentScreen('SHORT_ROUTES');
    }
    
    // Clear home search so it doesn't clutter next return
    setHomeSearchFrom('');
    setHomeSearchTo('');
    setShowSearchResults(false);
  };

  const t = TRANSLATIONS[lang];

  // Logic for Home Search and Autocomplete
  const allAvailablePlaces = useMemo(() => {
    const places = new Set<string>();
    Object.keys(shortData).forEach(city => places.add(city));
    Object.values(shortData).forEach(routes => {
      (routes as FareRoute[]).forEach(r => {
        places.add(r.from);
        places.add(r.to);
      });
    });
    longData.forEach(r => {
      places.add(r.from);
      places.add(r.to);
    });
    return Array.from(places).sort();
  }, [shortData, longData]);

  const fromSuggestions = useMemo(() => {
    if (!homeSearchFrom || homeSearchFrom.length < 1) return [];
    const search = homeSearchFrom.toLowerCase();
    return allAvailablePlaces.filter(p => 
      p.toLowerCase().startsWith(search) && p.toLowerCase() !== search
    ).slice(0, 5);
  }, [homeSearchFrom, allAvailablePlaces]);

  const toSuggestions = useMemo(() => {
    if (!homeSearchTo || homeSearchTo.length < 1) return [];
    const search = homeSearchTo.toLowerCase();
    return allAvailablePlaces.filter(p => 
      p.toLowerCase().startsWith(search) && p.toLowerCase() !== search
    ).slice(0, 5);
  }, [homeSearchTo, allAvailablePlaces]);

  const searchResults = useMemo(() => {
    if (!homeSearchFrom && !homeSearchTo) return [];
    
    const results: (FareRoute & { type: 'Local' | 'Highway', city?: string })[] = [];
    const searchFrom = homeSearchFrom.toLowerCase();
    const searchTo = homeSearchTo.toLowerCase();
    
    // Search in Local Data
    Object.entries(shortData).forEach(([city, routes]) => {
      (routes as FareRoute[]).forEach(r => {
        const fromMatch = !searchFrom || r.from.toLowerCase().includes(searchFrom);
        const toMatch = !searchTo || r.to.toLowerCase().includes(searchTo);
        const reverseFromMatch = !searchFrom || r.to.toLowerCase().includes(searchFrom);
        const reverseToMatch = !searchTo || r.from.toLowerCase().includes(searchTo);

        if ((fromMatch && toMatch) || (reverseFromMatch && reverseToMatch)) {
          results.push({ ...r, type: 'Local', city });
        }
      });
    });
    
    // Search in Highway Data
    longData.forEach(r => {
      const fromMatch = !searchFrom || r.from.toLowerCase().includes(searchFrom);
      const toMatch = !searchTo || r.to.toLowerCase().includes(searchTo);
      const reverseFromMatch = !searchFrom || r.to.toLowerCase().includes(searchFrom);
      const reverseToMatch = !searchTo || r.from.toLowerCase().includes(searchTo);

      if ((fromMatch && toMatch) || (reverseFromMatch && reverseToMatch)) {
        results.push({ ...r, type: 'Highway' });
      }
    });
    
    return results;
  }, [homeSearchFrom, homeSearchTo, shortData, longData]);

  // Suggested Routes with Operators
  const suggestedRoutes = useMemo(() => {
    const list: (FareRoute & { type: 'Local' | 'Highway', city?: string })[] = [];
    
    Object.entries(shortData).forEach(([city, routes]) => {
      (routes as FareRoute[]).forEach(r => {
        if (r.operator) list.push({ ...r, type: 'Local', city });
      });
    });
    
    longData.forEach(r => {
      if (r.operator) list.push({ ...r, type: 'Highway' });
    });
    
    return list.slice(0, 5); // Just show top 5 suggested
  }, [shortData, longData]);

  // Logic for Short Distance filtering using state data
  const filteredRoutes = useMemo(() => {
    if (!selectedCity) return [];
    const routes = shortData[selectedCity] || [];
    if (!searchQuery) return routes;
    const queries = searchQuery.toLowerCase().split(/\s+/).filter(q => q.length > 0);
    return routes.filter(r => 
      queries.every(q => 
        r.from.toLowerCase().includes(q) || 
        r.to.toLowerCase().includes(q) ||
        (r.vehicleType && r.vehicleType.toLowerCase().includes(q)) ||
        (r.serviceType && r.serviceType.toLowerCase().includes(q))
      )
    );
  }, [selectedCity, searchQuery, shortData]);

  const longDistanceRoutes = useMemo(() => {
    if (!longFrom || !longTo) return [];
    return longData.filter(f => 
      (f.from === longFrom && f.to === longTo) || 
      (f.from === longTo && f.to === longFrom)
    );
  }, [longFrom, longTo, longData]);

  const hasMultipleOptions = longDistanceRoutes.length > 0;

  const navigateBack = () => {
    if (currentScreen === 'SHORT_ROUTES') {
      setCurrentScreen('SHORT_CITY_LIST');
    } else if (currentScreen === 'SHORT_CITY_LIST' || currentScreen === 'LONG_DISTANCE' || currentScreen === 'LOGIN') {
      setCurrentScreen('HOME');
    }
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (loginEmail === 'prabinpokhrel234@gmail.com' && loginPass === 'Prabin@234') {
      setIsAdmin(true);
      setCurrentScreen('ADMIN');
      setLoginPass('');
      setLoginEmail('');
    } else {
      alert("Invalid credentials or unauthorized access.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentScreen('HOME');
  };

  // Admin Actions
  const addCity = () => {
    if (!newCityName || shortData[newCityName]) return;
    setShortData(prev => ({ ...prev, [newCityName]: [] }));
    if (!newShortCity) setNewShortCity(newCityName);
    setNewCityName('');
  };

  const deleteCity = (city: string) => {
    setShortData(prev => {
      const newData = { ...prev };
      delete newData[city];
      return newData;
    });
    // Clear dependent states
    if (newShortCity === city) setNewShortCity('');
    if (newLongFrom === city) setNewLongFrom('');
    if (newLongTo === city) setNewLongTo('');
  };

  const addShortRoute = () => {
    const targetCity = newShortCity || Object.keys(shortData)[0];
    if (!targetCity || !newShortFrom || !newShortTo || !newShortFare) return;
    const newRoute: FareRoute = {
      from: newShortFrom,
      to: newShortTo,
      fare: parseInt(newShortFare),
      operator: newShortOperator,
      vehicleType: newShortVehicleType,
      serviceType: newShortServiceType
    };
    setShortData(prev => ({
      ...prev,
      [targetCity]: [...(prev[targetCity] || []), newRoute]
    }));
    setNewShortFrom('');
    setNewShortTo('');
    setNewShortFare('');
    setNewShortOperator('');
    setNewShortVehicleType('');
    setNewShortServiceType('Normal');
  };

  const deleteShortRoute = (city: string, index: number) => {
    setShortData(prev => ({
      ...prev,
      [city]: prev[city].filter((_, i) => i !== index)
    }));
  };

  const addLongRoute = () => {
    if (!newLongFrom || !newLongTo || !newLongFare) return;
    setLongData(prev => [...prev, { 
      from: newLongFrom, 
      to: newLongTo, 
      fare: parseInt(newLongFare), 
      operator: newLongOperator,
      vehicleType: newLongVehicleType,
      serviceType: newLongServiceType
    }]);
    setNewLongFrom('');
    setNewLongTo('');
    setNewLongFare('');
    setNewLongOperator('');
    setNewLongVehicleType('');
    setNewLongServiceType('Normal');
  };

  const deleteLongRoute = (index: number) => {
    setLongData(prev => prev.filter((_, i) => i !== index));
  };

  const addUpdate = () => {
    if (!newUpdateTitle || !newUpdateContent) return;
    const newUpdate: TravelUpdate = {
      id: `upd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newUpdateTitle,
      content: newUpdateContent,
      timestamp: Date.now()
    };
    setUpdates(prev => [newUpdate, ...prev]);
    setNewUpdateTitle('');
    setNewUpdateContent('');
    alert("Update posted successfully!");
  };

  const deleteUpdate = (id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id));
    alert("Update deleted!");
  };

  const handleCsvUpload = (type: 'short' | 'long', file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        if (type === 'short') {
          const newShort: Record<string, FareRoute[]> = {};
          data.forEach(row => {
            const city = row.city;
            const from = row.from;
            const to = row.to;
            const fare = parseInt(row.fare);
            const operator = row.operator;
            const vehicleType = row.vehicleType;
            const serviceType = row.serviceType as any;
            
            if (city && from && to && !isNaN(fare)) {
              if (!newShort[city]) newShort[city] = [];
              newShort[city].push({ from, to, fare, operator, vehicleType, serviceType });
            }
          });
          if (Object.keys(newShort).length > 0) {
            setShortData(newShort);
            alert("Local routes updated successfully from CSV!");
          }
        } else {
          const newLong: LongDistanceFare[] = [];
          data.forEach(row => {
            const from = row.from;
            const to = row.to;
            const fare = parseInt(row.fare);
            const operator = row.operator;
            const vehicleType = row.vehicleType;
            const serviceType = row.serviceType as any;
            
            if (from && to && !isNaN(fare)) {
              newLong.push({ from, to, fare, operator, vehicleType, serviceType });
            }
          });
          if (newLong.length > 0) {
            setLongData(newLong);
            alert("Highway routes updated successfully from CSV!");
          }
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        alert("Failed to parse CSV file. Please check the format.");
      }
    });
  };

  const resetToDefaults = () => {
    if (window.confirm("This will erase all changes and restore original factory data. Continue?")) {
      setShortData(INITIAL_SHORT_DATA);
      setLongData(INITIAL_LONG_DATA);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'EN' ? 'NP' : 'EN');
  };

  const LanguageSelector = () => (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-natural-border rounded-full text-xs font-bold text-natural-primary shadow-sm hover:bg-natural-sidebar transition-all"
    >
      <Languages className="w-3.5 h-3.5" />
      <span>{lang === 'EN' ? 'NP' : 'EN'}</span>
    </button>
  );

  return (
    <div className="h-screen bg-natural-bg text-natural-text font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col border-x border-natural-border">
      {/* Top Header */}
      <header className="bg-white border-b border-natural-border px-6 py-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-natural-primary rounded-lg flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-natural-primary font-serif tracking-tight">Bhada Saathi</h1>
        </div>
        <LanguageSelector />
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {/* --- HOME SCREEN --- */}
          {currentScreen === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-8 flex flex-col overflow-y-auto"
            >
              <div className="grid gap-4 mt-4">
                {/* Search / Find Transport Section */}
                <div className="bg-white p-6 rounded-3xl card-shadow border border-natural-border space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-natural-primary" />
                    <h2 className="text-lg font-bold text-natural-primary font-serif">Find Transport</h2>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-12 -translate-y-1/2 w-0.5 h-12 bg-natural-badge z-0" />
                    <div className="space-y-4 relative z-10">
                      <div className="relative">
                        <div className="flex items-center gap-3 bg-natural-bg p-3 rounded-2xl border border-natural-border shadow-sm">
                          <MapPin className="w-4 h-4 text-natural-accent" />
                          <input 
                            placeholder="From (Origin)" 
                            value={homeSearchFrom}
                            onChange={(e) => {
                              setHomeSearchFrom(e.target.value);
                              setShowSearchResults(true);
                            }}
                            className="flex-1 bg-transparent text-sm outline-none font-medium"
                          />
                        </div>
                        {fromSuggestions.length > 0 && showSearchResults && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-natural-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-natural-bg">
                            {fromSuggestions.map(p => (
                              <button 
                                key={p} 
                                onClick={() => {
                                  setHomeSearchFrom(p);
                                  // Keep results open for destination
                                }}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-natural-primary hover:bg-natural-sidebar transition-colors flex items-center gap-2"
                              >
                                <Navigation className="w-3 h-3 text-gray-300" />
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="flex items-center gap-3 bg-natural-bg p-3 rounded-2xl border border-natural-border shadow-sm">
                          <Navigation className="w-4 h-4 text-natural-primary" />
                          <input 
                            placeholder="To (Destination)" 
                            value={homeSearchTo}
                            onChange={(e) => {
                              setHomeSearchTo(e.target.value);
                              setShowSearchResults(true);
                            }}
                            className="flex-1 bg-transparent text-sm outline-none font-medium"
                          />
                        </div>
                        {toSuggestions.length > 0 && showSearchResults && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-natural-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-natural-bg">
                            {toSuggestions.map(p => (
                              <button 
                                key={p} 
                                onClick={() => {
                                  setHomeSearchTo(p);
                                }}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-natural-primary hover:bg-natural-sidebar transition-colors flex items-center gap-2"
                              >
                                <MapPin className="w-3 h-3 text-gray-300" />
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleHomeSearchNavigation}
                      disabled={!homeSearchFrom || !homeSearchTo}
                      className="w-full py-4 bg-natural-primary text-white font-bold rounded-2xl shadow-lg shadow-natural-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:grayscale"
                    >
                      <Search className="w-4 h-4" />
                      Search Transport
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentScreen('SHORT_CITY_LIST')}
                  className="group bg-white p-5 rounded-2xl card-shadow border border-natural-border text-left transition-all hover:bg-natural-sidebar"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-natural-badge rounded-xl">
                      <MapPin className="w-5 h-5 text-natural-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-natural-primary">{t.shortDistance}</h3>
                      <p className="text-xs text-gray-500">{t.shortDesc}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentScreen('LONG_DISTANCE')}
                  className="group bg-white p-5 rounded-2xl card-shadow border border-natural-border text-left transition-all hover:bg-natural-sidebar"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F1EFE7] rounded-xl">
                      <ArrowRightLeft className="w-5 h-5 text-natural-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-natural-primary">{t.longDistance}</h3>
                      <p className="text-xs text-gray-500">{t.longDesc}</p>
                    </div>
                  </div>
                </button>
              </div>


              {/* Travel Updates Section */}
              <section className="mt-10 mb-20">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-natural-accent" />
                    <h2 className="text-lg font-bold text-natural-primary font-serif">Travel Updates</h2>
                  </div>
                  {updates.length > 4 && (
                    <button 
                      onClick={() => setCurrentScreen('ALL_UPDATES')}
                      className="text-xs font-bold text-natural-accent uppercase tracking-widest border-b border-natural-accent/30 pb-0.5"
                    >
                      See All
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {updates.length === 0 ? (
                    <div className="bg-white/50 p-6 rounded-2xl border border-dashed border-natural-border text-center">
                      <p className="text-xs text-gray-400 font-medium italic">No recent travel updates.</p>
                    </div>
                  ) : (
                    updates.slice(0, 4).map(update => (
                      <div key={update.id} className="bg-white p-5 rounded-2xl border border-natural-border card-shadow flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-natural-primary text-sm">{update.title}</h3>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(update.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                          {update.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <div className="mt-auto py-6 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 bg-natural-sidebar inline-flex px-4 py-1 rounded-full mx-auto">
                  <Calendar className="w-3 h-3" />
                  {t.lastUpdated}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- ALL UPDATES SCREEN --- */}
          {currentScreen === 'ALL_UPDATES' && (
            <motion.div
              key="all_updates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setCurrentScreen('HOME')} className="p-2 -ml-2 hover:bg-natural-sidebar rounded-full transition-all">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-2xl font-bold tracking-tight text-natural-primary font-serif">All Travel Updates</h2>
              </div>

              <div className="space-y-4 pb-20">
                {updates.map(update => (
                  <div key={update.id} className="bg-white p-6 rounded-2xl border border-natural-border card-shadow flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-natural-primary">{update.title}</h3>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 py-1 bg-natural-bg rounded-lg border border-natural-border">
                        {new Date(update.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {update.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- MAP SCREEN --- */}
          {currentScreen === 'MAP' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 flex flex-col bg-natural-bg overflow-hidden"
            >
              <div className="p-6 bg-white border-b border-natural-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-natural-primary font-serif">Transit Map</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Location & Routes</p>
                </div>
                <button 
                  onClick={() => setIsLocating(true)}
                  disabled={isLocating}
                  className="p-3 bg-natural-primary text-white rounded-2xl shadow-lg shadow-natural-primary/20 active:scale-90 transition-all disabled:opacity-50"
                  title="My Location"
                >
                  <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                </button>
              </div>

              <div className="flex-1 relative bg-gray-100">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/search?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${userLocation ? `${userLocation.lat},${userLocation.lng}` : 'Bus+Station+Nepal'}&zoom=${userLocation ? 15 : 12}`}
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  title="Google Map"
                />
                
                {!userLocation && !isLocating && (
                  <div className="absolute inset-x-4 bottom-24 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-natural-border shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-natural-badge rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Compass className="w-5 h-5 text-natural-primary animate-spin-[3s_linear_infinite]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-natural-primary">Location Access</p>
                      <p className="text-[10px] text-gray-500">Enable location to find nearest bus stops and rates.</p>
                    </div>
                    <button 
                      onClick={() => setIsLocating(true)}
                      className="px-4 py-2 bg-natural-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                    >
                      Enable
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- INFO SCREEN --- */}
          {currentScreen === 'INFO' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 p-6 overflow-y-auto pb-24"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-natural-sidebar rounded-3xl flex items-center justify-center mx-auto mb-4 border border-natural-border shadow-sm">
                  <Info className="w-8 h-8 text-natural-accent" />
                </div>
                <h2 className="text-2xl font-bold text-natural-primary font-serif">Information Center</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Version 2.4.0 • Updated Weekly</p>
              </div>
              
              <div className="space-y-8">
                {/* About Us */}
                <section>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Users className="w-4 h-4 text-natural-accent" />
                    <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest">About Us</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-natural-border card-shadow">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We are dedicated to providing the most accurate and up-to-date transportation fare information for Nepal. Our mission is to ensure transparency in travel costs and empower passengers with real-time updates.
                    </p>
                  </div>
                </section>

                {/* Feedback */}
                <section>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <MessageCircle className="w-4 h-4 text-natural-accent" />
                    <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest">Give Feedback</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-natural-border card-shadow space-y-4">
                    <p className="text-sm text-gray-600">Found an incorrect fare? Have a suggestion? We'd love to hear from you.</p>
                    <a 
                      href="mailto:support@farecalculator.np"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-natural-bg border border-natural-border rounded-2xl text-natural-primary font-bold hover:bg-natural-sidebar transition-all"
                    >
                      <Mail className="w-5 h-5" />
                      Email Feedback
                    </a>
                  </div>
                </section>

                {/* Useful Contacts/Links */}
                <section>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <ExternalLink className="w-4 h-4 text-natural-accent" />
                    <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest">Useful Sections</h3>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { label: 'Traffic Police Hotline', value: '103', icon: Phone },
                      { label: 'DoTM Official Portal', value: 'dotm.gov.np', icon: ExternalLink },
                      { label: 'Emergency Help', value: '100', icon: Bell }
                    ].map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-natural-border rounded-2xl card-shadow">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-natural-bg rounded-lg">
                            <link.icon className="w-4 h-4 text-natural-accent" />
                          </div>
                          <span className="text-sm font-bold text-natural-primary">{link.label}</span>
                        </div>
                        <span className="text-xs font-bold text-natural-accent bg-natural-sidebar px-3 py-1 rounded-full">{link.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Admin Access Section */}
                <section className="pt-6 border-t border-natural-border">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Lock className="w-4 h-4 text-natural-accent" />
                    <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest">Admin Dashboard</h3>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-natural-border card-shadow flex flex-col gap-4">
                    <p className="text-xs text-gray-500 italic">Secure data management for fares, cities, and notifications. Authorized personnel only.</p>
                    {isAdmin ? (
                      <button 
                        onClick={() => setCurrentScreen('ADMIN')}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-natural-primary text-white font-bold rounded-2xl shadow-lg shadow-natural-primary/20 active:scale-95 transition-all"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Enter Dashboard
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrentScreen('LOGIN')}
                        className="flex items-center justify-center gap-3 w-full py-4 border-2 border-natural-primary text-natural-primary font-bold rounded-2xl hover:bg-natural-sidebar active:scale-95 transition-all"
                      >
                        <Lock className="w-5 h-5" />
                        Admin Portal Login
                      </button>
                    )}
                  </div>
                </section>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Crafted for Himalayan Travelers</p>
                </div>
              </div>
            </motion.div>
          )}

        {/* --- LOGIN SCREEN --- */}
        {currentScreen === 'LOGIN' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 p-8 flex flex-col justify-center bg-white"
          >
            <button onClick={() => setCurrentScreen('HOME')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-natural-sidebar rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-natural-primary" />
              </div>
              <h2 className="text-2xl font-bold text-natural-primary font-serif">Admin Access</h2>
              <p className="text-gray-400 text-sm">Secure data management portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-natural-accent pl-1">Email Address</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-4 bg-natural-bg border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-natural-primary/20"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-natural-accent pl-1">Password</label>
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full p-4 bg-natural-bg border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-natural-primary/20"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-natural-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-natural-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Enter Dashboard
              </button>
            </form>
          </motion.div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {currentScreen === 'ADMIN' && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 bg-natural-bg flex flex-col h-full overflow-hidden"
          >
            <div className="bg-white px-6 py-6 border-b border-natural-border flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-natural-primary rounded-xl flex items-center justify-center text-white">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-natural-primary font-serif">Admin Panel</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Management Suite</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Sub-navigation */}
            <div className="bg-white border-b border-natural-border flex overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
                { id: 'UPDATES', label: 'Updates', icon: Bell },
                { id: 'LOCAL', label: 'Local', icon: MapPin },
                { id: 'HIGHWAY', label: 'Highway', icon: ArrowRightLeft },
                { id: 'TOOLS', label: 'Tools', icon: RefreshCw },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                    adminTab === tab.id 
                      ? 'border-natural-primary text-natural-primary bg-natural-sidebar/50' 
                      : 'border-transparent text-gray-400 hover:text-natural-accent hover:bg-natural-bg'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-24">
              {/* --- OVERVIEW TAB --- */}
              {adminTab === 'OVERVIEW' && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-natural-border card-shadow flex flex-col justify-between h-32">
                      <div className="flex items-center gap-2 text-natural-accent">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Routes</span>
                      </div>
                      <p className="text-3xl font-bold text-natural-primary">
                        {(Object.values(shortData) as FareRoute[][]).reduce((acc, curr) => acc + curr.length, 0) + longData.length}
                      </p>
                    </div>
                    <div className="bg-natural-badge p-5 rounded-3xl border border-natural-border card-shadow flex flex-col justify-between h-32">
                      <div className="flex items-center gap-2 text-natural-primary">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Cities</span>
                      </div>
                      <p className="text-3xl font-bold text-natural-primary">{Object.keys(shortData).length}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow">
                    <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="grid gap-3">
                      <button onClick={() => setAdminTab('UPDATES')} className="flex items-center justify-between p-4 bg-natural-bg rounded-2xl hover:bg-natural-sidebar transition-all group">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-natural-accent" />
                          <span className="text-xs font-bold text-natural-primary">Post new update</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-natural-primary" />
                      </button>
                      <button onClick={() => setAdminTab('LOCAL')} className="flex items-center justify-between p-4 bg-natural-bg rounded-2xl hover:bg-natural-sidebar transition-all group">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-natural-accent" />
                          <span className="text-xs font-bold text-natural-primary">Manage local areas</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-natural-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- UPDATES TAB --- */}
              {adminTab === 'UPDATES' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5 text-natural-primary" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Broadcast Update</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <input 
                        placeholder="Update Title (e.g. Weather Alert)" 
                        value={newUpdateTitle}
                        onChange={(e) => setNewUpdateTitle(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none focus:border-natural-primary"
                      />
                      <textarea 
                        placeholder="Describe the update... (e.g. Roads are closed due to rain)" 
                        value={newUpdateContent}
                        onChange={(e) => setNewUpdateContent(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none focus:border-natural-primary resize-none"
                      />
                      <button 
                        onClick={addUpdate}
                        className="w-full py-4 bg-black text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                      >
                        <Plus className="w-4 h-4" />
                        Post Now
                      </button>
                    </div>
                  </section>

                  {updates.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-sm font-bold text-natural-primary uppercase tracking-widest">Active Notifications</h3>
                      </div>
                      <div className="space-y-3">
                        {updates.map(u => (
                          <div key={u.id} className="bg-white p-4 rounded-2xl border border-natural-border flex items-start justify-between gap-3 group card-shadow">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-natural-primary">{u.title}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{u.content}</p>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUpdate(u.id);
                              }} 
                              className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100 flex items-center gap-2 flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* --- LOCAL TAB --- */}
              {adminTab === 'LOCAL' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-natural-primary" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Local Cities</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <div className="flex gap-2">
                        <input 
                          placeholder="City Name" 
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          className="flex-1 p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none focus:border-natural-primary"
                        />
                        <button 
                          onClick={addCity}
                          className="px-5 bg-natural-primary text-white font-bold rounded-xl active:scale-95 transition-transform"
                        >
                          Add
                        </button>
                      </div>
                      {Object.keys(shortData).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {Object.keys(shortData).map(city => (
                            <div key={city} className="flex items-center gap-2 bg-natural-sidebar px-3 py-2 rounded-xl border border-natural-border">
                              <span className="text-xs font-bold text-natural-primary">{city}</span>
                              <button 
                                onClick={() => deleteCity(city)} 
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Local Routes</h2>
                      <button 
                        onClick={() => {
                          const modal = document.getElementById('add-route-modal');
                          if (modal) modal.classList.toggle('hidden');
                        }}
                        className="p-2 bg-natural-primary text-white rounded-lg active:scale-95 transition-all shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div id="add-route-modal" className="hidden bg-white p-6 rounded-3xl border border-natural-border card-shadow mb-6 space-y-4">
                      <select 
                        value={newShortCity}
                        onChange={(e) => setNewShortCity(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Select City</option>
                        {Object.keys(shortData).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="From" 
                          value={newShortFrom}
                          onChange={(e) => setNewShortFrom(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                        />
                        <input 
                          placeholder="To" 
                          value={newShortTo}
                          onChange={(e) => setNewShortTo(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Fare (Rs.)" 
                          type="number"
                          value={newShortFare}
                          onChange={(e) => setNewShortFare(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                        />
                        <input 
                          placeholder="Transport (e.g. Sajha)" 
                          value={newShortOperator}
                          onChange={(e) => setNewShortOperator(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                        />
                      </div>
                      <input 
                        placeholder="Vehicle Type (e.g. Bus, EV, Sumo, Hiace)" 
                        value={newShortVehicleType}
                        onChange={(e) => setNewShortVehicleType(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <div className="flex gap-2">
                        {(['Normal', 'Delux', 'AC'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewShortServiceType(type)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                              newShortServiceType === type 
                                ? 'bg-natural-primary text-white border-natural-primary' 
                                : 'bg-white text-gray-500 border-natural-border hover:bg-natural-sidebar'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={addShortRoute}
                        disabled={!newShortCity}
                        className="w-full py-4 bg-natural-primary text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                      >
                        Add Local Route
                      </button>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(shortData).map(([city, routes]) => (
                        <div key={city} className="space-y-3">
                          <h3 className="text-[10px] font-black text-natural-accent uppercase tracking-widest pl-2">{city}</h3>
                          <div className="grid gap-2">
                            {(routes as FareRoute[]).map((route, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border border-natural-border flex items-center justify-between group">
                                <div className="text-xs font-medium text-natural-text">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold">{route.from} ➔ {route.to}</span>
                                    <span className="text-natural-primary font-bold">Rs. {route.fare}</span>
                                  </div>
                                  {route.operator && (
                                    <div className="text-[10px] text-natural-accent mt-1 flex items-center gap-1">
                                      <Bus className="w-3 h-3" />
                                      {route.operator}
                                    </div>
                                  )}
                                  {route.vehicleType && (
                                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-bold">
                                      Type: {route.vehicleType}
                                    </div>
                                  )}
                                  {route.serviceType && (
                                    <div className="text-[10px] font-black text-natural-accent mt-0.5 uppercase tracking-tighter">
                                      Service: {route.serviceType}
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => deleteShortRoute(city, idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* --- HIGHWAY TAB --- */}
              {adminTab === 'HIGHWAY' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowRightLeft className="w-5 h-5 text-natural-accent" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Add High-Way Route</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <select 
                          value={newLongFrom}
                          onChange={(e) => setNewLongFrom(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        >
                          <option value="">Origin</option>
                          {Object.keys(shortData).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                          value={newLongTo}
                          onChange={(e) => setNewLongTo(e.target.value)}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        >
                          <option value="">Destination</option>
                          {Object.keys(shortData).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <input 
                        placeholder="Inter-city Fare (Rs.)" 
                        type="number"
                        value={newLongFare}
                        onChange={(e) => setNewLongFare(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <input 
                        placeholder="Transport Pvt. (e.g. Blue Sky Yatayat)" 
                        value={newLongOperator}
                        onChange={(e) => setNewLongOperator(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <input 
                        placeholder="Vehicle Type (Sumo, EV, Bus, etc.)" 
                        value={newLongVehicleType}
                        onChange={(e) => setNewLongVehicleType(e.target.value)}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <div className="flex gap-2">
                        {(['Normal', 'Delux', 'AC'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewLongServiceType(type)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                              newLongServiceType === type 
                                ? 'bg-natural-accent text-white border-natural-accent' 
                                : 'bg-white text-gray-400 border-natural-border hover:bg-natural-bg'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={addLongRoute}
                        className="w-full py-4 bg-natural-accent text-white font-bold rounded-xl active:scale-95 transition-transform"
                      >
                        Save Highway Route
                      </button>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-sm font-bold text-natural-primary uppercase tracking-widest mb-4">Registered Routes</h2>
                    <div className="grid gap-3">
                      {longData.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-10">No highway routes added.</p>
                      ) : (
                        longData.map((route, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-natural-border flex items-center justify-between group">
                            <div className="text-xs font-medium text-natural-text">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{route.from} ➔ {route.to}</span>
                                <span className="text-natural-accent font-bold">Rs. {route.fare}</span>
                              </div>
                              {route.operator && (
                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-bold italic">
                                  Suggested: {route.operator}
                                </div>
                              )}
                              {route.vehicleType && (
                                <div className="text-[10px] text-natural-accent mt-0.5 flex items-center gap-1 font-black uppercase tracking-tighter">
                                  Vehicle: {route.vehicleType}
                                </div>
                              )}
                              {route.serviceType && (
                                <div className="text-[10px] font-black text-natural-primary mt-1 uppercase tracking-tighter">
                                  Service: {route.serviceType}
                                </div>
                              )}
                            </div>
                            <button onClick={() => deleteLongRoute(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* --- TOOLS TAB --- */}
              {adminTab === 'TOOLS' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Bulk Operations</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-natural-primary text-sm mb-1">Upload Local CSV</h3>
                        <p className="text-[10px] text-gray-400 mb-4 px-4 uppercase tracking-tighter">Cols: city, from, to, fare, operator, vehicleType, serviceType</p>
                        <input 
                          type="file" 
                          ref={fileInputRefShort} 
                          className="hidden" 
                          accept=".csv"
                          onChange={(e) => e.target.files?.[0] && handleCsvUpload('short', e.target.files[0])}
                        />
                        <button 
                          onClick={() => fileInputRefShort.current?.click()}
                          className="w-full py-4 bg-green-600 text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                        >
                          Select CSV File
                        </button>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-natural-primary text-sm mb-1">Upload Highway CSV</h3>
                        <p className="text-[10px] text-gray-400 mb-4 px-4 uppercase tracking-tighter">Cols: from, to, fare, operator, vehicleType, serviceType</p>
                        <input 
                          type="file" 
                          ref={fileInputRefLong} 
                          className="hidden" 
                          accept=".csv"
                          onChange={(e) => e.target.files?.[0] && handleCsvUpload('long', e.target.files[0])}
                        />
                        <button 
                          onClick={() => fileInputRefLong.current?.click()}
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                        >
                          Select CSV File
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="pt-6 border-t border-natural-border">
                    <button 
                      onClick={resetToDefaults}
                      className="w-full py-4 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shadow-red-100"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Wipe & Restore Defaults
                    </button>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        )}


        {/* --- SHORT DISTANCE: CITY LIST --- */}
        {currentScreen === 'SHORT_CITY_LIST' && (
          <motion.div 
            key="city-list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-natural-bg overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md px-6 py-6 flex items-center gap-4 border-b border-natural-border mb-6">
              <button 
                onClick={navigateBack}
                className="p-2 hover:bg-natural-sidebar rounded-full transition-colors border border-transparent hover:border-natural-border"
                id="back-button"
              >
                <ChevronLeft className="w-6 h-6 text-natural-primary" />
              </button>
              <h1 className="text-2xl font-bold text-natural-primary font-serif">{t.selectCity}</h1>
            </div>
            
            <div className="px-6 pb-24">
              <p className="text-gray-500 text-sm mb-6 font-medium">{t.chooseCityDesc}</p>
              <div className="grid gap-4">
                {Object.keys(shortData).length === 0 ? (
                  <div className="bg-white p-10 rounded-[2rem] border border-dashed border-natural-border text-center">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-medium">No cities added yet.</p>
                  </div>
                ) : (
                  Object.keys(shortData).map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCurrentScreen('SHORT_ROUTES');
                      }}
                      className="flex items-center justify-between p-5 bg-white rounded-2xl border border-natural-border card-shadow hover:border-natural-primary hover:bg-natural-sidebar/30 transition-all text-left group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-natural-primary">{city}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{shortData[city].length} Routes</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-natural-border group-hover:text-natural-primary transition-all" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SHORT DISTANCE: ROUTES --- */}
        {currentScreen === 'SHORT_ROUTES' && (
          <motion.div 
            key="routes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full bg-natural-bg"
          >
            <div className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md px-6 py-6 flex items-center gap-4 border-b border-natural-border mb-6">
              <button 
                onClick={navigateBack}
                className="p-2 hover:bg-natural-sidebar rounded-full transition-colors border border-transparent hover:border-natural-border"
              >
                <ChevronLeft className="w-6 h-6 text-natural-primary" />
              </button>
              <h1 className="text-2xl font-bold text-natural-primary font-serif">{selectedCity}</h1>
            </div>
            
            <div className="px-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder={t.searchRoutes}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-natural-border rounded-2xl text-sm focus:ring-2 focus:ring-natural-primary/20 focus:border-natural-primary outline-none card-shadow transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
              {filteredRoutes.length > 0 ? (
                <div className="grid gap-4">
                  {filteredRoutes.map((route, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${route.from}-${route.to}-${idx}`}
                      className="p-5 bg-white rounded-2xl border border-natural-border card-shadow flex items-center justify-between group"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-natural-text">{route.from}</span>
                          <ArrowRight className="w-3 h-3 text-natural-accent" />
                          <span className="text-sm font-bold text-natural-text">{route.to}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-natural-badge px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-natural-primary">{t.localRate}</span>
                          {route.operator && (
                            <span className="text-[10px] text-natural-accent font-bold italic">🚌 {route.operator}</span>
                          )}
                          {route.vehicleType && (
                            <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-black uppercase tracking-tighter">
                              {route.vehicleType}
                            </span>
                          )}
                          {route.serviceType && (
                            <span className="text-[9px] px-2 py-0.5 bg-natural-sidebar text-natural-primary rounded font-black uppercase tracking-tighter border border-natural-border">
                              {route.serviceType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-natural-primary">{t.rs} {route.fare}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="bg-natural-sidebar w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-natural-border">
                    <Search className="w-8 h-8 text-natural-accent opacity-30" />
                  </div>
                  <h3 className="text-natural-primary font-bold text-xl mb-2 font-serif">{t.routeNotFound}</h3>
                  <p className="text-gray-500 text-sm max-w-[200px] mx-auto">{t.routeNotFoundDesc}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- LONG DISTANCE SCREEN --- */}
        {currentScreen === 'LONG_DISTANCE' && (
          <motion.div 
            key="long-distance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-natural-bg overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md px-6 py-6 flex items-center gap-4 border-b border-natural-border mb-8">
              <button 
                onClick={navigateBack}
                className="p-2 hover:bg-natural-sidebar rounded-full transition-colors border border-transparent hover:border-natural-border"
              >
                <ChevronLeft className="w-6 h-6 text-natural-primary" />
              </button>
              <h1 className="text-2xl font-bold text-natural-primary font-serif">{t.travelCalculator}</h1>
            </div>

            <div className="px-8 pb-24">
              <div className="space-y-6 mb-12 relative">
                <div className="relative">
                  <label className="absolute left-5 top-3 text-[10px] uppercase font-black text-natural-accent tracking-[0.2em]">{t.departureCity}</label>
                  <select 
                    value={longFrom}
                    onChange={(e) => setLongFrom(e.target.value)}
                    className="w-full pt-8 pb-4 px-5 bg-white border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-natural-primary/20 focus:border-natural-primary transition-all appearance-none cursor-pointer card-shadow font-bold text-natural-primary"
                  >
                    <option value="">{t.chooseOrigin}</option>
                    {Object.keys(shortData).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                  <div className="bg-natural-primary p-3 rounded-2xl border-4 border-natural-bg shadow-lg text-white">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute left-5 top-3 text-[10px] uppercase font-black text-natural-accent tracking-[0.2em]">{t.destination}</label>
                  <select 
                    value={longTo}
                    onChange={(e) => setLongTo(e.target.value)}
                    className="w-full pt-8 pb-4 px-5 bg-white border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-natural-primary/20 focus:border-natural-primary transition-all appearance-none cursor-pointer card-shadow font-bold text-natural-primary"
                  >
                    <option value="">{t.chooseDestination}</option>
                    {Object.keys(shortData).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {longFrom && longTo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-natural-primary rounded-[2.5rem] p-10 text-center shadow-xl shadow-natural-primary/30 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                    <Bus className="w-32 h-32 text-white" />
                  </div>
                  
                  {longDistanceRoutes.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-natural-badge/70 text-[10px] font-black uppercase tracking-[0.25em]">Comparison Grid</p>
                        <span className="text-[9px] font-black text-white px-2 py-0.5 bg-white/10 rounded-lg uppercase">All Rates NPR</span>
                      </div>
                      
                      <div className="grid gap-3">
                        {longDistanceRoutes.map((route, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-black/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative group border border-transparent hover:border-natural-badge transition-all"
                          >
                            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-natural-sidebar text-natural-primary text-[8px] font-black rounded-md uppercase tracking-widest border border-natural-border">Official</span>
                                {route.vehicleType && (
                                  <span className="px-2 py-0.5 bg-natural-accent/10 text-natural-accent text-[8px] font-black rounded-md uppercase tracking-widest border border-natural-accent/20">
                                    {route.vehicleType}
                                  </span>
                                )}
                                {route.serviceType && (
                                  <span className="px-2 py-0.5 bg-natural-primary text-white text-[8px] font-black rounded-md uppercase tracking-widest">
                                    {route.serviceType}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-1">
                                {route.operator ? (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Partner Transport</span>
                                    <h4 className="text-xl font-bold text-natural-primary flex items-center gap-2">
                                      <Bus className="w-5 h-5 text-natural-accent" />
                                      {route.operator}
                                    </h4>
                                  </div>
                                ) : (
                                  <h4 className="text-lg font-bold text-gray-300 italic">Standard Service</h4>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-end sm:min-w-[120px]">
                              <div className="text-4xl font-bold text-natural-primary flex items-baseline font-serif">
                                <span className="text-lg font-bold mr-1 opacity-40">Rs.</span>
                                {route.fare}
                              </div>
                              <button className="mt-2 text-[9px] font-black text-natural-accent uppercase tracking-widest hover:underline">View Schedule</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl flex items-center gap-3 justify-center text-xs text-natural-badge font-medium border border-white/10 mt-4">
                        <Info className="w-4 h-4" />
                        <span>{t.fareNote}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6">
                      <h3 className="text-white font-bold text-xl mb-2 font-serif">{t.routeNotListed}</h3>
                      <p className="text-natural-badge/60 text-sm">{t.routeNotListedDesc}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

      {/* Persistent Bottom Navigation */}
      <nav className="shrink-0 bg-white border-t border-natural-border px-2 py-3 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-20">
        {[
          { id: 'HOME', icon: Home, label: 'Home' },
          { id: 'SHORT_CITY_LIST', icon: MapPin, label: 'Local', activeScreens: ['SHORT_CITY_LIST', 'SHORT_ROUTES'] },
          { id: 'LONG_DISTANCE', icon: ArrowRightLeft, label: 'Highway' },
          { id: 'MAP', icon: MapIcon, label: 'Maps' },
          { id: 'INFO', icon: Info, label: 'Info', activeScreens: ['INFO', 'LOGIN', 'ADMIN'] }
        ].map((tab) => {
          const isActive = tab.activeScreens 
            ? (tab.activeScreens as string[]).includes(currentScreen)
            : currentScreen === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id as Screen)}
              className="relative flex flex-col items-center justify-center group flex-1"
            >
              <div className="relative p-2 rounded-xl transition-all duration-300">
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-natural-sidebar rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-natural-primary' : 'text-gray-300 group-hover:text-natural-accent'}`} />
              </div>
              <span className={`text-[9px] font-bold mt-1 uppercase tracking-tighter transition-all ${isActive ? 'text-natural-primary opacity-100' : 'text-gray-400 opacity-60'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -bottom-3 w-1.5 h-1.5 bg-natural-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

