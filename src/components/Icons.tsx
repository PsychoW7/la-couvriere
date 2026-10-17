import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: P) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MountainIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 20 9.5 8l3.5 6 2-3 6 9Z" />
    <path d="M8 11.5 9.5 8" />
  </Svg>
);
export const WifiIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14 14 0 0 1 20 0" />
    <circle cx="12" cy="19.5" r="1" fill="currentColor" />
  </Svg>
);
export const CarIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 16H3v-5l2.5-5h13L21 11v5h-2M7 16h10" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </Svg>
);
export const FlameIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-3-8-1 4-5 6-5 12a7 7 0 0 0 7 7Z" />
  </Svg>
);
export const KitchenIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 21V3M4 3h3v8H4M9 21V3M14 10h6V3h-6v7Zm3 11V10" />
  </Svg>
);
export const LinenIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 18V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 18h18M3 14h18M7 6V4h10v2" />
  </Svg>
);
export const PawIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="7" cy="9" r="2" />
    <circle cx="17" cy="9" r="2" />
    <circle cx="10" cy="5" r="2" />
    <circle cx="14" cy="5" r="2" />
    <path d="M12 12c-3 0-5.5 2.5-5.5 5a3 3 0 0 0 3 3c1 0 1.7-.5 2.5-.5s1.5.5 2.5.5a3 3 0 0 0 3-3c0-2.5-2.5-5-5.5-5Z" />
  </Svg>
);
export const ClockIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const ShieldIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
export const CardIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Svg>
);
export const CalendarIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);
export const ArrowRightIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ChevronLeftIcon = (p: P) => (
  <Svg {...p}>
    <path d="m15 6-6 6 6 6" />
  </Svg>
);
export const ChevronRightIcon = (p: P) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const MenuIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const CloseIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);
export const PinIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);
export const PhoneIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Svg>
);
export const MailIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
export const UsersIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2" />
  </Svg>
);
export const BedIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M6 9V6h5v3M13 9V6h5v3" />
  </Svg>
);
export const PanoramaIcon = (p: P) => (
  <Svg {...p}>
    <path d="M2 6c3 1.2 6.5 1.8 10 1.8S19 7.2 22 6v12c-3-1.2-6.5-1.8-10-1.8S5 16.8 2 18V6Z" />
    <path d="m5 15 3.5-4 3 3 2.5-2L19 15" />
  </Svg>
);
export const TagIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 12V4h8l10 10-8 8L3 12Z" />
    <circle cx="7.5" cy="8.5" r="1.5" fill="currentColor" />
  </Svg>
);
export const LeafIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z" />
    <path d="M4 20 14 10" />
  </Svg>
);
export const LockIcon = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
