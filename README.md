       __                  __         _______
      / /_  ______  ____ _/ /__      / / ___/
 __  / / / / / __ \/ __ `/ / _ \__  / /\__ \
/ /_/ / /_/ / / / / /_/ / /  __/ /_/ /___/ /
\____/\__,_/_/ /_/\__, /_/\___/\____//____/
                 /____/

# Jungle JS

This library is designed to build one or more independent IE 10+ compatible JS
modules, focusing on high-performance audio and graphics.

All Javascript is written in ES6 and transpiled using Traceur and Browserify.

# Tech Stack

Originally, this stack was scaffolded using Yeoman and Babel Boilerplate.

After some refactoring, the new build stack is using Browserify and Traceur.

# TODO

- Hook up unit testing
- Improve issues with packaging structure (see builds.json)

# Gulp

The Gulp file is setup to run a `watch` and `build` plan for each build listed
in the `src/builds.json` file.

Each build contains the following properties:

- `key`: the name of the build. Case sensitive.
- `entry`: the root Javascript file.

Builds may use overlapping dependencies, but when constructed will only include
the dependencies they need.

# Building

To transpile all the builds within `src/builds.json`:

    gulp build

To build a single build, do:

    gulp build-[key]

So for example, to build the `Narrator` build:

    gulp build-narrator

All builds will be placed in the `dist` folder when completed.

# Watching

Watching monitors all the files in the entire `src` structure and if any of them
changes it rebuilds the currently watched build.

For example:

    gulp watch-narrator

Will lint and build the `Embers` build and place it in the `dist/Embers` folder.
Every time any file changes in `src` Gulp will rerun the `build-Embers` task.

# Testing in Browser

The `demos` folder can contain sub-folders, each of which is a test harness.

To serve one up in the browser, while automatically watching all `src` Javascript files,
simply do:

    gulp serve-[key]

# Testing in the Browser

`jungle-js` only transpiles Javascript. Please do not put any HTML or CSS files in
this library. To test your Javascript, build an independent project that includes
the JS file that is generated in the `dist` folder. This will allow us to create
a distinct separation of concerns and focus on making this a great JS library.
