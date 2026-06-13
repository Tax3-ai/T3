import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { background: '#050505', 'card-bg': '#0A0A0A', primary: '#22C55E' } } },
  plugins: [],
};
export default config;
