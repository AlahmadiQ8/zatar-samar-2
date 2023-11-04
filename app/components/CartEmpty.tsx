import {Link} from '@remix-run/react';
import {translations} from '../translations';

export function CartEmpty() {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-lg font-medium text-gray-900">
        {translations.cartEmpty.ar}
      </h3>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {translations.keepShoping.ar}
        </Link>
      </div>
    </div>
  );
}
