-- CreateEnum
CREATE TYPE "status_carrinho" AS ENUM ('ABERTO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "produto" (
    "id" INTEGER NOT NULL,
    "descricao_produto" TEXT NOT NULL,
    "quantidade_estoque" INTEGER NOT NULL,
    "preco_liquido" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupom" (
    "id" INTEGER NOT NULL,
    "codigo_cupom" TEXT NOT NULL,
    "percentual_desconto" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "cupom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinho" (
    "id" SERIAL NOT NULL,
    "status" "status_carrinho" NOT NULL DEFAULT 'ABERTO',
    "cupom_id" INTEGER,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinho_item" (
    "id" SERIAL NOT NULL,
    "carrinho_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_item" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "carrinho_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cupom_codigo_cupom_key" ON "cupom"("codigo_cupom");

-- CreateIndex
CREATE UNIQUE INDEX "carrinho_item_carrinho_id_produto_id_key" ON "carrinho_item"("carrinho_id", "produto_id");

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_cupom_id_fkey" FOREIGN KEY ("cupom_id") REFERENCES "cupom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinho_item" ADD CONSTRAINT "carrinho_item_carrinho_id_fkey" FOREIGN KEY ("carrinho_id") REFERENCES "carrinho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinho_item" ADD CONSTRAINT "carrinho_item_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
