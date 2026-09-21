/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			purple: {
  				DEFAULT: '#7C3AED',
  				50: '#F5F3FF',
  				100: '#EDE9FE',
  				200: '#DDD6FE',
  				300: '#C4B5FD',
  				400: '#A78BFA',
  				500: '#8B5CF6',
  				600: '#7C3AED',
  				700: '#6D28D9',
  				800: '#5B21B6',
  				900: '#4C1D95',
  				950: '#2E1065',
  			},
  			'brand-purple': {
  				DEFAULT: '#7C3AED',
  				deep: '#5B21B6',
  				darkest: '#4C1D95',
  				light: '#8B5CF6',
  				soft: '#EDE9FE',
  				bg: '#F5F3FF',
  				border: '#E5E0F5',
  			}
  		},
  		boxShadow: {
  			card: '0 1px 3px 0 rgba(76, 29, 149, 0.04), 0 1px 2px -1px rgba(76, 29, 149, 0.04)',
  			'card-hover': '0 4px 12px -2px rgba(124, 58, 237, 0.08), 0 2px 4px -2px rgba(124, 58, 237, 0.05)',
  			elevated: '0 10px 20px -3px rgba(124, 58, 237, 0.09), 0 4px 6px -4px rgba(124, 58, 237, 0.04)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
