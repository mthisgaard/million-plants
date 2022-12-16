import { Shopify } from "@shopify/shopify-api";

const UPDATE_PRODUCT_PRICE_MUTATION = `
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
        title
        inventoryPolicy
        inventoryQuantity
        price
        compareAtPrice
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export default async function priceUpdater(
  session,
  productID,
  newPrice
) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  try {
    await client.query({
      data: {
        query: UPDATE_PRODUCT_PRICE_MUTATION,
        variables: {
          input: {
            id: productID,
            price: newPrice,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Shopify.Errors.GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    } else {
      throw error;
    }
  }
}
