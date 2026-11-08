/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      height: {
        'dvh': '100dvh',
      },
      minHeight: {
        'dvh': '100dvh',
      },
      maxHeight: {
        'dvh': '100dvh',
      },
      colors: {
        // ── Brand / Primary (Deep Forest Green #1F6B3A) ─────────────────
        brand: {
          DEFAULT: '#144D29',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#2E9753',
          600: '#228B22',
          700: '#165B32',
          800: '#144D29',
          900: '#0E381C',
          950: '#0B2916',
        },
        // ── Mockup specific semantic tokens ────────────────────────────
        theme: {
          forest: '#144D29',
          forestDark: '#0D2B18',
          forestLight: '#165B32',
          mediumGreen: '#228B22',
          lime: '#84CC16',
          limeLight: '#A3E635',
          mint: '#DCFCE7',
          mintSubtle: '#F0FDF4',
          cream: '#FAF8F2',
          creamLight: '#FFFDF9',
          peach: '#FEF3C7',
          peachDark: '#92400E',
          lightBlue: '#E0F2FE',
          blueAccent: '#0284C7',
        },
        // ── Accent (lime/leaf) — used sparingly ────────────────────────
        accent: {
          DEFAULT: '#65A30D',
          50:  '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        // ── Neutral gray scale ─────────────────────────────────────────
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // ── Semantic status colors ─────────────────────────────────────
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark:  '#14532D',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark:  '#92400E',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark:  '#7F1D1D',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark:  '#1E3A8A',
        },
        // ── App background & surface ───────────────────────────────────
        bg: {
          DEFAULT: '#FAF9F6',
          muted: '#F3F2EF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9FAFB',
          elevated: '#FFFFFF',
        },
        // ── Dark mode surfaces (Soft Charcoal + Muted Green) ───────────
        dark: {
          bg:       '#1E2320',
          surface:  '#272E2A',
          elevated: '#313B35',
          border:   '#3A463F',
          text:     '#F0F4F1',
          muted:    '#A3B8AA',
        },
        // ── Legacy palette kept for compatibility with existing code ───
        forest: {
          DEFAULT: '#1F6B3A',
          dark:    '#18542D',
          light:   '#257F45',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#2E9753',
          600: '#257F45',
          700: '#1F6B3A',
          800: '#18542D',
          900: '#113E21',
        },
        leaf: {
          DEFAULT: '#65A30D',
          light:   '#84CC16',
          dark:    '#4D7C0F',
          50:  '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        mint: {
          DEFAULT: '#DCFCE7',
          light:   '#F0FDF4',
          dark:    '#BBF7D0',
        },
        cream: {
          DEFAULT: '#FAF9F6',
          light:   '#FDFCFA',
          dark:    '#F0EDE6',
        },
        harvest: {
          DEFAULT: '#D97706',
          light:   '#F59E0B',
          dark:    '#B45309',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        earth: {
          DEFAULT: '#78350F',
          light:   '#92400E',
          dark:    '#451A03',
        },
        soil: {
          red:    '#B85338',
          black:  '#3A3837',
          sandy:  '#D4B282',
          clay:   '#9E5D3E',
          loamy:  '#5A4632',
        },
        'dark-text':  '#E7EDE8',
        'dark-muted': '#8FA895',
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          '"Noto Sans"',
          '"Noto Sans Kannada"',
          '"Noto Sans Tamil"',
          '"Noto Sans Telugu"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '36px', fontWeight: '800' }],
        'title':   ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'heading': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '18px', fontWeight: '400' }],
      },

      // ── Shape ──────────────────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',      // 16px — inputs, buttons
        '3xl': '1.25rem',   // 20px — small cards
        '4xl': '1.5rem',    // 24px — cards
        '5xl': '1.75rem',   // 28px — large cards
        '6xl': '2rem',      // 32px — hero cards
      },

      // ── Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        // Hairline border replaces heavy shadows for flat cards
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        // Soft elevated shadow token
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
        // Bottom nav
        'nav': '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.04)',
        // Bottom sheet
        'sheet': '0 -4px 24px rgba(0,0,0,0.12)',
        // Dark mode card
        'card-dark': '0 1px 3px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.18)',
      },

      // ── Spacing supplement ─────────────────────────────────────────────
      spacing: {
        'screen-x': '20px',
        'section':  '24px',
      },

      // ── Keyframes + animations ─────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%':      { transform: 'scale(1.08)', opacity: '0.3' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%':           { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'shimmer':    'shimmer 1.8s infinite',
        'fade-in':    'fade-in 200ms ease-out',
        'slide-up':   'slide-up 220ms ease-out',
        'scale-in':   'scale-in 200ms ease-out',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'dot-1':      'dot-bounce 1.2s ease-in-out infinite',
        'dot-2':      'dot-bounce 1.2s ease-in-out 0.2s infinite',
        'dot-3':      'dot-bounce 1.2s ease-in-out 0.4s infinite',
      },
    },
  },
  plugins: [],
}
