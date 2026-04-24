/*
  Warnings:

  - Added the required column `fecha_fin` to the `proyectos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_inicio` to the `proyectos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "fecha_fin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_inicio" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "proyecto_prorrogas" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "numero_expediente" TEXT,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_prorrogas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_prorrogas_proyecto" ON "proyecto_prorrogas"("proyecto_id");

-- AddForeignKey
ALTER TABLE "proyecto_prorrogas" ADD CONSTRAINT "proyecto_prorrogas_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
