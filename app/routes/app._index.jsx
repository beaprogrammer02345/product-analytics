
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const TOP_PRODUCTS = 5;

// Loader: Fetch dashboard analytics
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const where = {
    shop: session.shop,
  };

  // Fetch total views, guest views and product-wise views
  const [totalViews, guestViews, byProduct] = await Promise.all([
    prisma.productView.count({
      where,
    }),

    prisma.productView.count({
      where: {
        ...where,
        isGuest: true,
      },
    }),

    prisma.productView.groupBy({
      by: ["productId"],
      where,
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
    }),
  ]);

  // Calculate unique products and guest percentage
  const uniqueProducts = byProduct.length;

  const guestPercent = totalViews
    ? Math.round((guestViews / totalViews) * 100)
    : 0;

  // Get top 5 viewed products
  const topProducts = byProduct
    .slice(0, TOP_PRODUCTS)
    .map((row) => ({
      productId: row.productId,
      views: row._count.productId,
    }));

  return {
    totalViews,
    uniqueProducts,
    guestPercent,
    topProducts,
  };
};

// Dashboard component
export default function Index() {
  const {
    totalViews,
    uniqueProducts,
    guestPercent,
    topProducts,
  } = useLoaderData();

  const metrics = [
    {
      label: "Total views",
      value: totalViews,
    },
    {
      label: "Products viewed",
      value: uniqueProducts,
    },
    {
      label: "Guest views",
      value: `${guestPercent}%`,
    },
  ];

  return (
    <s-page heading="Dashboard">

      {/* View all analytics button */}
      <s-button
        slot="primary-action"
        href="/app/analytics"
      >
        View all analytics
      </s-button>

      {/* Overview */}
      <s-section heading="Overview">

        <s-grid
          gridTemplateColumns="repeat(auto-fit, minmax(160px, 1fr))"
          gap="base"
        >
          {metrics.map((metric) => (
            <s-box
              key={metric.label}
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <s-stack direction="block" gap="small">

                <s-text color="subdued">
                  {metric.label}
                </s-text>

                <s-heading>
                  {metric.value}
                </s-heading>

              </s-stack>
            </s-box>
          ))}
        </s-grid>

      </s-section>

      {/* Top viewed products */}
      <s-section
        padding="none"
        heading="Top viewed products"
      >

        {topProducts.length === 0 ? (
          <s-box padding="base">
            <s-paragraph>
              No product views recorded yet. Views will appear
              here once your storefront starts sending tracking data.
            </s-paragraph>
          </s-box>
        ) : (

          <s-table>

            <s-table-header-row>
              <s-table-header listSlot="primary">
                Product ID
              </s-table-header>

              <s-table-header
                listSlot="labeled"
                format="numeric"
              >
                Views
              </s-table-header>
            </s-table-header-row>

            <s-table-body>
              {topProducts.map((product) => (
                <s-table-row key={product.productId}>

                  <s-table-cell>
                    {product.productId}
                  </s-table-cell>

                  <s-table-cell>
                    {product.views}
                  </s-table-cell>

                </s-table-row>
              ))}
            </s-table-body>

          </s-table>

        )}

      </s-section>

    </s-page>
  );
}

// Shopify response headers
export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
