import {useLocation} from '@remix-run/react';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';

export function useVariantUrl(
  handle: string,
  selectedOptions: SelectedOption[],
) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions: SelectedOption[];
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;

  const path = isLocalePathname
    ? `${match![0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

export function encodeCart(orderDetails, lines, totalAmount) {
  let result = '*السلة*\n';
  result += 'ـــــــــــــــــــــــ\n\n';

  for (const line of lines) {
    const productName = line.merchandise.product.title;
    const price = line.cost.amountPerQuantity.amount;
    const totalLinePrice = getLocalizedAmount(parseFloat(price));
    const options = line.merchandise.selectedOptions
      .map((o) => o.value)
      .join(' | ');

    result += `*${productName}*\n`;
    result += options;
    result += `\nالكمية: ${line.quantity}\n`;
    result += totalLinePrice + '\n\n';
  }

  result += '\n*طريقة التوصيل*\n';
  result += 'ـــــــــــــــــــــــ\n';
  result += orderDetails.shippingMethod.title + '\n\n';

  if (orderDetails.shippingMethod.id === 2) {
    result += '\n*العنوان*\n';
    result += 'ـــــــــــــــــــــــ\n';
    result += orderDetails.deliveryAddress + '\n\n';
  }

  result += '\n*طريقة الدفع*\n';
  result += 'ـــــــــــــــــــــــ\n';
  result += orderDetails.paymentMethod + '\n\n';

  result += '\n*الاجمالي قبل رسوم التوصيل*\n';
  result += 'ـــــــــــــــــــــــ\n';
  result += getLocalizedAmount(totalAmount);

  result += '\n\n*الفاتورة باسم*\n';
  result += 'ـــــــــــــــــــــــ\n';
  result += orderDetails.recipient;

  return customEncodeUri(result);
}

function customEncodeUri(str) {
  const strArr = Array.from(str);
  const result = strArr
    .map((letter) => {
      if (/[* \n:]/.test(letter)) {
        return encodeURI(letter);
      }
      return letter;
    })
    .join('');

  return result;
}

export function getLocalizedAmount(value: any) {
  return new Intl.NumberFormat('ar-KW', {
    style: 'currency',
    currency: 'KWD',
  }).format(value);
}
