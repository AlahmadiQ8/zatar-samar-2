import type {ProductType} from './ProductCard';
import {ProductCard} from './ProductCard';

export function ProductList({products}: {products: ProductType[]}) {
  // Return a list of products organized in a three-column grid.
  return (
    <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
      {products.map((product) => (
        // Each product card maps to a product in the storefront.
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
