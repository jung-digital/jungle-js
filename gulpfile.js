/*============================================*\
 * Require Gulp Modules
\*============================================*/
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const es6ify = require('es6ify');
const uglify = require('gulp-uglifyjs');
const browserify = require('browserify');
const filter = require('gulp-filter');
const extractor = require('gulp-extract-sourcemap')
const del = require('del');
const glob = require('glob');
const path = require('path');
const isparta = require('isparta');
const watchify = require('watchify');
const vinylBuffer = require('vinyl-buffer');
const runSequence = require('run-sequence');
const vinylSource = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const manifest = require('./package.json');
const destinationFolder = './dist';
const builds = require('./src/packages.json');
const fs = require('fs');
const mkdirp = require('mkdirp');

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

  browserify({
      debug: true
    })
    .add(es6ify.runtime)
    .transform(es6ify)
    .add(build.entry)
    .bundle()
    .pipe(vinylSource(build.key.toLowerCase() + '.js'))
    .pipe(vinylBuffer())
    .pipe(extractor({
      basedir: destinationFolder,
      removeSourcesContent: true
    }))
    .on('postextract', function(sourceMap){
      exchange.source_map.orig = sourceMap;
      fs.writeFileSync(targetDir + '/' + build.key.toLowerCase() + '.min.js');
    })
    .pipe( filter('**/*.js') )
    .pipe(gulp.dest(targetDir))
    .pipe(uglify(build.key.toLowerCase() + '.min.js', {
      outSourceMap: true,
      basePath: destinationFolder,
      output: {
        source_map: exchange.source_map
      }
    }))
    .pipe(gulp.dest(targetDir))
    .on('end', done);
}

// An alias of test
gulp.task('default', ['test']);
