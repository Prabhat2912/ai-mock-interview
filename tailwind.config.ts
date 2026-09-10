import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			sans: ["var(--font-barlow)", "Barlow", "ui-sans-serif", "system-ui", "sans-serif"],
			display: ["var(--font-condensed)", "\"Barlow Condensed\"", "Barlow", "ui-sans-serif", "sans-serif"],
		},
  		colors: {
			stage: {
				DEFAULT: "#14110B",
				soft: "#1E1A12",
				raised: "#262117",
				line: "#38311F",
			},
			paper: {
				DEFAULT: "#F4EEE1",
				deep: "#EAE0CB",
				line: "#D6C8AC",
			},
			marquee: {
				DEFAULT: "#D9961F",
				bright: "#F0B73E",
				deep: "#8F5E08",
			},
			tungsten: {
				DEFAULT: "#5C554A",
				bright: "#B9AF9E",
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		boxShadow: {
			stage: "0 18px 40px -18px rgb(20 17 11 / 0.45)",
			lift: "0 10px 24px -12px rgb(20 17 11 / 0.35)",
			stamp: "0 6px 16px -8px rgb(20 17 11 / 0.5)",
		},
		keyframes: {
			"cue-in": {
				from: { opacity: "0", transform: "translateY(14px)" },
				to: { opacity: "1", transform: "translateY(0)" },
			},
			"stamp-in": {
				"0%": { opacity: "0", transform: "scale(1.7) rotate(-7deg)" },
				"60%": { opacity: "1", transform: "scale(0.96) rotate(-7deg)" },
				"100%": { opacity: "1", transform: "scale(1) rotate(-7deg)" },
			},
			lamp: {
				"0%, 100%": { opacity: "1" },
				"50%": { opacity: "0.35" },
			},
			blink: {
				"0%, 100%": { opacity: "1" },
				"50%": { opacity: "0" },
			},
		},
		animation: {
			"cue-in": "cue-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
			"stamp-in": "stamp-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
			lamp: "lamp 1.6s ease-in-out infinite",
			blink: "blink 1s step-end infinite",
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
