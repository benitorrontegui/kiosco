import React, { useState, useEffect } from "react";
import {
  Store,
  Users,
  DollarSign,
  Award,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertOctagon,
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
  Info
} from "lucide-react";

// Types corresponding exactly to the user specification
export type TimeOfDay = "mañana" | "tarde" | "noche";

interface Client {
  name: string;
  appearance: string;
  entrance: string;
  dialogue: string;
  requires_id: boolean;
  requested_product: string;
  mood: "feliz" | "neutro" | "exigente" | "dramatico";
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

// Celebrity details
const GAME_CLIENTS: Client[] = [
  {
    name: "Mirtha Legrand",
    appearance: "Miniatura elegantísima de proporciones caricaturescas con rulitos plateados perfectamente lacados de volumen 3D, collar de perlas enorme y rictus exigente de conductora legendaria.",
    entrance: "Entra al almacén caminando despacito pero con erguida superioridad tridimensional, escoltada por un chofer imaginario que le abre paso.",
    dialogue: "¡Buenas tardes! ¿Este alfajor es verdaderamente artesanal? Traeme uno de chocolate, mi amor, y que esté a temperatura de cava. ¡Ojo que tengo ojos de lince en mi mesaza!",
    requires_id: false,
    requested_product: "Alfajor",
    mood: "exigente"
  },
  {
    name: "Susana Giménez",
    appearance: "Rubia exhuberante tridimensional con anteojos de sol negros gigantescos que tapan la mitad de su rostro, tapado de leopardo con volumen y labial carmín brillante.",
    entrance: "Llega tocando la puerta de vidrio del local mientras grita de emoción por haber encontrado un kiosco abierto.",
    dialogue: "¡Ay, hola che! Me vivo de sed por favor... Dame algo light, ¿este agua no tiene nada de sodio, no? ¡Ay, qué amoroso sos!",
    requires_id: false,
    requested_product: "Agua",
    mood: "feliz"
  },
  {
    name: "Ricardo Fort",
    appearance: "Fantasma musculoso recortado en rosa neón brillante con jopo perfecto de chocolate de 15cm, barba de candado ultra-detallada y tapado de zorro gris con pelaje modelado 3D.",
    entrance: "Aparece atravesando la puerta flotando pacíficamente rodeado de una estela dorada y ruidos de trompetas de Miami.",
    dialogue: "¡MAIAMEEE! ¡Chicos, cortaron toda la looz de la fábrica de chocolates! Exijo el chocolate más caro que tengas y una cerveza bien fría para mitigar el sofoco cósmico.",
    requires_id: true,
    requested_product: "Cerveza",
    mood: "dramatico"
  },
  {
    name: "Wanda Nara",
    appearance: "Cabello platinado lacio con profundidad y sombras 3D, uñas acrílicas extremadamente largas de color rosa flúo y campera de plumas importada de Europa.",
    entrance: "Entra al local hablando por videollamada a los gritos, firmando contratos para la televisión italiana antes de mirarte.",
    dialogue: "Hola, fiera. ¿Hacen canjes de publicidad en historias acá? Me llevo unos chicles masticables sabor mentol puro. Si preferís te pago, tengo tarjeta black.",
    requires_id: false,
    requested_product: "Chicles",
    mood: "neutro"
  },
  {
    name: "Marcelo Tinelli",
    appearance: "Sonrisa blanca impecable de carillas de porcelana resplandeciente, cuerpo Chibi con saco entallado negro con brillo satinado y un micrófono con tachas antiguos.",
    entrance: "Entra saltando en un pie, arengando a un público imaginario detrás de él mientras tira confeti plateado.",
    dialogue: "¡Buenas noches América! ¡Señoras y señores, hoy con el desafío de engullir este alfajor de un solo bocado! Dame uno ya, fiera.",
    requires_id: false,
    requested_product: "Alfajor",
    mood: "feliz"
  },
  {
    name: "L-Gante",
    appearance: "Gorra de visera plana perfectamente torcida de 45 grados, brackets dentales metálicos que chispean bajo los focos y cadenas macizas de oro Cumbia 420 fluyendo sobre ropa deportiva.",
    entrance: "Ingresa bailando un paso callejero mientras sostiene una botella de plástico cortada a la mitad.",
    dialogue: "¡Qué onda, pa! Cumbia 420 al toque con la Mafilia. Pasame un vino de carton místico de los fuertes para armar un viajero re piola con los pibes.",
    requires_id: true,
    requested_product: "Vino",
    mood: "neutro"
  },
  {
    name: "Juana Viale",
    appearance: "Silueta hippie-chic idéntica a Mirtha pero vestida en lino ecológico color crudo con trenzas de hilo rústico y pómulos esculpidos sumamente definidos en 3D.",
    entrance: "Entra de golpe con mirada altanera, analizando si hay tachas plásticas o si todo el almacén daña el ecosistema.",
    dialogue: "Buenas. Dame un paquete de cigarrillos Lucky Strike click y no me des bolsa de plástico porque es un atentado ambiental insoportable.",
    requires_id: true,
    requested_product: "Lucky Strike",
    mood: "exigente"
  },
  {
    name: "Diego Maradona",
    appearance: "Espíritu cósmico de rulos flotantes negros de 1986, arito brillante de diamante que destella pura elegancia y una pelota de cuero azteca adherida a su pie izquierdo.",
    entrance: "Entra flotando suavemente dominando el esférico de taco y hombro, lanzando besos al aire místico porteño.",
    dialogue: "Eeeeeeeee... fiera, ¿cómo andás? La pelota no se mancha, pa. Pasame el vino más noble que tengas para brindar por el pueblo.",
    requires_id: true,
    requested_product: "Vino",
    mood: "dramatico"
  }
];

export default function App() {
  // Gameplay states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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

  // Sound context references
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize first view
  useEffect(() => {
    // Pick first client at random
    const rand = Math.floor(Math.random() * GAME_CLIENTS.length);
    setActiveClientIndex(rand);
  }, []);

  const getActiveClient = (): Client => {
    return GAME_CLIENTS[activeClientIndex];
  };

  const getNextClientName = (): string | null => {
    // Give a small teaser hint or name of next client
    const nextIdx = (activeClientIndex + 1) % GAME_CLIENTS.length;
    return GAME_CLIENTS[nextIdx].name;
  };

  const getSceneDescription = (turn: TimeOfDay) => {
    switch (turn) {
      case "mañana":
        return "El sol amanece de costado iluminando con destellos cálidos los estantes polvorientos del almacén. El zumbido constante de la heladera de chapa resuena como un bajo profundo.";
      case "tarde":
        return "La resolana ardiente del mediodía se filtra por el toldo rojo gastado del local. Afuera se escucha el eco de bocinas porteñas e inspectores municipales apresurados frente a la caramelera doble.";
      case "noche":
        return "Carteles parpadeantes de neón rojo y azul iluminan el interior del local dibujando sombras nítidas y misteriosas sobre las botellas de vidrio heladas.";
    }
  };

  // Build the state JSON demanded by the user prompt
  const getGameStateJSON = (): GameStateJSON => {
    const active = getActiveClient();
    
    // Simple dry response from cashier
    let dryResponse = "Buenas tardes, ¿qué te doy?";
    if (saleResult) {
      dryResponse = saleResult.success ? "Impecable, gracias por la compra flaco." : "Uff... no sé qué pasó. Presta atención.";
    } else if (isDniCheckedThisTurn) {
      dryResponse = "Mirá que tengo cara de vigilante pero el documento es obligatorio.";
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

  // Copy JSON Utility
  const copyJSONToClipboard = () => {
    const jsonStr = JSON.stringify(getGameStateJSON(), null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setIsCopySuccess(true);
      setTimeout(() => setIsCopySuccess(false), 2000);
    });
  };

  // Play audio triggers
  const playSound = (type: "cash" | "error" | "click") => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      if (type === "cash") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.5);
      } else if (type === "error") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.4);
      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.06);
      }
    } catch(e) {}
  };

  // Process the command entered in terminal or clicked
  const processGameCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCustomConsoleLog(prev => [...prev, `> ${trimmed}`]);
    const cleanLower = trimmed.toLowerCase();
    const active = getActiveClient();
    const requestedStockKey = active.requested_product as keyof Stock;
    const currentProductPrice = PRODUCT_PRICES[requestedStockKey];

    // Determine how much the famous pays with
    let pagaCon = 1000;
    if (currentProductPrice > 2000) pagaCon = 5000;
    else if (currentProductPrice > 1000) pagaCon = 2000;
    else if (currentProductPrice > 500) pagaCon = 1000;
    else pagaCon = 500;

    // 1. "Pido DNI antes de vender alcohol o cigarros"
    if (cleanLower.includes("pido dni") || cleanLower.includes("dni") || cleanLower.includes("documento")) {
      setIsDniCheckedThisTurn(true);
      playSound("click");
      setKiosqueroComment("Te miro fijo de reojo... no abuses que soy un laburante cansado. Mostrame la tarjeta.");
      setCustomConsoleLog(prev => [...prev, `[SISTEMA] DNI de ${active.name} verificado correctamente.`]);
      setCommandInput("");
      return;
    }

    // 2. "No tengo stock"
    if (cleanLower.includes("no tengo stock") || cleanLower.includes("no hay stock") || cleanLower.includes("sin stock")) {
      setCommandInput("");
      const currentResStock = stock[requestedStockKey];
      if (currentResStock === 0) {
        // Correct dismiss! Player gets small point bonus or stays neutral
        playSound("cash");
        setPoints(p => p + 20);
        setKiosqueroComment("No me mires con esa cara de drama, la aduana no me entrega mercadería. Volvé mañana.");
        setSaleResult({
          success: true,
          amount_charged: 0,
          correct_price: 0,
          change_given: 0,
          client_reaction: `¡Ay qué bajón! Bueno che, me voy a buscarlo a otro lado. ${active.name} ladea la cabeza con rictus de resignación porteña.`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Licencia de faltante aceptada. Sin pérdidas.`]);
      } else {
        // Punish player because there is stock!
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        setKiosqueroComment("Pero qué vago de porquería... ¡si tenés el estante lleno!");
        setSaleResult({
          success: false,
          amount_charged: 0,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: `¡Dejate de joder che, si veo el escaparate lleno de ${active.requested_product}! ${active.name} te mira con desprecio absoluto por tu vagancia.`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Intento de mentir stock fallido. Penalización de 50 puntos.`]);
      }
      return;
    }

    // 3. "Vendo [producto] por $[precio]"
    // Regex parsing "Vendo ... por $..."
    const sellRegex = /vendo\s+([a-zA-Z\-\s]+)\s+por\s+\$?([0-9]+)/i;
    const match = trimmed.match(sellRegex);

    if (match) {
      setCommandInput("");
      const matchedProd = match[1].trim().toLowerCase();
      const parsedPriceCharged = parseInt(match[2], 10);

      // Find actual product key corresponding to matched name
      const actualProductKey = Object.keys(PRODUCT_PRICES).find(
        k => k.toLowerCase() === matchedProd || (k === "Coca-Cola" && matchedProd.includes("coca"))
      ) as keyof Stock | undefined;

      if (!actualProductKey) {
        playSound("error");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Error: Producto "${match[1]}" no reconocido. Intentá de nuevo.`]);
        return;
      }

      // Check stock
      if (stock[actualProductKey] <= 0) {
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        setSaleResult({
          success: false,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: `¡Pero che! Me decís que me vendés, estirás la mano y la caramelera está vacía... ¡No tenés stock de ${actualProductKey}!`
        });
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Venta fallida. Intentaste vender un producto sin stock.`]);
        return;
      }

      // Checks logic:
      // a. Is it the product requested?
      const isProductMatch = actualProductKey.toLowerCase() === requestedStockKey.toLowerCase();
      
      // b. Is the price correct?
      const isPriceCorrect = parsedPriceCharged === currentProductPrice;

      // c. Is DNI required and verified?
      const isAgeVerifiedOk = !active.requires_id || isDniCheckedThisTurn;

      const isSuccess = isProductMatch && isPriceCorrect && isAgeVerifiedOk;

      const changeToReturn = pagaCon - parsedPriceCharged;

      if (isSuccess) {
        playSound("cash");
        // Subtract stock
        setStock(prev => ({
          ...prev,
          [actualProductKey]: prev[actualProductKey] - 1
        }));
        setPoints(p => p + 100);
        setCash(c => c + parsedPriceCharged);
        setSalesCount(s => s + 1);

        // Advance Time of Day dynamically based on sales count
        let nextTurn = timeOfDay;
        if (salesCount + 1 >= 10 && salesCount + 1 < 20) {
          nextTurn = "tarde";
        } else if (salesCount + 1 >= 20) {
          nextTurn = "noche";
        }
        setTimeOfDay(nextTurn);

        // Visual Reaction Success fallbacks
        const reactions: Record<string, string> = {
          "Mirtha Legrand": "¡Maravilloso, mi amor! Sos muy rápido y sumamente educado... Como te ven te tratan, recordalo siempre. ¡Me llevo mi Alfajor calentito!",
          "Susana Giménez": "¡Ay, hola che! Qué divino, acá tengo mi agüita fría para arrancar el programa del domingo, ¡Sos un sol de persona, te mando un choclo de besos!",
          "Ricardo Fort": "¡SÍ! ¡Eso es eficiencia de primer nivel mundial, pibe de barrio! Comé chocolate y andá a Miami. ¡Te dejo el jaguar estacionado en la vereda!",
          "Wanda Nara": "¡Espectacular canje! Mentira, te pagué con tarjeta black como corresponde. Sos un genio re buena onda, te ganaste una mención en mi feed de Instagram.",
          "Marcelo Tinelli": "¡Impecable fiera! ¡Chau chau chau chauuuu! El alfajor ya está adentro, el camarógrafo está tentado. ¡Sos un maestro nacional del comercio!",
          "L-Gante": "¡Al toque gato! Vuelto exacto para el fernet de la previa con los muchachos del club. Cumbia 420 para que baile todo el almacén, genio.",
          "Juana Viale": "Bueno, al menos me atendiste rápido y no usamos plásticos. Los cigarrillos me los guardo con cargo de conciencia biodegradable. Chau.",
          "Diego Maradona": "¡GOLAZO del Diego, papa! Metiste la cuenta en el ángulo puro. Te abrazo con alma de campeón, la pelota y la caja registradora no se manchan jamas."
        };

        setSaleResult({
          success: true,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: changeToReturn,
          client_reaction: reactions[active.name] || "¡Bien cobrado flaco! Un servicio espectacular."
        });
        setKiosqueroComment("Bajo las persianas un ratito para enfriar las cervezas... impecable el billete.");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Venta aprobada. Suman 100 puntos y $${parsedPriceCharged} a la caja.`]);

      } else {
        playSound("error");
        setPoints(p => Math.max(0, p - 50));
        
        let errorReaction = "¡Hiciste cualquier cosa! Así vas a fundir este kiosco de barrio.";
        if (!isProductMatch) {
          errorReaction = `¡Pero yo te pedí un ${active.requested_product} y me estás encajando un ${actualProductKey}! ¡Ponete los lentes de contacto, fiera!`;
        } else if (!isPriceCorrect) {
          errorReaction = `¡Pará la mano carero! Registraste $${parsedPriceCharged} pero en la cartela oficial dice clarito que sale $${currentProductPrice}. ¡No me robes!`;
        } else if (!isAgeVerifiedOk) {
          errorReaction = `¡Ey irresponsable! Me estás vendiendo alcohol/cigarrillos para mayores sin pedirme el documento de identidad. ¡Te van a clausurar de por vida!`;
        }

        setSaleResult({
          success: false,
          amount_charged: parsedPriceCharged,
          correct_price: currentProductPrice,
          change_given: 0,
          client_reaction: errorReaction
        });
        setKiosqueroComment("Uf... qué dolor de cabeza, hoy no es mi día de suerte definitivamente.");
        setCustomConsoleLog(prev => [...prev, `[SISTEMA] Venta rechazada. Descuentan 50 puntos por error comercial.`]);
      }
      return;
    }

    // Default error syntax fallback
    playSound("error");
    setCustomConsoleLog(prev => [...prev, `[SISTEMA] Formato inválido. Escribí exactamente comando como "Vendo ${active.requested_product} por $${currentProductPrice}"`]);
  };

  const handleNextClient = () => {
    playSound("click");
    setSaleResult(null);
    setIsDniCheckedThisTurn(false);
    setKiosqueroComment(null);

    // Pick next celebrity
    const nextIdx = (activeClientIndex + 1) % GAME_CLIENTS.length;
    setActiveClientIndex(nextIdx);
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
    setCustomConsoleLog(["[SISTEMA] Kiosco reabierto con $5000 de caja base y heladeras llenas."]);
  };

  const activeClient = getActiveClient();
  const currentPrice = PRODUCT_PRICES[activeClient.requested_product as keyof Stock];

  // Helper values for payment UI computation
  let calculatedPayerBill = 1000;
  if (currentPrice > 2000) calculatedPayerBill = 5000;
  else if (currentPrice > 1000) calculatedPayerBill = 2000;
  else if (currentPrice > 500) calculatedPayerBill = 1000;
  else calculatedPayerBill = 500;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* HUD Top bar */}
      <header className="bg-stone-950 border-b-4 border-amber-800 sticky top-0 z-20 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-950/80 p-2 rounded-xl border border-amber-600 shadow-md">
              <Store className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-amber-500 font-mono leading-none">
                EL KIOSCO
              </h1>
              <p className="text-[10px] text-stone-400 font-semibold block uppercase tracking-widest mt-0.5">
                Almacén Porteño • Simulación Turno a Turno
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <Award className="w-5 h-5 text-yellow-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">🏆 PUNTOS</span>
                <span className="text-sm font-bold text-yellow-300 font-mono">{points}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">💵 CAJA KIOSCO</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">${cash.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 shadow-inner">
              <Clock className="w-5 h-5 text-amber-400" />
              <div className="leading-none">
                <span className="text-[10px] text-stone-400 block font-mono uppercase">🌅 TURNO</span>
                <span className="text-sm font-bold text-amber-400 font-sans uppercase">{timeOfDay} ({salesCount}/10 ventas)</span>
              </div>
            </div>

            {/* Audio configuration toggling */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-755 rounded-lg text-stone-400 hover:text-stone-100 transition cursor-pointer"
              title={isMuted ? "Activar Sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-1 px-3 text-xs bg-stone-800 hover:bg-red-950 hover:text-red-400 text-stone-400 rounded-md border border-stone-700 hover:border-red-900 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recomenzar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Dashboard layout splits into simulation visual and state code output */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Visual Arena & Game Console Input (7 cols) */}
        <section className="xl:col-span-7 space-y-6 flex flex-col">
          
          {/* Ambient Scene Banner */}
          <div className="bg-stone-950 p-4 border-l-4 border-amber-600 rounded-r-xl shadow-inner select-none flex items-center gap-3">
            <span className="text-3xl animate-bounce">🏪</span>
            <div>
              <span className="text-[10px] bg-amber-950 text-amber-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono block w-max">
                ESCENARIO 3D INTERIOR
              </span>
              <p className="text-xs sm:text-sm text-stone-300 italic font-mono mt-0.5">
                "{getSceneDescription(timeOfDay)}"
              </p>
            </div>
          </div>

          {/* ACTIVE CELEBRITY COMIC AREA CARD */}
          <div className="bg-stone-950 rounded-2xl border-2 border-stone-800 shadow-2xl overflow-hidden p-6 flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">LIVE MOTOR</span>
            </div>

            {/* Character Header containing look like render */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-850">
              <div className="w-20 h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-700 flex items-center justify-center text-4xl relative overflow-hidden select-none flex-shrink-0 shadow-inner">
                {activeClient.name.charAt(0)}
                {activeClient.requires_id && (
                  <span className="absolute bottom-1 right-1 text-xs bg-red-600 text-white rounded font-black font-mono px-1 border border-white">
                    18+
                  </span>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] bg-amber-50 text-amber-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  GTA Chibi Proporciones 3D
                </span>
                <h2 className="text-xl font-black text-white uppercase font-sans tracking-tight">
                  {activeClient.name}
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed font-sans font-medium">
                  <strong>Aspecto:</strong> {activeClient.appearance}
                </p>
                <p className="text-[10.5px] text-stone-500 italic leading-none font-sans mt-1">
                  <strong>Arribo:</strong> {activeClient.entrance}
                </p>
              </div>
            </div>

            {/* Spech bubble character */}
            <div className="relative py-2 max-w-full select-none">
              <div className="bg-white text-stone-950 p-5 rounded-3xl relative border-4 border-stone-950 shadow-2xl max-w-lg mx-auto">
                <div className="absolute w-5 h-5 bg-white border-b-4 border-r-4 border-stone-950 rotate-45 -bottom-2.5 left-10" />
                <span className="text-[10px] block font-mono font-black text-amber-600 uppercase tracking-widest mb-1">
                  {activeClient.name} grita:
                </span>
                <p className="text-sm font-sans font-black leading-relaxed text-stone-900">
                  "{activeClient.dialogue}"
                </p>
                <div className="mt-3 pt-2.5 border-t border-stone-200 flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
                  <span className="font-mono uppercase font-bold text-[10px]">Petición:</span>
                  <span className="bg-stone-100 text-stone-950 font-black px-2 py-0.5 rounded border border-stone-200 uppercase tracking-wide">
                    {activeClient.requested_product}
                  </span>
                  <span className="font-mono font-bold">(${currentPrice})</span>
                  
                  <span className="mx-1">•</span>
                  <span className="font-mono uppercase font-bold text-[10px]">Ofrece:</span>
                  <span className="bg-emerald-50 text-emerald-800 font-mono font-bold px-1.5 rounded">
                    ${calculatedPayerBill}
                  </span>
                </div>
              </div>
            </div>

            {/* DNI Alert Box conditional */}
            {activeClient.requires_id && !isDniCheckedThisTurn && (
              <div className="bg-red-950/60 border border-red-900 text-red-300 p-3 rounded-lg text-xs leading-relaxed font-semibold flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 text-red-500 animate-spin flex-shrink-0" />
                <div>
                  <span className="font-mono font-black uppercase text-red-400 block">🛑 CONTROL OBLIGATORIO DE DNI</span>
                  Lleva cerveza o tabaco. Si vendés sin apretar "Pedir DNI/exigir", fallará la venta y perderás reputación.
                </div>
              </div>
            )}

            {isDniCheckedThisTurn && (
              <div className="bg-blue-950/60 border border-blue-900 text-blue-300 p-3 rounded-lg text-xs leading-relaxed font-semibold flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-400 animate-bounce flex-shrink-0 animate-pulse" />
                <div>
                  <span className="font-mono font-black uppercase text-blue-400 block">✓ DNI VERIFICADO</span>
                  Documentación del famoso chequeada correctamente. Ya podés realizar la venta sin miedo a que te claven multa.
                </div>
              </div>
            )}

            {/* Kiosquero dry reaction comment */}
            {kiosqueroComment && (
              <div className="bg-stone-900 p-3 rounded-lg border border-stone-850 text-xs text-stone-400">
                💬 <strong className="text-amber-500">Comentario del kiosquero porteño:</strong> "{kiosqueroComment}"
              </div>
            )}

            {/* AFTER SALE RESOLUTION DISPLAY (If resolution happens) */}
            {saleResult && (
              <div className={`p-4 rounded-xl border-2 shadow-lg space-y-2 animate-fade-in ${
                saleResult.success ? "bg-emerald-950/80 border-emerald-800 text-emerald-300" : "bg-red-950/80 border-red-800 text-red-300"
              }`}>
                <div className="flex items-center gap-2">
                  {saleResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />
                  )}
                  <h4 className="font-black text-sm uppercase">
                    RESOLUCIÓN DE LA TRANSACCIÓN:
                  </h4>
                </div>
                
                <p className="font-serif italic text-white text-xs leading-relaxed">
                  "{saleResult.client_reaction}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-900 text-[11px] font-mono">
                  <div>
                    <span className="text-stone-500 block">COBRADO:</span>
                    <strong className="text-stone-200">${saleResult.amount_charged}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">PRECIO RECTO:</span>
                    <strong className="text-stone-200">${saleResult.correct_price}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">VUELTO DADO:</span>
                    <strong className="text-stone-200">${saleResult.change_given}</strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-next-client"
                    onClick={handleNextClient}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:translate-y-0.5 text-stone-950 font-black text-xs uppercase tracking-wider rounded-md transition cursor-pointer"
                  >
                    Atender siguiente famoso ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE INPUT CONTROL TERMINAL & COMMAND SHORTCUTS */}
          <div className="bg-stone-950 rounded-xl border border-stone-850 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-900 pb-2">
              <div className="flex items-center gap-2 text-stone-300 font-mono text-xs">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>TERMINAL DEL ALMACENERO (INPUT COMMANDS)</span>
              </div>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono select-none">
                SIM ENGINE v1.2
              </span>
            </div>

            {/* Console Log window */}
            <div className="h-28 bg-stone-900/85 rounded border border-stone-850 p-2 overflow-y-auto space-y-1 font-mono text-[11px] text-stone-400">
              <p className="text-stone-600 italic">// Consola del simulador. El motor procesa comandos aquí.</p>
              {customConsoleLog.map((log, idx) => (
                <p key={idx} className={
                  log.includes("[SISTEMA]") ? "text-amber-500/90 font-semibold" :
                  log.startsWith("> ") ? "text-stone-200" : "text-stone-400"
                }>
                  {log}
                </p>
              ))}
            </div>

            {/* Autocomplete Quick Assist Shortcuts */}
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wider block mb-1.5 select-none">
                💡 Atajos rápidos - Hacé clic para rellenar & ejecutar comando:
              </span>
              
              <div className="flex flex-wrap gap-1.5 text-xs">
                {/* 1. Demand ID */}
                <button
                  id="shortcut-check-id"
                  onClick={() => {
                    setCommandInput("Pido DNI antes de vender alcohol o cigarros");
                    playSound("click");
                  }}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-800 p-1.5 rounded cursor-pointer transition text-[11px] text-stone-300"
                >
                  💳 Pido DNI
                </button>

                {/* 2. No Stock */}
                <button
                  id="shortcut-no-stock"
                  onClick={() => {
                    setCommandInput("No tengo stock");
                    playSound("click");
                  }}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-800 p-1.5 rounded cursor-pointer transition text-[11px] text-stone-300"
                >
                  🚫 No tengo stock
                </button>

                {/* 3. Sell Correctly */}
                <button
                  id="shortcut-sell-correct"
                  onClick={() => {
                    setCommandInput(`Vendo ${activeClient.requested_product} por $${currentPrice}`);
                    playSound("click");
                  }}
                  className="bg-amber-950/60 hover:bg-amber-900 border border-amber-800 p-1.5 rounded text-amber-300 font-bold cursor-pointer transition text-[11px]"
                >
                  🚀 Vender producto (Precio Justo)
                </button>

                {/* 4. Sell with wrong price (rob them) */}
                <button
                  id="shortcut-sell-carero"
                  onClick={() => {
                    const priceCarero = currentPrice + 500;
                    setCommandInput(`Vendo ${activeClient.requested_product} por $${priceCarero}`);
                    playSound("click");
                  }}
                  className="bg-red-950/50 hover:bg-red-900/60 border border-red-950 p-1.5 rounded text-red-300 cursor-pointer transition text-[11px]"
                >
                  💸 Sobrecargar (Carero)
                </button>
              </div>
            </div>

            {/* Command terminal input form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              processGameCommand(commandInput);
            }} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500 font-bold font-mono text-sm select-none">&gt;</span>
                <input
                  id="input-terminal-command"
                  type="text"
                  placeholder='Escribí "Vendo Alfajor por $600" o "Pido DNI antes de vender..."'
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 pl-6 py-2 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-600 text-xs sm:text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                id="btn-submit-command"
                className="bg-amber-600 hover:bg-amber-700 text-stone-950 font-black font-mono text-xs uppercase px-4 py-2.5 rounded-lg active:scale-95 transition cursor-pointer flex-shrink-0"
              >
                PROCESAR
              </button>
            </form>
          </div>

          {/* STOCK GRID */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-850">
            <h3 className="text-stone-300 font-mono text-xs uppercase tracking-wider mb-2 select-none">
              📦 ESTANTES DE MERCADERÍA EN TIENDA (STOCK RESTANTE):
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(stock).map(([prodName, qty]) => {
                const price = PRODUCT_PRICES[prodName as keyof Stock];
                const ageLimit = IS_ADULT_ONLY[prodName as keyof Stock];
                return (
                  <div key={prodName} className="bg-stone-900 p-2 rounded border border-stone-850 flex flex-col justify-between text-center select-none">
                    <span className="text-[11px] font-bold text-stone-200 truncate">{prodName}</span>
                    <span className="font-mono text-[10px] text-stone-500 font-medium block mt-0.5">${price}</span>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={`text-[9px] uppercase px-1 rounded font-black ${
                        ageLimit ? "bg-red-950 text-red-400" : "bg-stone-950 text-stone-500"
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

        {/* RIGHT COLUMN: Formal Live JSON output viewer requested (5 cols) */}
        <section className="xl:col-span-5 flex flex-col space-y-4">
          <div className="bg-stone-950 p-4 rounded-2xl border-2 border-stone-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-900 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="font-mono text-xs uppercase tracking-widest font-black text-amber-500 flex items-center gap-1.5">
                    Live JSON State Frame
                  </h3>
                </div>
                <button
                  id="btn-copy-json"
                  onClick={copyJSONToClipboard}
                  className="p-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 rounded transition flex items-center gap-1 text-[10px] cursor-pointer"
                  title="Copiar JSON de respuesta estructurado"
                >
                  {isCopySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopySuccess ? "¡Copiado!" : "Copiar JSON"}</span>
                </button>
              </div>

              <div className="bg-stone-900/40 p-2 rounded-lg border border-stone-900 text-xs text-stone-400 flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="font-sans leading-tight text-[10.5px]">
                  Abajo ves el frame de respuesta estructurado exacto que se genera turno a turno de acuerdo a tus mandatos precisos. El motor actualiza el JSON dinámicamente con cada comando procesado.
                </p>
              </div>

              {/* JSON code block render */}
              <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 overflow-auto max-h-[70vh] sm:max-h-[64vh] text-[10px] font-mono text-stone-300">
                <pre>{JSON.stringify(getGameStateJSON(), null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-900 text-[11px] text-stone-500 leading-tight">
              🎮 <strong>Para jugar desde el chat:</strong> Escribí tus comandos en español bajo las directivas. Por ejemplo: <strong className="text-stone-400">Vendo Alfajor por $600</strong>. El agente te responderá siempre con el JSON actualizado representativo.
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-stone-950 border-t border-stone-900 py-3 px-4 text-center text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            Diseño: GTA Chibi Estilo Realista Cómico • El Kiosco 2026.
          </span>
          <span className="text-amber-500/80">
            A las 10 ventas sube el turno (tarde), a las 20 sube el turno (noche).
          </span>
        </div>
      </footer>
    </div>
  );
}
