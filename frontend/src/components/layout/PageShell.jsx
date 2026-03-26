import PageBackground from './PageBackground';
import SiteHeader from './SiteHeader';

export default function PageShell({
  children,
  withHeader = false,
  headerProps,
  className = '',
  wrapperClassName = '',
  contentClassName = '',
}) {
  return (
    <div className={`page-enter relative min-h-screen overflow-hidden text-[var(--text-primary)] ${className}`.trim()}>
      <PageBackground />
      <div className={`relative z-10 ${wrapperClassName}`.trim()}>
        {withHeader ? <SiteHeader {...headerProps} /> : null}
        <main className={contentClassName}>{children}</main>
      </div>
    </div>
  );
}