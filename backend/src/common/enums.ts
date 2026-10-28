// Re-export Prisma-generated enums so all source files share the same types.
// This file existed as a workaround before `prisma generate` was run.
// Now that the client is generated, we simply proxy through @prisma/client.
export { Role, UserStatus, PropertyStatus, PropertyType } from '@prisma/client';
