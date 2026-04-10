-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL DEFAULT 4,
    "google_id" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "acronimo" TEXT,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_proyectos" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "horas_proyectadas" INTEGER NOT NULL,

    CONSTRAINT "contrato_proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uso_mensual" (
    "id" SERIAL NOT NULL,
    "contrato_proyecto_id" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "horas_estimadas" INTEGER,
    "horas_reales" INTEGER,

    CONSTRAINT "uso_mensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero_expediente" TEXT NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "cantidad_horas" INTEGER NOT NULL,
    "valor_hora" DECIMAL(65,30),
    "es_accesoridad" BOOLEAN,
    "contrato_principal_id" INTEGER,
    "observaciones" TEXT,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_prorrogas" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "numero_expediente" TEXT,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrato_prorrogas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrato_incrementos" (
    "id" SERIAL NOT NULL,
    "contrato_id" INTEGER NOT NULL,
    "horas_extra" INTEGER NOT NULL,
    "numero_expediente" TEXT,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrato_incrementos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "estado_contratacion_id" INTEGER NOT NULL DEFAULT 1,
    "area_id" INTEGER NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "name" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "google_id" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_acronimo_key" ON "areas"("acronimo");

-- CreateIndex
CREATE INDEX "idx_cp_contrato" ON "contrato_proyectos"("contrato_id");

-- CreateIndex
CREATE INDEX "idx_cp_proyecto" ON "contrato_proyectos"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_contrato_proyecto" ON "contrato_proyectos"("contrato_id", "proyecto_id");

-- CreateIndex
CREATE INDEX "idx_uso_mensual_cp" ON "uso_mensual"("contrato_proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_uso_mensual" ON "uso_mensual"("contrato_proyecto_id", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numero_expediente_key" ON "contratos"("numero_expediente");

-- CreateIndex
CREATE INDEX "idx_contratos_proveedor" ON "contratos"("proveedor_id");

-- CreateIndex
CREATE INDEX "idx_contratos_principal" ON "contratos"("contrato_principal_id");

-- CreateIndex
CREATE INDEX "idx_prorrogas_contrato" ON "contrato_prorrogas"("contrato_id");

-- CreateIndex
CREATE INDEX "idx_incrementos_contrato" ON "contrato_incrementos"("contrato_id");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_value_key" ON "proveedores"("value");

-- CreateIndex
CREATE INDEX "idx_proyectos_area" ON "proyectos"("area_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_roles" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contrato_proyectos" ADD CONSTRAINT "fk_cp_contrato" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_proyectos" ADD CONSTRAINT "fk_cp_proyecto" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "uso_mensual" ADD CONSTRAINT "fk_uso_mensual_cp" FOREIGN KEY ("contrato_proyecto_id") REFERENCES "contrato_proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "fk_contratos_proveedor" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_contrato_principal_id_fkey" FOREIGN KEY ("contrato_principal_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_prorrogas" ADD CONSTRAINT "fk_prorrogas_contrato" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_incrementos" ADD CONSTRAINT "fk_incrementos_contrato" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "fk_proyectos_area" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
