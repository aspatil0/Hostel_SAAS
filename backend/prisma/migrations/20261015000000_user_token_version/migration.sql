-- Add a per-user token version so logout revokes previously issued JWTs.
ALTER TABLE `users`
ADD COLUMN `token_version` INTEGER NOT NULL DEFAULT 0;
