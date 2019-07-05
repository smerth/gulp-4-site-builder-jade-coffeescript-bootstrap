const devBuild =
  (process.env.NODE_ENV || "development").trim().toLowerCase() ===
  "development";

var gulp = require("gulp"),
  noop = require("gulp-noop"),
  size = require("gulp-size"),
  postcss = require("gulp-postcss"),
  gulpPug = require("gulp-pug"),
  gulpCoffee = require("gulp-coffee"),
  gutil = require("gulp-util"),
  concat = require("gulp-concat"),
  gulpBrowserify = require("gulp-browserify"),
  gulpif = require("gulp-if"),
  uglify = require("gulp-uglify"),
  gulpImagemin = require("gulp-imagemin"),
  imageminPngcrush = require("imagemin-pngcrush"),
  gulpSass = require("gulp-sass"),
  path = require("path"),
  ghPages = require("gh-pages"),
  gulpGhPages = require("gulp-gh-pages"),
  browserSync = require("browser-sync").create(),
  // browsersync = devBuild ? require("browser-sync").create() : null,
  sourcemaps = devBuild ? require("gulp-sourcemaps") : null;

// You can declare variables in a .env file to make them
// available in the jade templates
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
});

// By default the environment is development
var env = process.env.NODE_ENV || "development";

// Set variables based on the environment
if (env === "development") {
  outputDir = "./builds/development/";
  sassStyle = "expanded";
  sassOpts = {
    sourceMap: require("gulp-sourcemaps"),
    imagePath: "/images/",
    precision: 3,
    errLogToConsole: true
  };
  pugOptions = {
    // debug: true
    // compileDebug: true
    locals: {
      baseUrl: "/"
    }
  };
  coffeeOptions = {
    bare: true
    // inlineMap: true
  };
} else {
  outputDir = "./builds/production/";
  sassStyle = "compressed";
  sassOpts = {
    imagePath: `${process.env.BASE_URL}` + "/images/",
    precision: 3,
    errLogToConsole: true
  };
  pugOptions = {
    debug: false,
    compileDebug: false,
    locals: {
      baseUrl: `${process.env.BASE_URL}`
    }
  };
  coffeeOptions = {
    bare: true
    // inlineMap: false
  };
}

// Process PUG PAGES into HTML for DEVELOPMENT and PRODUCTION
var pagesSource = "src/pages/**/*.pug";

function compilePugPages() {
  return gulp
    .src(pagesSource)
    .pipe(gulpPug(pugOptions))
    .pipe(gulp.dest(outputDir));
}

// Process COFFEESCRIPT FILES into JAVASCRIPT files and place in the JAVASCRIPT folder.
// Use an array incase you need to pass in other paths in a defined order...
var coffeeSources = ["./src/coffee/**/*.coffee"];

function transpileCoffeeFiles() {
  return gulp
    .src(coffeeSources)
    .pipe(gulpCoffee(coffeeOptions).on("error", gutil.log))
    .pipe(gulp.dest("./src/javascript/"));
}

// Concatenate JAVSCRIPT LIBRARY files for DEVELOPMENT and PRODUCTION
// Control the order of processing by listing files in an array
var librarySources = [
  // "node_modules/jquery/dist/jquery.min.js",
  "node_modules/popper.js/dist/umd/popper.min.js",
  "node_modules/bootstrap/dist/js/bootstrap.min.js",
  "node_modules/prismjs/prism.js"
  // "./src/javascript/rclick.js",
  // "./src/javascript/pixgrid.js",
];

function moveLibraryFiles() {
  return gulp.src(librarySources).pipe(gulp.dest(outputDir + "js"));
}

// Concatenate JAVASCRIPT files for DEVELOPMENT and PRODUCTION
// Control the order of processing by listing files in an array
var javascriptSources = ["./src/javascript/**/*.js"];

