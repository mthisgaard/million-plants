import { useState, useMemo } from "react";
import { TextContainer, Toast, Frame, Button, DataTable, Card, Heading, Page, Stack, TextField, EmptyState } from "@shopify/polaris";
import { ResourcePicker } from '@shopify/app-bridge-react';
import { useAuthenticatedFetch } from "../hooks";
import { ProductsCard } from "../components";

export default function HomePage() {
  const [newPrice, setNewPrice] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const fetch = useAuthenticatedFetch();

  const productData = useMemo(() => products.map((product) => [
    product.id,
    product.title,
    `${product.variants[0].price}¥`,
    `${newPrice}¥`
  ]), [products, newPrice]);

  const submitHandler = async (productID, selectedPrice) => {
    console.log(productID)
    console.log(selectedPrice)
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
    }
  };

  const updateTitleHandler = async () => {
    const response = await fetch("/api/products/updatetitles", {
      method: 'POST'
    });

    if (response.ok) {
      setShowToast(true)
    }
  }

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
          <Card.Section>
            { productData.length ? <DataTable
              columnContentTypes={['text', 'text', 'text', 'text']}
              headings={['ID', 'Title', 'Old price', 'New price']}
              rows={productData}
            /> : <EmptyState heading="No Product Selected"/>}
          </Card.Section>
          <Card.Section>
            <Button primary onClick={() => submitHandler(products[0].variants[0].id, newPrice)} disabled={!products.length}>Submit</Button>
          </Card.Section>
        </Card>
        {toastMarkup}
      </Page>
    </Frame>
  );
}

