/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0a7ea4',
                    dark: '#075c7a',
                    light: '#0d9ecf'
                },
                danger: '#DC2626',
                warning: '#F59E0B',
                success: '#10B981',
                transport: {
                    metro: '#003DA5',
                    bus: '#00A64F',
                    tram: '#E19400',
                    rer: '#537DBF'
                }
            }
        },
    },
    plugins: [],
}