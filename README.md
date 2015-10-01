# jd-js-lib

This library is designed to build one or more independent IE 10+ compatible JS
modules.

All Javascript is written in ES6 and transpiled.

# Tech Stack

Right now, this stack was scaffolded using Yeoman and Babel Boilerplate. You
will get a warning when you run it saying Esperanto is no longer updated. This is
something we will need to address at some point in the future but is not essential
to fix right now.

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

So for example, to build the `Embers` build:

    gulp build-Embers

Please note that case matters!

All builds will be placed in the `dist` folder when completed.

# Watching

Watching monitors all the files in the entire `src` structure and if any of them
changes it rebuilds the currently watched build.

For example:

    gulp watch-Embers

Will lint and build the `Embers` build and place it in the `dist/Embers` folder.
Every time any file changes in `src` Gulp will rerun the `build-Embers` task.

# Testing in the Browser

`jd-js-lib` only transpiles Javascript. Please do not put any HTML or CSS files in
this library. To test your Javascript, build an independent project that includes
the JS file that is generated in the `dist` folder. This will allow us to create
a distinct separation of concerns and focus on making this a great JS library.
