import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";

// Guardamos los datos en archivos JSON. En Vercel solo se puede escribir en `/tmp`, que es temporal: los datos se pierden cuando la función se reinicia. En local usamos la carpeta `tmp/` del proyecto, que está en el .gitignore.
const DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp");

export function read<T>(name: string, initial: T): T {
  try {
    return JSON.parse(readFileSync(path.join(DIR, `${name}.json`), "utf-8"));
  } catch {
    // Si el archivo todavía no existe, devolvemos los datos iniciales
    return initial;
  }
}

export function write(name: string, data: unknown) {
  mkdirSync(DIR, {recursive: true});
  writeFileSync(path.join(DIR, `${name}.json`), JSON.stringify(data, null, 2));
}
