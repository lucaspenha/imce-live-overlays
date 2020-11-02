const gulp = require('gulp');
const sass = require('gulp-sass');
var concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

function style(){
    return gulp.src('./src/assets/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./src/assets/css'))
    .pipe(browserSync.stream());
}

function watch(){
    browserSync.init({
        server: {
            baseDir: './src'
        }
    })
    gulp.watch('./src/assets/scss/**/*.scss', style);
    gulp.watch(['./src/assets/js/**/*.js','!./src/assets/js/main.js'], js);
    gulp.watch('./src/**/*.html').on('change', browserSync.reload);

}

function js() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        './src/assets/js/**/*.js',
        '!./src/assets/js/main.js'
    ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./src/assets/js'))
    .pipe(browserSync.stream());
  }

exports.js = js;
exports.style = style;
exports.watch = watch;