import {Await, Link} from '@remix-run/react';
import {Suspense} from 'react';
import type {LayoutProps} from './Layout';
import {ShoppingBagIcon} from '@heroicons/react/24/outline';
import {WhatsAppIcon} from './WhatsAppIcon';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

export function Header({cart, header}: HeaderProps) {
  const {shop} = header;
  return (
    <header className=" bg-white fixed top-0 left-0 right-0 z-10">
      <nav aria-label="Top" className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* TODO: NEEDED when we have menus */}
        {/* <div className="border-b border-gray-200 px-4 pb-14 sm:px-0 sm:pb-0"> */}
        <div className="border-b border-gray-200 px-4 sm:px-0 ">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 flex">
              <Link to="/" className="flex items-center h-8 w-auto space-x-2">
                <span className="sr-only">{shop.name}</span>
                <img
                  className="h-8 w-auto"
                  src="/zatarsamar-logo.png"
                  alt="Zatar Samar Logo"
                  height={8}
                  width={10}
                />
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-end">
              <div className="flex items-center">
                <Link
                  to={`https://wa.me/96565544219`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center px-2.5 py-1.5 border border-green-700 shadow-sm text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <div className="flex flex-row-reverse space-x-1">
                    <div>965+</div>
                    <div>65544219</div>
                  </div>
                  <WhatsAppIcon
                    className="rtl:mr-2 ltr:ml-2 rtl:-ml-1 ltr:-mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {/* Cart */}
              <Suspense fallback={<Cart totalQuantity={0} />}>
                <Await resolve={cart}>
                  {(cart) => {
                    if (!cart) return <Cart totalQuantity={0} />;
                    return <Cart totalQuantity={cart.totalQuantity || 0} />;
                  }}
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Cart({totalQuantity}: {totalQuantity: number}) {
  return (
    <div className="mr-4 flow-root lg:ml-8">
      <Link to="/cart" className="group -m-2 p-2 flex items-center">
        <ShoppingBagIcon
          className="flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
        <span className=" rtl:mr-2 ltr:ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
          {totalQuantity}
        </span>
        <span className="sr-only">items in cart, view bag</span>
      </Link>
    </div>
  );
}
