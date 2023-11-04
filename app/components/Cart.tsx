import type {CartActionInput} from '@shopify/hydrogen';
import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {Link, useFetcher} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {encodeCart, getLocalizedAmount, useVariantUrl} from '~/utils';
import {CartEmpty} from './CartEmpty';
import {
  CheckCircleIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {translations} from '~/translations';
import {useState} from 'react';
import {RadioGroup} from '@headlessui/react';
import {WhatsAppIcon} from './WhatsAppIcon';

type CartLine = CartApiQueryFragment['lines']['nodes'][0];

type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: 'page' | 'aside';
};

const paymentMethods = [
  {id: 'online', title: translations.online.ar},
  {id: 'cash', title: translations.cash.ar},
];

const deliveryMethods = [
  {
    id: 1,
    title: translations.pickup.ar,
    turnaround: translations.pickupYourSelf.ar,
    price: 0,
  },
  {
    id: 2,
    title: translations.delivery.ar,
    turnaround: '',
    price: translations.deliveryPriceBasedOnCity.ar,
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

const customerInfo = {
  recipient: '',
  shippingMethod: deliveryMethods[0],
  deliveryAddress: '',
  paymentMethod: paymentMethods[0].title,
};

export function CartMain({cart}: CartMainProps) {
  const [currentCustomerInfo, setCurrrentCustomerInfo] = useState(customerInfo);

  const {totalQuantity, lines, cost} = cart!;
  const fetcher = useFetcher();

  if (totalQuantity == 0) {
    return <CartEmpty />;
  }

  const buildFormInput: (
    event: React.ChangeEvent<HTMLSelectElement>,
    id: string,
  ) => CartActionInput = (e, id) => ({
    action: CartForm.ACTIONS.LinesUpdate,
    inputs: {
      lines: [{id, quantity: parseInt(e.target.value)}],
    },
  });

  const inqueryEncoded = encodeCart(
    currentCustomerInfo,
    lines.nodes,
    cost.totalAmount.amount,
  );

  const recipientOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrrentCustomerInfo({
      ...currentCustomerInfo,
      recipient: e.target.value,
    });
  };

  const setSelectedDeliveryMethodWrapper = (value: {
    id: number;
    title: string;
    turnaround: string;
    price: number;
  }) => {
    setCurrrentCustomerInfo({
      ...currentCustomerInfo,
      shippingMethod: value,
    });

    // setSelectedDeliveryMethod(value);
  };

  const deliveryAddressOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrrentCustomerInfo({
      ...currentCustomerInfo,
      deliveryAddress: e.target.value,
    });
  };

  const setPaymentMethod = (e: React.ChangeEvent<HTMLInputElement>) => {
    // debugger
    setCurrrentCustomerInfo({
      ...currentCustomerInfo,
      paymentMethod: e.target.value,
    });
  };

  return (
    <div className="mt-12 flex flex-col">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
          {lines.nodes.map((line) => {
            return (
              <li key={line.id} className="flex py-6 sm:py-10">
                <div className="flex-shrink-0">
                  {line.merchandise.image && (
                    <Image
                      alt={line.merchandise.title}
                      aspectRatio="1/1"
                      data={line.merchandise.image}
                      height={100}
                      loading="lazy"
                      width={100}
                    />
                  )}
                </div>

                <div className="rtl:mr-4 ltr:ml-4 flex-1 flex flex-col justify-between ltr:sm:ml-6 rtl:sm:mr-6">
                  <div className="relative rtl:pl-9 ltr:pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 rtl:sm:pl-0 ltr:sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <a
                            href={`/products/${line.merchandise.product.handle}`}
                            className="font-medium text-gray-700 hover:text-gray-800"
                          >
                            {line.merchandise.title}
                          </a>
                        </h3>
                      </div>
                      <ul className="mt-1 flex text-sm divide-x divide-gray-200 text-gray-500">
                        {line.merchandise.selectedOptions.map((option) => (
                          <li key={option.value}>{option.value}</li>
                        ))}
                      </ul>
                      <Money
                        as="p"
                        className="mt-1 text-sm font-medium text-gray-900"
                        data={line.cost.amountPerQuantity}
                      />
                    </div>

                    <div className="mt-4 sm:mt-0 rtl:sm:pl-9 ltr:sm:pr-9">
                      <select
                        id={`quantity-${line.id}`}
                        name={`quantity-${line.id}`}
                        onChange={(e) => {
                          console.log('changing ' + e.target.value);
                          console.log(buildFormInput(e, line.id));
                          fetcher.submit(
                            {
                              [CartForm.INPUT_NAME]: JSON.stringify(
                                buildFormInput(e, line.id),
                              ),
                            },
                            {method: 'POST', action: '/cart'},
                          );
                        }}
                        defaultValue={line.quantity}
                        className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 rtl:text-right ltr:text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((quantity) => (
                          <option key={quantity} value={quantity}>
                            {quantity}
                          </option>
                        ))}
                      </select>

                      <div className="absolute top-0 rtl:left-0 ltr:right-0">
                        <div className='className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500 disabled:pointer-events-all disabled:cursor-wait"'>
                          <CartForm
                            route="/cart"
                            action={CartForm.ACTIONS.LinesRemove}
                            aria-label="Remove from cart"
                            inputs={{lineIds: [line.id]}}
                          >
                            <button type="submit">
                              <XMarkIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </CartForm>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="summary-heading"
        className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
      >
        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
          {translations.orderSummary.ar}
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">
              {translations.subtotal.ar}
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              {/* <CartEstimatedCost amountType="subtotal" /> */}
              <Money as="p" data={cost.subtotalAmount} />
            </dd>
          </div>
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <dt className="flex items-center text-sm text-gray-600">
              {translations.shipping.ar}
            </dt>
            <dd className="text-sm text-gray-500">
              {translations.calculatedAtNextStep.ar}
            </dd>
          </div>
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <dt className="text-base font-medium text-gray-900">
              {translations.orderTotal.ar}
            </dt>
            <dd className="text-base font-medium text-gray-900">
              <Money as="p" data={cost.totalAmount} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-2">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {translations.contactInformation.ar}
          </h2>

          <div className="mt-4">
            <label
              htmlFor="receipt-for-who"
              className="block text-sm font-medium text-gray-700"
            >
              {translations.receiptByWho.ar}
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="receipt-for-who"
                name="receipt-for-who"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                onChange={recipientOnChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-10">
          <RadioGroup
            value={currentCustomerInfo.shippingMethod}
            onChange={setSelectedDeliveryMethodWrapper}
          >
            <RadioGroup.Label className="text-lg font-medium text-gray-900">
              {translations.deliveryMethod.ar}
            </RadioGroup.Label>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              {deliveryMethods.map((deliveryMethod) => (
                <RadioGroup.Option
                  key={deliveryMethod.id}
                  value={deliveryMethod}
                  className={({checked, active}) =>
                    classNames(
                      checked ? 'border-transparent' : 'border-gray-300',
                      active ? 'ring-2 ring-indigo-500' : '',
                      'relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none',
                    )
                  }
                >
                  {({checked, active}) => (
                    <>
                      <div className="flex-1 flex">
                        <div className="flex flex-col">
                          <RadioGroup.Label
                            as="span"
                            className="block text-sm font-medium text-gray-900"
                          >
                            {deliveryMethod.title}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className="mt-6 text-sm font-medium text-gray-900"
                          >
                            {typeof deliveryMethod.price == 'number'
                              ? getLocalizedAmount(deliveryMethod.price)
                              : deliveryMethod.price}
                          </RadioGroup.Description>
                        </div>
                      </div>
                      {checked ? (
                        <CheckCircleIcon
                          className="h-5 w-5 text-indigo-600"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div
                        className={classNames(
                          active ? 'border' : 'border-2',
                          checked ? 'border-indigo-500' : 'border-transparent',
                          'absolute -inset-px rounded-lg pointer-events-none',
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-medium text-gray-900">
            {currentCustomerInfo.shippingMethod.id == 1
              ? translations.pickupInformation.ar
              : translations.shippingInformation.ar}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            {currentCustomerInfo.shippingMethod.id == 1 ? (
              <PickupInformation />
            ) : (
              <DeliveryInformation onChangeHandler={deliveryAddressOnChange} />
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="mt-10 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-medium text-gray-900">Payment</h2>

          <fieldset className="mt-4">
            <legend className="sr-only">Payment type</legend>
            <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10 sm:space-x-reverse ">
              {paymentMethods.map((paymentMethod, paymentMethodIdx) => (
                <div
                  key={paymentMethod.id}
                  className="flex items-center"
                  onChange={setPaymentMethod}
                >
                  {paymentMethodIdx === 0 ? (
                    <input
                      id={paymentMethod.id}
                      name="payment-type"
                      type="radio"
                      defaultChecked
                      value={paymentMethod.title}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                  ) : (
                    <input
                      id={paymentMethod.id}
                      name="payment-type"
                      type="radio"
                      value={paymentMethod.title}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                  )}

                  <label
                    htmlFor={paymentMethod.id}
                    className="rtl:mr-3 ltr:ml-3 block text-sm font-medium text-gray-700"
                  >
                    {paymentMethod.title}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="">
        <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
          <Link
            to={`https://wa.me/96565544219?text=${inqueryEncoded}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {translations.sendOrderThroughWhatsapp.ar}
            <WhatsAppIcon
              className="rtl:mr-3 ltr:ml-3 rtl:-ml-1 ltr:-mr-1 h-5 w-5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CartLines({
  lines,
  layout,
}: {
  layout: CartMainProps['layout'];
  lines: CartApiQueryFragment['lines'] | undefined;
}) {
  if (!lines) return null;

  return (
    <div aria-labelledby="cart-lines">
      <ul>
        {lines.nodes.map((line) => (
          <CartLineItem key={line.id} line={line} layout={layout} />
        ))}
      </ul>
    </div>
  );
}

function CartLineItem({
  layout,
  line,
}: {
  layout: CartMainProps['layout'];
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  return (
    <li key={id} className="cart-line">
      {line.merchandise.image && (
        <Image
          alt={line.merchandise.title}
          aspectRatio="1/1"
          data={line.merchandise.image}
          height={100}
          loading="lazy"
          width={100}
        />
      )}

      <div>
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              // close the drawer
              window.location.href = lineItemUrl;
            }
          }}
        >
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        <CartLinePrice line={line} as="span" />
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value}
              </small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

export function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment['cost'];
  layout: CartMainProps['layout'];
}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Totals</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {cost?.subtotalAmount?.amount ? (
            <Money data={cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      {children}
    </div>
  );
}

function CartLineRemoveButton({lineIds}: {lineIds: string[]}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button type="submit">Remove</button>
    </CartForm>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantiy">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineRemoveButton lineIds={[lineId]} />
    </div>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return (
    <div>
      <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function PickupInformation() {
  return (
    <div className="sm:col-span-2">
      <div className="block text-sm font-medium text-gray-700">
        {translations.address.ar}
      </div>
      <div className="mt-2 block text-sm font-normal text-gray-700">
        {translations.fullAddress.ar}
      </div>
      <div className="mt-2 block text-sm font-medium text-gray-700">
        {translations.googleMapsAddress.ar}
      </div>
      <div className="mt-1">
        <Link
          to="https://goo.gl/maps/H887haRhckgJNgep9"
          // className="inline-flex rtl:flex-row-reverse items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          className="inline-flex rtl:flex-row-reverse items-center text-sm text-blue-500 hover:text-blue-700"
          target="_blank"
          rel="noopener"
        >
          https://goo.gl/maps/H887haRhckgJNgep9
          <MapPinIcon className="ml-3 ltr:-mr-1 h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function DeliveryInformation({
  onChangeHandler,
}: {
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <label
        htmlFor="address"
        className="block text-sm font-medium text-gray-700"
      >
        {translations.address.ar}
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="address"
          id="address"
          autoComplete="street-address"
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={translations.addressPlaceHolder.ar}
          onChange={onChangeHandler}
        />
      </div>
    </div>
  );
}