function concatenateJavascriptFiles() {
  return gulp
    .src(librarySources)
    .pipe(concat("main.js"))
    .pipe(
      gulpBrowserify({
        insertGlobals: true,
        debug: !env.production
      })
    )
    .pipe(gulpif(env === "production", uglify()))
    .pipe(gulp.dest(outputDir + "js"));
}

// Process IMAGE files
var imageSources = ["src/images/**/*.*"];

function processImageFiles() {
  return gulp
    .src(imageSources)
    .pipe(
      gulpif(
        env === "production",
        gulpImagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [imageminPngcrush()]
        })
      )
    )
    .pipe(gulp.dest(outputDir + "images"));
}

/**************** CSS task ****************/
const cssConfig = {
  src: "./src/scss/main.scss",
  watch: "./src/scss/**/*",
  build: outputDir + "css/",
  sassOpts: {
    sourceMap: devBuild,
    imagePath: outputDir + "/images/",
    precision: 3,
    errLogToConsole: true
  },

  postCSS: [
    // require("usedcss")({
    //   html: ["index.html"]
    // }),
    require("postcss-assets")({
      loadPaths: ["images/"],
      basePath: outputDir,
      baseUrl: `${pugOptions.locals.baseUrl}`
    }),
    require("autoprefixer")({
      browsers: ["> 2%"]
    }),
    require("cssnano")
  ]
};

function css() {
  return gulp
    .src(cssConfig.src)
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(gulpSass(cssConfig.sassOpts).on("error", gulpSass.logError))
    .pipe(postcss(cssConfig.postCSS))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(cssConfig.build))
    .pipe(browserSync ? browserSync.reload({ stream: true }) : noop());
}
// exports.compileScssFiles = gulp.series(css);

// var scssSources = ["src/scss/main.scss"];

// // Compile SCSS files to css
// function compileScssFiles() {
//   return gulp
//     .src(scssSources)
//     .pipe(gulpSass(sassOpts).on("error", gulpSass.logError))
//     .pipe(gulp.dest(outputDir + "css"));
// }
// gulp.task("sass", function() {});

function watch() {
  browserSync.init({
    watchEvents: ["change", "add", "unlink", "addDir", "unlinkDir"],
    server: {
      baseDir: outputDir
    },
    open: "external"
  });
  gulp.watch(librarySources, moveLibraryFiles);
  gulp.watch(coffeeSources, transpileCoffeeFiles);
  gulp.watch(javascriptSources, concatenateJavascriptFiles);
  gulp.watch(imageSources, processImageFiles);
  gulp.watch("src/scss/**/*.*", css);
  gulp.watch(pagesSource, compilePugPages);
  gulp.watch("src/includes/**/*.pug", compilePugPages);
  gulp.watch([outputDir + "**/*.*"]).on("change", browserSync.reload);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: outputDir
    },
    open: "external"
  });
}

// Working!
function deploy(cb) {
  ghPages.publish(
    outputDir,
    {
      src: "**/*",
      branch: "gh-pages",
      dest: ".",
      dotfiles: false,
      add: false,
      message: "Auto-generated commit",
      push: true,
      silent: false
    },
    cb()
  );
}

var build = gulp.series(
  moveLibraryFiles,
  processImageFiles,
  transpileCoffeeFiles,
  concatenateJavascriptFiles,

  css,

  compilePugPages
);

// GULP CLEAN
// - delete the build folder

// GULP RESET
// - delete the node_modules folder

var develop = gulp.series(build, watch);

// gulp.task("default", gulp.series(build, watch));

gulp.task("default", develop);

exports.moveLibraryFiles = moveLibraryFiles;
exports.transpileCoffeeFiles = transpileCoffeeFiles;
exports.concatenateJavascriptFiles = concatenateJavascriptFiles;
exports.css = css;
exports.processImageFiles = processImageFiles;
exports.compilePugPages = compilePugPages;

exports.develop = develop;
exports.build = build;
exports.watch = watch;
exports.deploy = deploy;
