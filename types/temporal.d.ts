// TypeScript no trae aún los tipos de Temporal en su lib estándar.
// Este proyecto usa columnas `Timestamp`/`Date` de Postgres, que Prisma 8
// lee/escribe como `Temporal.PlainDateTime` global (ver lib/temporal.ts).
/// <reference types="temporal-spec/global" />
