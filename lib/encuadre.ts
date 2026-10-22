/*
 * El encuadre de una foto, como `photo_framing.dart` de la app (BooKit): las
 * dos formas en que la app muestra la foto de un local, y qué parte de la foto
 * entra en cada una. Lo usa el navegador para recortar antes de subir: la foto
 * original no viaja, viajan los recortes.
 */

/** Las dos formas: el círculo (tarjetas, mapa, búsqueda) y la banda de la ficha. */
export const FORMAS = {
  perfil: { proporcion: 1, ancho: 720 },
  portada: { proporcion: 2, ancho: 1440 },
} as const;

export type Forma = keyof typeof FORMAS;

/** Las formas que se suben de cada foto: el local, las dos; un profesional, sólo el círculo. */
export const FORMAS_DEL_LOCAL: Forma[] = ["perfil", "portada"];
export const FORMAS_DEL_PROFESIONAL: Forma[] = ["perfil"];

/** La calidad del JPEG que se sube, la de la app. */
export const CALIDAD = 0.85;

export type Medida = { ancho: number; alto: number };

/**
 * Qué parte de la foto se ve: el centro, en píxeles de la foto, y cuánto se
 * acercó (1 es el rectángulo más grande que entra). Se guarda así y no como
 * un desplazamiento en pantalla, para que no dependa del tamaño del marco.
 */
export type Encuadre = { x: number; y: number; zoom: number };

export const ZOOM_MAXIMO = 4;

/** El encuadre inicial: el más grande, centrado (`Encuadre.centrado`). Quien no toca nada ve lo que veía antes. */
export const centrado = (foto: Medida): Encuadre => ({ x: foto.ancho / 2, y: foto.alto / 2, zoom: 1 });

/** El rectángulo de la foto que entra en la forma, sin salirse de la foto. */
export function recorte(foto: Medida, forma: Forma, { x, y, zoom }: Encuadre) {
  const { proporcion } = FORMAS[forma];
  const entraDeAncho = foto.alto * proporcion <= foto.ancho;
  const ancho = (entraDeAncho ? foto.alto * proporcion : foto.ancho) / zoom;
  const alto = ancho / proporcion;
  const entre = (valor: number, minimo: number, maximo: number) => Math.min(Math.max(valor, minimo), maximo);
  return {
    x: entre(x - ancho / 2, 0, foto.ancho - ancho),
    y: entre(y - alto / 2, 0, foto.alto - alto),
    ancho,
    alto,
  };
}

/** El encuadre con el centro corrido y llevado de vuelta adentro de la foto. */
export function mover(foto: Medida, forma: Forma, encuadre: Encuadre, dx: number, dy: number): Encuadre {
  const r = recorte(foto, forma, { ...encuadre, x: encuadre.x + dx, y: encuadre.y + dy });
  return { ...encuadre, x: r.x + r.ancho / 2, y: r.y + r.alto / 2 };
}

/** El encuadre con otro zoom, sobre el mismo centro. */
export function acercar(foto: Medida, forma: Forma, encuadre: Encuadre, zoom: number): Encuadre {
  return mover(foto, forma, { ...encuadre, zoom: Math.min(Math.max(zoom, 1), ZOOM_MAXIMO) }, 0, 0);
}

/** Dibuja la parte encuadrada de la foto en todo el lienzo. */
export function dibujar(lienzo: HTMLCanvasElement, foto: ImageBitmap, forma: Forma, encuadre: Encuadre) {
  const contexto = lienzo.getContext("2d");
  if (!contexto) return;
  const r = recorte({ ancho: foto.width, alto: foto.height }, forma, encuadre);
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(foto, r.x, r.y, r.ancho, r.alto, 0, 0, lienzo.width, lienzo.height);
}

/** El recorte final, del tamaño que sube la app, como JPEG. */
export function exportar(foto: ImageBitmap, forma: Forma, encuadre: Encuadre): Promise<Blob> {
  const { ancho, proporcion } = FORMAS[forma];
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = Math.round(ancho / proporcion);
  dibujar(lienzo, foto, forma, encuadre);
  return new Promise((resolver, fallar) =>
    lienzo.toBlob((blob) => (blob ? resolver(blob) : fallar(new Error("encuadre: sin JPEG"))), "image/jpeg", CALIDAD),
  );
}
