module.exports = {
    content: ['./public/index.html', './public/assets/{app,dom,forms,motion,controls}.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter', 'sans-serif'],
                mono: ['ui-monospace', 'monospace']
            }
        }
    }
};
