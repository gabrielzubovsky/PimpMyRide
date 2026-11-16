import type { ModelCredit as Credit } from '../data/types';

// Credit for the car's 3D model. Creative Commons Attribution asks for the
// title, author, source and licence, plus a note of any changes, wherever the
// work is shown; `full` adds the changes and any doubt about the licence.

function Link({ href, children }: { href?: string; children: string }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function ModelCredit({ credit, full = false }: { credit: Credit; full?: boolean }) {
  return (
    <>
      3D model: <Link href={credit.url}>{`“${credit.title}”`}</Link> by{' '}
      <Link href={credit.authorUrl}>{credit.author}</Link>,{' '}
      <Link href={credit.licenceUrl}>{credit.licence}</Link>
      {full ? `. Modified: ${credit.changes}` : ', modified.'}
      {full && credit.unconfirmed && ` Licence unconfirmed: ${credit.unconfirmed} A placeholder for local use only.`}
    </>
  );
}
