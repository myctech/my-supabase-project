'use client';

import { useEffect, useState } from 'react';
import styles from './results.module.css';

interface Product {
  id: number;
  name?: string;
  description?: string;
  min_campaign_budget?: number;  // or your price field
  location_prefix?: string;
  min_impressions?: number;
  max_impressions?: number;
  imageUrl?: string;             // If you store an image URL
  // ... add any other fields you need
}

export default function Results() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendationResults');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  }, []);

  if (!products.length) {
    return (
      <div className={styles.container}>
        <h1>Recommended Products</h1>
        <p>No recommended products found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Recommended Products</h1>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            {/* Image (or placeholder) */}
            <img
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name || 'Product Image'}
              className={styles.productImage}
            />

            {/* Product Title & Price */}
            <h2>{product.name || `Product #${product.id}`}</h2>
            <p className={styles.price}>
              £{product.min_campaign_budget?.toFixed(2) ?? '0.00'}
            </p>

            {/* Product Description */}
            <p className={styles.description}>
              {product.description || 'No description available.'}
            </p>

            {/* Location & Intended Impressions */}
            <p>
              <strong>Location:</strong> {product.location_prefix ?? 'N/A'}
            </p>
            <p>
              <strong>Intended Impressions:</strong>{' '}
              {product.min_impressions} - {product.max_impressions}
            </p>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button className={styles.buyNow}>Buy Now</button>
              <button className={styles.addToBasket}>Add to Basket</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
