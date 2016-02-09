/*============================================*\
 * Require Gulp Modules
\*============================================*/
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const filter = require('gulp-filter');
//const extractor = require('gulp-extract-sourcemap')
const del = require('del');
//const glob = require('glob');
const path = require('path');
//const isparta = require('isparta');
//const watchify = require('watchify');
//const vinylBuffer = require('vinyl-buffer');
//const runSequence = require('run-sequence');
//const vinylSource = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const manifest = require('./package.json');
const destinationFolder = './dist';
const builds = require('./src/packages.json');
//const fs = require('fs');
const mkdirp = require('mkdirp');
const webpack = require('gulp-webpack');

const config = manifest.babelBoilerplateOptions;

/*============================================*\
 * Task Definitions
\*============================================*/
gulp.task('clean', del.bind(undefined, [destinationFolder]));

// Send a notification when JSCS fails,
// so that you know your changes didn't build
function jscsNotify(file) {
  if (!file.jscs) { return; }
  return file.jscs.success ? false : 'JSCS failed';
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify));
  });
}

createLintTask('lint-src', ['src/**/*.js']);
createLintTask('lint-test', ['test/**/*.js']);

var _builds = [];

builds.forEach(function (build) {
  var key = build.key.toLowerCase();

  // Clean the target folder
  gulp.task('clean-' + key, del.bind(undefined, [destinationFolder + '/' + key]));

  // Clean the source and place in the target folder
  gulp.task('build-' + key, ['lint-src', 'clean-' + key], buildComplete.bind(undefined, build));

  // Watch all the JS files and run lint and build when a change is made.
  gulp.task('watch-' + key, ['lint-src', 'build-' + key], function () {
    gulp.watch('src/**/*.js', ['build-' + key]);
  });

  // Serve, watch, lint, and build the
  gulp.task('serve-' + key, ['lint-src', 'build-' + key], function () {
    browserSync({
      notify: false,
      port: 3030,
      server: {
        baseDir: ['demos/' + key],
        routes: {
          '/shared': 'demos/shared',
          '/dist': 'dist/' + key,
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch(['src/**/*.js', './demos/' + key], ['lint-src', 'build-' + key]).on('change', browserSync.reload);;
  });
});

gulp.task('build', builds.map(function (b) {return 'build-' + b.key.toLowerCase()}));

function buildComplete(build, done) {
  _builds.push(build);

  var targetDir = destinationFolder + '/' + build.key.toLowerCase();

  var exchange = {
    source_map: {
      file: build.key.toLowerCase() + '.min.js.map',
      root: '/',
      orig: ''
    }
  };

  mkdirp.sync(targetDir);

  var webpackConfig = require('./webpack.config.js');

  webpackConfig.entry = [build.entry];
  webpackConfig.output = {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: build.key.toLowerCase() + '.js'
    };

  gulp.src(build.entry)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(targetDir))
    .on('end', done);
}

gulp.task('list', function () {
  console.log('Run build-[key] to build demo for production.');
  console.log('Run serve-[key] to serve demo in browser.');
  console.log('Run watch-[key] to build and watch the demo for changes.');
  console.log('Keys:');
  var l = builds.map(function (build) {
    return build.key;
  });

  console.log(l.join('\n'));
});

// An alias of test
gulp.task('default', ['test']);
