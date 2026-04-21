-- AlterTable
ALTER TABLE "contrato_incrementos" ALTER COLUMN "horas_extra" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "contrato_proyectos" ALTER COLUMN "horas_proyectadas" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "contratos" ALTER COLUMN "cantidad_horas" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "uso_mensual" ALTER COLUMN "horas_estimadas" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "horas_reales" SET DATA TYPE DOUBLE PRECISION;
