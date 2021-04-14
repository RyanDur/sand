const {merge, loadTS} = require("@ryandur/webpack-configs");
const path = require('path');
const currentDir = __dirname;
const PATHS = {
    dist: path.resolve(__dirname, 'dist'),
    exclude: /node_modules|cypress/
};

const base = ({dist, exclude}) => merge([{
    target: 'node',
    context: path.resolve(currentDir),
    mode: 'production',
    entry: './index.ts',
    output: {
        chunkFilename: '[base].[chunkhash:4].js',
        filename: '[name].[chunkhash:4].js',
        library: {
            name,
            type: 'umd'
        },
        clean: true
    }
}, loadTS({exclude})
]);

const last = (list) => list[list.length - 1]
const name = last(__dirname.split('/'));

module.exports = (mode, PATHS) => base(PATHS)