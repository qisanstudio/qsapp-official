'use strict';
// generated on 2014-08-22 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');
var bower = require('main-bower-files');
var yo = {
    dev: 'static-src',
    prod: 'src/official/static'
};
// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src(yo.dev + '/styles/main.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('requirejs', function () {
    $.requirejs({
        baseUrl: yo.dev + '/scripts',
        optimize: 'none',
        include: ['config'],
        mainConfigFile: yo.dev + '/scripts/config.js',
        out: 'base.js',
        useStrict: true,
        wrap: true
    })
    .pipe(gulp.dest(yo.prod));
})

gulp.task('scripts', ['requirejs'], function () {
    return gulp.src(yo.dev + '/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(yo.dev + '/htmls/**/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,' + yo.dev + '}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
//        .pipe($.hashmap({app: yo.dev, dist: yo.prod}))
        .pipe(gulp.dest(yo.prod))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src(yo.dev + '/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(yo.prod + '/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src(bower())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(yo.prod + '/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src([yo.dev + '/*.*', '!' + yo.dev + '/*.html'], { dot: true })
        .pipe(gulp.dest(yo.prod));
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', yo.prod], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static(yo.dev))
        .use(connect.static('.tmp'))
        .use(connect.directory(yo.dev));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect', 'styles'], function () {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src(yo.dev + '/styles/*.scss')
        .pipe(wiredep({
            directory: yo.dev + '/bower_components'
        }))
        .pipe(gulp.dest(yo.dev + '/styles'));

    gulp.src(yo.dev + '/*.html')
        .pipe(wiredep({
            directory: yo.dev + '/bower_components'
        }))
        .pipe(gulp.dest(yo.dev));
});


gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        yo.dev + '/*.html',
        '.tmp/styles/**/*.css',
        yo.dev + '/scripts/**/*.js',
        yo.dev + '/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch(yo.dev + '/styles/**/*.scss', ['styles']);
    gulp.watch(yo.dev + '/scripts/**/*.js', ['scripts']);
    gulp.watch(yo.dev + '/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});