var bowerFiles = require('main-bower-files'),
    gulp = require('gulp'),
    util = require('gulp-util'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    shell = require('gulp-shell'),
    minifyCss = require('gulp-minify-css'),
    gulpFilter = require('gulp-filter'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'), webpack = require('webpack'), webpackDevServer = require('webpack-dev-server'),
    webpackConfig = require('./webpack.config.js'),
    notify = require('gulp-notify');

var staticDir = './public',
    srcDir = './app',
    cssFilter = gulpFilter('*.css'),
    jsFilter = gulpFilter('*.js'),
    fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf'])

var dest = {
    js: staticDir + '/js',
    css: staticDir + '/css',
    fonts: staticDir + '/fonts'
}

var compiler = webpack(webpackConfig);

gulp.task('pkg', function() {
    // installs all the 3rd party stuffs.

    return gulp.src(bowerFiles({
            debugging: true,
            checkExistence: true,
            base: 'bower_components'
        }))
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(dest.js))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(minifyCss())
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(dest.css))
        .pipe(cssFilter.restore())
        .pipe(fontFilter)
        .pipe(gulp.dest(dest.fonts))
})

gulp.task("webpack:build", function(callback) {
	// run webpack
	compiler.run(function(err, stats) {
		if(err) throw new util.PluginError("webpack:build", err);
		util.log("[webpack:build]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task("webpack-dev-server", function(callback) {
    new webpackDevServer(webpack(webpackConfig), {
        publicPath: webpackConfig.output.publicPath,
        hot: true,
        quiet: false,
        lazy: false,
        watchDelay: 300,
        stats: { colors: true },
        historyApiFallback: true
    }).listen(8080, 'localhost', function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log('Listening at localhost:8080');
    });
});

gulp.task('install', shell.task([
    'bower cache clean',
    'bower install'
]));

gulp.task('default', ['webpack-dev-server'], function() {
    gulp.start('install', 'pkg', 'webpack:build')
    gulp.watch(srcDir + '/**', {}, ['watch'])
});
