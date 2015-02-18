'use strict';

var browserify = require('browserify')
  , connect = require('gulp-connect')
  , eslint = require('gulp-eslint')
  , glob = require('glob')
  , gulp = require('gulp')
  , karma = require('gulp-karma')
  , mocha = require('gulp-mocha')
  // , ngmin = require('gulp-ngmin')
  , protractor = require('gulp-protractor').protractor
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , uglify = require('gulp-uglify');

var bowerFiles = require('main-bower-files');
var path = require('path');
var gutil = require('gulp-util');
var less = require('gulp-less');
var jade = require('gulp-jade');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var del = require('del');

/*
 * Useful tasks:
 * - gulp fast:
 *   - linting
 *   - unit tests
 *   - browserification
 *   - no minification, does not start server.
 * - gulp watch:
 *   - starts server with live reload enabled
 *   - lints, unit tests, browserifies and live-reloads changes in browser
 *   - no minification
 * - gulp:
 *   - linting
 *   - unit tests
 *   - browserification
 *   - minification and browserification of minified sources
 *   - start server for e2e tests
 *   - run Protractor End-to-end tests
 *   - stop server immediately when e2e tests have finished
 *
 * At development time, you should usually just have 'gulp watch' running in the
 * background all the time. Use 'gulp' before releases.
 */

var DIST = './dist/';
var liveReload = true;
var LOCALS = {
  title: 'Angular, Browserify & Jade'
};






gulp.task('clean', function(cb) {
  del(['./dist'], cb);
});

gulp.task('lint', function() {
  return gulp.src([
    'gulpfile.js',
    'app/**/*.js',
    'test/**/*.js',
    '!app/angular-index.js',
    '!test/browserified/**',
  ])
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('unit', function () {
  return gulp.src([
    'test/unit/**/*.js'
  ])
  .pipe(mocha({ reporter: 'dot' }));
});

function bundle(bundler) {
  return function () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('bundle.js'))
      // optional, remove if you dont want sourcemaps
        // .pipe(buffer())
        // .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // .pipe(sourcemaps.write('./')) // writes .map file
      //
      .pipe(gulp.dest('./dist'));
  };
}

gulp.task('browserify', ['bower-files'], function () {
  var bundler = browserify('./app/app.js', watchify.args);
  //var bundler = watchify(browserify('./app/app.js', watchify.args));
  //bundler.on('update', bundle(bundler)); // on any dep update, runs the bundler

  //bundler.transform('brfs');
  return bundle(bundler)();
});



gulp.task('browserify-tests', function() {
  var bundler = browserify();
  glob.sync('./test/unit/**/*.js')
  .forEach(function(file) {
    bundler.add(file);
  });
  return bundler.bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('browserified_tests.js'))
  .pipe(gulp.dest('./test/browserified'));
});




// gulp.task('ngmin', ['lint', 'unit'], function() {
//   return gulp.src([
//     'app/js/**/*.js',
//     '!app/js/third-party/**',
//   ])
//   .pipe(ngmin())
//   .pipe(gulp.dest('./app/ngmin'));
// });

// gulp.task('browserify-min', ['ngmin'], function() {
//   return browserify('./app/ngmin/app.js')
//   .bundle()
//   .pipe(source('app.min.js'))
//   .pipe(streamify(uglify({ mangle: false })))
//   .pipe(gulp.dest('./app/dist/'));
// });



gulp.task('less', function () {
  return gulp.src('./app/assets/less/app.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.join(DIST, 'assets')));
});


gulp.task('templates', function () {
  gulp.src(['./app/**/*.jade', '!./app/**/_*.jade'])
    .pipe(jade({
      locals: LOCALS
    }))
    .pipe(gulp.dest(DIST));
});


gulp.task('bower-files', function () {
  return gulp.src(bowerFiles(), {base: './bower_components'})
    .pipe(gulp.dest('./dist/lib'));
});


gulp.task('karma', ['browserify-tests'], function() {
  return gulp
  .src('./test/browserified/browserified_tests.js')
  .pipe(karma({
    configFile: 'karma.conf.js.travis',
    action: 'run'
  }))
  .on('error', function(err) {
    // Make sure failed tests cause gulp to exit non-zero
    throw err;
  });
});

gulp.task('server', ['browserify', 'less', 'templates'], function() {
  connect.server({
    root: DIST,
    livereload: liveReload,
  });
});

gulp.task('e2e', ['server'], function() {
  return gulp.src(['./test/e2e/**/*.js'])
  .pipe(protractor({
    configFile: 'protractor.conf.js',
    args: ['--baseUrl', 'http://127.0.0.1:8080'],
  }))
  .on('error', function(e) { throw e; })
  .on('end', function() {
    connect.serverClose();
  });
});

gulp.task('watch', function() {
  gulp.start('server');
  gulp.watch([
    'app/**/*.js',
    'app/**/*.jade',
    'app/**/*.less',
    'test/**/*.js',
  ], ['fast']);
});

gulp.task('fast', ['clean'], function() {
  gulp.start('dist');
});

gulp.task('dist', ['browserify', 'templates', 'less'], function () {

});

gulp.task('default', ['clean'], function() {
  liveReload = false;
  gulp.start('karma', 'less', 'browserify', 'browserify-min', 'e2e');
});
