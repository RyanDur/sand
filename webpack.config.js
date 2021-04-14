const path = require('path');
const currentDir = __dirname;
const PATHS = {
    dist: path.resolve(__dirname, 'dist'),
    exclude: /node_modules|cypress/
};

const base = ({dist, exclude}) => ({
    target: 'node',
    context: path.resolve(currentDir),
    mode: 'production',
    output: {
        filename: 'index.js',
        library: {
            name,
            type: 'umd'
        },
        clean: true
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: exclude
        }]
    },
    resolve: {
        extensions: ['*', '.tsx', '.ts', '.js']
    }
});

const last = (list) => list[list.length - 1]
const name = last(__dirname.split('/'));

module.exports = (mode) => base(PATHS)