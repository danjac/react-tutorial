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
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    es6ify = require('es6ify');

var staticDir = './public',
    srcDir = './client',
    watch = false,
    cssFilter = gulpFilter('*.css'),
    jsFilter = gulpFilter(['*.js', '*.jsx']),
    fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);


var dest = {
    js: staticDir + '/js',
    css: staticDir + '/css',
    fonts: staticDir + '/fonts'
};


gulp.task('build-src', function() {
    gulp.src(srcDir + '/app.js')
        .pipe(sourcemaps.init())
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
        .pipe(uglify())
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
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

gulp.task('install', shell.task([
    'bower cache clean',
    'bower install'
]));

gulp.task('default', function() {
    gulp.start('install', 'pkg', 'build-src');
    gulp.watch(srcDir + '/**', {}, ['build-src']);
});
