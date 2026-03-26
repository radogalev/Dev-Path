import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const sitemapSections = [
  {
    titleKey: 'shared.footer.sitemap.sections.primary.title',
    links: [
      { labelKey: 'shared.footer.sitemap.sections.primary.home', to: '/' },
      { labelKey: 'shared.footer.sitemap.sections.primary.login', to: '/login' },
      { labelKey: 'shared.footer.sitemap.sections.primary.signIn', to: '/signin' },
      { labelKey: 'shared.footer.sitemap.sections.primary.paths', to: '/paths' },
    ],
  },
  {
    titleKey: 'shared.footer.sitemap.sections.platform.title',
    links: [
      { labelKey: 'shared.footer.sitemap.sections.platform.dashboard', to: '/dashboard' },
      { labelKey: 'shared.footer.sitemap.sections.platform.roadmap', to: '/roadmap/frontend' },
      { labelKey: 'shared.footer.sitemap.sections.platform.events', to: '/events' },
      { labelKey: 'shared.footer.sitemap.sections.platform.jobs', to: '/jobs' },
    ],
  },
  {
    titleKey: 'shared.footer.sitemap.sections.useful.title',
    links: [
      { labelKey: 'shared.footer.sitemap.sections.useful.apply', to: '/apply' },
      { labelKey: 'shared.footer.sitemap.sections.useful.admin', to: '/admin' },
    ],
  },
];

export default function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 border-t border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_rgba(2,6,23,0.95)_52%)] text-emerald-50/90">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div className="max-w-sm space-y-3">
            <h2 className="text-xl font-black tracking-tight text-emerald-100">Dev Path</h2>
            <p className="text-sm leading-relaxed text-emerald-100/75">
              {t('shared.footer.description', {
                defaultValue: 'A platform for learning, practice, and real career steps in technology.',
              })}
            </p>
          </div>

          {sitemapSections.map((section) => (
            <nav
              key={section.titleKey}
              aria-label={t(section.titleKey, { defaultValue: 'Section' })}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-200/90">
                {t(section.titleKey, { defaultValue: 'Section' })}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      to={link.to}
                      className="text-emerald-100/75 transition-colors duration-200 hover:text-emerald-200"
                    >
                      {t(link.labelKey, { defaultValue: 'Page' })}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-emerald-500/20 pt-5 text-xs text-emerald-200/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t('shared.footer.copyright', {
              year,
              defaultValue: '© {{year}} Dev Path. All rights reserved.',
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
