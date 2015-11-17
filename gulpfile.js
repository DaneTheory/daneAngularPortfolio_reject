var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var size = require('gulp-size');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var stylish = require('jshint-stylish');
var clean = require('gulp-clean');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');
var reload = browserSync.reload;


// BROWSERSYNC LOCALHOST
gulp.task('browser-sync', function() {
    browserSync.init(['./css/**/*.css', './js/**/*.js'], {
        // Uncomment If Using Vhost To Serve Locally
        // proxy: 'your_dev_site.url'

        // Static Webserver
        server: {
            baseDir: './'
        }
    });
});

// BROWSERSYNC - Auto Page Reload
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// IMAGE OPTIMIZATION
gulp.task('images', function(){
  gulp.src('./images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images/'));
});

// SASS
gulp.task('sass', function() {
  var sizeChecker = size();
  gulp.src('./scss/**/*.{scss,sass}')
    .pipe(sizeChecker)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./dist/styles'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('./css'))
    .pipe(gulp.dest('./dist/styles'))
    .pipe(notify({
          onLast: true,
          message: function () {
              return 'Total size ' + sizeChecker.prettySize;
          }
      }))
    .pipe(reload({stream:true}));
});

// CLEAN SCRIPTS
gulp.task('clean-scripts', function () {
  return gulp.src(['./js/main.js',
                  './js/main.min.js',
                  './dist/scripts/main.js',
                  './dist/scripts/main.min.js',
                  ])
                  .pipe(clean());
});

// SCRIPTS
gulp.task('scripts', ['clean-scripts'], function() {
  var sizeChecker = size();
  return gulp.src([
    // JS Files In Order Of Concatination
    './js/vendor/modernizr.js',
    './js/vendor/html5shim.js',
    './js/vendor/angular.js',
    './js/app.js',
    './js/**/*.js',
    './js/*.js'
    ])
    .pipe(sizeChecker)
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(babel())
    .pipe(gulp.dest('./js'))
    .pipe(gulp.dest('./dist/scripts'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./js'))
    .pipe(gulp.dest('./dist/scripts'))
    .pipe(notify({
          onLast: true,
          message: function () {
              return 'Total size ' + sizeChecker.prettySize;
          }
      }))
    .pipe(browserSync.reload({stream:true}))
});

// DEFAULT
gulp.task('default', ['browser-sync'], function () {
  // SASS Watcher
  gulp.watch(['./scss/*.scss', 'scss/**/*.scss'], ['sass'])
  // SCRIPTS Watcher
  gulp.watch(['./js/*.js', './js/**/*.js'], ['scripts'])
  // BROWSERSYNC RELOAD
  gulp.watch(['./*.html', './views/*.html', './views/**/*.html'], ['bs-reload']);
});
