import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22V2" />
      <path d="M6 10l-4 4 4 4" />
      <path d="M18 10l4 4-4 4" />
      <path d="M2 14h20" />
    </svg>
  );
}
