/*============================================*\
 * Require Gulp Modules
\*============================================*/
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const glob = require('glob');
const path = require('path');
const isparta = require('isparta');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');
const manifest = require('./package.json');
const destinationFolder = './dist';
const builds = require('./src/builds.json');

const config = manifest.babelBoilerplateOptions;

/*============================================*\
 * Task Definitions
\*============================================*/
gulp.task('clean', del.bind(undefined, [destinationFolder]));
gulp.task('clean-tmp', del.bind(undefined, ['tmp']));

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

  gulp.task('build-' + key, ['lint-src', 'clean'], buildComplete.bind(undefined, build));

  gulp.task('watch-' + key, ['build-' + key], function () {
    gulp.watch('src/**/*.js', ['build-' + key]);
  });

  gulp.task('serve-' + key, ['build-' + key], function () {
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

    gulp.watch(['src/**/*.js', './demos/' + key], ['build-' + key]).on('change', browserSync.reload);;
  });
});

gulp.task('build', builds.map(function (b) {return 'build-' + b.key.toLowerCase()}));

function buildComplete(build, done) {
  _builds.push(build);

  gulp.src(build.entry)
    .pipe($.plumber())
    .pipe($.rollup())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.babel({
      modules: 'amd'
    }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder + '/' + build.key))
    .pipe($.filter(['*', '!**/*.js.map']))
    .pipe($.rename(build.key + '.min.js'))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder+ '/' + build.key))
    .on('end', done);
}

// An alias of test
gulp.task('default', ['test']);
