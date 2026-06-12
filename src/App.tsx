import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Store,
  Award,
  DollarSign,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  Check,
  ShieldCheck,
  HelpCircle,
  Terminal,
  Copy,
  Info,
  ChevronRight,
  User,
  ShoppingBag,
  Sliders,
  Play
} from "lucide-react";

// Types corresponding exactly to specifications
export type TimeOfDay = "mañana" | "tarde" | "noche";

interface Client {
  name: string;
  appearance: string;
  entrance: string;
  dialogue: string;
  requires_id: boolean;
  requested_product: string;
  mood: "feliz" | "neutro" | "exigente" | "dramatico";
  pagaCon: number;
}

interface Cashier {
  response: string;
  comment: string | null;
}

interface Stock {
  "Coca-Cola": number;
  Fanta: number;
  Agua: number;
  Cerveza: number;
  Vino: number;
  Marlboro: number;
  Camel: number;
  "Lucky Strike": number;
  Alfajor: number;
  Chicles: number;
  Pastillas: number;
  Chupetín: number;
  Chocolate: number;
}

interface Scoreboard {
  points: number;
  cash: number;
  next_client: string | null;
}

interface SaleResult {
  success: boolean;
  amount_charged: number;
  correct_price: number;
  change_given: number;
  client_reaction: string;
}

interface GameStateJSON {
  scene: {
    turn: TimeOfDay;
    sales_count: number;
    description: string;
  };
  client: Client;
  cashier: Cashier;
  stock: Stock;
  scoreboard: Scoreboard;
  sale_result: SaleResult | null;
}

// Initial constants
const PRODUCT_PRICES: Record<keyof Stock, number> = {
  "Coca-Cola": 800,
  Fanta: 700,
  Agua: 500,
  Cerveza: 1200,
  Vino: 2500,
  Marlboro: 2000,
  Camel: 1800,
  "Lucky Strike": 1700,
  Alfajor: 600,
  Chicles: 300,
  Pastillas: 250,
  Chupetín: 150,
  Chocolate: 700
};

const IS_ADULT_ONLY: Record<keyof Stock, boolean> = {
  "Coca-Cola": false,
  Fanta: false,
  Agua: false,
  Cerveza: true,
  Vino: true,
  Marlboro: true,
  Camel: true,
  "Lucky Strike": true,
  Alfajor: false,
  Chicles: false,
  Pastillas: false,
  Chupetín: false,
  Chocolate: false
};

// Colors of the items for THREE.js materials
const PRODUCT_COLORS: Record<keyof Stock, string> = {
  "Coca-Cola": "#dc2626", // red
  Fanta: "#ea580c", // orange
  Agua: "#38bdf8", // light blue
  Cerveza: "#eab308", // golden yellow
  Vino: "#701a75", // deep purple
  Marlboro: "#f87171", // red/white pack
  Camel: "#fbbf24", // yellow/tan pack
  "Lucky Strike": "#1e293b", // dark blue pack with green/white circle
  Alfajor: "#7c2d12", // chocolate brown
  Chicles: "#ec4899", // bright pink
  Pastillas: "#f1f5f9", // pale mint
  Chupetín: "#a855f7", // violet swirly
  Chocolate: "#451a03" // thick brown block
};

// Celebrity details with interactive coordinates inside 3D environment
const GAME_CLIENTS: Client[] = [
  {
    name: "Mirtha Legrand",
    appearance: "Miniatura elegantísima de proporciones caricaturescas con rulitos plateados de volumen 3D, collar de perlas enorme y rictus exigente de conductora legendaria.",
    entrance: "Entra al almacén caminando despacito pero con erguida superioridad tridimensional, escoltada por un chofer imaginario.",
    dialogue: "¡Buenas tardes! ¿Este alfajor es verdaderamente artesanal? Traeme uno, mi amor, y que esté a temperatura de cava. ¡Ojo que tengo ojos de lince en mi mesaza!",
    requires_id: false,
    requested_product: "Alfajor",
    mood: "exigente",
    pagaCon: 1000
  },
  {
    name: "Susana Giménez",
    appearance: "Rubia exhuberante tridimensional con anteojos de sol negros gigantescos que tapan la mitad de su rostro, tapado de leopardo y labial carmín brillante.",
    entrance: "Llega tocando la puerta de vidrio del local mientras grita de emoción por encontrar un kiosco abierto.",
    dialogue: "¡Ay, hola che! Me vivo de sed por favor... Dame algo light, ¿este agua no tiene nada de sodio, no? ¡Ay, qué amoroso sos!",
    requires_id: false,
    requested_product: "Agua",
    mood: "feliz",
    pagaCon: 1000
  },
  {
    name: "Ricardo Fort",
    appearance: "Fantasma musculoso recortado en rosa neón con jopo perfecto de chocolate de 15cm, barba de candado ultra-detallada y tapado de zorro gris modelado 3D.",
    entrance: "Aparece atravesando la puerta de vidrio flotando pacíficamente, rodeado de destellos y murmullos de Miami.",
    dialogue: "¡MAIAMEEE! ¡Chicos, cortaron toda la looz de la fábrica! Exijo una cerveza bien helada para mitigar este sofoco estival cósmico.",
    requires_id: true,
    requested_product: "Cerveza",
    mood: "dramatico",
    pagaCon: 2000
  },
  {
    name: "Wanda Nara",
    appearance: "Cabello platinado lacio con profundidad, uñas acrílicas sumamente largas de color rosa flúo y campera acolchada importada de Milán.",
    entrance: "Entra hablando por videollamada a los gritos, firmando contratos multimillonarios antes de mirarte.",
    dialogue: "Hola, fiera. ¿Hacen canjes de publicidad en historias acá? Me llevo unos chicles masticables antes de subirme al vuelo privado.",
    requires_id: false,
    requested_product: "Chicles",
    mood: "neutro",
    pagaCon: 500
  },
  {
    name: "Marcelo Tinelli",
    appearance: "Sonrisa blanca impecable de porcelana resplandeciente, cuerpo Chibi con saco negro satinado brillante y un micrófono con tachas antiguos.",
    entrance: "Entra saltando en un pie, arengando a un público imaginario detrás de él mientras tira confeti.",
    dialogue: "¡Buenas noches América! ¡Señoras y señores, hoy con el desafío de engullir este alfajor de un bocado! Dame uno ya, fiera.",
    requires_id: false,
    requested_product: "Alfajor",
    mood: "feliz",
    pagaCon: 1000
  },
  {
    name: "L-Gante",
    appearance: "Gorra de visera plana perfectamente torcida de 5 grados, brackets dentales metálicos que chispean y cadenas macizas de oro Cumbia 420 fluyendo sobre ropa deportiva.",
    entrance: "Ingresa bailando un paso callejero mientras sostiene una botella de plástico cortada a la mitad.",
    dialogue: "¡Qué onda, pa! Cumbia 420 al toque con la Mafilia. Pasame un vino potente de los tradicionales para armar un viajero de previa bien piola.",
    requires_id: true,
    requested_product: "Vino",
    mood: "neutro",
    pagaCon: 10000
  },
  {
    name: "Juana Viale",
    appearance: "Silueta hippie-chic idéntica a Mirtha pero vestida en lino ecológico color crudo con trenzas de hilo rústico y pómulos esculpidos sumamente definidos.",
    entrance: "Entra de golpe con mirada altanera, analizando si el local usa plásticos descartables nocivos para el ecosistema.",
    dialogue: "Buenas. Dame un atado de Lucky Strike y no me des bolsa plástica porque es un atentado ambiental insoportable.",
    requires_id: true,
    requested_product: "Lucky Strike",
    mood: "exigente",
    pagaCon: 2000
  },
  {
    name: "Diego Maradona",
    appearance: "Espíritu cósmico de rulos flotantes negros de la copa de 1986, arito brillante de diamante destellando y pelota de cuero adherida al pie izquierdo.",
    entrance: "Entra flotando suavemente dominando el esférico con maestría mística.",
    dialogue: "Eeeeeeeee... fiera, ¿cómo andás? La pelota no se mancha, pa. Pasame una buena botella de Fanta bien helada para festejar.",
    requires_id: false,
    requested_product: "Fanta",
    mood: "dramatico",
    pagaCon: 1000
  }
];

