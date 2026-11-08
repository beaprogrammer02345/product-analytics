import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Format date and time in UTC
const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

// Loader: Fetch product analytics
export const loader = async ({ request }) => {
  // This is an admin dashboard, so use admin authentication
  const { session } = await authenticate.admin(request);

  const rows = await prisma.productView.findMany({
    where: {
      shop: session.shop,
    },
    orderBy: {
      viewerAt: "desc",
    },
    take: 50,
  });

  return {
    views: rows.map((row) => ({
      id: row.id,
      productId: row.productId,
      viewer: row.viewer,
      isGuest: row.isGuest,
      viewedAt: dateFormat.format(row.viewerAt),
    })),
  };
};

// Analytics Component
export default function Analytics() {
  const { views } = useLoaderData();

  return (
    <s-page heading="Analytics">
      <s-section
        padding="none"
        heading={`Product views (${views.length})`}
      >
        {views.length === 0 ? (
          <s-box padding="base">
            <s-paragraph>
              No product views recorded yet.
            </s-paragraph>
          </s-box>
        ) : (
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">
                Product ID
              </s-table-header>

              <s-table-header listSlot="secondary">
                Viewer
              </s-table-header>

              <s-table-header listSlot="inline">
                Type
              </s-table-header>

              <s-table-header listSlot="labeled">
                Viewed at
              </s-table-header>
            </s-table-header-row>

            <s-table-body>
              {views.map((view) => (
                <s-table-row key={view.id}>
                  <s-table-cell>
                    {view.productId}
                  </s-table-cell>

                  <s-table-cell>
                    {view.viewer}
                  </s-table-cell>

                  <s-table-cell>
                    <s-badge
                      tone={view.isGuest ? "warning" : "success"}
                    >
                      {view.isGuest ? "Guest" : "Customer"}
                    </s-badge>
                  </s-table-cell>

                  <s-table-cell>
                    {view.viewedAt}
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
