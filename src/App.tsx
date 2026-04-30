/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Check,
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
  Navigation,
  ChevronRight,
  Fingerprint,
  Heart,
  ShieldCheck,
  Bug,
  Share2,
  Star,
  Facebook,
  RotateCcw
} from 'lucide-react';
import INITIAL_ROUTES from './data/fareRoutes.json';
import INITIAL_LOCAL_ROUTES from './data/localRoutes.json';
import INITIAL_UPDATES from './data/updates.json';
import { TRANSLATIONS, Language } from './i18n';
import { FareRoute, LocalRoute, AppRoute } from './types';
import founderImg from './founder.jpg';

type Screen = 'HOME' | 'LONG_DISTANCE' | 'LOCAL_DISTANCE' | 'LOGIN' | 'ADMIN' | 'INFO' | 'ALL_UPDATES' | 'MAP';
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
  const [localFrom, setLocalFrom] = useState<string>('');
  const [localTo, setLocalTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [routes, setRoutes] = useState<FareRoute[]>(INITIAL_ROUTES as FareRoute[]);
  const [localRoutes, setLocalRoutes] = useState<LocalRoute[]>(INITIAL_LOCAL_ROUTES as LocalRoute[]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [updates, setUpdates] = useState<TravelUpdate[]>(INITIAL_UPDATES as TravelUpdate[]);

  // Fetch routes and updates from server on mount
  useEffect(() => {
    console.log("App: Fetching data from server...");
    
    // Fetch Routes
    fetch('api/routes')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error("Oops, we haven't got JSON!");
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`App: Successfully loaded ${data.length} highway routes from server.`);
          setRoutes(data);
          setJsonText(JSON.stringify(data, null, 2));
          setDataLoaded(true);
        }
      })
      .catch(err => {
        console.warn("App: Falling back to local highway routes:", err);
        setDataLoaded(true);
      });

    // Fetch Local Routes
    fetch('api/local-routes')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error("Oops, we haven't got JSON!");
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`App: Successfully loaded ${data.length} local routes from server.`);
          setLocalRoutes(data);
        }
      })
      .catch(err => console.warn("App: Local routes API failed, using empty or local bundle."));

    // Fetch Updates
    fetch('api/updates')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error("Oops, we haven't got JSON!");
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`App: Successfully loaded ${data.length} updates from server.`);
          setUpdates(data);
        }
      })
      .catch(err => console.warn("App: Updates failed to fetch (expected on static host)."));
  }, []);

  const saveRoutesToServer = async (newRoutes: FareRoute[]) => {
    if (!dataLoaded) return;
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      const response = await fetch('api/save-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoutes)
      });
      if (!response.ok) throw new Error("Failed to save highway routes");
      setSaveStatus('Success!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.warn("App: Error saving highway routes (expected on static host):", err);
      setSaveStatus('Offline Mode');
      setTimeout(() => setSaveStatus(null), 1000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveLocalRoutesToServer = async (newRoutes: LocalRoute[]) => {
    if (!dataLoaded) return;
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      const response = await fetch('api/save-local-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoutes)
      });
      if (!response.ok) throw new Error("Failed to save local routes");
      setSaveStatus('Success!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.warn("App: Error saving local routes (expected on static host):", err);
      setSaveStatus('Offline Mode');
      setTimeout(() => setSaveStatus(null), 1000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveUpdatesToServer = async (newUpdates: TravelUpdate[]) => {
    if (!dataLoaded) return;
    try {
      fetch('api/save-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdates)
      });
    } catch (err) {
      console.warn("App: Error saving updates (expected on static host):", err);
    }
  };

  // Persist routes
  useEffect(() => {
    if (!dataLoaded) return; 
    saveRoutesToServer(routes);
  }, [routes, dataLoaded]);

  // Persist local routes
  useEffect(() => {
    if (!dataLoaded) return;
    saveLocalRoutesToServer(localRoutes);
  }, [localRoutes, dataLoaded]);

  // Persist updates
  useEffect(() => {
    if (!dataLoaded) return;
    saveUpdatesToServer(updates);
  }, [updates, dataLoaded]);

  const jsonInputRef = useRef<HTMLTextAreaElement>(null);

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

  const [newRoute, setNewRoute] = useState<FareRoute>({
    from: '',
    to: '',
    fares: { normal: 0, ac: 0, deluxe: 0 },
    suggestedYatayat: '',
    vehicleType: 'Bus'
  });

  const [newLocalRoute, setNewLocalRoute] = useState<LocalRoute>({
    from: '',
    to: '',
    fare: 0,
    suggestedYatayat: '',
    vehicleType: 'Bus'
  });

  const [jsonText, setJsonText] = useState(() => JSON.stringify(routes, null, 2));

  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  
  const [homeSearchFrom, setHomeSearchFrom] = useState('');
  const [homeSearchTo, setHomeSearchTo] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'FROM' | 'TO' | null>(null);

  const [editingRoute, setEditingRoute] = useState<{type: 'short' | 'long', city?: string, index: number} | null>(null);
  const [selectedLongRoutes, setSelectedLongRoutes] = useState<number[]>([]);

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'EN';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const handleJsonUpdate = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        setRoutes(parsed);
        alert("System data updated successfully!");
      } else {
        alert("Invalid format: Root must be an array of routes.");
      }
    } catch (e) {
      alert("Invalid JSON: " + (e as Error).message);
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "bhada_saathi_routes_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportUpdates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(updates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "bhada_saathi_updates_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleHomeSearchNavigation = () => {
    if (searchResults.length === 0) {
      // Check local search results too
      if (localSearchResults.length > 0) {
        setLocalFrom(localSearchResults[0].from);
        setLocalTo(localSearchResults[0].to);
        setCurrentScreen('LOCAL_DISTANCE');
        setHomeSearchFrom('');
        setHomeSearchTo('');
        setShowSearchResults(false);
        return;
      }
      alert("No direct routes found for this search. Try different keywords.");
      return;
    }

    setLongFrom(searchResults[0].from);
    setLongTo(searchResults[0].to);
    setCurrentScreen('LONG_DISTANCE');
    
    setHomeSearchFrom('');
    setHomeSearchTo('');
    setShowSearchResults(false);
  };

  const t = TRANSLATIONS[lang];

  // Logic for Home Search and Autocomplete
  const allAvailablePlaces = useMemo(() => {
    const places = new Set<string>();
    routes.forEach(r => {
      places.add(r.from);
      places.add(r.to);
    });
    localRoutes.forEach(r => {
      places.add(r.from);
      places.add(r.to);
    });
    return Array.from(places).sort();
  }, [routes, localRoutes]);

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
    
    const searchFrom = homeSearchFrom.toLowerCase();
    const searchTo = homeSearchTo.toLowerCase();
    
    return routes.filter(r => {
      const fromMatch = !searchFrom || r.from.toLowerCase().includes(searchFrom);
      const toMatch = !searchTo || r.to.toLowerCase().includes(searchTo);
      const reverseFromMatch = !searchFrom || r.to.toLowerCase().includes(searchFrom);
      const reverseToMatch = !searchTo || r.from.toLowerCase().includes(searchTo);

      return (fromMatch && toMatch) || (reverseFromMatch && reverseToMatch);
    });
  }, [homeSearchFrom, homeSearchTo, routes]);

  const localSearchResults = useMemo(() => {
    if (!homeSearchFrom && !homeSearchTo) return [];
    
    const searchFrom = homeSearchFrom.toLowerCase();
    const searchTo = homeSearchTo.toLowerCase();
    
    return localRoutes.filter(r => {
      const fromMatch = !searchFrom || r.from.toLowerCase().includes(searchFrom);
      const toMatch = !searchTo || r.to.toLowerCase().includes(searchTo);
      const reverseFromMatch = !searchFrom || r.to.toLowerCase().includes(searchFrom);
      const reverseToMatch = !searchTo || r.from.toLowerCase().includes(searchTo);

      return (fromMatch && toMatch) || (reverseFromMatch && reverseToMatch);
    });
  }, [homeSearchFrom, homeSearchTo, localRoutes]);

  // Suggested Routes
  const suggestedRoutes = useMemo(() => {
    return routes.filter(r => r.suggestedYatayat).slice(0, 5);
  }, [routes]);

  // Logic for filtering
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;
    const queries = searchQuery.toLowerCase().split(/\s+/).filter(q => q.length > 0);
    return routes.filter(r => 
      queries.every(q => 
        r.from.toLowerCase().includes(q) || 
        r.to.toLowerCase().includes(q) ||
        (r.vehicleType && r.vehicleType.toLowerCase().includes(q)) ||
        (r.suggestedYatayat && r.suggestedYatayat.toLowerCase().includes(q))
      )
    );
  }, [routes, searchQuery]);

  const longDistanceRoutes = useMemo(() => {
    if (!longFrom || !longTo) return [];
    return routes.filter(f => 
      (f.from === longFrom && f.to === longTo) || 
      (f.from === longTo && f.to === longFrom)
    );
  }, [longFrom, longTo, routes]);

  const localDistanceRoutes = useMemo(() => {
    if (!localFrom || !localTo) return [];
    return localRoutes.filter(f => 
      (f.from === localFrom && f.to === localTo) || 
      (f.from === localTo && f.to === localFrom)
    );
  }, [localFrom, localTo, localRoutes]);

  const hasMultipleOptions = longDistanceRoutes.length > 0;

  const navigateBack = () => {
    if (currentScreen === 'LONG_DISTANCE' || currentScreen === 'LOCAL_DISTANCE' || currentScreen === 'LOGIN') {
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
  const addRoute = () => {
    if (!newRoute.from || !newRoute.to) return;
    setRoutes(prev => [...prev, newRoute]);
    setNewRoute({
      from: '',
      to: '',
      fares: { normal: 0, ac: 0, deluxe: 0 },
      suggestedYatayat: '',
      vehicleType: 'Bus'
    });
    alert("Route added successfully!");
  };

  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  
  const toggleRouteSelection = (idx: number) => {
    setSelectedRoutes(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const deleteRoute = (index: number) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      const updated = routes.filter((_, i) => i !== index);
      setRoutes(updated);
      setSelectedRoutes(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  };

  const allCities = useMemo(() => {
    const citiesSet = new Set<string>();
    routes.forEach(route => {
      if (route.from) citiesSet.add(route.from);
      if (route.to) citiesSet.add(route.to);
    });
    return Array.from(citiesSet).sort();
  }, [routes]);

  const allLocalCities = useMemo(() => {
    const citiesSet = new Set<string>();
    localRoutes.forEach(route => {
      if (route.from) citiesSet.add(route.from);
      if (route.to) citiesSet.add(route.to);
    });
    return Array.from(citiesSet).sort();
  }, [localRoutes]);

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

  const resetToDefaults = () => {
    if (window.confirm("This will erase all changes and restore original factory data. Continue?")) {
      setRoutes(INITIAL_ROUTES as FareRoute[]);
      alert("System reset to defaults!");
    }
  };

  const clearEverything = () => {
    if (window.confirm("This will PERMANENTLY DELETE all routes and updates. Continue?")) {
      setRoutes([]);
      setUpdates([]);
      alert("System wiped successfully!");
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'EN' ? 'NP' : 'EN');
  };

  const deleteSelectedRoutes = () => {
    if (selectedRoutes.length === 0) return;
    if (window.confirm(`Delete ${selectedRoutes.length} selected routes?`)) {
      const updated = routes.filter((_, idx) => !selectedRoutes.includes(idx));
      setRoutes(updated);
      setSelectedRoutes([]);
    }
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
        <div className="flex items-center gap-3">
          {saveStatus && (
            <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full border ${saveStatus === 'Success!' ? 'bg-green-50 border-green-100 text-green-600' : saveStatus === 'Saving...' ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {saveStatus}
            </div>
          )}
          <LanguageSelector />
        </div>
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
                            onFocus={() => setActiveSearchField('FROM')}
                            onChange={(e) => {
                              setHomeSearchFrom(e.target.value);
                              setShowSearchResults(true);
                              setActiveSearchField('FROM');
                            }}
                            onBlur={() => setTimeout(() => setActiveSearchField(null), 200)}
                            className="flex-1 bg-transparent text-sm outline-none font-medium"
                          />
                        </div>
                        {fromSuggestions.length > 0 && showSearchResults && activeSearchField === 'FROM' && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-natural-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-natural-bg max-h-48 overflow-y-auto">
                            {fromSuggestions.map(p => (
                              <button 
                                key={p} 
                                onClick={() => {
                                  setHomeSearchFrom(p);
                                  setActiveSearchField(null);
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
                            onFocus={() => setActiveSearchField('TO')}
                            onChange={(e) => {
                              setHomeSearchTo(e.target.value);
                              setShowSearchResults(true);
                              setActiveSearchField('TO');
                            }}
                            onBlur={() => setTimeout(() => setActiveSearchField(null), 200)}
                            className="flex-1 bg-transparent text-sm outline-none font-medium"
                          />
                        </div>
                        {toSuggestions.length > 0 && showSearchResults && activeSearchField === 'TO' && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-natural-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-natural-bg max-h-48 overflow-y-auto">
                            {toSuggestions.map(p => (
                              <button 
                                key={p} 
                                onClick={() => {
                                  setHomeSearchTo(p);
                                  setActiveSearchField(null);
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
                  onClick={() => setCurrentScreen('LONG_DISTANCE')}
                  className="group bg-white p-5 rounded-2xl card-shadow border border-natural-border text-left transition-all hover:bg-natural-sidebar"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-natural-badge rounded-xl">
                      <Bus className="w-5 h-5 text-natural-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-natural-primary">Highway Routes</h3>
                      <p className="text-xs text-gray-500">Check official fares for all highway routes.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </button>

                <button
                  onClick={() => setCurrentScreen('LOCAL_DISTANCE')}
                  className="group bg-white p-5 rounded-2xl card-shadow border border-natural-border text-left transition-all hover:bg-natural-sidebar"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Navigation className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-blue-800">Local Routes</h3>
                      <p className="text-xs text-gray-500">Check fares for short distance / city travel.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
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
              className="flex-1 bg-natural-bg flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="shrink-0 p-6 pt-10">
                <h2 className="text-2xl font-bold text-natural-primary">About</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
                {/* Profile Header */}
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => isAdmin ? setCurrentScreen('ADMIN') : setCurrentScreen('LOGIN')}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-natural-border overflow-hidden bg-white shadow-sm">
                      <img 
                        src={founderImg} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-natural-primary">Prabin Pokhrel</h3>
                      <p className="text-gray-500 text-sm">Developer & UI/UX Designer</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>

                {/* Section: General */}
                <div>
                  <h4 className="text-gray-400 font-black uppercase tracking-[0.2em] mb-4 text-[10px] mt-4">General</h4>
                  <div className="space-y-6">
                    <button onClick={resetToDefaults} className="w-full flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
                          <RotateCcw className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Erase Everything</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>

                    <button className="w-full flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-sm">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Donate to Developer</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Section: Community */}
                <div>
                  <h4 className="text-gray-400 font-black uppercase tracking-[0.2em] mb-4 text-[10px]">Community</h4>
                  <div className="space-y-6">
                    <a href="https://www.facebook.com/bhadasaathi" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm">
                          <Facebook className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Facebook Page</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </a>

                    <a href="https://chat.whatsapp.com/your-group-id" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">WhatsApp Group</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Section: Application */}
                <div>
                  <h4 className="text-gray-400 font-black uppercase tracking-[0.2em] mb-4 text-[10px]">Application</h4>
                  <div className="space-y-6">
                    <button 
                      onClick={() => window.open('https://bhadasaathi.com/privacy', '_blank')}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-natural-primary flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Privacy Policy</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>

                    <button 
                      onClick={() => window.location.href = 'mailto:support@bhadasaathi.com?subject=Report/Request'}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                          <Bug className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Report or Request</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>

                    <button 
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Bhada Saathi',
                              text: 'Check out the most accurate transport fare calculator for Nepal!',
                              url: window.location.href
                            });
                          } catch (e) {
                            console.error('Share failed', e);
                          }
                        } else {
                          alert('Sharing is not supported on this browser. Copy link: ' + window.location.href);
                        }
                      }}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center shadow-sm">
                          <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Share App</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>

                    <button 
                      onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bhadasaathi', '_blank')}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-natural-primary font-bold">Rate App</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                    </button>
                    {!isAdmin && (
                      <button onClick={() => setCurrentScreen('LOGIN')} className="w-full flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-natural-sidebar flex items-center justify-center shadow-sm border border-natural-border">
                            <Lock className="w-5 h-5 text-natural-primary" />
                          </div>
                          <span className="text-natural-primary font-bold">Admin Portal</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-natural-primary transition-colors" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center pt-8 opacity-40">
                  <p className="text-[10px] text-natural-primary font-black uppercase tracking-[0.4em]">Bhada Saathi • Version 2.5.0</p>
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
                { id: 'HIGHWAY', label: 'Highway', icon: Bus },
                { id: 'LOCAL', label: 'Local', icon: MapPin },
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
                    <div className="bg-natural-badge p-5 rounded-3xl border border-natural-border card-shadow flex flex-col justify-between h-32">
                      <div className="flex items-center gap-2 text-natural-primary">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Routes</span>
                      </div>
                      <p className="text-3xl font-bold text-natural-primary">{routes.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-natural-border card-shadow flex flex-col justify-between h-32">
                      <div className="flex items-center gap-2 text-natural-accent">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Cities</span>
                      </div>
                      <p className="text-3xl font-bold text-natural-primary">{allCities.length}</p>
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
                          <Bus className="w-4 h-4 text-natural-accent" />
                          <span className="text-xs font-bold text-natural-primary">Manage all routes</span>
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

              {/* --- HIGHWAY ROUTES TAB --- */}
              {adminTab === 'HIGHWAY' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Bus className="w-5 h-5 text-natural-accent" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Add Highway Route</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Origin" 
                          value={newRoute.from}
                          onChange={(e) => setNewRoute({...newRoute, from: e.target.value})}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        />
                        <input 
                          placeholder="Destination" 
                          value={newRoute.to}
                          onChange={(e) => setNewRoute({...newRoute, to: e.target.value})}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-gray-400 pl-1">Normal</label>
                          <input 
                            type="number"
                            value={newRoute.fares.normal}
                            onChange={(e) => setNewRoute({...newRoute, fares: {...newRoute.fares, normal: parseInt(e.target.value) || 0}})}
                            className="w-full p-2 bg-natural-bg border border-natural-border rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-blue-400 pl-1">AC</label>
                          <input 
                            type="number"
                            value={newRoute.fares.ac}
                            onChange={(e) => setNewRoute({...newRoute, fares: {...newRoute.fares, ac: parseInt(e.target.value) || 0}})}
                            className="w-full p-2 bg-natural-bg border border-natural-border rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-natural-accent pl-1">Deluxe</label>
                          <input 
                            type="number"
                            value={newRoute.fares.deluxe}
                            onChange={(e) => setNewRoute({...newRoute, fares: {...newRoute.fares, deluxe: parseInt(e.target.value) || 0}})}
                            className="w-full p-2 bg-natural-bg border border-natural-border rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                      <input 
                        placeholder="Transport (e.g. Blue Sky Yatayat)" 
                        value={newRoute.suggestedYatayat}
                        onChange={(e) => setNewRoute({...newRoute, suggestedYatayat: e.target.value})}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <input 
                        placeholder="Vehicle (e.g. Sumo, EV, Bus)" 
                        value={newRoute.vehicleType}
                        onChange={(e) => setNewRoute({...newRoute, vehicleType: e.target.value})}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <button 
                        onClick={addRoute}
                        className="w-full py-4 bg-natural-primary text-white font-bold rounded-xl active:scale-95 transition-transform"
                      >
                        Add Route
                      </button>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-natural-primary uppercase tracking-widest pl-2">Highway DB ({routes.length})</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {routes.map((route, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl border transition-all bg-white border-natural-border flex items-center justify-between"
                        >
                          <div className="text-xs">
                            <p className="font-bold text-natural-primary">{route.from} ➔ {route.to}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] text-gray-400">N: {route.fares.normal}</span>
                              <span className="text-[10px] text-blue-400">AC: {route.fares.ac}</span>
                              <span className="text-[10px] text-natural-accent">D: {route.fares.deluxe}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteRoute(idx)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* --- LOCAL ROUTES TAB --- */}
              {adminTab === 'LOCAL' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">Add Local Route</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="From (Place)" 
                          value={newLocalRoute.from}
                          onChange={(e) => setNewLocalRoute({...newLocalRoute, from: e.target.value})}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        />
                        <input 
                          placeholder="To (Place)" 
                          value={newLocalRoute.to}
                          onChange={(e) => setNewLocalRoute({...newLocalRoute, to: e.target.value})}
                          className="p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-gray-400 pl-1">Fare (NPR)</label>
                        <input 
                          type="number"
                          value={newLocalRoute.fare}
                          onChange={(e) => setNewLocalRoute({...newLocalRoute, fare: parseInt(e.target.value) || 0})}
                          className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm font-bold"
                        />
                      </div>
                      <input 
                        placeholder="Suggested (e.g. Local Micro)" 
                        value={newLocalRoute.suggestedYatayat}
                        onChange={(e) => setNewLocalRoute({...newLocalRoute, suggestedYatayat: e.target.value})}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <input 
                        placeholder="Vehicle (e.g. Mini Bus, Tempo)" 
                        value={newLocalRoute.vehicleType}
                        onChange={(e) => setNewLocalRoute({...newLocalRoute, vehicleType: e.target.value})}
                        className="w-full p-3 bg-natural-bg border border-natural-border rounded-xl text-sm outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (!newLocalRoute.from || !newLocalRoute.to) return;
                          setLocalRoutes(prev => [...prev, newLocalRoute]);
                          setNewLocalRoute({
                            from: '',
                            to: '',
                            fare: 0,
                            suggestedYatayat: '',
                            vehicleType: 'Bus'
                          });
                          alert("Local route added!");
                        }}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                      >
                        Add Local Route
                      </button>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-natural-primary uppercase tracking-widest pl-2">Local DB ({localRoutes.length})</h2>
                    </div>
                    <div className="space-y-3">
                      {localRoutes.map((route, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl border transition-all bg-white border-natural-border flex items-center justify-between"
                        >
                          <div className="text-xs">
                            <p className="font-bold text-natural-primary">{route.from} ➔ {route.to}</p>
                            <p className="text-sm font-bold text-blue-600 mt-1">Rs. {route.fare}</p>
                          </div>
                          <button 
                            onClick={() => {
                              if (window.confirm("Delete this local route?")) {
                                setLocalRoutes(prev => prev.filter((_, i) => i !== idx));
                              }
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* --- TOOLS TAB --- */}
              {adminTab === 'TOOLS' && (
                <div className="p-6 space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <RefreshCw className="w-5 h-5 text-natural-primary" />
                      <h2 className="text-lg font-bold text-natural-primary font-serif">JSON Data Editor</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-natural-border card-shadow space-y-4">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                        Directly edit the underlying JSON database. WARNING: Incorrect syntax will cause app failure.
                      </p>
                      <textarea 
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        rows={12}
                        className="w-full p-4 bg-natural-bg border border-natural-border rounded-xl text-[10px] font-mono outline-none focus:border-natural-primary resize-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={handleJsonUpdate}
                          className="py-4 bg-natural-primary text-white font-bold rounded-xl active:scale-95 transition-transform text-sm"
                        >
                          Sync JSON
                        </button>
                        <button 
                          onClick={() => setJsonText(JSON.stringify(routes, null, 2))}
                          className="py-4 bg-white border border-natural-border text-natural-primary font-bold rounded-xl active:scale-95 transition-transform text-sm"
                        >
                          Refresh View
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={exportData}
                          className="py-4 bg-natural-sidebar border border-natural-border text-natural-primary font-bold rounded-xl active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4 rotate-180" />
                          Highway Routes
                        </button>
                        <button 
                          onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localRoutes, null, 2));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href",     dataStr);
                            downloadAnchorNode.setAttribute("download", "bhada_saathi_local_routes_backup.json");
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                          }}
                          className="py-4 bg-natural-sidebar border border-natural-border text-natural-primary font-bold rounded-xl active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4 rotate-180" />
                          Local Routes
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={exportUpdates}
                          className="py-4 bg-natural-sidebar border border-natural-border text-natural-primary font-bold rounded-xl active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4 rotate-180" />
                          Export Updates
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4 shadow-sm">
                    <h3 className="text-red-800 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                       <Trash2 className="w-4 h-4" /> Danger Zone
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={resetToDefaults} className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-xs">Restore Factory Defaults</button>
                      <button onClick={clearEverything} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl text-xs">Delete Everything</button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        )}


        {/* --- SHORT DISTANCE: CITY LIST --- */}
        {/* --- LOCAL DISTANCE SCREEN --- */}
        {currentScreen === 'LOCAL_DISTANCE' && (
          <motion.div 
            key="local-distance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-natural-bg overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-natural-border mb-6">
              <button 
                onClick={navigateBack}
                className="p-2 hover:bg-natural-sidebar rounded-full transition-colors border border-transparent hover:border-natural-border"
              >
                <ChevronLeft className="w-6 h-6 text-natural-primary" />
              </button>
              <h2 className="text-xl font-bold text-natural-primary font-serif">Local Rates</h2>
            </div>

            <div className="px-8 pb-24">
              <div className="space-y-6 mb-12 relative">
                <div className="relative">
                  <label className="absolute left-5 top-3 text-[10px] uppercase font-black text-blue-400 tracking-[0.2em]">Origin Place</label>
                  <select 
                    value={localFrom}
                    onChange={(e) => setLocalFrom(e.target.value)}
                    className="w-full pt-8 pb-4 px-5 bg-white border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer card-shadow font-bold text-natural-primary"
                  >
                    <option value="">Choose place</option>
                    {allLocalCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex justify-center -my-4 relative z-10">
                  <div className="bg-blue-600 p-3 rounded-2xl border-4 border-natural-bg shadow-lg text-white">
                    <Navigation className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute left-5 top-3 text-[10px] uppercase font-black text-blue-400 tracking-[0.2em]">Destination</label>
                  <select 
                    value={localTo}
                    onChange={(e) => setLocalTo(e.target.value)}
                    className="w-full pt-8 pb-4 px-5 bg-white border border-natural-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer card-shadow font-bold text-natural-primary"
                  >
                    <option value="">Choose place</option>
                    {allLocalCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {localFrom && localTo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-600 rounded-[2.5rem] p-10 text-center shadow-xl shadow-blue-600/30 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
                    <Navigation className="w-32 h-32 text-white" />
                  </div>
                  
                  {localDistanceRoutes.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.25em]">Local Transfer</p>
                        <span className="text-[9px] font-black text-white px-2 py-0.5 bg-white/10 rounded-lg uppercase">Fixed Rate</span>
                      </div>
                      
                      <div className="grid gap-3">
                        {localDistanceRoutes.map((route, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-black/10 flex flex-col items-center justify-center gap-4 relative group border border-transparent hover:border-blue-100 transition-all text-center"
                          >
                            <div className="flex flex-col items-center gap-1">
                               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-md uppercase tracking-widest border border-blue-100">
                                 {route.vehicleType || 'Local Service'}
                               </span>
                               <h4 className="text-xl font-bold text-natural-primary">
                                 {route.suggestedYatayat || 'Standard Local'}
                               </h4>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Base Fare</span>
                              <div className="text-4xl font-bold text-blue-600 mt-1">
                                Rs.{route.fare}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl flex items-center gap-3 justify-center text-xs text-white font-medium border border-white/10 mt-4">
                        <Info className="w-4 h-4" />
                        <span>Rates are subject to local authorities.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6">
                      <h3 className="text-white font-bold text-xl mb-2 font-serif">Not Listed</h3>
                      <p className="text-white/60 text-sm">We couldn't find official local rates for this specific stretch.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- FARES SEARCH SCREEN --- */}
        {currentScreen === 'LONG_DISTANCE' && (
          <motion.div 
            key="long-distance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-natural-bg overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-natural-border mb-6">
              <button 
                onClick={navigateBack}
                className="p-2 hover:bg-natural-sidebar rounded-full transition-colors border border-transparent hover:border-natural-border"
              >
                <ChevronLeft className="w-6 h-6 text-natural-primary" />
              </button>
              <h2 className="text-xl font-bold text-natural-primary font-serif">{t.highwayRates}</h2>
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
                    {allCities.map(c => <option key={c} value={c}>{c}</option>)}
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
                    {allCities.map(c => <option key={c} value={c}>{c}</option>)}
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

                            <div className="flex flex-col gap-3 flex-1 sm:flex-initial">
                              <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                                <div className="flex flex-col items-center bg-natural-sidebar p-2 rounded-xl border border-natural-border">
                                  <span className="text-[8px] font-black uppercase text-gray-400">Normal</span>
                                  <span className="text-sm font-bold text-natural-primary">Rs.{route.fares.normal}</span>
                                </div>
                                <div className="flex flex-col items-center bg-blue-50 p-2 rounded-xl border border-blue-100">
                                  <span className="text-[8px] font-black uppercase text-blue-400">AC</span>
                                  <span className="text-sm font-bold text-blue-700">Rs.{route.fares.ac}</span>
                                </div>
                                <div className="flex flex-col items-center bg-natural-accent/10 p-2 rounded-xl border border-natural-accent/20">
                                  <span className="text-[8px] font-black uppercase text-natural-accent/60">Deluxe</span>
                                  <span className="text-sm font-bold text-natural-accent">Rs.{route.fares.deluxe}</span>
                                </div>
                              </div>
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
      <nav className="shrink-0 bg-white border-t border-natural-border px-4 py-3 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-20">
        {[
          { id: 'HOME', icon: Home, label: 'Home' },
          { id: 'LONG_DISTANCE', icon: ArrowRightLeft, label: 'Fares' },
          { id: 'MAP', icon: MapIcon, label: 'Maps' },
          { id: 'INFO', icon: Info, label: 'About', activeScreens: ['INFO', 'LOGIN', 'ADMIN'] }
        ].map((tab) => {
          const isActive = tab.activeScreens 
            ? (tab.activeScreens as string[]).includes(currentScreen)
            : currentScreen === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id as Screen)}
              className="relative flex flex-col items-center justify-center group flex-1 h-12 rounded-2xl transition-all duration-300"
            >
              <div className="relative flex flex-col items-center justify-center">
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-natural-sidebar rounded-xl -z-10 scale-150"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-natural-primary' : 'text-gray-300 group-hover:text-natural-accent'}`} />
                <span className={`text-[9px] font-bold mt-1 uppercase tracking-tighter transition-all ${isActive ? 'text-natural-primary opacity-100' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-natural-primary rounded-full"
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

