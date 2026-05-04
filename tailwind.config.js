/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#090b0f',
        },
        accent: {
          blue: '#3b8bf5',
          teal: '#00d4aa',
          amber: '#f5a623',
          red: '#ff4d4d',
          purple: '#9b6dff',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['11px', '14px'],
        sm: ['13px', '18px'],
        base: ['15px', '22px'],
        lg: ['18px', '24px'],
        xl: ['28px', '32px'],
        '2xl': ['48px', '52px'],
      },
      borderRadius: {
        glass: '16px',
      },
    },
  },
  plugins: [],
};
