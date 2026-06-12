import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PRODUCTS, CELEBRITIES, CustomerOrderRequest } from "./src/types.js";

// Force local domain resolution of google servers if any issues exist
dns.setDefaultResultOrder && dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API cliente inicializado correctamente.");
  } catch (error) {
    console.error("Error al inicializar Gemini API:", error);
  }
} else {
  console.log("No se detectó GEMINI_API_KEY real. Usando simulador offline.");
}

// Fallback scenarios for offline play
const OFFLINE_SCENARIOS: Record<string, {
  dialogues: string[];
  items: { productId: string; quantity: number }[];
  pagaCon: number;
  mustCheckDni: boolean;
}> = {
  mirtha: {
    dialogues: [
      "¡Hola, mi amor! ¿El alfajor Guaymallén es artesanal? Quisiera uno de dulce de leche, y un agua mineral bien fría. Como te ven te tratan, divino. ¿Tenés cambio?",
      "Buenas tardes. Vine directo de almorzar en el canal y tengo la boca seca. Dame un agua mineral y unos caramelos pastillas DRF. ¿Me vas a pedir DNI? ¡Tengo más años de televisión que vos de vida!"
    ],
    items: [
      { productId: "alfajor", quantity: 1 },
      { productId: "agua", quantity: 1 }
    ],
    pagaCon: 2000,
    mustCheckDni: false
  },
  susana: {
    dialogues: [
      "¡Ay, hola che! Me vivo de sed por favor... ¡Vengo caminando desde el auto! Dame una Coca-Cola bien helada de vidrio y un chocolate Block light... ¿No tenés light? Bueno dame el común con maní que me encanta, y un paquete de mentas Beldent. ¡Tomá un hornero de dos mil!",
      "¡Ay, hola divino! Vengo a buscar cigarros para el muchacho que me maneja el Mercedes, dale unos Lucky Strike mentolados y un Gatorade... ah, tenés Fanta, bueno, dame una Fanta. ¿DNI? ¡Ay por favor, me muero, si me conoce todo el planeta!"
    ],
    items: [
      { productId: "coca", quantity: 1 },
      { productId: "chocolates", quantity: 1 },
      { productId: "chicles", quantity: 1 }
    ],
    pagaCon: 5000,
    mustCheckDni: false // though the second one had Lucky, which demands DNI!
  },
  fort: {
    dialogues: [
      "¡MAIAMEEE! ¡No se puede creer este calocha! Exijo una Cerveza Quilmes helada de oro, dos chocolates Block con mucho maní para recuperar el volumen muscular, y unos cigarros Marlboro Box para tirar facha en el Rolls Royce. ¡Tomá un jaguar de diez lucas y quedate con el vuelto! ¡O no, mejor dame el vuelto exacto o te compro el kiosco completo!",
      "¡Chicos, cortaron toda la lozzz en mi mansión! Vine flotando a buscar combustible espiritual. Dame un Toro de cartón para el folclore argentino, unos pucho Camel y un alfajor. ¡Págame en dólares si querés, pero como no tenés posnet te tiro diez mil mangos!"
    ],
    items: [
      { productId: "cerveza", quantity: 1 },
      { productId: "chocolates", quantity: 2 },
      { productId: "marlboro", quantity: 1 }
    ],
    pagaCon: 10000,
    mustCheckDni: true
  },
  wanda: {
    dialogues: [
      "¿Hola? Hacen envíos a Estambul o Milán? No, bueno... che, dame una Coca para el camino y unos chicles Beldent sabor mentol bien fuerte para desestresar después de las grabaciones de la tele. Tengo un billete de diez mil, ¿tenés cambio o preferís un canje por historias de Instagram?",
      "Hola, gordito. Quiero algo dulce para los chicos y unos puchos Lucky de menta para pasar el frío. Dame un chocolate Block, un alfajor de oro y el atado de Lucky. Cobrame rápido que me espera el avión privado."
    ],
    items: [
      { productId: "coca", quantity: 1 },
      { productId: "chicles", quantity: 2 }
    ],
    pagaCon: 10000,
    mustCheckDni: false
  },
  tinelli: {
    dialogues: [
      "¡Buenas noches América! ¡Señoras y señores, hoy metemos el desafío de tragar un alfajor Guaymallén entero sin tomar líquido! Chau chau chauuuu... Dame cuatro alfajores y una Fanta helada para el camarógrafo de Showmatch. ¡Te pago con diez lucas!"
    ],
    items: [
      { productId: "alfajor", quantity: 4 },
      { productId: "fanta", quantity: 1 }
    ],
    pagaCon: 10000,
    mustCheckDni: false
  },
  lgante: {
    dialogues: [
      "¿Qué onda, pa? Cumbia 420 al toque. Directo de la caravana con los pibes. Pasame dos cervezas de litro heladísimas, un vino Toro en tetra para armar un 'viajero', y dos paquetes de puchos Camel que los pibes fuman como murciélago en cueva. ¡Te pago con diez mil mangos viejita, mandame todo el vuelto en monedas o billetes chicos para la propina del bloque!"
    ],
    items: [
      { productId: "cerveza", quantity: 2 },
      { productId: "vino", quantity: 1 },
      { productId: "camel", quantity: 2 }
    ],
    pagaCon: 10000,
    mustCheckDni: true
  },
  juanita: {
    dialogues: [
      "Buenas. ¿Tenés algo orgánico? No, todo plástico y harinas... qué horror. Bueno, dame un agua mineral para hidratar las neuronas y unas pastillas DRF que es lo único sano. Ah, y dame unos Lucky mentolados para una amiga que todavía tiene ese vicio espantoso. Cobrame rápido. Pago con $2000."
    ],
    items: [
      { productId: "agua", quantity: 1 },
      { productId: "pastillas", quantity: 1 },
      { productId: "lucky", quantity: 1 }
    ],
    pagaCon: 2000,
    mustCheckDni: true
  },
  maradona: {
    dialogues: [
      "Eeeeeeeeee... ¿Qué hacés, fiera? La pelota no se mancha, pa. Dame un vino Toro místico para meterle mística de tablón y dos chocolates Block con maní para calmar a los angelitos de acá arriba. Eeeee... te pago con cinco lucas, ¿tenés cambio o te firmo una pelota?"
    ],
    items: [
      { productId: "vino", quantity: 1 },
      { productId: "chocolates", quantity: 2 }
    ],
    pagaCon: 5000,
    mustCheckDni: true
  }
};

