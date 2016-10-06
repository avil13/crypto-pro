var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var reload = function() {
    browserSync.reload();
};

var src = {
    js: [
        'src/js/cadesplugin_api.js',
        'src/js/signature.js',
        // 'src/js/run.js',
        'src/js/app.js'
    ],
    css: [
        'src/scss/app.scss'
    ]
};


var tasks = {};

tasks.js = function(done) {
    return gulp.src(src.js)
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error:\n<%= error %>")
        }))
        .pipe($.sourcemaps.init())
        .pipe($.concat('app.js'))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('public/content/js/'));
};

tasks.css = function(done) {
    return gulp.src(src.css)
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error:\n<%= error %>")
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            errLogToConsole: true
        }))
        .pipe($.concat('app.css'))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('public/content/css/'));
};

tasks.serve = function(done) {
    browserSync.init({
        server: {
            baseDir: "./public"
        },
        ui: {
            port: 8080
        }
    });

    return done();
};


gulp.task('js', tasks.js);
gulp.task('js-watch', ['js'], reload);

gulp.task('css', tasks.css);
gulp.task('css-watch', ['css'], reload);

gulp.task('serve', ['js', 'css'], tasks.serve);


gulp.task('watch', ['js', 'css', 'serve'], function() {
    gulp.watch(src.js, ['js-watch']);
    gulp.watch(src.css, ['css-watch']);
    gulp.watch('public/**/*.html', reload);
});

gulp.task('default', ['watch']);