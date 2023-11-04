import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';

export type ProductType = RecommendedProductsQuery['products']['nodes'][number];

export function ProductCard({product}: {product: ProductType}) {
  const {title, variants, priceRange, images} = product;
  const hasMoreThanOneVariant = variants.nodes.length > 1;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group border rounded-lg"
    >
      <div className="flex flex-col w-full overflow-hidden space-x-2 rtl:space-x-reverse">
        {images.nodes.length > 0 && (
          <Image
            data={images.nodes[0]}
            className=" object-center object-cover group-hover:opacity-75 ltr:rounded-l-lg rtl:rounded-r-lg"
            // sizes="8rem"
            // width="8rem"
            // height="8rem"
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        )}
        <div className="mb-2">
          <h3 className="mt-4 text-gray-700">{title}</h3>
          <div className="flex rtl:space-x-reverse space-x-1 mt-1 text-lg font-medium text-gray-900 items-center">
            <Money data={priceRange.minVariantPrice} as="p" lang="ar" />
            {hasMoreThanOneVariant && <div>+</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}
