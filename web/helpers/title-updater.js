import { Shopify } from "@shopify/shopify-api";

export default async function titleUpdater(session, products) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  const productDetails = products.map((product) => {
    return {id: product.admin_graphql_api_id, title: product.title}
  })

  productDetails.forEach(product => {
    titleMutation(client, product.id, product.title)
  });
}

async function titleMutation(client, id, title) {

  const query = `mutation {
    productUpdate(input: {id: "${id}", title: "${randomTitle(title)}"}) {
      product {
        id
      }
    }
  }`

  try {
    await client.query({
      data: query,
    });
  } catch (error) {
    if (error instanceof Shopify.Errors.GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    } else {
      throw error;
    }
  }
}

function randomTitle(title) {
  const regex = /\d{4}/
  const number = Math.floor(1000 + Math.random() * 9000);
  return title.replace(regex, number)
}
