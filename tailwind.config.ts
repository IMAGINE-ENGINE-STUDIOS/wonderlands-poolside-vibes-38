import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				coral: {
					DEFAULT: 'hsl(var(--coral))',
					foreground: 'hsl(var(--coral-foreground))'
				},
				teal: {
					DEFAULT: 'hsl(var(--teal))',
					foreground: 'hsl(var(--teal-foreground))'
				},
				orange: {
					DEFAULT: 'hsl(var(--orange))',
					foreground: 'hsl(var(--orange-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'flip-corner-lift': {
					'0%, 8%': { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: '0' },
					'26%': { transform: 'translate3d(-12px,-12px,0) rotate(-9deg)', opacity: '1' },
					'52%': { transform: 'translate3d(-30px,-26px,0) rotate(-17deg)', opacity: '1' },
					'78%': { transform: 'translate3d(-10px,-9px,0) rotate(-6deg)', opacity: '0.85' },
					'100%': { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: '0' }
				},
				'flip-riffle': {
					'0%': { transform: 'rotateY(0deg)', opacity: '0' },
					'12%': { transform: 'rotateY(-18deg)', opacity: '1' },
					'100%': { transform: 'rotateY(-176deg)', opacity: '1' }
				},
				'flip-tab-in': {
					'0%': { opacity: '0', transform: 'translateX(-8px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'hero-marquee': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' }
				},
				'ken-burns': {
					'0%': { transform: 'scale(1.02) translate3d(0, 0, 0)' },
					'100%': { transform: 'scale(1.14) translate3d(0, -2%, 0)' }
				},
				'rule-draw': {
					'0%': { transform: 'scaleX(0)' },
					'100%': { transform: 'scaleX(1)' }
				},
				'accordion-down': {
					from': { height: '0' },
					to': { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from': { height: 'var(--radix-accordion-content-height)' },
					to': { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-30px) rotate(5deg)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'fly-to-top': {
					'0%': { bottom: '1rem', left: '50%', transform: 'translateX(-50%) scale(1)', opacity: '1' },
					'50%': { bottom: '50%', left: '75%', transform: 'translateX(-50%) scale(0.8)', opacity: '0.8' },
					'100%': { bottom: 'calc(100% - 4rem)', left: 'calc(100% - 12rem)', transform: 'translateX(-50%) scale(0.6)', opacity: '0' }
				},
				'medallion-glow': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.0), inset 0 0 0 0 rgba(255,255,255,0.0)', opacity: '0.85' },
					'50%': { boxShadow: '0 0 35px 8px rgba(255,255,255,0.55), inset 0 0 20px 2px rgba(255,255,255,0.25)', opacity: '1' }
				},
				'medallion-wave': {
					'0%': { transform: 'scale(0.85)', opacity: '0.7' },
					'50%': { opacity: '0.35' },
					'100%': { transform: 'scale(1.45)', opacity: '0' }
				},
				'medallion-float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				'medallion-shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-slow': 'float-slow 8s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 4s ease-in-out infinite',
				'wiggle': 'wiggle 2s ease-in-out infinite',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.6s ease-out',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
				'fly-to-top': 'fly-to-top 0.6s ease-in-out forwards',
				'ken-burns': 'ken-burns 20s ease-in-out infinite alternate',
				'rule-draw': 'rule-draw 1.2s ease-out forwards',
				'flip-corner-lift': 'flip-corner-lift 3.6s cubic-bezier(0.4,0,0.2,1) infinite',
				'flip-riffle': 'flip-riffle 620ms cubic-bezier(0.55,0,0.35,1) forwards',
				'flip-tab-in': 'flip-tab-in 400ms ease-out both',
				'medallion-glow': 'medallion-glow 2.4s ease-in-out infinite',
				'medallion-wave': 'medallion-wave 2.4s cubic-bezier(0.25,0.46,0.45,0.94) infinite',
				'medallion-float': 'medallion-float 3s ease-in-out infinite',
				'medallion-shimmer': 'medallion-shimmer 2.2s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
