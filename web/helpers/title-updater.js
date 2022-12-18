import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";
import cron from "node-cron";

// Setting the cron schedule to execute the custom titleUpdater function every hour.
cron.schedule('* * * * *', async () => {
  console.log('Updating titles every hour');
  titleUpdater()
});

export default async function titleUpdater() {

  // Loading offline session to authorize access the Admin API
  const session = await Shopify.Utils.loadOfflineSession('million-plants.myshopify.com')

  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  // Getting all products in the shop using the REST API
  const { Product } = await import(
    `@shopify/shopify-api/dist/rest-resources/${LATEST_API_VERSION}/index.js`
  );

  const products = await Product.all({ session });

  // Mapping over fetched products to get id and title
  const productDetails = products.map((product) => {
    return {id: product.admin_graphql_api_id, title: product.title}
  })

  productDetails.forEach(product => {
    titleMutation(client, product.id, product.title)
  });
}

async function titleMutation(client, id, title) {

  const query = `mutation {
    productUpdate(input: {id: "${id}", title: "${randomTitleChange(title)}"}) {
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

// Generating a random number and changing the product title by replacing the old number with the new.
function randomTitleChange(title) {
  const regex = /\d{4}/
  const number = Math.floor(1000 + Math.random() * 9000);
  return title.replace(regex, number)
}