// Evaluate the list of items requested and generate a correct payment amount larger than total
function calculateTotal(items: { productId: string; quantity: number }[]): number {
  return items.reduce((sum, i) => {
    const prod = PRODUCTS.find((p) => p.id === i.productId);
    return sum + (prod ? prod.price * i.quantity : 0);
  }, 0);
}

// 1. Get next customer request
app.post("/api/customer/next", async (req, res) => {
  try {
    const { playedTurnCount } = req.body;
    const currentTurn = playedTurnCount !== undefined ? playedTurnCount : 1;

    // Pick a random celebrity, but cycle or choose wisely
    const randomIndex = Math.floor(Math.random() * CELEBRITIES.length);
    const celebrity = CELEBRITIES[randomIndex];

    // Determine how complex the request is depending on turn index
    // Turn 1..3 is simple (1-2 items)
    // Turn 4..7 is medium (2-3 items)
    // Turn 8+ is complex / exotic
    let numberOfItemsRange = [1, 2];
    if (currentTurn >= 4) numberOfItemsRange = [2, 3];
    if (currentTurn >= 8) numberOfItemsRange = [3, 4];

    if (ai) {
      // Prompt Gemini to generate a hilarious dialogue and request items
      const prompt = `
        Estás actuando como el motor del juego 'El Kiosco'.
        Generá un pedido divertido en español rioplatense (argentino) para el famoso: ${celebrity.name}.
        Detalles del famoso: ${celebrity.description}.
        Instrucciones de actitud: ${celebrity.personalityPrompt}.

        Elegí de entre 1 y ${numberOfItemsRange[1]} productos de esta lista para pedir:
        ${JSON.stringify(PRODUCTS.map(p => ({ id: p.id, name: p.name, price: p.price, reqAge: p.requiresAgeVerification })))}

        Determiná un billete con el que paga el famoso. El billete de pago DEBE ser mayor al importe total del pedido. Los billetes comunes en argentina son: 500, 1000, 2000, 5000, 10000.
        Si la cuenta da más de 5000, debe pagar con 10000.
        Si la cuenta incluye cerveza, vino, Marlboro, Camel o Lucky, el pedido DEBE marcar \`mustCheckDni: true\`.

        Retorná el resultado en formato JSON estructurado con el siguiente esquema:
        {
          "celebrityId": "${celebrity.id}",
          "dialogue": "Un diálogo cómico e hiper-característico del famoso pidiendo las cosas (máximo 30 palabras).",
          "itemsRequested": [{"productId": "id-del-producto", "quantity": 1}],
          "pagaCon": 10000, // número entero (500, 1000, 2000, 5000, 10000)
          "mustCheckDni": true // true si lleva alcohol o cigarrillos, false si no
        }
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.85,
          },
        });

        const text = response.text || "{}";
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanText);

        // Sanity validation of products
        const validItems = (data.itemsRequested || []).filter((i: any) => 
          PRODUCTS.some(p => p.id === i.productId) && typeof i.quantity === "number" && i.quantity > 0
        );

        if (validItems.length > 0) {
          const totalCost = calculateTotal(validItems);
          // Standardize bill
          let payerBill = data.pagaCon || 10000;
          if (payerBill <= totalCost) {
            const bills = [500, 1000, 2000, 5000, 10000];
            payerBill = bills.find(b => b > totalCost) || 10000;
          }

          const has18Plus = validItems.some((i: any) => {
            const p = PRODUCTS.find(pr => pr.id === i.productId);
            return p?.requiresAgeVerification;
          });

          return res.json({
            celebrityId: celebrity.id,
            dialogue: data.dialogue || "¡Eeee fiera! Cobrame rápido.",
            itemsRequested: validItems,
            pagaCon: payerBill,
            mustCheckDni: has18Plus,
          });
        }
      } catch (err) {
        console.warn("Fallo en Gemini al generar cliente, usando fallback offline:", err);
      }
    }

    // Fallback Offline Generator
    const scenario = OFFLINE_SCENARIOS[celebrity.id] || OFFLINE_SCENARIOS.mirtha;
    const items = [...scenario.items];
    
    // adjust quantities if high turn
    if (currentTurn >= 4) {
      items[0].quantity = (items[0].quantity || 1) + 1;
    }

    const totalCost = calculateTotal(items);
    const bills = [500, 1000, 2000, 5000, 10000];
    const payerBill = bills.find(b => b > totalCost) || 10000;

    const has18Plus = items.some((i: any) => {
      const p = PRODUCTS.find(pr => pr.id === i.productId);
      return p?.requiresAgeVerification;
    });

    const isSecondDialogue = Math.random() > 0.5 && scenario.dialogues.length > 1;
    const finalDialogue = isSecondDialogue ? scenario.dialogues[1] : scenario.dialogues[0];

    return res.json({
      celebrityId: celebrity.id,
      dialogue: finalDialogue,
      itemsRequested: items,
      pagaCon: payerBill,
      mustCheckDni: has18Plus,
    });
  } catch (error: any) {
    console.error("Critical error in /api/customer/next:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Resolve purchase
app.post("/api/customer/resolve", async (req, res) => {
  try {
    const {
      celebrityId,
      itemsRequested,
      itemsDelivered,
      pagaCon,
      registeredPrice,
      isDniVerified,
      changeReturned, // Summed value of bills handed to user
    } = req.body;

    const celebrity = CELEBRITIES.find(c => c.id === celebrityId) || CELEBRITIES[0];
    
    // Server calculations for truth
    const expectedPriceObj: Record<string, number> = {};
    itemsRequested.forEach((it: any) => {
      expectedPriceObj[it.productId] = it.quantity;
    });

    const deliveredPriceObj: Record<string, number> = {};
    itemsDelivered.forEach((it: any) => {
      deliveredPriceObj[it.productId] = it.quantity;
    });

    // 1. Check if correct products are delivered
    let productMatch = true;
    PRODUCTS.forEach(p => {
      const reqQty = expectedPriceObj[p.id] || 0;
      const delQty = deliveredPriceObj[p.id] || 0;
      if (reqQty !== delQty) {
        productMatch = false;
      }
    });

    // 2. Check price
    const correctPrice = calculateTotal(itemsRequested);
    const priceCorrectInRegister = registeredPrice === correctPrice;

    // 3. Check change returned
    const correctChange = pagaCon - correctPrice;
    const changeCorrect = changeReturned === correctChange;

    // 4. Age Verification
    const has18PlusDelivered = itemsDelivered.some((i: any) => {
      const p = PRODUCTS.find(pr => pr.id === i.productId);
      return p?.requiresAgeVerification;
    });
    
    let dniVerifiedStatus = true;
    if (has18PlusDelivered && !isDniVerified) {
      dniVerifiedStatus = false; // Sold alcohol/cigar without checking DNI! Sarcastic loss
    }

    // Determine absolute success
    const isSuccess = productMatch && priceCorrectInRegister && changeCorrect && dniVerifiedStatus;

    // Diagnose errors for Gemini custom commentary
    let mistakeType = "none";
    if (!productMatch) {
      mistakeType = "wrong_items";
    } else if (!priceCorrectInRegister) {
      mistakeType = "wrong_register_price";
    } else if (!changeCorrect) {
      mistakeType = "wrong_change";
    } else if (!dniVerifiedStatus) {
      mistakeType = "forgot_dni";
    }

    // Calculate score & cash delta
    let pointsAwarded = 0;
    let cashChangeDelta = -changeReturned; // cash drawer loses change bills returned
    let cashAdded = pagaCon; // cash drawer gains pay bill

    if (isSuccess) {
      pointsAwarded = 200 + Math.floor(correctPrice * 0.1);
    } else {
      pointsAwarded = -100;
      // if they return wrong change let's simulate the immediate reality:
      // if they gave too much change, they lost that cash.
      // if they gave too little, customer got mad, player was fined or had to hand back corrected change, we subtract normal.
    }

    let customReaction = "";

    if (ai) {
      const evaluationPrompt = `
        Sos el motor del juego 'El Kiosco'. El jugador acaba de despachar a ${celebrity.name} (${celebrity.description}).
        Instrucciones de actitud: ${celebrity.personalityPrompt}.

        === Situación de la Venta ===
        - Pedido original: ${JSON.stringify(itemsRequested.map((it: any) => ({ name: PRODUCTS.find(p=>p.id===it.productId)?.name, qty: it.quantity })))}
        - Entregado por el jugador: ${JSON.stringify(itemsDelivered.map((it: any) => ({ name: PRODUCTS.find(p=>p.id===it.productId)?.name, qty: it.quantity })))}
        - Precio real correcto: $${correctPrice}
        - Precio cobrado en caja registradora por jugador: $${registeredPrice}
        - Pagó con: $${pagaCon}
        - Vuelto devuelto de cambio por jugador: $${changeReturned} (Vuelto esperado: $${correctChange})
        - Verificó documento DNI obligatorio (18+ alcohol/cigarros): ${isDniVerified ? "SÍ" : "NO"}
        - ¿El resultado general fue exitoso? ${isSuccess ? "SÍ" : "NO"}
        - Tipo de error cometido: ${mistakeType}

        Generá una respuesta hiper-graciosa de máximo 35 palabras en la voz y estilo rioplatense (argentino) exagerado de ${celebrity.name}, reaccionando a lo que pasó.
        - Si es un acierto (isSuccess = true), debe estar feliz y decir una de sus frases icónicas, apurarse o tirar facha.
        - Si el error fue 'forgot_dni', debe quejarse sarcásticamente de que le vendiste alcohol/cuchos de contrabando sin pedirle la cédula, o estar enojado/a por tu irresponsabilidad.
        - Si el error fue 'wrong_change' (vuelto equivocado), ¡estará indignado/a de que le querés robar plata o confundir!
        - Si fue 'wrong_register_price', estará ofendido con el precio de carero o que está mal registrado.
        - Si fue 'wrong_items', protestará porque le diste cualquier otra cosa.

        Retorná de forma limpia solo el texto del diálogo hablado (con signos de exclamación abundantes, lunfardo y referencias argentinas).
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: evaluationPrompt,
          config: {
            temperature: 0.9,
          }
        });
        customReaction = response.text?.trim() || "";
      } catch (err) {
        console.warn("Fallo al generar reacción vía Gemini, usando fallbacks offline:", err);
      }
    }

    // Offline Reaction generator block if customReaction is still empty
    if (!customReaction) {
      if (isSuccess) {
        const successFallback: Record<string, string> = {
          mirtha: "¡Maravilloso, tesoro! Qué velocidad. Como te ven te tratan, recordalo... ¡Y a mí me atendiste de diez! Me voy feliz para el almuerzo del domingo.",
          susana: "¡Ay, mi amor, un sol! Vuelto exacto y todo impecable. Me voy volando al desierto a gastar mis millones, ¡los teléfonos de la tele me esperan, che!",
          fort: "¡SIII! ¡Facha pura! Tomá el cambio de propina pibe, o mejor me lo guardo para comprar un nuevo Rolex en Miami. ¡MAIAMEEE, te felicito, sos un campeón de la noche!",
          wanda: "¡Buenísimo, canje cerrado! Mentira, te pagué con efectivo porque soy una empresaria honesta. Agendame el kiosco que te recomiendo con mis quince millones de seguidores.",
          tinelli: "¡Espectacular, fiera! ¡Chau chau chauuuuu! El alfajor Guaymallén ya está adentro de un solo bocado. ¡Música de festejo, muchachos, el mejor kiosquero de Buenos Aires!",
          lgante: "¡Eh gato, al toque! Vuelto clavado para la birrita de la esquina. Cumbia 420 para todos los pibes de la cuadra. Cuidate la espalda, re piola el servicio, pa.",
          juanita: "Bueno, al menos tenés cambio. No me diste bolsa plástica, lo cual te suma mil puntos ecológicos. No vuelvo a fumar esto, pero gracias.",
          maradona: "¡GOLAZO, papa! Tenés más precisión en las manos que yo con la zurda del Diego. La caja registradora no se mancha, fiera. Un abrazo de gol."
        };
        customReaction = successFallback[celebrity.id] || "¡Espectacular fiera! Atendido de primera.";
      } else {
        const errorFallback: Record<string, Record<string, string>> = {
          mirtha: {
            wrong_items: "¡Pero por favor, cariño! Yo no pedí esto. ¿Me vio cara de comer cualquier rascada? Traigo modales, traiga mi pedido.",
            wrong_register_price: "¡Carajo, mierda! ¿A cuánto me estás cobrando el alfajor? ¡Esto es una estafa televisada! Registre bien el importe.",
            wrong_change: "¡¿Qué es este vuelto?! Me falta plata, mi amor. Conmigo no vas a hacer diferencias. Dame la plata exacta.",
            forgot_dni: "¡Ay, por favor! Qué irresponsable, venderme esto sin pedirme el documento nacional. ¡Podría ser una menor rebelde!"
          },
          susana: {
            wrong_items: "¡Ay, no, che, te confundiste de paquete! Esto no es lo mío. Esforzate un poquito más que ando sin anteojos pero igual veo.",
            wrong_register_price: "¡¿Qué?! ¿Eso cuesta? ¡Ay, me muero! ¡No puede ser, si el presidente dijo que bajaron las tarifas de las golosinas!",
            wrong_change: "¡Ay, divino, me diste cualquier plata! Me faltan pesos o me sobran caramelos... ¡Controlame bien ese cajón, mi amor!",
            forgot_dni: "¡Ay, me vendiste los cigarros sin pedir el documento! ¡Menos mal que me veo de veinte, che, pero sos medio distraído!"
          },
          fort: {
            wrong_items: "¡¿Qué es esta porquería?! ¡Yo pedí la Quilmes del Comandante y chocolate Block premium! ¡Me estás dando veneno, pibe!",
            wrong_register_price: "¡Mamá, cortaste toda la luz y me estás cobrando de más! ¡Con mi tarjeta de crédito de oro no vas a jugar!",
            wrong_change: "¡Falta vuelto acá! ¡A Ricardo Fort no le vas a ratear cien mangos, maleducado! ¡Te compro el local y te echo en un Rolls Royce!",
            forgot_dni: "¡No me pediste el DNI para la birra! ¡Sabelo que soy un fantasma inmortal, pero las reglas de Maiame se respetan, carajo!"
          },
          wanda: {
            wrong_items: "¡Perdón! Yo no pedí esto, me arruinás la dieta y el reel de Instagram. Dame bien los ítems o te pongo una mala reseña.",
            wrong_register_price: "¡Qué carero! Registraste un precio re loco. Mirá que hago canje pero no me dejo estafar de esta manera.",
            wrong_change: "¡Falta plata en este vuelto! Mis contadores son de Suiza y me enseñaron a contar billetes rápidos, ojo conmigo.",
            forgot_dni: "¡Ey! Te llevás la cerveza y ni miras mi DNI. ¡Mirá que tengo cara de nena pero soy mamá de cinco! Qué poco profesional."
          }
        };

        const characterFail = errorFallback[celebrity.id] || errorFallback.mirtha;
        customReaction = characterFail[mistakeType] || "¡Che, hiciste todo mal! Prestá atención que esto es un kiosco serio.";
      }
    }

    return res.json({
      success: isSuccess,
      dialogue: customReaction,
      pointsAwarded: pointsAwarded,
      cashChangeDelta: cashChangeDelta,
      cashAdded: cashAdded,
      correctPrice: correctPrice,
      correctChange: correctChange,
      mistakeType: mistakeType
    });

  } catch (error: any) {
    console.error("Critical error in /api/customer/resolve:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build static files inside production
const distPath = path.join(process.cwd(), "dist");

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`El Kiosco server is running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
