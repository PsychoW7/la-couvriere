export function HeroIllustration({ title }: { title: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] w-full sm:h-[70%] lg:h-[82%]"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={title}
    >
      <defs>
        <filter id="mist-blur" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="sun-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>

      {/* Soleil ambre */}
      <g transform="translate(1040 190)">
        <circle r="150" fill="#F2A65A" opacity="0.14" filter="url(#sun-glow)" />
        <circle r="88" fill="#F2A65A" />
      </g>

      {/* Plan 1 — le plus lointain, le plus sombre */}
      <path
        fill="#16352A"
        d="M0 420 L120 350 L230 395 L330 300 L440 360 L540 280 L640 345 L760 250 L860 330 L980 270 L1090 340 L1200 290 L1300 350 L1440 300 L1440 800 L0 800 Z"
      />
      {/* Plan 2 */}
      <path
        fill="#1B4A36"
        d="M0 500 L90 455 L190 480 L300 400 L400 470 L510 420 L620 480 L720 400 L840 460 L950 410 L1050 475 L1160 430 L1280 480 L1360 440 L1440 470 L1440 800 L0 800 Z"
      />
      {/* Brume entre les plans */}
      <g filter="url(#mist-blur)" className="animate-drift" opacity="0.55">
        <ellipse cx="380" cy="520" rx="420" ry="34" fill="#E8F0EA" />
        <ellipse cx="1080" cy="505" rx="360" ry="28" fill="#E8F0EA" />
      </g>
      {/* Plan 3 */}
      <path
        fill="#1F6F4A"
        d="M0 580 L110 545 L220 570 L320 520 L430 560 L560 510 L680 565 L790 520 L900 570 L1010 530 L1120 575 L1240 540 L1340 575 L1440 550 L1440 800 L0 800 Z"
      />
      {/* Plan 4 */}
      <path
        fill="#2E8C5E"
        d="M0 660 L130 630 L260 655 L380 615 L500 650 L640 610 L760 655 L880 625 L1010 660 L1140 630 L1260 660 L1360 640 L1440 655 L1440 800 L0 800 Z"
      />
      {/* Plan 5 — premier plan, le plus clair */}
      <path
        fill="#5BBF7A"
        d="M0 740 L160 715 L320 735 L470 705 L620 735 L780 710 L940 740 L1100 715 L1260 740 L1440 720 L1440 800 L0 800 Z"
      />
      {/* Brume basse */}
      <g filter="url(#mist-blur)" opacity="0.35">
        <ellipse cx="720" cy="690" rx="700" ry="26" fill="#E8F0EA" />
      </g>

      {/* Silhouette de palme, bas droite */}
      <g fill="#08190F" transform="translate(1250 800)">
        <path d="M-6 0 C-10 -120 -8 -220 0 -300 C8 -220 10 -120 6 0 Z" />
        <path d="M0 -300 C-80 -340 -170 -330 -230 -270 C-150 -290 -70 -280 0 -280 Z" />
        <path d="M0 -300 C80 -340 170 -330 230 -270 C150 -290 70 -280 0 -280 Z" />
        <path d="M0 -300 C-60 -380 -150 -410 -220 -400 C-140 -370 -60 -330 0 -290 Z" />
        <path d="M0 -300 C60 -380 150 -410 220 -400 C140 -370 60 -330 0 -290 Z" />
        <path d="M0 -300 C-20 -400 -60 -470 -110 -500 C-70 -440 -30 -370 0 -290 Z" />
        <path d="M0 -300 C20 -400 60 -470 110 -500 C70 -440 30 -370 0 -290 Z" />
        <path d="M0 -300 C-5 -400 -2 -470 0 -520 C2 -470 5 -400 0 -300 Z" />
      </g>
    </svg>
  );
}
