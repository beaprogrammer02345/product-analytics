import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function action({ request }) {
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return Response.json(
      { error: "Shop session not found" },
      { status: 401 }
    );
  }

  const shop = session.shop;

  const { productId, viewer, isGuest } =
    await request.json();

  if (!productId || !viewer) {
    return Response.json(
      { error: "Product ID and viewer are required" },
      { status: 400 }
    );
  }

  await prisma.productView.upsert({
    where: {
      shop_productId_viewer: {
        shop,
        productId,
        viewer,
      },
    },

    create: {
      shop,
      productId,
      viewer,
      isGuest: isGuest ?? true,
    },

    update: {},
  });

  return Response.json({
    ok: true,
    message: "Product view saved successfully",
  });
}
