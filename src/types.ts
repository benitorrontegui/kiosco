export interface Product {
  id: string;
  name: string;
  price: number;
  category: "bebida" | "cigarrillos" | "golosina";
  requiresAgeVerification: boolean;
  image?: string;
  description: string;
}

export type TimeOfDay = "Mañana" | "Tarde" | "Noche";

export interface Celebrity {
  id: string;
  name: string;
  description: string;
  chibiDetails: {
    faceExpression: string;
    clothing: string;
    accessories: string;
    avatarColor: string; // Tailind class for background/portrait
  };
  personalityPrompt: string;
}

export interface CustomerOrderRequest {
  celebrityId: string;
  dialogue: string;
  itemsRequested: { productId: string; quantity: number }[];
  pagaCon: number; // The payment bill they are offering
  mustCheckDni: boolean;
}

export interface GameState {
  points: number;
  cashInDrawer: number;
  turnCount: number; // Increment every successful sale
  timeOfDay: TimeOfDay;
  currentCustomer: CustomerOrderRequest | null;
  selectedItems: { productId: string; quantity: number }[];
  registeredPrice: number; // What the player typed or set as total price
  isDniVerified: boolean;
  changeBills: { [value: number]: number }; // How much change they have prepared to give back
  customerDialogue: string;
  customerReaction: string | null;
  saleSuccess: boolean | null; // true = success, false = fail
  nextCelebrityHint: string;
}

export const PRODUCTS: Product[] = [
  // Bebidas
  { id: "Coca-Cola", name: "Coca-Cola", price: 800, category: "bebida", requiresAgeVerification: false, description: "La clásica de vidrio bien helada." },
  { id: "Fanta", name: "Fanta", price: 700, category: "bebida", requiresAgeVerification: false, description: "Sabor naranja hiper burbujeante en 3D." },
  { id: "Agua", name: "Agua", price: 500, category: "bebida", requiresAgeVerification: false, description: "Pura de manantial, baja en sodio." },
  { id: "Cerveza", name: "Cerveza", price: 1200, category: "bebida", requiresAgeVerification: true, description: "De litro heladísima de lúpulo nacional." },
  { id: "Vino", name: "Vino", price: 2500, category: "bebida", requiresAgeVerification: true, description: "Tinto noble tradicional en caja de cartón." },
  
  // Cigarros
  { id: "Marlboro", name: "Marlboro", price: 2000, category: "cigarrillos", requiresAgeVerification: true, description: "Atado tradicional, tabaco de Virginia." },
  { id: "Camel", name: "Camel", price: 1800, category: "cigarrillos", requiresAgeVerification: true, description: "De filtro clásico con aromático blend turco." },
  { id: "Lucky Strike", name: "Lucky Strike", price: 1700, category: "cigarrillos", requiresAgeVerification: true, description: "Con refrescante cápsula de sabor clickeable." },
  
  // Golosinas
  { id: "Alfajor", name: "Alfajor", price: 600, category: "golosina", requiresAgeVerification: false, description: "Caviar argentino bañado en chocolate amargo." },
  { id: "Chicles", name: "Chicles", price: 300, category: "golosina", requiresAgeVerification: false, description: "Menta fuerte para frescura instantánea." },
  { id: "Pastillas", name: "Pastillas", price: 250, category: "golosina", requiresAgeVerification: false, description: "Las clásicas de drageas que todos bolsillean." },
  { id: "Chupetín", name: "Chupetín", price: 150, category: "golosina", requiresAgeVerification: false, description: "Pico de carrusel con tintura multicolor." },
  { id: "Chocolate", name: "Chocolate", price: 700, category: "golosina", requiresAgeVerification: false, description: "Tableta crujiente rellena con abundante maní tostado." }
];

