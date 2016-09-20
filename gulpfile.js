// Pull plugins into variables
	var gulp           = require('gulp'),
		connect        = require('gulp-connect'),
		util           = require('gulp-util'),
		jade           = require('gulp-jade'),
		htmlmin        = require('gulp-htmlmin'),
		coffee         = require('gulp-coffee'),
		browserify     = require("gulp-browserify"),
		source         = require("vinyl-source-stream"),
		concat         = require('gulp-concat'),
		bower          = require('bower'),
		gulpif         = require("gulp-if"),
		imagemin       = require("gulp-imagemin"),
		pngcrush       = require("imagemin-pngcrush"),
		compass        = require("gulp-compass"),
		flatten        = require('gulp-flatten'),
        gulpFilter     = require('gulp-filter'),
        uglify         = require('gulp-uglify'),
        cssnano        = require('gulp-cssnano'),
        sourcemaps     = require('gulp-sourcemaps'),
        rename         = require('gulp-rename'),
        deploy = require('gulp-gh-pages'),
        mainBowerFiles = require('main-bower-files');

// Path variables
    var sassSource     = ['src/sass/style.scss'],

        coffeeSource   = 'src/scripts/coffee/**/*.coffee',
        fontSource     = 'src/fonts',
        imageSource    = 'src/images/**/*.*',
        svgSource      = 'src/svg',
        src            = 'src',
        development    = 'builds/development',
        staging        = 'builds/staging';

var jsSource = ['src/vendor/**/jquery.js', 
                'src/vendor/**/bootstrap.js'];

// Create server connections
gulp.task('connectdev', function() {
    connect.server({
        root: 'builds/development',
        port: 8080,
        livereload: true
    });
});
gulp.task('connectstage', function() {
    connect.server({
        root: 'builds/staging',
        port: 8001
    });
});


/*
Downloads and installs the libraries listed as dependencies
in bower.json file. Normally you would only run this once when setting up, 
or after including a new Bower dependency.
*/
gulp.task('bower', function(cb) {
    bower.commands.install([], {
            save: true
        }, {})
        .on('end', function(installed) {
            cb(); // notify gulp that this task is finished
        });
});

// 
gulp.task('vendor', function() {
    return gulp.src(mainBowerFiles(/* options */), { base: 'bower_components/' })
        .pipe(gulp.dest(src + '/vendor'))
});

/*
Process CoffeeScript files into js files and place in the js folder.
*/
gulp.task('coffee', function() {
    gulp.src(coffeeSource)
        .pipe(coffee({
                bare: true
            })
            .on('error', util.log))
        .pipe(gulp.dest('src/scripts/js'))
});
/*
Concatenate js files in the js/top folder into a single file to be included at the top of the page and place in staging js folder.
Concatenate js files in the js/bottom folder into a single file to be included at the bottom of the page and place in staging js folder.
*/
gulp.task('js', function() {
    return gulp.src(jsSource)
        // concatinate all js files into a single file
        .pipe(concat('main.js'))
        // .pipe(browserify()) // this seems to be the cause of problems with jquery not being recognized
        .pipe(gulp.dest(development + '/js'))
        .pipe(connect.reload())
});





/*
Write your markup in jade and then
compile to html with this task.
{base: ""} tells gulp.dest to recreate the dir
structure found inside the specified base folder
*/
var jadeSource  = ['src/templates/index.jade', 'src/templates/sections/**/*.jade'];

gulp.task('jadedev', function() {
    

    return gulp.src(jadeSource, {
            base: "./src/templates"
        })
        .pipe(jade({
            pretty: true,
            locals: 0
        }))
        .pipe(gulp.dest(development))
        .pipe(connect.reload())
});


gulp.task('jadestage', function() {
    return gulp.src(jadeSource, {
            base: "./src/templates"
        })
        .pipe(jade({
            pretty: false,
            locals: 1
        }))
        .pipe(gulp.dest(staging))
        .pipe(connect.reload())
});


/*
this task takes the html from development folder and compresses it into staging folder.
*/
gulp.task('htmlmin', function() {
    gulp.src(development + '/**/*.html', {
            base: "./" + development
        })
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(staging))
        .pipe(connect.reload())
});




/*
For a simple SASS processing use the task with gulp-sass.
I you need Susy, Breakpoint, which requires Compass 
- go with the gulp-compass task (which means ruby,...)
*/

// Using gulp-compass to process sass
gulp.task('compass', function() {
    gulp.src(sassSource)
        .pipe(compass({
            sass: 'src/sass',
            css: development + '/css',
            image: development + '/images',
            style: 'expanded',
            comments: true,
            sourcemap: true
        }))
        .on('error', util.log)
        .pipe(gulp.dest(staging + '/css'))
        .pipe(connect.reload());
});


/*
This is the only task not split into development nand staging.  Image files are compressed and sent to both folders...
*/ 

gulp.task('images', function() {
    gulp.src(imageSource)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest(development + '/images'))
        .pipe(gulp.dest(staging + '/images'))
        .pipe(connect.reload())
});

gulp.task('watchdev', function() {
    gulp.watch(coffeeSource, ['coffee'])
    gulp.watch(jsSource, ['js'])
    gulp.watch('src/templates/**/*.jade', ['jadedev'])
    gulp.watch('src/sass/**/*.scss', ['compass'])
    gulp.watch('src/images/**/*.*', ['images'])
});





// compress js from development to staging
gulp.task('jsuglify', function() {    
    gulp.src('builds/development/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest(staging + '/js'))
});


// compress css from development to staging 
gulp.task('cssnano', function () {
    return gulp.src('builds/development/css/style.css')
        // .pipe(sourcemaps.init())
        .pipe(cssnano())
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(staging + '/css'));
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
  return gulp.src("./builds/staging/**/*")
    .pipe(deploy())
});

/*
gulp install assets runs:
bower - download bower dependancies to bower_components
vendor - move bower dependancy main assets to vendor
*/

gulp.task('install-assets', ['bower', 'vendor'])

/*
Gulp default [gulp] runs the following:
connectdev  - serves the contents of development folder at: http://localhost:8080
vendor - moves the main files from bower_components to src_vendor
coffee - compiles coffeescript files to js files and places them in 'src/scripts'
js - concatenates all js files in 'src/scripts' and the bower dependancy js files in 'vendor' 
and places a single js file in 'development/js'
jade - compiles jade template files into html and places them in 'development' while maintaining the folder structure of 'src/templates/pages'
images - compresses image files and moves them to development
watchdev - sets up the watch

Check the following:
- Site should be up and running at > http://localhost:8080
- Bootstrap 4 should be working
- Scripts should be loaded and working (check responsive side-bar menu, errors on the console)
- In terminal gulp should be watching for changes to the code
- Writing changes to: sass stylesheets, jade templates, coffeescripts, js scripts, image files, 
should result in a live reload with changes immediately visible in the browser.
- The development folder should contain un-compressed css and js files. with comments and maps intact.
*/

gulp.task('default', ['connectdev', 'vendor', 'jadedev', 'coffee', 'js', 'compass', 'images', 'watchdev'])



/*
The purpose of gulp stage is move files from development to staging while minifying, 
comressing, removing maps and comments...
*/

gulp.task('stage', ['connectstage', 'jadestage', 'jsuglify', 'compass', 'cssnano'])











