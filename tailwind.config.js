/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        copper: {
          50:  '#FDF6EE',
          100: '#F8E8D4',
          400: '#D9903F',
          500: '#B87333',
          600: '#9A5F28',
        },
        ink: {
          DEFAULT: '#111008',
          soft:    '#3D3526',
          muted:   '#7A6E60',
          faint:   '#B5AFA6',
        },
        surface: {
          DEFAULT: '#F8F7F5',
          card:    '#FFFFFF',
          raised:  '#F0EDE8',
        },
        burgundy: {
          DEFAULT: '#4a0008',
          light:   '#6b000c',
          dark:    '#2d0005',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08)',
        'nav': '0 -1px 0 0 rgba(0,0,0,0.06)',
      }
    }
  },
  plugins: []
}