export const CELEBRITIES: Celebrity[] = [
  {
    id: "mirtha",
    name: "Mirtha Legrand",
    description: "Miniatura elegantísima con rulitos plateados, collar de perlas enorme y mirada inquisidora.",
    chibiDetails: {
      faceExpression: "Rictus de alta alcurnia, rulitos plateados impecables.",
      clothing: "Vestido de gala rosa pastel, joyas brillantes.",
      accessories: "Collar de perlas gigante y un abanico de encaje.",
      avatarColor: "bg-rose-50"
    },
    personalityPrompt: "Mirtha Legrand. Siempre formal, elegante, curiosa por si los alfajores son artesanales. Usa frases icónicas como '¡Como te ven te tratan, si te ven mal te maltratan y si te ven bien te contratan!' y '¡Carajo, mierda!' si se enoja. Exige fineza y odia el desorden."
  },
  {
    id: "susana",
    name: "Susana Giménez",
    description: "Rubia exuberante con anteojos de sol gigantes, sonrisa radiante y tapado de leopardo chibi.",
    chibiDetails: {
      faceExpression: "Boca abierta en '¡Ooooh!', pestañas XL arqueadas.",
      clothing: "Tapado de leopardo sintético, brillos dorados.",
      accessories: "Anteojos de sol gigantescos que tapan media cara.",
      avatarColor: "bg-yellow-50"
    },
    personalityPrompt: "Susana Giménez. Súper simpática, distraída, pide cosas bajas en calorías o 'light'. Dice '¡Hola, che!', '¡Me vivo!', '¿Vivo?', y gesticula muchísimo. Si le cobrás mal o recibe vuelto de menos grita impactada con humor chic."
  },
  {
    id: "fort",
    name: "Ricardo Fort",
    description: "Es un fantasma flotante de color rosa neón, con su icónico traje brillante, jopo perfecto y barba candado.",
    chibiDetails: {
      faceExpression: "Sonrisa desafiante de galán de chocolate, cejas arqueadas.",
      clothing: "Traje rosa brillante con hombreras de piel.",
      accessories: "Reloj de oro gigante (flotante), jopo de 20cm de alto.",
      avatarColor: "bg-pink-100/70"
    },
    personalityPrompt: "Ricardo Fort (fantasma). Ostentoso, delirante, le decís 'El Comandante'. Menciona Miami ('¡MAIAMEEE!'), el Rolls-Royce, cortar la luz del kiosco. Ofrece dólares o billetes enormes de oro. Se enoja gritando '¡Mamá, cortaste toda la looooz!' si fallás."
  },
  {
    id: "wanda",
    name: "Wanda Nara",
    description: "Rubia XL con uñas esculpidas infinitas, cartera importada Gucci sobre el brazo, y mirada de empresaria.",
    chibiDetails: {
      faceExpression: "Mirada astuta de reojo, labios pintados mate con gloss.",
      clothing: "Monoprenda de diseñador negro, zapatillas de canje.",
      accessories: "Cartera diminuta que vale más que todo el kiosco, uñas de 5 cm.",
      avatarColor: "bg-purple-50"
    },
    personalityPrompt: "Wanda Nara. Habla de marcas, de canjes de Instagram, de Mauro Icardi o de mudanzas europeas. Pretende descuento de influencer o pagar con cripto/tarjeta black. Si le errás, te amenaza con cancelar el kiosco en sus historias."
  },
  {
    id: "tinelli",
    name: "Marcelo Tinelli",
    description: "Sonrisa gigantesca de porcelana blanca, tatuajes por todo el cuello chibi y un micrófono antiguo en la mano.",
    chibiDetails: {
      faceExpression: "Sonrisa eterna e inmóvil de conductor, ojos achinados.",
      clothing: "Chaqueta de cuero ajustada negra con tachas.",
      accessories: "Micrófono con cable retro en mano, tatuajes que suben al cuello.",
      avatarColor: "bg-blue-50"
    },
    personalityPrompt: "Marcelo Tinelli. Súper enérgico, habla rápido, pide alfajores para hacer el 'desafío del alfajor entero'. Dice '¡Buenas noches América!', '¡Chau, chau, chau, chauuu!'. Si errás el vuelto o tardás, te tira un chiste con música de fondo."
  },
  {
    id: "lgante",
    name: "L-Gante",
    description: "Gorra torcida de visera plana, cadena de oro macizo del tamaño de un termo, actitud relajada de barrio.",
    chibiDetails: {
      faceExpression: "Guiño de ojo astuto, sonrisa con brackets brillantes (bling).",
      clothing: "Conjunto deportivo de marca famoso y chaleco inflable.",
      accessories: "Cadena gigante Cumbia 420, gorra torcida de visera plana.",
      avatarColor: "bg-emerald-50"
    },
    personalityPrompt: "L-Gante. Habla con jerga de la calle: 'viejita', 'pa', 'Cumbia 420', 'al toque'. Paga con billetes grandes de $10.000 de los nuevos de Evita/San Martín o Messi y pide el cambio justo para la previa. Si cobrás bien, tira paso acrobático."
  },
  {
    id: "juanita",
    name: "Juana Viale",
    description: "Idéntica a su abuela Mirtha pero más joven, con remera eco-friendly, mirada altanera y descalza en espíritu.",
    chibiDetails: {
      faceExpression: "Expresión desafiante y cejo fruncido, mirada filosa.",
      clothing: "Ropa hippie-chic de lino ecológico.",
      accessories: "Planta colgante minúscula en mano y collar artesanal.",
      avatarColor: "bg-stone-100"
    },
    personalityPrompt: "Juana Viale. Brava, preguntona, amante de lo agroecológico y vegano. Odia los plásticos y se queja del humo. Te mira con superioridad, defiende el medio ambiente. Dice frases cortas pero cortantes como '¿Me vas a cobrar eso?'."
  },
  {
    id: "maradona",
    name: "El Diego (Fantasma)",
    description: "Abrazo eterno celeste y blanco, rulitos negros de 1986, arito brillante y una pelota de fútbol pegada al pie.",
    chibiDetails: {
      faceExpression: "Mirada nostálgica heroica, mechón dorado en los rulos.",
      clothing: "Camiseta número 10 de Argentina de México 86 deshilachada.",
      accessories: "Pelota de cuero clásica azteca flotante, arito de diamante brillante.",
      avatarColor: "bg-sky-50"
    },
    personalityPrompt: "Ángel del Diego (Diego Maradona en versión cósmica cómica). Habla del Fiorito, de 'la pelota no se mancha', tira chistes sobre la FIFA o los jeques. Dice 'eeeee' con pausas, pide un vino Toro o una cerveza bien fría para meterle mística al potrero lunar. Súper cariñoso pero explosivo."
  }
];
