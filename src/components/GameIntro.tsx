import React from "react";
import { Play, Volume2, Store, Users, DollarSign, Award, ThumbsUp } from "lucide-react";
import { CELEBRITIES } from "../types.js";

interface GameIntroProps {
  onStart: () => void;
}

export default function GameIntro({ onStart }: GameIntroProps) {
  return (
    <div className="max-w-3xl mx-auto bg-amber-50 rounded-2xl border-4 border-amber-900 shadow-2xl overflow-hidden my-4">
      {/* Hero Header Banner */}
      <div className="bg-amber-900 text-amber-50 p-6 text-center border-b-4 border-amber-950 relative">
        <div className="absolute top-2 left-2 flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold mb-1">
          Simulador de Kiosco Argentino
        </div>
        <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tight uppercase flex items-center justify-center gap-2 drop-shadow-md">
          <Store className="w-10 h-10 text-amber-400" /> EL KIOSCO
        </h1>
        <p className="font-mono text-xs text-amber-300 mt-2">
          Estética Realista Cómica GTA Chibi • Mayores de 18
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Game Lore / Setting */}
        <div className="bg-white p-4 rounded-xl border-2 border-amber-200 text-amber-950 shadow-inner">
          <p className="text-sm md:text-base leading-relaxed text-amber-900 italic font-medium">
            "Sos el dueño de un histórico kiosco-almacén porteño. La heladera zumba como turbina de avión, la caramelera doble tiene el vidrio medio rayado, y vos tenés más ojeras que ganas de vivir. Para colmo, hoy todos los famosos del país se pusieron de acuerdo para venir a comprarte a vos."
          </p>
        </div>

        {/* Dynamic List of Celebs */}
        <div>
          <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" /> Clientes VIP Chibi que te visitarán:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {CELEBRITIES.map((c) => (
              <div
                key={c.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 flex flex-col items-center text-center shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full ${c.chibiDetails.avatarColor} border border-amber-300 flex items-center justify-center font-bold text-amber-800 text-lg shadow-sm mb-1`}>
                  {c.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-amber-950 font-sans leading-tight">
                  {c.name}
                </span>
                <span className="text-[10px] text-amber-700/80 font-mono leading-none mt-0.5">
                  {c.id === "fort" || c.id === "maradona" ? "👻 Fantasma" : "🌟 Viva"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Play Rules Card */}
        <div className="bg-amber-100/70 p-4 rounded-xl border border-amber-200">
          <h2 className="font-sans font-bold text-amber-950 text-base mb-2 uppercase tracking-wide">
            Reglas del Almacén:
          </h2>
          <ul className="text-xs md:text-sm text-amber-900 space-y-2 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-red-600 font-bold mt-0.5">🔞</span>
              <span>
                <strong>Control de DNI obligatorio:</strong> Si te piden alcohol o cigarrillos (Cerveza, Vino, Marlboro, Camel, Lucky), tenés que exigir el documento (DNI) antes de despachar. ¡Si les vendés sin mirar DNI te clavan denuncia!
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-800 font-bold mt-0.5">💵</span>
              <span>
                <strong>Caja registradora y Vuelto:</strong> Sumá los precios usando la "Lista de Precios" pegada al mostrador, registralos en la caja, mirá con qué billete te pagan y da el vuelto exacto usando los billetes de tu cajón.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-800 font-bold mt-0.5">🏆</span>
              <span>
                <strong>Sube el turno:</strong> Arrancás en el turno <strong>Mañana</strong> con $5.000. Al acumular 10 ventas perfectas pasás a la <strong>Tarde</strong> y luego a la <strong>Noche</strong>. Los famosos vendrán más apurados, exigentes y bizarros.
              </span>
            </li>
          </ul>
        </div>

        {/* Actions Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-amber-800 font-mono text-xs">
            <Volume2 className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Sonido de heladera zumbando: Activado por defecto ⚡</span>
          </div>

          <button
            id="btn-play-game"
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition text-white font-sans font-black text-xl rounded-xl border-b-4 border-emerald-800 flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current text-emerald-100" /> ABRIR EL KIOSCO
          </button>
        </div>
      </div>
    </div>
  );
}
