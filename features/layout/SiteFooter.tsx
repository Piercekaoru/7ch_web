import Link from 'next/link';

import { tServer } from '../../lib/i18n/dictionaries';
import { buildLocalizedStaticPath } from '../../lib/i18n/routing';
import { getServerLocale } from '../../lib/i18n/server';
import { DonateFooterButton } from './DonateFooterButton.client';

export async function SiteFooter() {
  const locale = await getServerLocale();

  return (
    <footer className="themed-footer-shell mt-auto py-8 text-center text-sm">
      <div className="mb-4 flex flex-wrap justify-center gap-4 sm:gap-6">
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/privacy', locale)}>
          {tServer('page.privacy.title', locale)}
        </Link>
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/docs', locale)}>
          {tServer('page.docs.title', locale)}
        </Link>
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/terms', locale)}>
          {tServer('page.terms.title', locale)}
        </Link>
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/help', locale)}>
          {tServer('page.help.title', locale)}
        </Link>
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/QA', locale)}>
          {tServer('page.qa.title', locale)}
        </Link>
        <Link className="themed-nav-link hover:underline" href={buildLocalizedStaticPath('/changelog', locale)}>
          {tServer('page.changelog.title', locale)}
        </Link>
        <DonateFooterButton label={tServer('footer.donate', locale)} />
      </div>
      <div>&copy; 2024 7ch Project. All rights reserved.</div>
    </footer>
  );
}
