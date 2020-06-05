import React, { useState, useEffect } from 'react';

import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart';

import { API } from 'aws-amplify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addItem, removeItem } = useShoppingCart();

  useEffect(() => {
    async function getData() {
      const data = await API.get('ecommerce', '/products');
      setProducts(data.products);
    }
    getData();
  }, []);

  return (
    <section className="products">
      {products.map((product) => (
        <div key={product.sku} className="product">
          <img src={product.image} alt={product.name} />
          <h2>{product.name}</h2>
          <p className="price">
            {formatCurrencyString({
              value: product.price,
              currency: product.currency,
            })}
          </p>
          <button onClick={() => addItem(product)}>Add to cart</button>
          <button onClick={() => removeItem(product.sku)}>Remove</button>
        </div>
      ))}
    </section>
  );
};

export default Products;
