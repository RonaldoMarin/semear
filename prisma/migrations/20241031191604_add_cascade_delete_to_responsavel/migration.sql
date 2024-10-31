-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_responsavel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_responsavel" TEXT NOT NULL,
    "telefone_responsavel" TEXT NOT NULL,
    "dependente_id" INTEGER NOT NULL,
    CONSTRAINT "responsavel_dependente_id_fkey" FOREIGN KEY ("dependente_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_responsavel" ("dependente_id", "id", "nome_responsavel", "telefone_responsavel") SELECT "dependente_id", "id", "nome_responsavel", "telefone_responsavel" FROM "responsavel";
DROP TABLE "responsavel";
ALTER TABLE "new_responsavel" RENAME TO "responsavel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
