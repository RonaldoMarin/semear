/*
  Warnings:

  - You are about to drop the column `dependente_id` on the `responsavel` table. All the data in the column will be lost.
  - Added the required column `usuario_id` to the `responsavel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_responsavel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_responsavel" TEXT NOT NULL,
    "telefone_responsavel" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    CONSTRAINT "responsavel_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_responsavel" ("id", "nome_responsavel", "telefone_responsavel") SELECT "id", "nome_responsavel", "telefone_responsavel" FROM "responsavel";
DROP TABLE "responsavel";
ALTER TABLE "new_responsavel" RENAME TO "responsavel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
