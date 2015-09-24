/*---------------------------------------------------------------------------*\
 * Gulp Modules
\*---------------------------------------------------------------------------*/
const gulp = require('gulp'),
      $ = require('gulp-load-plugins')();

/*---------------------------------------------------------------------------*\
 * NPM Modules
\*---------------------------------------------------------------------------*/
const del = require('del'),
      glob = require('glob'),
      path = require('path'),
      isparta = require('isparta'),
      babelify = require('babelify'),
      watchify = require('watchify'),
      buffer = require('vinyl-buffer'),
      esperanto = require('esperanto'),
      browserify = require('browserify'),
      runSequence = require('run-sequence'),
      source = require('vinyl-source-stream');

/*---------------------------------------------------------------------------*\
 * Load Dependencies
\*---------------------------------------------------------------------------*/
const manifest = require('./package.json'),
      destinationFolder = './dist',
      builds = require('./src/builds.json'),
      config = manifest.babelBoilerplateOptions;

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
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failOnError())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify));
  });
}

createLintTask('lint-src', ['src/**/*.js']);
createLintTask('lint-test', ['test/**/*.js']);

builds.forEach(function (build) {
  // Build two versions of the library
  
  gulp.task('build-' + build.key, ['lint-src', 'clean'], buildComplete.bind(undefined, build));
});

gulp.task('build', builds.map(function (b) {return 'build-' + b.key}));

function bundle(bundler) {
  return bundler.bundle()
    .on('error', function(err) {
      console.log(err.message);
      this.emit('end');
    })
    .pipe($.plumber())
    .pipe(source('./tmp/__spec-build.js'))
    .pipe(buffer())
    .pipe(gulp.dest(''))
    .pipe($.livereload());
}

function buildComplete(build, done) {
  esperanto.bundle({
    base: 'src',
    entry: build.entry,
  }).then(function(bundle) {
    var res = bundle.toUmd({
      // Don't worry about the fact that the source map is inlined at this step.
      // `gulp-sourcemaps`, which comes next, will externalize them.
      sourceMap: 'inline',
      name: build.key
    });

    $.file(build.key + '.js', res.code, { src: true })
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.babel())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder + '/' + build.key))
      .pipe($.filter(['*', '!**/*.js.map']))
      .pipe($.rename(build.key + '.min.js'))
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.uglify())
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder+ '/' + build.key))
      .on('end', done);
  })
  .catch(done);
}
function getBundler() {
  // Our browserify bundle is made up of our unit tests, which
  // should individually load up pieces of our application.
  // We also include the browserify setup file.
  var testFiles = glob.sync('./test/unit/**/*');
  var allFiles = ['./test/setup/browserify.js'].concat(testFiles);

  // Create our bundler, passing in the arguments required for watchify
  var bundler = browserify(allFiles, watchify.args);

  // Watch the bundler, and re-bundle it whenever files change
  bundler = watchify(bundler);
  bundler.on('update', function() {
    bundle(bundler);
  });

  // Set up Babelify so that ES6 works in the tests
  bundler.transform(babelify.configure({
    sourceMapRelative: __dirname + '/src'
  }));

  return bundler;
};

// Build the unit test suite for running tests
// in the browser
gulp.task('browserify', function() {
  return bundle(getBundler());
});

function test() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}));
}

gulp.task('coverage', ['lint-src', 'lint-test'], function(done) {
  require('babel-core/register');
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: isparta.Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
});

// Lint and run our tests
gulp.task('test', ['lint-src', 'lint-test'], function() {
  require('babel-core/register');
  return test();
});

// Ensure that linting occurs before browserify runs. This prevents
// the build from breaking due to poorly formatted code.
gulp.task('build-in-sequence', function(callback) {
  runSequence(['lint-src', 'lint-test'], 'browserify', callback);
});

// These are JS files that should be watched by Gulp. When running tests in the browser,
// watchify is used instead, so these aren't included.
const jsWatchFiles = ['src/**/*', 'test/**/*'];
// These are files other than JS files which are to be watched. They are always watched.
const otherWatchFiles = ['package.json', '**/.eslintrc', '.jscsrc'];

// Run the headless unit tests as you make changes.
gulp.task('watch', function() {
  const watchFiles = jsWatchFiles.concat(otherWatchFiles);
  gulp.watch(watchFiles, ['test']);
});

// Set up a livereload environment for our spec runner
gulp.task('test-browser', ['build-in-sequence'], function() {
  $.livereload.listen({port: 35729, host: 'localhost', start: true});
  return gulp.watch(otherWatchFiles, ['build-in-sequence']);
});

// An alias of test
gulp.task('default', ['test']);
