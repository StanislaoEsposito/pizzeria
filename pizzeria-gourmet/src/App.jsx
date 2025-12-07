import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { 
  Utensils, MapPin, Phone, Clock, Calendar, Users, ChefHat, 
  Instagram, Facebook, Menu as MenuIcon, X, CheckCircle, 
  Star, Mail, ClipboardList, Lock, LogIn, Check, Ban, Send, Trash2,
  ArrowLeft, Info, Leaf, Wheat, Milk, Wine, Coffee, UserPlus, ShieldAlert, History, User, PlusCircle, CalendarDays, Moon, Sun
} from 'lucide-react';

// --- CONFIGURAZIONE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAcGXNkFGeBNHmF3aGjcHXAmuGi9CmQ240",
  authDomain: "pizzeria-ef166.firebaseapp.com",
  projectId: "pizzeria-ef166",
  storageBucket: "pizzeria-ef166.firebasestorage.app",
  messagingSenderId: "403551662896",
  appId: "1:403551662896:web:2700b62a36055cd9398ef5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COSTANTI ---
const MAX_SEATS_PER_SLOT = 10;
const TIME_SLOTS = {
  lunch: ["12:30", "13:30"],
  dinner: ["19:30", "20:30", "21:30"]
};

// --- UTILS ---
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('it-IT', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  }).format(date);
};

const getNext7Days = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).format(date);
};

// --- DATI MENU (LE TUE IMMAGINI) ---
const MENU_DATA = {
  antipasti: [
    {
      id: "a1",
      name: "Il Crocchè dal 1965",
      price: 5.00,
      description: "L'autentico crocchè di patate con provola, salame Napoli e fonduta di parmigiano.",
      ingredients: "Patate, Provola, Salame, Parmigiano Reggiano",
      allergens: ["Latte", "Glutine", "Uova"],
      image: "https://images.unsplash.com/photo-1683694062041-cc62c5390b13?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Antipasti"
    },
    {
      id: "a2",
      name: "Frittatina alla Parmigiana",
      price: 6.00,
      description: "La tradizione napoletana incontra la parmigiana di melanzane. Cuore filante e panatura croccante.",
      ingredients: "Bucatini, Besciamella, Melanzane, Provola, Basilico",
      allergens: ["Latte", "Glutine"],
      image: "https://blog.giallozafferano.it/ammorecucinaemandolino/wp-content/uploads/2020/12/81E54AF9-8F6E-4F9C-BB89-F4FEF4BF2AA3-750x500.jpeg",
      category: "Antipasti"
    },
    {
      id: "a3",
      name: "Tacos Napoletani (2pz)",
      price: 7.00,
      description: "Tacos croccanti ripieni di parmigiana di melanzane e fonduta.",
      ingredients: "Mais, Melanzane, Provola, Parmigiano",
      allergens: ["Latte"],
      image: "https://ca.italiaonline.it/67416_2.jpg",
      category: "Antipasti"
    }
  ],
  pizze_tradizione: [
    {
      id: "p1",
      name: "Margherita DOP",
      price: 7.50,
      description: "La regina delle pizze, semplice e perfetta.",
      ingredients: "Pomodoro San Marzano DOP, Fiordilatte, Basilico, Olio EVO",
      allergens: ["Latte", "Glutine"],
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
      category: "Tradizione",
      isVegetarian: true
    },
    {
      id: "p2",
      name: "Marinara Antica",
      price: 6.50,
      description: "Profumi intensi di aglio e origano su pomodoro di filiera.",
      ingredients: "Pomodoro pelato, Aglio, Origano, Basilico, Olio EVO",
      allergens: ["Glutine"],
      image: "https://www.pizzarecipe.org/wp-content/uploads/2019/01/Pizza-Marinara-2000x1500.jpg",
      category: "Tradizione",
      isVegetarian: true
    },
    {
      id: "p3",
      name: "La Montanara",
      price: 10.00,
      description: "Pizza fritta e ripassata al forno, una doppia consistenza unica.",
      ingredients: "Pomodoro pelato, Fiordilatte, Cacioricotta, Basilico",
      allergens: ["Latte", "Glutine"],
      image: "https://media-cdn.tripadvisor.com/media/photo-s/14/f1/85/81/montanara-fritta-ripassata.jpg",
      category: "Tradizione",
      isVegetarian: true
    }
  ],
  pizze_gourmet: [
    {
      id: "g1",
      name: "Mortazza & Pistacchio",
      price: 13.00,
      description: "Un classico moderno, cremoso e croccante.",
      ingredients: "Fiordilatte, Mortadella IGP, Pesto e granella di pistacchio, Limone",
      allergens: ["Latte", "Glutine", "Pistacchio"],
      image: "https://lh5.googleusercontent.com/proxy/dFJxh_nvnkb6lZTLaCCQFPsmNJxn5xxDiJ6ry8JoELyEKWFxPCRs1l9tHfb9Dnp6ffdJx0g70GbG1VtoKx_k9DMjedQD4I_WkhONznifTT0Bbb1PyF4ZaPLEsvUihEvaJrwsCqPc-RfMh3ow",
      category: "Gourmet"
    },
    {
      id: "g2",
      name: "Ortolana 2.0",
      price: 15.00,
      description: "Per gli amici vegani e non solo: un trionfo di verdure di stagione.",
      ingredients: "Cianfotta di verdure di stagione, Pesto di basilico, Mozzarella vegana (o Fiordilatte)",
      allergens: ["Glutine"],
      image: "https://i0.wp.com/www.piccolericette.net/piccolericette/wp-content/uploads/2017/12/3243_Pizza.jpg?resize=895%2C616&ssl=1",
      category: "Gourmet",
      isVegetarian: true
    },
    {
      id: "g3",
      name: "Gamberi e Agrumi",
      price: 20.00,
      description: "Impasto al limone, freschezza assoluta.",
      ingredients: "Fiordilatte, Crudo di gamberi rossi, Rucola, Arancia, Olio EVO",
      allergens: ["Latte", "Glutine", "Crostacei"],
      image: "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=800&q=80",
      category: "Gourmet"
    }
  ],
  dolci: [
    {
      id: "d1",
      name: "Innamorarsi sul Vesuvio",
      price: 6.00,
      description: "Spicchio di impasto al cacao con crema al burro e frutti di bosco.",
      ingredients: "Cacao, Burro, Frutti di bosco, Confettura",
      allergens: ["Latte", "Glutine"],
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80", // Torta cioccolato
      category: "Dolci"
    },
    {
      id: "d2",
      name: "Tiramisù a modo nostro",
      price: 6.00,
      description: "Crema al mascarpone con savoiardo artigianale.",
      ingredients: "Mascarpone, Caffè, Cacao, Uova",
      allergens: ["Latte", "Uova", "Glutine"],
      image: "https://www.giallozafferano.it/images/237-23742/Tiramisu_650x433_wm.jpg",
      category: "Dolci"
    },
  ],
  bevande: [
    {
      id: "b1",
      name: "Acqua Minerale (75cl)",
      price: 2.50,
      description: "Naturale o Frizzante",
      image: "https://images.vanityfair.it/wp-content/uploads/2019/12/09190654/GettyImages-1125114941-950x684.jpg",
      category: "Bevande"
    },
    {
      id: "b2",
      name: "Birra Artigianale (33cl)",
      price: 6.00,
      description: "Selezione di birre locali.",
      image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
      category: "Bevande"
    },
    {
      id: "b3",
      name: "Calice di Vino",
      price: 5.00,
      description: "Rosso o Bianco della casa (Campania IGP).",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
      category: "Bevande"
    }
  ]
};

