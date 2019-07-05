const withCSS = require('@zeit/next-css');
const withReactSvg = require('next-react-svg');

// https://github.com/zeit/next-plugins/issues/392#issuecomment-475845330
function HackRemoveMinimizeOptionFromCssLoaders(config) {
    console.warn(
        'HACK: Removing `minimize` option from `css-loader` entries in Webpack config',
    );
    config.module.rules.forEach((rule) => {
        if (Array.isArray(rule.use)) {
            rule.use.forEach((u) => {
                if (u.loader === 'css-loader' && u.options) {
                    // eslint-disable-next-line no-param-reassign
                    delete u.options.minimize;
                }
            });
        }
    });
}


module.exports = withCSS(withReactSvg({
    include: `${__dirname}/static`,
    target: 'serverless',
    webpack(config) {
        HackRemoveMinimizeOptionFromCssLoaders(config);
        return config;
    },
    env: { API_URL: process.env.API_URL },
}));
