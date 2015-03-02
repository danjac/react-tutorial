var browserify = require('gulp-browserify'),
    babel = require('gulp-babel'),
    bowerFiles = require('main-bower-files'),
    watchify = require('watchify'),
    gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    shell = require('gulp-shell'),
    minifyCss = require('gulp-minify-css'),
    gulpFilter = require('gulp-filter'),
    concat = require('gulp-concat'),
    es6ify = require('es6ify');

var staticDir = './public',
    assetsDir = './src',
    watch = false,
    cssFilter = gulpFilter('*.css'),
    jsFilter = gulpFilter(['*.js', '*.jsx']),
    fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);


var src = {
    js: assetsDir + '/js',
    css: assetsDir + '/css',
    fonts: assetsDir + '/fonts'
};

var dest = {
    js: staticDir + '/js',
    css: staticDir + '/css',
    fonts: staticDir + '/fonts'
};


gulp.task('build-js', function() {

    gulp.src(src.js + '/app.js')
        .pipe(babel())
        .pipe(browserify({
            cache: {},
            packageCache: {},
            fullPaths: true,
            transform: [
                "reactify",
                "envify",
                es6ify.configure(/.jsx/)
            ],
            extensions: ['.js', '.jsx']
        }))
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(dest.js));

});

gulp.task('pkg', function() {

    return gulp.src(bowerFiles({
            debugging: true,
            checkExistence: true,
            base: 'bower_components'
        }))
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(dest.js))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(concat('vendor.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(dest.css))
        .pipe(cssFilter.restore())
        .pipe(fontFilter)
        .pipe(gulp.dest(dest.fonts));
});

gulp.task('build-css', function() {
    return gulp.src(src.css + '/*.css')
        .pipe(plumber())
        .pipe(concat('app.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(dest.css));
});


gulp.task('install', shell.task([
    'bower cache clean',
    'bower install'
]));


gulp.task('default', function() {
    gulp.start('install', 'pkg', 'build-css', 'build-js');
    gulp.watch(src.js + '/**', {}, ['build-js']);
    gulp.watch(src.css + '/**', {}, ['build-css']);
});
