import { useState } from "react";
import { TextContainer, Toast, Frame, Button, DataTable, Card, Heading, Page, Stack, TextField, EmptyState } from "@shopify/polaris";
import { ResourcePicker } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const [newPrice, setNewPrice] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const fetch = useAuthenticatedFetch();

  // Making an array of product data from the selected product to display in the table.
  const productData = products.map((product) => [
    product.title,
    product.variants[0].title,
    `¥${product.variants[0].price}`,
    `¥${newPrice}`
  ]);

  // Calling the API to update the price, passing along the product id and new price.
  const submitHandler = async (productID, selectedPrice) => {
    const response = await fetch("/api/products/updateprice", {
      method: 'POST',
      body:JSON.stringify({
        id: productID,
        price: selectedPrice
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      },
    });

    if (response.ok) {
      setShowToast(true)
      setProducts([])
      setNewPrice('')
    }
  };

  // Toast to let the user know the product update was successful
  const toastMarkup = showToast ?
    <Toast
      content="Update Successful"
      onDismiss={() => setShowToast(false)}
      duration={4000}
    /> : null;

  return (
    <Frame>
      <Page>
        <Card>
          <Card.Section>
            <TextContainer>
              <Heading>Update the price of a product</Heading>
            </TextContainer>
          </Card.Section>
          <Card.Section>
            <Stack vertical>
              <Button primary onClick={() => setPickerOpen(true)}>Select Product</Button>
              {/* Using the Shopify resource picker component to let the user select a product to modify. Only possible to select one product. */}
              <ResourcePicker
                resourceType="Product"
                open={pickerOpen}
                selectMultiple={false}
                onCancel={() => setPickerOpen(false)}
                onSelection={(resources) => {
                  setPickerOpen(false)
                  setProducts(resources.selection)
                }}
              />
              <TextField
                label="New price"
                value={newPrice}
                onChange={setNewPrice}
              />
            </Stack>
          </Card.Section>
          {/* Displaying the selected product along with old and new price. Show message if no product is selected */}
          <Card.Section>
            { productData.length ? <DataTable
              columnContentTypes={['text', 'text', 'text', 'text']}
              headings={['Title', 'Variant', 'Old price', 'New price']}
              rows={productData}
            /> : <EmptyState heading="No Product Selected"/>}
          </Card.Section>
          <Card.Section>
            {/* Call submitHandler function when clicking submit button, passing along the id of the selected product and new price. Disable if no product has been selected. */}
            <Button primary onClick={() => submitHandler(products[0].variants[0].id, newPrice)} disabled={!products.length}>Submit</Button>
          </Card.Section>
        </Card>
        {toastMarkup}
      </Page>
    </Frame>
  );
}