// --- NAVIGATION HOOK (CORRETTO) ---
const useNavigation = () => {
  const getRouteFromUrl = () => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') return { tab: 'home', productId: null };
    
    const params = new URLSearchParams(window.location.search);
    return {
      tab: params.get('tab') || 'home',
      productId: params.get('product') || null
    };
  };

  const [route, setRoute] = useState(getRouteFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (tab, productId = null) => {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    
    if (productId) {
      url.searchParams.set('product', productId);
    } else {
      url.searchParams.delete('product');
    }

    // PushState aggiunge una voce alla cronologia
    window.history.pushState({}, '', url);
    setRoute({ tab, productId });
    
    // Scroll in alto solo se cambiamo tab principale, non se apriamo un prodotto (per preservare il contesto se torni indietro)
    if (!productId) {
      window.scrollTo(0, 0);
    }
  };

  return { route, navigate };
};

// --- COMPONENTS ---

const Navbar = ({ activeTab, navigate, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'prenota', label: 'Prenota' },
    { id: 'storia', label: 'Storia' },
    { id: 'contatti', label: 'Contatti' },
    ...(isLoggedIn ? [{ id: 'admin', label: 'Area Staff', icon: <Lock className="w-4 h-4 mr-1 inline" /> }] : []),
  ];

  const handleNavClick = (id) => {
    // Quando clicchi sul menu, resetti sempre il prodotto selezionato
    navigate(id, null); 
    setIsOpen(false);
  };

  return (
    <nav className="bg-stone-900 text-stone-100 sticky top-0 z-50 shadow-xl border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('home', null)}>
            <ChefHat className="h-8 w-8 text-amber-500 mr-2" />
            <span className="font-serif text-2xl font-bold tracking-wider text-amber-500 hidden sm:inline">DANIELE GOURMET</span>
            <span className="font-serif text-xl font-bold tracking-wider text-amber-500 sm:hidden">DANIELE</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center ${
                    activeTab === item.id ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-300 hover:text-white focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-stone-900 pb-4">
          <div className="px-2 pt-2 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${
                  activeTab === item.id ? 'text-amber-500 bg-stone-800' : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ navigate }) => (
  <div className="relative h-[600px] flex items-center justify-center bg-stone-900 overflow-hidden">
    <div className="absolute inset-0 opacity-40">
       <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent z-10"></div>
       <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950"></div>
    </div>
    <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-center">
        <Star className="text-amber-500 h-8 w-8 mx-1" />
        <Star className="text-amber-500 h-8 w-8 mx-1" />
        <Star className="text-amber-500 h-8 w-8 mx-1" />
      </div>
      <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
        L'Arte della Pizza <span className="text-amber-500 italic">Gourmet</span>
      </h1>
      <p className="text-xl text-stone-300 mb-10 font-light max-w-2xl mx-auto">
        Sapori autentici, impasti a lunga lievitazione e ingredienti di prima scelta. Un'esperienza unica a Salerno.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => navigate('prenota')} className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-sm uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg">
          Prenota un Tavolo
        </button>
        <button onClick={() => navigate('menu')} className="px-8 py-4 bg-transparent border-2 border-stone-400 hover:border-amber-500 hover:text-amber-500 text-stone-300 font-bold rounded-sm uppercase tracking-widest transition-all">
          Sfoglia il Menu
        </button>
      </div>
    </div>
  </div>
);

