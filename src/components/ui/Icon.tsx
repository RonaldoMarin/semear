import type { SVGProps } from "react";

const paths = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.2-3.9A8 8 0 1 1 8 19Z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2-1.6 1Z" fill="currentColor" stroke="none" />
    </>
  ),
  // frentes
  presence: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  growth: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5Z" />
      <path d="M12 14.5C12 11.2 9.5 9 6 9c0 3.3 2.5 5.5 6 5.5Z" />
      <path d="M7 21h10" />
    </>
  ),
  hands: (
    <>
      <path d="M3 14.5 7 11l3 1.5 3-1 3.5 2.5" />
      <path d="M7 11 4 8" />
      <path d="m16.5 14 1.5-1.5L21 15" />
      <path d="M6 17.5 9 20h4.5l4-3.5" />
      <path d="M10 12.5 12.5 15" />
    </>
  ),
  // participação
  pray: (
    <>
      <path d="M12 3v7.5" />
      <path d="M12 10.5 8.5 14v6h7v-6L12 10.5Z" />
      <path d="M8.5 14 6 12.5V7" />
      <path d="M15.5 14 18 12.5V7" />
    </>
  ),
  go: (
    <>
      <path d="M4 20c3-1 4-4 8-4s5-3 8-6" />
      <circle cx="20" cy="6" r="2" />
      <path d="M4 20h.01M8 18h.01" />
    </>
  ),
  give: (
    <path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z" />
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
