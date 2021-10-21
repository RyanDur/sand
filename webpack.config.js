const path = require('path');
const EslintWebpackPlugin = require('eslint-webpack-plugin');

const currentDir = __dirname;
const PATHS = {
    dist: path.resolve(__dirname, 'dist'),
    exclude: /node_modules|cypress/
};

const base = ({exclude}) => ({
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
    },
    plugins: [
        new EslintWebpackPlugin({
            context: 'src',
            extensions: ['ts', 'tsx'],
            failOnError: true,
            failOnWarning: true,
        })
    ]
});

const last = (list) => list[list.length - 1]
const name = last(__dirname.split('/'));

module.exports = () => base(PATHS)