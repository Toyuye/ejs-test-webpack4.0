
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const fs = require('fs')
const path = require('path')
const HtmlwebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebapckPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

let  html_ejs_plugin = function(templateArr=[]) {
    let ejsArr = fs.readdirSync('./src/page')
    for(let i=0; i < ejsArr.length; i++) {
        if(/\.ejs$/.test(ejsArr[i])){
            let filePath = ejsArr[i];
            let filename = filePath.substring(filePath.lastIndexOf('\/')+1,filePath.lastIndexOf('.'));
            let conf = {
                template:`./src/page/${filePath}`,
                filename:`${filename}.html`,
                inject: true,
                hash: true,
                minify:{
                    removeAttributeQuotes:true,
                    collapseWhitespace:true,
                }
            }
            templateArr.push(new HtmlwebpackPlugin(conf))
        }
        
    }
    return templateArr
}
let entries = function(map={}) {
    let jsArr = fs.readdirSync('./src/js')
    for(let i=0;i<jsArr.length; i++) {
        if(/\.js/.test(jsArr[i])) {
            let filePath = jsArr[i]
            let filename = filePath.substring(filePath.lastIndexOf('\/')+1,filePath.lastIndexOf('.'));
            map[filename] = `./src/js/${filePath}`
        }
    }
    console.log(map)
    return map
}


entries()
module.exports = (env, argv)=>{
    if(argv.mode === 'development') {
        console.log('开发模式')
        env = {
            NODE_ENV: '"development"',
            HTTP:{
                BASE_URL:'"https://dev.api.toyuye.github.com"'
            }
        }
    }
    if(argv.mode === 'production' && !argv.userTest) {
        env = {
            NODE_ENV: '"userTest"',
            HTTP:{
                BASE_URL:'"https://api.toyuye.github.com"'
            }
        }
    }
    if(argv.mode === 'production' && !!argv.userTest) {
        env = {
            NODE_ENV: '"production"',
            HTTP:{
                BASE_URL:'"https://test.api.toyuye.github.com"'
            }
        }
    }
    return {
        context: path.resolve(__dirname, './'),
        devServer:{
            contentBase: path.resolve(__dirname, './'),
            host:'192.168.17.12',
            port:'8888',
            open:true,
        },
        entry:webpackMerge(entries(), {}),
        output:{
            path: path.resolve(__dirname, 'dist'),
            filename: 'static/page/[name].js',
            publicPath: argv.mode==="development" ? '/' : "./"
        },
        optimization:{
            minimizer:[
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                }),
            ]
        },
        plugins: html_ejs_plugin().concat([
            new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
                'process.env':env
            }),
            new webpack.HashedModuleIdsPlugin(),
            new BundleAnalyzerPlugin({
                analyzerMode: 'disabled',
                analyzerHost: '127.0.0.1',
                analyzerPort: 9966,
            }),
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].css',
                chunkFilename: 'static/css/[id].css'
            }),
            new CopyWebapckPlugin([
                {
                    from:path.resolve(__dirname, './static'),
                    to:'static',
                    ignore: ['.*']
                }
            ])
        ]),
        module:{
            rules:[
                {
                    test: /\.css$/,
                    use:[
                        argv.mode === "development" ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        argv.mode === "development" ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    include: [resolvePath('src'), resolvePath('test'), resolvePath('node_modules/webpack-dev-server/client')]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: assetsPath('img/[name].[hash:7].[ext]'),
                        publicPath:'../../' 
                    }
                },
                {
                    test:/\.(mp4|webm|ogg|mp3|wav|flac|acc)(\?.*0)?$/,
                    loader:'url-loader',
                    options:{
                        limit:10000,
                        name: assetsPath('media/[name].[hash:7].[ext]')
                    }
                },
                {
                    test:/\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    options:{
                        limit: 10000,
                        name: assetsPath('fonts/[name].[hash:7].[ext]')
                    }
                },
                {
                    test:/\.(tpl|ejs)$/,
                    use:'ejs-loader'
                },
                
            ]
        },
        node:{
            setImmediate: false,
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        },
        resolve:{
            alias:{
                '@':resolvePath('src'),
                'common': resolvePath('src/js/lib/common.js')
            }
        }
    }
};

function assetsPath (_path){
    return path.posix.join('static', _path)
}

function resolvePath(dir) {
    return path.join(__dirname, '.', dir)
}