const PizzaDetail = ({ item, onBack }) => (
  <div className="bg-white min-h-[60vh] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-stone-200">
    <div className="grid md:grid-cols-2 h-full">
      <div className="h-64 md:h-full relative bg-stone-200">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 p-2 rounded-full hover:bg-white text-stone-800 transition-colors md:hidden shadow-lg">
          <ArrowLeft size={24} />
        </button>
      </div>
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <button onClick={onBack} className="hidden md:flex items-center text-stone-500 hover:text-amber-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Torna al Catalogo
        </button>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {item.category}
          </span>
          {item.isVegetarian && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Leaf size={12} /> Veg
            </span>
          )}
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">{item.name}</h2>
        <p className="text-2xl text-amber-600 font-bold mb-6">€{item.price.toFixed(2)}</p>
        <div className="mb-8">
          <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">Descrizione</h4>
          <p className="text-stone-700 leading-relaxed text-lg">{item.description}</p>
        </div>
        {item.ingredients && (
          <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-100">
            <h4 className="text-sm font-bold text-stone-800 uppercase tracking-widest mb-3 flex items-center">
              <Utensils size={16} className="mr-2 text-amber-500" /> Ingredienti Principali
            </h4>
            <p className="text-stone-600 italic">{item.ingredients}</p>
          </div>
        )}
        {item.allergens && (
          <div className="mt-auto border-t border-stone-200 pt-6">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Allergeni</h4>
            <div className="flex gap-2 flex-wrap">
              {item.allergens.map((alg, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 bg-stone-100 text-stone-500 text-xs rounded border border-stone-200">
                  {alg === 'Glutine' && <Wheat size={12} className="mr-1"/>}
                  {alg === 'Latte' && <Milk size={12} className="mr-1"/>}
                  {alg}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const MenuCatalog = ({ productId, onProductSelect, onClearProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState("Tutte");

  const allItems = useMemo(() => [
    ...MENU_DATA.antipasti,
    ...MENU_DATA.pizze_tradizione,
    ...MENU_DATA.pizze_gourmet,
    ...MENU_DATA.dolci,
    ...MENU_DATA.bevande
  ], []);

  // Se c'è un productId, troviamo quel prodotto specifico
  const selectedItem = useMemo(() => {
    return productId ? allItems.find(p => p.id === productId) : null;
  }, [productId, allItems]);

  const categories = ["Tutte", "Antipasti", "Tradizione", "Gourmet", "Dolci", "Bevande"];

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Tutte") return allItems;
    return allItems.filter(p => p.category === selectedCategory);
  }, [selectedCategory, allItems]);

  // Se c'è un prodotto selezionato, mostriamo il dettaglio
  if (selectedItem) {
    return (
      <div className="py-12 bg-stone-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PizzaDetail item={selectedItem} onBack={onClearProduct} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-800 mb-4">Il Nostro Menu</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">Dagli antipasti ai dolci, scopri le eccellenze del territorio.</p>
        </div>
        <div className="flex justify-center mb-12 overflow-x-auto py-2 no-scrollbar">
          <div className="bg-white p-1 rounded-full shadow-sm border border-stone-200 flex gap-1 whitespace-nowrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => onProductSelect(item.id)}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-stone-100 flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative bg-stone-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {item.category}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl font-bold text-stone-800 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                  <span className="text-lg font-bold text-amber-600">€{item.price.toFixed(2)}</span>
                </div>
                {item.description && <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-grow">{item.description}</p>}
                <div className="flex items-center text-stone-400 text-xs font-medium uppercase tracking-wide mt-auto">
                  <Info size={14} className="mr-1" /> Dettagli
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- STAFF & ADMIN COMPONENTS ---

const StaffLogin = ({ onLoginSuccess }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // MASTER LOGIN
    if (code === 'admin' && password === 'admin') {
      onLoginSuccess({ name: 'Master Admin', role: 'manager', isMaster: true });
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'staff_users'), where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Codice utente non trovato");
      }

      let userFound = null;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.password === password) { 
          userFound = { id: doc.id, ...userData };
        }
      });

      if (userFound) {
        onLoginSuccess(userFound);
      } else {
        throw new Error("Password errata");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-stone-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border-t-4 border-amber-500">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-stone-700 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-stone-800">Accesso Staff</h2>
          <p className="text-sm text-stone-500 mt-1">Inserisci le tue credenziali</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Codice Staff</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none" 
              placeholder="Es. 101"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none" 
              placeholder="••••••"
              required
            />
          </div>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded flex items-center"><ShieldAlert size={16} className="mr-2"/>{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifica...' : 'Accedi'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-stone-400">
          <p>Solo per personale autorizzato.</p>
        </div>
      </div>
    </div>
  );
};

const StaffReservationForm = ({ staffUser, onClose }) => {
  const [formData, setFormData] = useState({ 
    name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '', guests: '2', notes: '' 
  });
  const [availability, setAvailability] = useState({});
  const [status, setStatus] = useState('idle'); 

  const next7Days = getNext7Days();
  const maxDate = next7Days[6];

  useEffect(() => {
    if (!formData.date) return;
    const q = query(collection(db, 'prenotazioni'), where('date', '==', formData.date));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status !== 'cancelled') {
          booked[data.time] = (booked[data.time] || 0) + parseInt(data.guests);
        }
      });
      const nextAvailability = {};
      [...TIME_SLOTS.lunch, ...TIME_SLOTS.dinner].forEach(slot => {
        nextAvailability[slot] = Math.max(0, MAX_SEATS_PER_SLOT - (booked[slot] || 0));
      });
      setAvailability(nextAvailability);
    });
    return () => unsubscribe();
  }, [formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const guests = parseInt(formData.guests);
    const available = availability[formData.time] || 0;

    if (guests > available) {
      alert(`Non ci sono abbastanza posti! Disponibili: ${available}`);
      return;
    }

    setStatus('loading');
    try {
      const now = new Date();
      await addDoc(collection(db, 'prenotazioni'), {
        ...formData,
        userId: 'staff_entry',
        createdAt: serverTimestamp(),
        status: 'confirmed', 
        updatedBy: staffUser.name,
        createdByStaff: staffUser.name,
        createdByName: staffUser.name,
        createdByTime: now.toISOString(), // CORRETTO QUI
        updatedAtTime: now.toISOString() // Aggiunto per coerenza
      });
      setStatus('success');
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-stone-800 px-4 py-3 flex justify-between items-center text-white">
          <h3 className="font-bold">Nuova Prenotazione (Staff)</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-stone-800">Prenotazione Salvata!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required type="text" placeholder="Nome Cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <input required type="tel" placeholder="Telefono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  max={maxDate}
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full px-3 py-2 border rounded" 
                />
                <select value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full px-3 py-2 border rounded bg-white">
                  {[...Array(10).keys()].map(i => <option key={i+1} value={i+1}>{i+1} Persone</option>)}
                </select>
              </div>
              <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-3 py-2 border rounded bg-white">
                <option value="">Seleziona Orario...</option>
                {formData.date && (
                  <>
                    <optgroup label="Pranzo">
                      {TIME_SLOTS.lunch.map(t => (
                        <option key={t} value={t} disabled={availability[t] <= 0}>
                          {t} ({availability[t] || 0} posti)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Cena">
                      {TIME_SLOTS.dinner.map(t => (
                        <option key={t} value={t} disabled={availability[t] <= 0}>
                          {t} ({availability[t] || 0} posti)
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
              <textarea placeholder="Note aggiuntive..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border rounded h-20"></textarea>
              <button type="submit" disabled={status === 'loading'} className="w-full bg-amber-600 text-white font-bold py-2 rounded hover:bg-amber-700">
                {status === 'loading' ? 'Salvataggio...' : 'Crea Prenotazione'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ staffUser, onLogout }) => {
  const [activeView, setActiveView] = useState('reservations'); 
  const [resFilter, setResFilter] = useState('pending'); 
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', code: '', password: '', role: 'waiter' });
  const [showNewResModal, setShowNewResModal] = useState(false);
  
  // Weekly View State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const weekDays = getNext7Days();

  // Load Reservations
  useEffect(() => {
    const q = query(collection(db, 'prenotazioni'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Load Users (Only Manager)
  useEffect(() => {
    if (staffUser.role !== 'manager') return;
    const q = query(collection(db, 'staff_users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [staffUser]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (staffUser.role !== 'manager') return;
    try {
      await addDoc(collection(db, 'staff_users'), newUser);
      setNewUser({ name: '', code: '', password: '', role: 'waiter' });
      alert("Utente creato con successo!");
    } catch (error) {
      console.error("Error adding user: ", error);
      alert("Errore nella creazione");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare definitivamente questo utente?")) {
      await deleteDoc(doc(db, 'staff_users', id));
    }
  };

  const updateResStatus = async (id, status) => {
    const now = new Date();
    await updateDoc(doc(db, 'prenotazioni', id), { 
      status,
      updatedAt: serverTimestamp(),
      updatedBy: staffUser.name,
      updatedAtTime: now.toISOString()
    });
  };

  const deleteReservation = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questa prenotazione? L'azione è irreversibile.")) {
      await deleteDoc(doc(db, 'prenotazioni', id));
    }
  };

  // Filter reservations by selected date
  const dailyReservations = useMemo(() => {
    return reservations.filter(r => r.date === selectedDate && r.status !== 'cancelled');
  }, [reservations, selectedDate]);

  // Group by slot
  const groupedReservations = useMemo(() => {
    const grouped = { lunch: {}, dinner: {} };
    
    TIME_SLOTS.lunch.forEach(time => {
      grouped.lunch[time] = dailyReservations.filter(r => r.time === time);
    });
    
    TIME_SLOTS.dinner.forEach(time => {
      grouped.dinner[time] = dailyReservations.filter(r => r.time === time);
    });
    
    return grouped;
  }, [dailyReservations]);

  return (
    <div className="bg-stone-100 min-h-screen">
      {/* Admin Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full"><ChefHat className="text-amber-600 w-6 h-6" /></div>
            <div>
              <h2 className="font-bold text-stone-800 text-lg">Portale Staff</h2>
              <p className="text-xs text-stone-500">Operatore: {staffUser.name} ({staffUser.role === 'manager' ? 'Manager' : 'Cameriere'})</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNewResModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center shadow-sm"
            >
              <PlusCircle size={16} className="mr-2"/> Nuova Prenotazione
            </button>
            <div className="flex bg-stone-100 rounded p-1">
              <button 
                onClick={() => setActiveView('reservations')}
                className={`px-4 py-1 rounded text-sm font-medium transition-all ${activeView === 'reservations' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}
              >
                Agenda
              </button>
              {staffUser.role === 'manager' && (
                <button 
                  onClick={() => setActiveView('users')}
                  className={`px-4 py-1 rounded text-sm font-medium transition-all ${activeView === 'users' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}
                >
                  Utenti
                </button>
              )}
            </div>
            <button onClick={onLogout} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-bold border border-red-200">
              Esci
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {activeView === 'reservations' && (
          <>
            {/* Date Tabs */}
            <div className="flex space-x-2 mb-8 border-b border-stone-300 pb-2 overflow-x-auto">
              {weekDays.map((dateStr) => (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`px-4 py-3 rounded-t-lg font-bold text-sm transition-colors flex flex-col items-center min-w-[100px] ${
                    selectedDate === dateStr 
                    ? 'bg-stone-800 text-white border-b-4 border-amber-500'
                    : 'bg-white text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <span className="text-xs opacity-70 uppercase tracking-wider">{getDayName(dateStr).split(' ')[0]}</span>
                  <span className="text-lg">{dateStr.split('-')[2]}</span>
                </button>
              ))}
            </div>

            {/* Service Sections */}
            <div className="space-y-8">
              
              {/* PRANZO */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center">
                  <Sun className="text-orange-500 mr-2" size={20}/>
                  <h3 className="font-serif font-bold text-orange-800 text-lg">Servizio Pranzo</h3>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {TIME_SLOTS.lunch.map(time => (
                    <div key={time} className="border border-stone-100 rounded-lg p-4 bg-stone-50/50">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
                        <span className="font-bold text-lg text-stone-700">{time}</span>
                        <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded font-mono">
                          {groupedReservations.lunch[time].reduce((acc, curr) => acc + parseInt(curr.guests), 0)} / 10 Posti
                        </span>
                      </div>
                      {groupedReservations.lunch[time].length === 0 ? (
                        <p className="text-sm text-stone-400 italic">Nessuna prenotazione.</p>
                      ) : (
                        <div className="space-y-3">
                          {groupedReservations.lunch[time].map(res => (
                            <div key={res.id} className="bg-white p-3 rounded border border-stone-200 shadow-sm relative group">
                              <button onClick={() => deleteReservation(res.id)} className="absolute top-2 right-2 text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
                              <div className="font-bold text-stone-800">{res.name}</div>
                              <div className="text-sm text-stone-500 flex items-center gap-3">
                                <span className="flex items-center"><Users size={12} className="mr-1"/> {res.guests}</span>
                                <span className="flex items-center"><Phone size={12} className="mr-1"/> {res.phone}</span>
                              </div>
                              {res.notes && <div className="text-xs bg-yellow-50 text-yellow-800 p-1 rounded mt-1 border border-yellow-100">{res.notes}</div>}
                              
                              {/* Staff Creation Info */}
                              {res.createdByStaff && (
                                <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-400 flex items-center">
                                  <UserPlus size={10} className="mr-1"/> 
                                  Creata da {res.createdByName} il {formatDate(res.createdByTime)}
                                </div>
                              )}

                              {/* Update Info */}
                              {res.updatedBy && res.status !== 'pending' && (
                                <div className="mt-1 text-[10px] text-stone-400 flex items-center">
                                  <User size={10} className="mr-1"/> 
                                  {res.status === 'confirmed' ? 'Confermata' : 'Cancellata'} da {res.updatedBy} il {formatDate(res.updatedAtTime || res.updatedAt)}
                                </div>
                              )}
                              
                              <div className="mt-2 flex gap-2">
                                <div className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                  res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {res.status === 'confirmed' ? 'Confermato' : 'In Attesa'}
                                </div>
                                {res.status === 'pending' && (
                                  <button onClick={() => updateResStatus(res.id, 'confirmed')} className="text-xs text-green-600 hover:underline">Conferma</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CENA */}
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center">
                  <Moon className="text-indigo-500 mr-2" size={20}/>
                  <h3 className="font-serif font-bold text-indigo-800 text-lg">Servizio Cena</h3>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-6">
                  {TIME_SLOTS.dinner.map(time => (
                    <div key={time} className="border border-stone-100 rounded-lg p-4 bg-stone-50/50">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-200">
                        <span className="font-bold text-lg text-stone-700">{time}</span>
                        <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded font-mono">
                          {groupedReservations.dinner[time].reduce((acc, curr) => acc + parseInt(curr.guests), 0)} / 10 Posti
                        </span>
                      </div>
                      {groupedReservations.dinner[time].length === 0 ? (
                        <p className="text-sm text-stone-400 italic">Nessuna prenotazione.</p>
                      ) : (
                        <div className="space-y-3">
                          {groupedReservations.dinner[time].map(res => (
                            <div key={res.id} className="bg-white p-3 rounded border border-stone-200 shadow-sm relative group">
                              <button onClick={() => deleteReservation(res.id)} className="absolute top-2 right-2 text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
                              <div className="font-bold text-stone-800">{res.name}</div>
                              <div className="text-sm text-stone-500 flex items-center gap-3">
                                <span className="flex items-center"><Users size={12} className="mr-1"/> {res.guests}</span>
                                <span className="flex items-center"><Phone size={12} className="mr-1"/> {res.phone}</span>
                              </div>
                              {res.notes && <div className="text-xs bg-yellow-50 text-yellow-800 p-1 rounded mt-1 border border-yellow-100">{res.notes}</div>}
                              
                              {/* Staff Creation Info */}
                              {res.createdByStaff && (
                                <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-400 flex items-center">
                                  <UserPlus size={10} className="mr-1"/> 
                                  Creata da {res.createdByName} il {formatDate(res.createdByTime)}
                                </div>
                              )}

                              {/* Update Info */}
                              {res.updatedBy && res.status !== 'pending' && (
                                <div className="mt-1 text-[10px] text-stone-400 flex items-center">
                                  <User size={10} className="mr-1"/> 
                                  {res.status === 'confirmed' ? 'Confermata' : 'Cancellata'} da {res.updatedBy} il {formatDate(res.updatedAtTime || res.updatedAt)}
                                </div>
                              )}

                              <div className="mt-2 flex gap-2">
                                <div className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                  res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {res.status === 'confirmed' ? 'Confermato' : 'In Attesa'}
                                </div>
                                {res.status === 'pending' && (
                                  <button onClick={() => updateResStatus(res.id, 'confirmed')} className="text-xs text-green-600 hover:underline">Conferma</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {activeView === 'users' && staffUser.role === 'manager' && (
          <div className="space-y-8">
            {/* Create User Form */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200">
              <h3 className="text-lg font-bold mb-4 flex items-center"><UserPlus className="mr-2 text-amber-600"/> Aggiungi Dipendente</h3>
              <form onSubmit={handleCreateUser} className="grid md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">Nome</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Mario" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">Codice</label>
                  <input required type="text" value={newUser.code} onChange={e => setNewUser({...newUser, code: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="1234" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">Password</label>
                  <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="pass" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-stone-500 mb-1">Ruolo</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full border rounded px-3 py-2 text-sm bg-white">
                    <option value="waiter">Cameriere</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <button type="submit" className="bg-stone-800 text-white font-bold py-2 rounded hover:bg-black transition-colors text-sm">Crea Utente</button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Codice</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Ruolo</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 font-mono">{u.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.role === 'manager' ? 'Manager' : 'Cameriere'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-stone-500">Nessun utente trovato nel database.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {showNewResModal && (
        <StaffReservationForm staffUser={staffUser} onClose={() => setShowNewResModal(false)} />
      )}
    </div>
  );
};

// --- PRENOTAZIONE E CONTATTI ---

const ReservationForm = ({ navigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', date: '', time: '', guests: '2', notes: '' });
  const [status, setStatus] = useState('idle');
  const [availability, setAvailability] = useState({});

  // Calcolo data max (7 giorni da oggi)
  const next7Days = getNext7Days();
  const maxDate = next7Days[6];

  useEffect(() => {
    if (!formData.date) return;
    const q = query(collection(db, 'prenotazioni'), where('date', '==', formData.date));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status !== 'cancelled') {
          booked[data.time] = (booked[data.time] || 0) + parseInt(data.guests);
        }
      });
      const nextAvailability = {};
      [...TIME_SLOTS.lunch, ...TIME_SLOTS.dinner].forEach(slot => {
        nextAvailability[slot] = Math.max(0, MAX_SEATS_PER_SLOT - (booked[slot] || 0));
      });
      setAvailability(nextAvailability);
    });
    return () => unsubscribe();
  }, [formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const guests = parseInt(formData.guests);
    const available = availability[formData.time] || 0;

    if (guests > available) {
      alert(`Siamo spiacenti, per l'orario selezionato sono rimasti solo ${available} posti.`);
      return;
    }

    setStatus('loading');
    try {
      await addDoc(collection(db, 'prenotazioni'), {
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="py-16 bg-stone-100 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-stone-900 px-6 py-8 text-center text-white">
            <h2 className="text-3xl font-serif font-bold">Prenota il tuo Tavolo</h2>
            <p className="opacity-80 mt-2">Assicurati un posto per un'esperienza indimenticabile.</p>
          </div>
          <div className="p-8">
            {status === 'success' ? (
              <div className="text-center py-10">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-stone-800">Richiesta Inviata!</h3>
                <p className="text-stone-600">Riceverai una conferma via email.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-amber-600 font-bold underline">Nuova Prenotazione</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input required type="text" placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                  <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <input required type="tel" placeholder="Telefono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                  <select value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full px-4 py-3 border rounded bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    {[...Array(10).keys()].map(i => <option key={i+1} value={i+1}>{i+1} Persone</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <input 
                    required 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    max={maxDate}
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-amber-500 outline-none" 
                  />
                  <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 border rounded bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">Orario</option>
                    {formData.date && (
                      <>
                        <optgroup label="Pranzo">
                          {TIME_SLOTS.lunch.map(t => (
                            <option key={t} value={t} disabled={availability[t] <= 0}>
                              {t} ({availability[t] ?? 10} posti)
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Cena">
                          {TIME_SLOTS.dinner.map(t => (
                            <option key={t} value={t} disabled={availability[t] <= 0}>
                              {t} ({availability[t] ?? 10} posti)
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full bg-amber-600 text-white font-bold py-4 rounded hover:bg-amber-700 transition-all shadow-lg">
                  {status === 'loading' ? 'Invio...' : 'Conferma Prenotazione'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Contacts = () => (
  <div className="py-16 bg-white min-h-screen">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Dove Siamo</h2>
        <div className="h-1 w-24 bg-amber-500 mx-auto"></div>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-stone-50 p-8 rounded-xl border border-stone-200">
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center"><MapPin className="text-amber-500 mr-2" /> Daniele Gourmet</h3>
            <p className="text-stone-600 mb-2">Lungomare Trieste, 98</p>
            <p className="text-stone-600 mb-6">84122, Salerno (SA)</p>
            <div className="flex items-center text-stone-600 mb-2"><Phone size={18} className="mr-3 text-amber-500"/> 089 123 4567</div>
            <div className="flex items-center text-stone-600"><Mail size={18} className="mr-3 text-amber-500"/> info@danielegourmet.it</div>
          </div>
          <div className="bg-stone-50 p-8 rounded-xl border border-stone-200">
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center"><Clock className="text-amber-500 mr-2" /> Orari</h3>
            <p className="mb-2"><strong>Lun - Ven:</strong> 12:30 - 15:00 | 19:00 - 23:30</p>
            <p><strong>Sab - Dom:</strong> 19:00 - 00:30</p>
          </div>
        </div>
        <div className="h-[400px] bg-stone-200 rounded-xl overflow-hidden shadow-lg">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.777678536124!2d14.7667893!3d40.6749987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133bc3cf7a8d56b5%3A0x6296720d2769222!2sDaniele%20Gourmet!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit" width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </div>
);

const Story = () => (
  <div className="py-16 bg-stone-50 min-h-screen">
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">La Nostra Storia</h2>
        <div className="h-1 w-24 bg-amber-500 mx-auto"></div>
      </div>
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-stone-100">
        <p className="text-lg text-stone-600 leading-relaxed mb-6">
          La storia di <strong>Daniele Gourmet</strong> inizia molto prima dell'apertura del nostro locale sul Lungomare di Salerno. Inizia nelle cucine di famiglia, tra il profumo del ragù e la farina che imbiancava i grembiuli delle nonne.
        </p>
        <p className="text-lg text-stone-600 leading-relaxed mb-6">
          Il nostro chef, Giuseppe Maglione, ha voluto portare questa eredità nel futuro. Non più solo "pizza", ma un disco di pasta lievitato lentamente, leggero come una nuvola, che diventa la tela per ingredienti d'eccellenza: dal Pomodoro San Marzano DOP alla Mozzarella di Bufala, fino alle eccellenze Slow Food.
        </p>
        <blockquote className="border-l-4 border-amber-500 pl-6 italic text-xl text-stone-800 my-10 font-serif">
          "L'innovazione non è altro che la tradizione che ha saputo evolversi per incontrare il gusto contemporaneo."
        </blockquote>
        <div className="grid grid-cols-2 gap-4 mt-12">
          <div className="col-span-2 h-64 overflow-hidden rounded-lg">
             <img src="https://images.unsplash.com/photo-1684183164475-fd45179b47aa?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Lungomare Salerno" className="w-full h-full object-cover" />
          </div>
          <div className="h-64 overflow-hidden rounded-lg">
             <img src="https://images.unsplash.com/photo-1542834369-f10ebf06d3e0?w=800&q=80" alt="Il nostro forno" className="w-full h-full object-cover" />
          </div>
          <div className="h-64 overflow-hidden rounded-lg">
             <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" alt="Sala" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP ---

export default function App() {
  const { route, navigate } = useNavigation();
  const [staffUser, setStaffUser] = useState(null);

  useEffect(() => {
    signInAnonymously(auth).catch(e => console.error(e));
  }, []);

  const handleLogout = () => {
    setStaffUser(null);
    navigate('home', null);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col">
       <Navbar activeTab={route.tab} navigate={navigate} isLoggedIn={!!staffUser} />
       
       <main className="flex-grow">
        {route.tab === 'home' && <Hero navigate={navigate} />}
        {route.tab === 'menu' && (
          <MenuCatalog 
            productId={route.productId} 
            onProductSelect={(id) => navigate('menu', id)} 
            onClearProduct={() => navigate('menu', null)}
          />
        )}
        {route.tab === 'prenota' && <ReservationForm navigate={navigate} />}
        {route.tab === 'storia' && <Story />}
        {route.tab === 'contatti' && <Contacts />}
        
        {route.tab === 'admin' && !staffUser && (
          <StaffLogin onLoginSuccess={setStaffUser} />
        )}
        
        {route.tab === 'admin' && staffUser && (
          <AdminPanel staffUser={staffUser} onLogout={handleLogout} />
        )}
       </main>

       {route.tab !== 'admin' && (
         <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
           <div className="max-w-7xl mx-auto px-4 text-center">
             <div className="flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-amber-500 mr-2" />
                <span className="font-serif text-xl font-bold text-white">DANIELE GOURMET</span>
             </div>
             <p className="text-sm mb-6">Lungomare Trieste 98, Salerno</p>
             <button onClick={() => navigate('admin', null)} className="text-xs flex items-center justify-center mx-auto hover:text-amber-500 transition-colors">
               <Lock className="w-3 h-3 mr-1" /> Accesso Staff
             </button>
             <p className="text-xs mt-8 border-t border-stone-800 pt-4">&copy; 2025 Daniele Gourmet. P.IVA 12345678901</p>
           </div>
         </footer>
       )}
    </div>
  );
}//ultimo aggiornamento 06/2024