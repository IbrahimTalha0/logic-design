export const LINKEDIN = 'https://www.linkedin.com/in/ibrahimtalhademir/';

/** "Hazırlayan" bağlantısı (LinkedIn profili, yeni sekmede açılır) */
export function Credit({ className = '' }: { className?: string }) {
  return (
    <a className={`credit ${className}`} href={LINKEDIN} target="_blank" rel="noopener noreferrer">
      Hazırlayan: <b>İbrahim Talha Demir</b> <span aria-hidden>↗</span>
    </a>
  );
}