export default function App() {
  // Gameplay states
  const [points, setPoints] = useState<number>(0);
  const [cash, setCash] = useState<number>(5000);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("mañana");
  const [stock, setStock] = useState<Stock>({
    "Coca-Cola": 10,
    Fanta: 10,
    Agua: 10,
    Cerveza: 10,
    Vino: 10,
    Marlboro: 10,
    Camel: 10,
    "Lucky Strike": 10,
    Alfajor: 10,
    Chicles: 10,
    Pastillas: 10,
    Chupetín: 10,
    Chocolate: 10
  });

  // Current Turn States
  const [activeClientIndex, setActiveClientIndex] = useState<number>(0);
  const [isDniCheckedThisTurn, setIsDniCheckedThisTurn] = useState<boolean>(false);
  const [kiosqueroComment, setKiosqueroComment] = useState<string | null>(null);
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null);
  const [commandInput, setCommandInput] = useState<string>("");
  const [isCopySuccess, setIsCopySuccess] = useState<boolean>(false);
  const [customConsoleLog, setCustomConsoleLog] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Custom HUD select highlights for raycast clicks
  const [shelfHoveredItem, setShelfHoveredItem] = useState<string | null>(null);

  // References for Three.js scene container
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const activeMeshRef = useRef<THREE.Group | null>(null); // holds actual client custom geometry card
  const neonLightsRef = useRef<THREE.PointLight[]>([]);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Initialize and select a random starting customer
  useEffect(() => {
    const rand = Math.floor(Math.random() * GAME_CLIENTS.length);
    setActiveClientIndex(rand);
    setCustomConsoleLog(["[SISTEMA] Kiosco reabierto con $5000 de presupuesto base. Las luces automáticas se encienden."]);
  }, []);

  const getActiveClient = (): Client => {
    return GAME_CLIENTS[activeClientIndex];
  };

  const getNextClientName = (): string | null => {
    const nextIdx = (activeClientIndex + 1) % GAME_CLIENTS.length;
    return GAME_CLIENTS[nextIdx].name;
  };

  const getSceneDescription = (turn: TimeOfDay) => {
    switch (turn) {
      case "mañana":
        return "El sol amanece de costado cruzando la ventana con destellos cálidos dorados por sobre los estantes. Se oye el zumbido de la heladera de chapa de fondo.";
      case "tarde":
        return "La resolana ardiente de la siesta de avenida Rivadavia calienta el toldo rojo exterior. El polvo baila flotando bajo la luz intensa del mediodía.";
      case "noche":
        return "Carteles parpadeantes de neón rojo y azul eléctrico recortan sombras nítidas muy profundas. Se respira mística y misterio de local nocturno porteño.";
    }
  };

  // Build the state JSON required by user configuration
  const getGameStateJSON = (): GameStateJSON => {
    const active = getActiveClient();
    
    let dryResponse = "Buenas pibe, ¿qué te doy?";
    if (saleResult) {
      dryResponse = saleResult.success ? "Impecable fiera, gracias por comprar en el barrio." : "Uff... qué dolor. Pasame bien la plata la próxima.";
    } else if (isDniCheckedThisTurn) {
      dryResponse = "Chequeado. Tenés cara de pibe pero el plástico está en regla.";
    }

    return {
      scene: {
        turn: timeOfDay,
        sales_count: salesCount,
        description: getSceneDescription(timeOfDay)
      },
      client: active,
      cashier: {
        response: dryResponse,
        comment: kiosqueroComment
      },
      stock: stock,
      scoreboard: {
        points: points,
        cash: cash,
        next_client: getNextClientName()
      },
      sale_result: saleResult
    };
  };

  // Copy structured JSON payload
  const copyJSONToClipboard = () => {
    const jsonStr = JSON.stringify(getGameStateJSON(), null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setIsCopySuccess(true);
      setTimeout(() => setIsCopySuccess(false), 2000);
    });
  };

  // Safe sound synthesizer triggers using Web Audio API (No files required)
  const playSound = (type: "cash" | "error" | "click" | "bell") => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      if (type === "cash") {
        // Double sweet ring
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        osc2.frequency.setValueAtTime(1100, now);
        osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
      } else if (type === "error") {
        // Sour buzzer
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.45);
      } else if (type === "bell") {
        // High crisp shop door bell
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(2500, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.3);
      } else {
        // Basic click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(900, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.05);
      }
    } catch (e) {}
  };

  // Primary business model command executor (accepts custom shortcuts and typed text)
  const processGameCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCustomConsoleLog(prev => [...prev, `> ${trimmed}`]);
    const cleanLower = trimmed.toLowerCase();
    const active = getActiveClient();
    const requestedStockKey = active.requested_product as keyof Stock;
    const currentProductPrice = PRODUCT_PRICES[requestedStockKey];

    // DNI execution check
    if (cleanLower.includes("pido dni") || cleanLower.includes("dni") || cleanLower.includes("documento") || cleanLower.includes("identidad")) {
      setIsDniCheckedThisTurn(true);
      playSound("click");
      setKiosqueroComment("Te clavo los ojos de reojo con la peor de las ondas. Mostrame la credencial pibe, acá no se regala nada.");
      setCustomConsoleLog(prev => [...prev, `[SISTEMA] DNI de ${active.name} verificado. Su edad es legal para la compra.`]);
      setCommandInput("");
      return;
    }

    // No stock exception execution
    if (cleanLower.includes("no tengo stock") || cleanLower.includes("no hay stock") || cleanLower.includes("sin stock") || cleanLower.includes("quedó sin")) {
      setCommandInput("");
      const currentResStock = stock[requestedStockKey];
      
      if (currentResStock === 0) {
        playSound("cash");
        setPoints(p => p + 20);
        setKiosqueroComment("Y bueh... la aduana no me entrega mercadería de importación. Si querés te doy un chupetín de vuelto.");
        setSaleResult({
          success: true,
          amount_charged: 0,
          correct_price: 0,
          change_given: 0,
          client_reaction: `¡Qué bajonazo enorme che! No hay caso, me iré a buscarlo a otro lado. ${active.name} se retira del local encogiendo los hombros con rictus de resignación.`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Licencia comercial aceptada. Negación de producto correcta por falta auténtica de stock.`]);
      } else {
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        setKiosqueroComment("Qué vago insoportable... tenés las repisas casi que revientan de mercadería y mentís de puro haragán.");
        setSaleResult({
          success: false,
          amount_charged: 0,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: `¡Pero che escúchame! ¿Seguro que no te queda si veo de acá nomás el estante repleto de ${active.requested_product}? ¡Tenés menos ganas de trabajar que una heladera desenchufada!`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Intento fallido de simular falta de mercadería. Penalización de 50 puntos.`]);
      }
      return;
    }

    // Sell command execution
    const sellRegex = /vendo\s+([a-zA-Z\-\s]+)\s+por\s+\$?([0-9]+)/i;
    const match = trimmed.match(sellRegex);

    if (match) {
      setCommandInput("");
      const matchedProd = match[1].trim().toLowerCase();
      const parsedPriceCharged = parseInt(match[2], 10);

      // Resolve key matches
      const resolvedProductKey = Object.keys(PRODUCT_PRICES).find(
        k => k.toLowerCase() === matchedProd || (k === "Coca-Cola" && matchedProd.includes("coca"))
      ) as keyof Stock | undefined;

      if (!resolvedProductKey) {
        playSound("error");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Error: El producto "${match[1]}" no existe en nuestro registro porteño.`]);
        return;
      }

      // Assert stock
      if (stock[resolvedProductKey] <= 0) {
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        setSaleResult({
          success: false,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: `¡Pero pibe! Estirás la mano y el estante está más vacío que bolsillo de fin de mes... ¡No tenés stock de ${resolvedProductKey}!`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Venta rechazada. Trato fallido de vender un producto sin stock.`]);
        return;
      }

      // Business match tests
      const isProductMatch = resolvedProductKey.toLowerCase() === requestedStockKey.toLowerCase();
      const isPriceCorrect = parsedPriceCharged === currentProductPrice;
      const isAgeVerifiedOk = !active.requires_id || isDniCheckedThisTurn;
      const isSuccess = isProductMatch && isPriceCorrect && isAgeVerifiedOk;

      // Compute visual change
      const paymentBill = active.pagaCon;
      const changeToReturn = paymentBill - parsedPriceCharged;

      if (isSuccess) {
        playSound("cash");
        // Subtract stock
        setStock(prev => ({
          ...prev,
          [resolvedProductKey]: prev[resolvedProductKey] - 1
        }));
        
        setPoints(p => p + 100);
        setCash(c => c + parsedPriceCharged);
        
        const nextSalesCount = salesCount + 1;
        setSalesCount(nextSalesCount);

        // Adjust Time of Day based on sales count
        let nextTurn = timeOfDay;
        if (nextSalesCount >= 10 && nextSalesCount < 20) {
          nextTurn = "tarde";
        } else if (nextSalesCount >= 20) {
          nextTurn = "noche";
        }
        setTimeOfDay(nextTurn);

        const successReactions: Record<string, string> = {
          "Mirtha Legrand": "¡Maravilloso, mi amor! Sos rápido y sumamente educado... Como te ven te tratan, recordalo siempre. ¡Me llevo mi alfajor calentito para acompañar el té de la tarde!",
          "Susana Giménez": "¡Ay, hola che! Qué divino, acá tengo mi agüita helada para arrancar el programa. ¡Sos un sol de persona, te mando un choclo de besos gigantescos!",
          "Ricardo Fort": "¡SÍ! ¡Eso es velocidad premium de nivel Miami, carajo! Comé chocolate de buena calidad, pibe, y comprate un Rolls-Royce. ¡Te dejo propina de millonario!",
          "Wanda Nara": "¡Espectacular canje de historias de Instagram! Mentira, te pago con la tarjeta black para que veas que soy buena onda. ¡Mándale saludos a los chicos de la cuadra!",
          "Marcelo Tinelli": "¡Impecable fiera! ¡Chau chau chau chauuuu! El alfajor ya está adentro del mostrador, el sonidista está carraspeando de risa. ¡Sos el mago rey del comercio!",
          "L-Gante": "¡Al toque gatito! Vuelto exacto de diez lucas para el fernet de la caravana. Cumbia 420 para que baile todo el almacén con la Mafilia, genio absoluto.",
          "Juana Viale": "Bueno, al menos me atendiste con rapidez y no usamos plásticos rústicos contaminantes. Los cigarrillos me los guardo con cargo de conciencia sustentable. Chau.",
          "Diego Maradona": "¡GOLAZO del Diego, papa! Pusiste el vuelto clavado al ángulo de la caja. Te abrazo con alma de campeón, la pelota y la registradora no se manchan jamás en la vida."
        };

        setSaleResult({
          success: true,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: changeToReturn,
          client_reaction: successReactions[active.name] || "¡Bien cobrado pibe! Una transacción impecable."
        });
        setKiosqueroComment("Listo maestro. Un billete más al cajón de chapa. Siguiente en fila por favor.");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Trato aprobado. Suman +100 puntos y $${parsedPriceCharged} a la caja.`]);

      } else {
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        
        let failDialogue = "¡Hiciste cualquier cuenta comercial! Vas a fundir el almacén en dos semanas flaco.";
        if (!isProductMatch) {
          failDialogue = `¡Pero te pedí un ${active.requested_product} y me estás encajando un ${resolvedProductKey}! ¡Ponete los lentes de contacto, fiera!`;
        } else if (!isPriceCorrect) {
          failDialogue = `¡Pará la mano carero! Me registrás $${parsedPriceCharged} pero en la cartela oficial dice clarito que sale $${currentProductPrice}. ¡No me robes!`;
        } else if (!isAgeVerifiedOk) {
          failDialogue = `¡Epa, irresponsable! Me estás queriendo encajar tabaco/alcohol sin pedirme el documento de identidad obligatorio. ¡Te clausuran el local en cinco minutos!`;
        }

        setSaleResult({
          success: false,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: failDialogue
        });
        setKiosqueroComment("La cabeza me taladra con el calor porteño... hoy no es mi tarde decididamente.");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Trato declinado. Descuenta -50 puntos por error grave de facturación.`]);
      }
      return;
    }

    playSound("error");
    setCustomConsoleLog(prev => [...prev, `[SISTEMA] Sintaxis de comando desconocida. Usá los atajos de botones rápidos en la pantalla.`]);
  };

  const handleNextClient = () => {
    playSound("bell");
    setSaleResult(null);
    setIsDniCheckedThisTurn(false);
    setKiosqueroComment(null);

    // Pick next celebrity sequentially
    const nextIdx = (activeClientIndex + 1) % GAME_CLIENTS.length;
    setActiveClientIndex(nextIdx);

    // Give visual animation nudge to Three.js mesh card
    if (activeMeshRef.current) {
      activeMeshRef.current.position.y = -2; // drop and bounce up
    }
  };

  const handleRestart = () => {
    playSound("cash");
    setPoints(0);
    setCash(5000);
    setSalesCount(0);
    setTimeOfDay("mañana");
    setStock({
      "Coca-Cola": 10,
      Fanta: 10,
      Agua: 10,
      Cerveza: 10,
      Vino: 10,
      Marlboro: 10,
      Camel: 10,
      "Lucky Strike": 10,
      Alfajor: 10,
      Chicles: 10,
      Pastillas: 10,
      Chupetín: 10,
      Chocolate: 10
    });
    setActiveClientIndex(Math.floor(Math.random() * GAME_CLIENTS.length));
    setIsDniCheckedThisTurn(false);
    setKiosqueroComment(null);
    setSaleResult(null);
    setCustomConsoleLog(["[SISTEMA] Simulación reajustada. Caja en $5000 y estanterías recargadas."]);
  };

  // Setup THREE.js 3D View Scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0c0a09"); // stone-950 dark base
    sceneRef.current = scene;

    // Camera setup (first person behind the cashier counter)
    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.8, 4.2); // raised looking down
    camera.lookAt(0, 1.1, 0);

    // Renderer matching high-res window
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight, false);
    renderer.shadowMap.enabled = true;

    // Ambient light - changes depending on time of day
    const ambient = new THREE.AmbientLight("#44403c", 1.2);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    // Directional sunset/sunrise sun
    const dirLight = new THREE.DirectionalLight("#fbbf24", 2.2); // warm gold sun
    dirLight.position.set(4, 3, 2);
    dirLight.castShadow = true;
    scene.add(dirLight);
    directionalLightRef.current = dirLight;

    // Dynamic neon colored lights for Night Mode
    const neonRed = new THREE.PointLight("#ef4444", 0, 8);
    neonRed.position.set(-2, 2.5, 0.5);
    scene.add(neonRed);

    const neonBlue = new THREE.PointLight("#3b82f6", 0, 8);
    neonBlue.position.set(2, 2.5, 0.5);
    scene.add(neonBlue);

    neonLightsRef.current = [neonRed, neonBlue];

    // Build the 3D KIOSK ENVIRONMENT using standard primitives with colors:
    
    // 1. BACK WALL with Tobacco Rack
    const wallGeo = new THREE.BoxGeometry(7, 4, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: "#1c1917", roughness: 0.95 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 2, -1.2);
    scene.add(wallMesh);

    // Tobacco rack shelves on back wall
    const rackGeo = new THREE.BoxGeometry(2.5, 1.8, 0.35);
    const rackMat = new THREE.MeshStandardMaterial({ color: "#451a03", roughness: 0.9 }); // wood brown
    const rackMesh = new THREE.Mesh(rackGeo, rackMat);
    rackMesh.position.set(1.5, 2.2, -1.0);
    scene.add(rackMesh);

    // Stacks of colored 3D cigarette boxes in the rack
    const brands: { name: keyof Stock; color: string; offset: number }[] = [
      { name: "Marlboro", color: PRODUCT_COLORS["Marlboro"], offset: 0.7 },
      { name: "Camel", color: PRODUCT_COLORS["Camel"], offset: 1.5 },
      { name: "Lucky Strike", color: PRODUCT_COLORS["Lucky Strike"], offset: 2.3 }
    ];

    brands.forEach((brand, bIdx) => {
      for (let y = 0; y < 3; y++) {
        const boxGeo = new THREE.BoxGeometry(0.5, 0.35, 0.25);
        const boxMat = new THREE.MeshStandardMaterial({
          color: brand.color,
          roughness: 0.5,
          emissive: brand.color,
          emissiveIntensity: 0.1
        });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        // stack boxes neatly
        boxMesh.position.set(0.6 + bIdx * 0.61, 1.6 + y * 0.45, -0.85);
        scene.add(boxMesh);
      }
    });

    // 2. RETRO HELADERA (Beverages Refrigerator) on Left Wall side
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(-2, 0, -0.5);

    // fridge chassis
    const bodyGeo = new THREE.BoxGeometry(1.4, 2.8, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: "#bc1a1a", roughness: 0.4 }); // red classic fridge
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 1.4, 0);
    fridgeGroup.add(bodyMesh);

    // glowing interior backing
    const interiorGeo = new THREE.BoxGeometry(1.2, 2.5, 0.4);
    const interiorMat = new THREE.MeshStandardMaterial({
      color: "#ecfeff", // white backlight
      emissive: "#a5f3fc",
      emissiveIntensity: 0.25
    });
    const interiorMesh = new THREE.Mesh(interiorGeo, interiorMat);
    interiorMesh.position.set(0, 1.4, 0.4);
    fridgeGroup.add(interiorMesh);

    // translucent glass doors
    const glassGeo = new THREE.BoxGeometry(1.15, 2.4, 0.05);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#38bdf8",
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 1.4, 0.61);
    fridgeGroup.add(glassMesh);

    // Dynamic 3D bottles sitting on fridge shelves
    const drinks: { name: keyof Stock; color: string; shelfY: number; shelfX: number }[] = [
      { name: "Coca-Cola", color: PRODUCT_COLORS["Coca-Cola"], shelfY: 2.1, shelfX: -0.3 },
      { name: "Coca-Cola", color: PRODUCT_COLORS["Coca-Cola"], shelfY: 2.1, shelfX: 0.3 },
      { name: "Fanta", color: PRODUCT_COLORS["Fanta"], shelfY: 1.5, shelfX: -0.3 },
      { name: "Fanta", color: PRODUCT_COLORS["Fanta"], shelfY: 1.5, shelfX: 0.3 },
      { name: "Agua", color: PRODUCT_COLORS["Agua"], shelfY: 0.9, shelfX: -0.4 },
      { name: "Cerveza", color: PRODUCT_COLORS["Cerveza"], shelfY: 0.9, shelfX: 0.1 },
      { name: "Vino", color: PRODUCT_COLORS["Vino"], shelfY: 0.4, shelfX: 0 }
    ];

    drinks.forEach((drink) => {
      const btlGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8);
      const btlMat = new THREE.MeshStandardMaterial({
        color: drink.color,
        roughness: 0.2,
        emissive: drink.color,
        emissiveIntensity: 0.2
      });
      const btlMesh = new THREE.Mesh(btlGeo, btlMat);
      // Place inside the cooling space
      btlMesh.position.set(drink.shelfX, drink.shelfY, 0.45);
      fridgeGroup.add(btlMesh);
    });

    scene.add(fridgeGroup);

    // 3. FRONT KIOSQUERO WOODEN COUNTER (Foreground stage looking out)
    const counterGeo = new THREE.BoxGeometry(6.5, 1.1, 1.7);
    const counterMat = new THREE.MeshStandardMaterial({ color: "#292524", roughness: 0.85 }); // dark stone/wood counter
    const counterMesh = new THREE.Mesh(counterGeo, counterMat);
    counterMesh.position.set(0, 0.55, 1.9);
    scene.add(counterMesh);

    // 4. RETRO CASH REGISTER on our Counter (Chunky box with a glowing display cylinder)
    const regGroup = new THREE.Group();
    regGroup.position.set(-1.2, 1.1, 1.6);

    const regBodyGeo = new THREE.BoxGeometry(0.7, 0.5, 0.7);
    const regBodyMat = new THREE.MeshStandardMaterial({ color: "#57534e", roughness: 0.6 }); // vintage metal gray
    const regBody = new THREE.Mesh(regBodyGeo, regBodyMat);
    regGroup.add(regBody);

    // Register glowing tube price indicator
    const indicGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
    const indicMat = new THREE.MeshStandardMaterial({ color: "#22c55e", emissive: "#22c55e", emissiveIntensity: 0.8 }); // glowing green tube
    const indicator = new THREE.Mesh(indicGeo, indicMat);
    indicator.rotation.z = Math.PI / 2;
    indicator.position.set(0, 0.35, 0);
    regGroup.add(indicator);

    scene.add(regGroup);

    // 5. CARAMELERA DOBLE GLASS CONTAINER on right counter
    const caramGroup = new THREE.Group();
    caramGroup.position.set(1.4, 1.1, 1.6);

    const caramGlassGeo = new THREE.BoxGeometry(1.2, 0.65, 0.85);
    const caramGlass = new THREE.Mesh(caramGlassGeo, glassMat);
    caramGroup.add(caramGlass);

    // Tiny colorful sweet box shapes inside carameleras
    const sweetItems: { color: string; px: number; py: number; pz: number }[] = [
      { color: PRODUCT_COLORS["Alfajor"], px: -0.4, py: -0.2, pz: 0.1 },
      { color: PRODUCT_COLORS["Alfajor"], px: -0.2, py: -0.2, pz: 0.1 },
      { color: PRODUCT_COLORS["Chicles"], px: 0.1, py: -0.2, pz: 0.2 },
      { color: PRODUCT_COLORS["Pastillas"], px: 0.3, py: -0.2, pz: 0.2 },
      { color: PRODUCT_COLORS["Chocolate"], px: -0.3, py: 0.1, pz: 0 },
      { color: PRODUCT_COLORS["Chupetín"], px: 0.2, py: 0.1, pz: -0.1 }
    ];

    sweetItems.forEach((itm) => {
      const sweetGeo = new THREE.BoxGeometry(0.16, 0.12, 0.22);
      const sweetMat = new THREE.MeshStandardMaterial({ color: itm.color, roughness: 0.4 });
      const m = new THREE.Mesh(sweetGeo, sweetMat);
      m.position.set(itm.px, itm.py, itm.pz);
      caramGroup.add(m);
    });

    scene.add(caramGroup);

    // FLOOR
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({ color: "#1c1917", roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // 6. CLIENT PORTRAIT BILLBOARD HOLDER
    // Created as a group that floats behind the center of the counter
    const clientGroup = new THREE.Group();
    clientGroup.position.set(0, 1.45, 0.2); // center stage
    scene.add(clientGroup);
    activeMeshRef.current = clientGroup;

    // Inside customer billboard we construct a beautifully designed caricature board
    const billboardCardGeo = new THREE.BoxGeometry(1.6, 2.0, 0.12);
    const billboardCardMat = new THREE.MeshStandardMaterial({
      color: "#f59e0b", // glowing golden backdrop border
      roughness: 0.5,
      metalness: 0.2,
      emissive: "#ea580c",
      emissiveIntensity: 0.1
    });
    const billboardCard = new THREE.Mesh(billboardCardGeo, billboardCardMat);
    clientGroup.add(billboardCard);

    // Interactive circular head model structure with colorful chibi background
    const headBoardGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 16);
    const headBoardMat = new THREE.MeshStandardMaterial({ color: "#fef3c7" });
    const headBoard = new THREE.Mesh(headBoardGeo, headBoardMat);
    headBoard.rotation.x = Math.PI / 2;
    headBoard.position.set(0, 0.45, 0.08);
    clientGroup.add(headBoard);

    // Companion accessory meshes (e.g. Maradona's revolving soccer ball or Fort's dollar signs)
    const accessoryGroup = new THREE.Group();
    accessoryGroup.position.set(0.9, -0.2, 0.1);
    clientGroup.add(accessoryGroup);

    const companionGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const companionMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.2 });
    const companionMesh = new THREE.Mesh(companionGeo, companionMat);
    accessoryGroup.add(companionMesh);

    // Little floating text mesh simulated boxes
    const quoteGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const quoteMat = new THREE.MeshStandardMaterial({ color: "#fbbf24", emissive: "#fbbf24", emissiveIntensity: 0.4 });
    const quoteMesh = new THREE.Mesh(quoteGeo, quoteMat);
    quoteMesh.position.set(-1.0, 0.5, 0);
    clientGroup.add(quoteMesh);

    // Raycast Interaction: Mouse clicking on elements inside Three.js Scene handles quick selections
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      // Calculate coordinates relative to canvas
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find if they clicked the Refrigerator area
        const clickedName = intersects[0].object.name || "";
        // Toggle look/feedback
        playSound("click");
      }
    };

    renderer.domElement.addEventListener("click", handleCanvasClick);

    // Animation Tick loop
    let requestID: number;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      requestID = requestAnimationFrame(animateLoop);

      const elapsed = clock.getElapsedTime();

      // Slow idle rotation of client quote boxes
      quoteMesh.rotation.y = elapsed * 1.5;
      quoteMesh.rotation.x = Math.sin(elapsed) * 0.5;

      // Accessory rotates (soccer ball spins!)
      accessoryGroup.rotation.y = elapsed * 3.0;
      accessoryGroup.position.y = -0.2 + Math.sin(elapsed * 5) * 0.1;

      // Adjust client bounce based on mood state
      const client = getActiveClient();
      if (clientGroup) {
        if (client.mood === "feliz") {
          clientGroup.position.y = 1.45 + Math.sin(elapsed * 7) * 0.15; // fast happy bounce
        } else if (client.mood === "dramatico") {
          clientGroup.position.y = 1.45 + Math.cos(elapsed * 3.5) * 0.25; // wide dramatic wave
          clientGroup.rotation.z = Math.sin(elapsed * 2) * 0.1;
        } else if (client.mood === "exigente") {
          clientGroup.position.y = 1.45 + Math.sin(elapsed * 12) * 0.05; // tiny frustrated jitter
        } else {
          clientGroup.position.y = 1.45 + Math.sin(elapsed * 2) * 0.04; // calm idle sway
          clientGroup.rotation.z = 0;
        }
      }

      // Render execution
      renderer.render(scene, camera);
    };

    animateLoop();

    // Resize Handler
    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    // Cleanup inside destroy loop
    return () => {
      cancelAnimationFrame(requestID);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [activeClientIndex]);

  // Adjust lights and color elements dynamically inside Three.js based on timeOfDay change
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Ambient color shift
    if (ambientLightRef.current) {
      if (timeOfDay === "mañana") {
        ambientLightRef.current.color.set("#44403c");
        ambientLightRef.current.intensity = 1.4;
      } else if (timeOfDay === "tarde") {
        ambientLightRef.current.color.set("#57534e");
        ambientLightRef.current.intensity = 1.8;
      } else {
        ambientLightRef.current.color.set("#1c1917");
        ambientLightRef.current.intensity = 0.6;
      }
    }

    // Golden sun directional shift
    if (directionalLightRef.current) {
      if (timeOfDay === "mañana") {
        directionalLightRef.current.color.set("#fbbf24");
        directionalLightRef.current.intensity = 2.5;
        directionalLightRef.current.position.set(4, 2, 2);
      } else if (timeOfDay === "tarde") {
        directionalLightRef.current.color.set("#fafaf9");
        directionalLightRef.current.intensity = 2.0;
        directionalLightRef.current.position.set(0.5, 5, 1);
      } else {
        directionalLightRef.current.color.set("#1e1b4b");
        directionalLightRef.current.intensity = 0.3;
      }
    }

    // Toggle glowing neon lights for Night
    const neonIntensity = timeOfDay === "noche" ? 3.0 : 0.0;
    neonLightsRef.current.forEach(light => {
      light.intensity = neonIntensity;
    });

  }, [timeOfDay]);

  const activeClient = getActiveClient();
  const currentPrice = PRODUCT_PRICES[activeClient.requested_product as keyof Stock];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* HUD HEADER */}
      <header className="bg-stone-900 border-b-4 border-amber-800 sticky top-0 z-25 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-950/80 p-2 rounded-xl border border-amber-600 shadow-md">
              <Store className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-amber-500 font-mono leading-none">
                EL KIOSCO 3D
              </h1>
              <p className="text-[10px] text-stone-400 font-semibold block uppercase tracking-widest mt-0.5">
                Simulador del Almacén Porteño • Vista en Primera Persona
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <Award className="w-5 h-5 text-yellow-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">🏆 REPUTACIÓN</span>
                <span className="text-sm font-bold text-yellow-300 font-mono">{points} pts</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">💵 CAJA TOTAL</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">${cash.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <Clock className="w-5 h-5 text-amber-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">🌅 HORA DEL TURNO</span>
                <span className="text-sm font-bold text-amber-400 font-sans uppercase">{timeOfDay} ({salesCount}/10 vtas)</span>
              </div>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-lg text-stone-400 hover:text-stone-100 transition cursor-pointer"
              title={isMuted ? "Activar Sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-1 px-3 text-xs bg-stone-800 hover:bg-red-950 hover:text-red-400 text-stone-400 rounded-md border border-stone-700 hover:border-red-900 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </header>

      {/* THREE.js CANVAS ARENA STAGE (First Person Perspective) */}
      <section className="relative w-full bg-stone-950 flex flex-col items-center justify-center border-b-2 border-stone-800">
        
        {/* Helper overlay hints to guide user */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 sm:flex-col text-xs space-y-1 bg-stone-900/90 border border-stone-800 p-3 rounded-lg max-w-sm pointer-events-none select-none">
          <span className="font-bold text-amber-400 uppercase tracking-wide block">👁️ VISTA PRIMERA PERSONA:</span>
          <p className="text-stone-300 text-[11px] leading-tight font-sans">
            Estás parado detrás del mostrador tradicional. Mirá de frente al famoso que entra por la puerta. Las heladeras para bebidas y carameleras dobles están a tu alcance inmediato.
          </p>
        </div>

        {/* Float 3D Mood Indicators */}
        <div className="absolute top-4 right-4 z-10 bg-stone-900/90 border border-stone-800 p-2 rounded-lg text-xs font-mono flex items-center gap-2 select-none">
          <span className="text-stone-400">Estado de {activeClient.name}:</span>
          <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${
            activeClient.mood === "feliz" ? "bg-emerald-950 text-emerald-400 animate-bounce" :
            activeClient.mood === "dramatico" ? "bg-pink-950 text-pink-400 animate-pulse" :
            activeClient.mood === "exigente" ? "bg-red-950 text-red-400" : "bg-blue-950 text-blue-400"
          }`}>
            {activeClient.mood}
          </span>
        </div>

        {/* THREEJS MASTER CANVAS RENDERING BOX */}
        <div className="w-full h-[52vh] sm:h-[58vh] relative overflow-hidden bg-black flex justify-center items-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair"
            id="threejs-canvas-store"
          />

          {/* Interactive 3D Billboard overlaid label HUD inside first-person look */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-15 bg-stone-950/95 p-3 rounded-2xl border-2 border-amber-600 flex items-center gap-3 shadow-2xl max-w-lg w-11/12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-950 to-amber-700 border border-amber-500 overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-extrabold text-xl select-none uppercase">
              {activeClient.name.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider block w-max">
                Cliente Activo en Mostrador
              </span>
              <p className="text-sm font-black text-white truncate leading-tight mt-0.5">
                {activeClient.name}
              </p>
              <p className="text-[11px] text-stone-300 leading-snug italic mt-0.5">
                "{activeClient.dialogue}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD GAMEPLAY CONTROLS & RESPONSE JSON */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE CONTROLLER (7 Cols) */}
        <section className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* CLIENT SPEECH BALLOON CARD CONTAINER */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-4 shadow-xl">
            <h3 className="text-stone-300 font-mono text-xs uppercase tracking-wider border-b border-stone-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>DIÁLOGO Y APARIENCIA COMICA DEL CLIENTE</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              
              <div className="md:col-span-2 space-y-2">
                <span className="text-stone-400 font-mono text-xs block">
                  <strong>Aspecto 3D de Caricatura:</strong>
                </span>
                <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/60 p-3 rounded-lg border border-stone-850">
                  {activeClient.appearance}
                </p>
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-500 italic block font-mono">
                    <strong>Pide:</strong> {activeClient.requested_product} (${currentPrice})
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className="text-[11px] text-stone-500 italic block font-mono">
                    <strong>Paga con:</strong> ${activeClient.pagaCon}
                  </span>
                </div>
              </div>

              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-900 flex flex-col space-y-2 text-center items-center justify-center relative select-none">
                <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-1.5 rounded font-mono uppercase tracking-widest leading-none">
                  ORDEN ACTIVA
                </span>
                
                <span className="text-xs text-stone-300">Producto solicitado:</span>
                <strong className="text-lg text-white font-serif uppercase tracking-tight">
                  {activeClient.requested_product}
                </strong>
                
                <span className="text-[11px] text-amber-400 font-mono font-bold">
                  Precio: ${currentPrice}
                </span>
              </div>

            </div>

            {/* AGE VERIFICATION DNI BUTTON */}
            {activeClient.requires_id && !isDniCheckedThisTurn && (
              <div className="bg-red-950/50 border-2 border-red-900 text-red-200 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between animate-pulse">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="bg-red-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono">
                    ADVERTENCIA DE MAYORÍA DE EDAD
                  </span>
                  <p className="text-xs leading-relaxed text-red-300 font-medium">
                    El producto solicitado (<strong>{activeClient.requested_product}</strong>) contiene alcohol o tabaco. ¡Tenés que exigir su DNI antes de facturar!
                  </p>
                </div>
                <button
                  id="action-demand-id"
                  onClick={() => processGameCommand("Pido DNI antes de vender alcohol o cigarros")}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-stone-950 font-black text-xs uppercase tracking-wider rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                >
                  💳 PEDIR DNI COBRANDO
                </button>
              </div>
            )}

            {isDniCheckedThisTurn && (
              <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
                <span className="bg-emerald-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded font-mono">DNI OK</span>
                <span>Edad validada. Ya podés vender sin arriesgarte a pérdidas de reputación de local.</span>
              </div>
            )}

            {/* AFTER TRANSACTION REPORT BLOCK */}
            {saleResult && (
              <div className={`p-4 rounded-xl border-2 shadow-lg space-y-2 animate-fade-in ${
                saleResult.success ? "bg-emerald-950/80 border-emerald-800 text-emerald-300" : "bg-red-950/80 border-red-800 text-red-300"
              }`}>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-extrabold text-sm uppercase">
                    RESOLUCIÓN DE LA VENTA EN CURSO:
                  </h4>
                </div>
                
                <p className="font-serif italic text-white text-xs leading-relaxed">
                  "{saleResult.client_reaction}"
                </p>

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-stone-800 text-[11px] font-mono select-none">
                  <div>
                    <span className="text-stone-500 block">COBRADO:</span>
                    <strong className="text-stone-200">${saleResult.amount_charged}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">PRECIO RECTO:</span>
                    <strong className="text-stone-200">${saleResult.correct_price}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">VUELTO ENTREGADO:</span>
                    <strong className="text-stone-200">${saleResult.change_given}</strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    id="action-advance-client"
                    onClick={handleNextClient}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:translate-y-0.5 text-stone-950 font-black text-xs uppercase tracking-widest rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    Atender próximo famoso ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DOCK BAR AND TRADING CONTROLS (QUICK ACTIONS FOR KIOSQUERO) */}
          <div className="bg-stone-900 rounded-xl border border-stone-850 p-4 space-y-4 shadow-md">
            <div>
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest block mb-2">
                🎮 PANEL DE VENDEDOR (Click rápido para interactuar con {activeClient.name}):
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Sale item at exact perfect price button */}
                <button
                  id="action-sell-perfect"
                  onClick={() => processGameCommand(`Vendo ${activeClient.requested_product} por $${currentPrice}`)}
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs uppercase p-3 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Vender {activeClient.requested_product} por ${currentPrice}</span>
                </button>

                {/* Overcharge Client (Rob) button */}
                <button
                  id="action-overcharge"
                  onClick={() => {
                    const wrongPrice = currentPrice + 400;
                    processGameCommand(`Vendo ${activeClient.requested_product} por $${wrongPrice}`);
                  }}
                  className="bg-stone-800 hover:bg-red-950 hover:text-red-300 text-stone-300 font-bold text-xs uppercase p-3 rounded-lg border border-stone-700 hover:border-red-900 transition active:scale-95 cursor-pointer"
                >
                  💸 Sobrecargar precio (${currentPrice + 400})
                </button>

                {/* Demand Document button */}
                <button
                  id="action-check-id-neutral"
                  onClick={() => processGameCommand("Pido DNI antes de vender alcohol o cigarros")}
                  className="bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold text-xs p-3 rounded-lg border border-stone-700 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  💳 Exigir DNI
                </button>

                {/* Out of Stock exception button */}
                <button
                  id="action-declare-no-stock"
                  onClick={() => processGameCommand("No tengo stock")}
                  className="bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold text-xs p-3 rounded-lg border border-stone-700 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  🚫 Declarar "No tengo stock"
                </button>

              </div>
            </div>

            {/* CLI Console prompt input form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              processGameCommand(commandInput);
            }} className="pt-2 border-t border-stone-800 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500 font-bold font-mono text-sm select-none">&gt;</span>
                <input
                  id="input-cmd-terminal"
                  type="text"
                  placeholder='O escribí manual: "Vendo Chocolate por $700", o "Pido DNI"'
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 pl-6 py-2.5 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600 text-xs sm:text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                id="btn-cmd-submit"
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold font-mono text-xs uppercase px-4 py-2.5 border border-stone-700 rounded-lg active:scale-95 transition cursor-pointer flex-shrink-0"
              >
                PROCESAR
              </button>
            </form>

            {/* Logger list */}
            <div className="h-24 bg-stone-950 rounded border border-stone-850 p-2 overflow-y-auto space-y-1 font-mono text-[10px] text-stone-500">
              {customConsoleLog.map((log, idx) => (
                <p key={idx} className={
                  log.includes("[SISTEMA]") ? "text-amber-500/80 font-bold" :
                  log.startsWith("> ") ? "text-stone-300" : "text-stone-500"
                }>
                  {log}
                </p>
              ))}
            </div>
          </div>

          {/* PRODUCTS STOCK CHECK GRID */}
          <div className="bg-stone-900 p-4 rounded-xl border border-stone-850 shadow-md">
            <h4 className="text-stone-300 font-mono text-xs uppercase tracking-wider mb-2 select-none">
              📦 REGISTRO DE STOCK FISICO EN KIOSCO 3D:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(stock).map(([prodName, qty]) => {
                const price = PRODUCT_PRICES[prodName as keyof Stock];
                const ageLimit = IS_ADULT_ONLY[prodName as keyof Stock];
                return (
                  <div key={prodName} className="bg-stone-950 p-2 rounded border border-stone-850 flex flex-col justify-between text-center select-none">
                    <span className="text-[11px] font-bold text-stone-200 truncate">{prodName}</span>
                    <span className="font-mono text-[10px] text-stone-500 font-medium block mt-0.5">${price}</span>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={`text-[9px] uppercase px-1 rounded font-black ${
                        ageLimit ? "bg-red-950 text-red-400" : "bg-stone-900 text-stone-500"
                      }`}>
                        {ageLimit ? "18+" : "Libre"}
                      </span>
                      <span className={`text-xs font-mono font-black ${qty === 0 ? "text-red-500 animate-pulse" : "text-amber-400"}`}>
                        Cant: {qty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: STRUCTURAL API LIVE JSON RESPONSES (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-xl flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="font-mono text-xs uppercase tracking-widest font-black text-amber-500">
                    Live JSON State Frame
                  </h3>
                </div>
                
                <button
                  id="btn-copy-live-json"
                  onClick={copyJSONToClipboard}
                  className="p-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 rounded transition flex items-center gap-1 text-[10px] cursor-pointer"
                  title="Copiar JSON de respuesta estructurado"
                >
                  {isCopySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopySuccess ? "¡Copiado!" : "Copiar JSON"}</span>
                </button>
              </div>

              <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 text-xs text-stone-400 flex items-start gap-2 select-none">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="font-sans leading-tight text-[10.5px]">
                  Abajo ves el frame de respuesta estructurado exacto que se genera turno a turno para el simulador interactivo de acuerdo a las pautas.
                </p>
              </div>

              {/* JSON code block render */}
              <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 overflow-auto max-h-[64vh] text-[10px] font-mono text-stone-300">
                <pre>{JSON.stringify(getGameStateJSON(), null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-500 leading-tight">
              🎮 <strong>Para interactuar desde el chat:</strong> Escribí tus comandos en español bajo las directivas. Por ejemplo: <strong className="text-stone-300">Vendo Alfajor por $600</strong> o <strong className="text-stone-300">Pido DNI antes de vender</strong>.
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-stone-900 border-t border-stone-800 py-3 px-4 text-center text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            Diseño: Kiosco 3D Primera Persona • El Kiosco 2026.
          </span>
          <span className="text-amber-500/80">
            A las 10 ventas cambia el turno (Tarde), a las 20 cambia el turno (Noche).
          </span>
        </div>
      </footer>
    </div>
  );
}
