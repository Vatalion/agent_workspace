const path = require('path');

module.exports = {
    target: 'node',
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    entry: path.resolve(__dirname, 'src/extension.ts'), // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: 'nosources-source-map',
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                "sourceMap": true,
                            }
                        }
                    }
                ]
            }
        ]
    },
    performance: {
        hints: false
    }
};
