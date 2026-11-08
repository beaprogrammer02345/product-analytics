-- CreateTable
CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "viewer" TEXT NOT NULL,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "viewerAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductView_shop_productId_viewer_key" ON "ProductView"("shop", "productId", "viewer");
