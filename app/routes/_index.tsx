import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductList} from '~/components/ProductList';
import {translations} from '~/translations';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const mainCollection = storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {handle: 'main'},
  });

  return defer({mainCollection});
}

export default function Homepage() {
  const {mainCollection} = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <Hero />
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      <RecommendedProducts collection={mainCollection} />
    </div>
  );
}

export function Hero() {
  return (
    <>
      <div className="pt-20 lg:pt-0 lg:mt-16">
        <img
          width={1500}
          height={951}
          className="hidden lg:block h-full w-full object-cover object object-center"
          src="/hero-2.svg"
          alt="Zatar Samar Hero"
        />
        <img
          width={914}
          height={527}
          className="block lg:hidden h-full w-full object-cover object-center"
          src="/hero-2-sm.svg"
          alt="Zatar Samar Hero"
        />
      </div>
    </>
  );
}

function RecommendedProducts({
  collection,
}: {
  collection: Promise<RecommendedProductsQuery>;
}) {
  return (
    <div className="p-5 md:p-12 shadow-xl rounded-xl mb-10">
      <h2 className="text-gray-700 mb-8 text-2xl font-medium">
        {translations.ourProducts.ar}
      </h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={collection}>
          {({collectionByHandle}) => (
            <ProductList products={collectionByHandle?.products.nodes} />
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 2) {
      nodes {
        id
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
      collectionByHandle(handle: $handle) {
        products(first: 100) {
          nodes {
            ...RecommendedProduct
          }
        }
      }
  }
` as const;
