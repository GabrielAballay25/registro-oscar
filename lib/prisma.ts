/**
 * Cliente de base de datos (singleton).
 *
 * Prisma 8 conecta perezosamente y el pool vive durante todo el proceso, así
 * que basta con exportar la instancia creada una única vez en
 * `src/prisma/db.ts` (módulo cacheado por Node/Next). No se debe crear una
 * instancia nueva por request.
 */
export { db } from "@/src/prisma/db";
