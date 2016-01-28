# Solid Octo Garbanzo

## What's in a name?
When you create a new repository, Github suggests a non-sense name so you don't have to think one up...

## What does this project do?
This is a Gulp build process for a web app using the following projects:

- Jade for writing HTML templates.
- CoffeeScript for quick writing of Javascript.
- Bootstrap 4 for quick styling using SASS.
- Bower to download and manage project dependencies.

#### [Jump to links](#links)

## How can you work with it?

You write your code in `project/src`

Gulp processes the code in `project/src` into two folders: `development` and `staging`

### `development` should contain:

a single css file containing Bootstrap SASS and your own SASS in a single file.

 a single js file containing any bower js dependencies, your own js files and coffee files all concatenated into one.

 An HTML index files and a pages folder containing any HMTL represented by Jade templates in `src/templates/pages`

 ### `staging` should contain the above content minified with maps and comments removed from css and js files.

 ## How do I get it up and running?

-  Get the repo
-  Make sure you have the following installed globally:
    -  node.js
    -  npm
    -  ruby
    -  compass
    -  bower

-  In the repo folder run: `npm install` that will install everything listed in the `package.json` file.

-  run `gulp install-assets`. That will cause Bower to go out and fetch the asset dependencies listed in `bower.json`

-  run `gulp`. That runs a bunch of tasks listed below and serves up the built development folder contents at: http://localhost:8080

-  When development looks good run `gulp stage`. This will compress the files in the `development` folder into the `staging` folder and serve up the `staging` folder at: http://localhost:8001

-  The main point is write in `src` debug from the results in `development` then compress to `staging` and then push `staging` to the live server.

 ## What's with that file structure?

Its just one way of doing things (I'm sure its not the best way,) but it may be quicker for you than starting from scratch.

This build process will add the following folders and contents:
bower_components
src/vendor
builds/*
node_modules - added by npm when you first install




### Misc. files to consider:
.gitignore - useful to exclude staging/ if you want to track that folder separately and push it somewhere else.

.atomignore - useful to exclude annoying files from the Atom finder side-bar

config.rb - useful if you want to explicitly define your ruby and gems for use with compass to process SASS. ([see note below](#compass))

.ruby-version - you might want to specify a ruby-version (in which case I suggest chruby.)

## What gulp tasks can I use?

### Three main tasks

#### `gulp`

Runs the following:
- connectdev  - serves the contents of development folder at: http://localhost:8080
- vendor - moves the main files from bower_components to src_vendor
- coffee - compiles coffeescript files to js files and places them in 'src/scripts'
- js - concatenates all js files in 'src/scripts' and the bower dependancy js files in 'vendor'
- and places a single js file in 'development/js'
- jade - compiles jade template files into html and places them in 'development' while maintaining the folder structure of 'src/templates/pages'
- images - compresses image files and moves them to development
- watchdev - sets up the watch


#### `gulp install-assets`

Runs:
- bower - download bower dependancies to bower_components
- vendor - move bower dependancy main assets to vendor

#### `gulp stage`

The purpose of gulp stage is move files from development to staging while minifying,
comressing, removing maps and comments...



### Other gulp tasks

#### `gulp bower`


Downloads and installs the libraries listed as dependencies in bower.json file. Normally you would only run this once when setting up,  or after including a new Bower dependency.

#### `gulp vendor`
 Moves only the main Bower dependencies to `src/vendor`  In this build the Javascript processing tasks rely on the .js files (jquery.js and Bootstrap.js) being in `src/vendor`. You'll also see bootstrap.scss here but in fact that file is referenced from bower_components in your style.scss.  That way all of Boostraps partial scss files can be pulled in by Compass...

#### `gulp coffee`

Processes CoffeeScript files into js files and places them in the `src/js` folder.

#### `gulp js`

Concatenate js files in the js/top folder into a single file to be included at the top of the page and place in staging js folder.
Concatenate js files in the js/bottom folder into a single file to be included at the bottom of the page and place in staging js folder.


#### `gulp jade`

Write your markup in jade and then
compile to html with this task. The option: `{base: }` tells `gulp.dest` to recreate the dir
structure found inside the specified base folder.  So you can build directory structure in the pages folder inside templates and it will be reflected in the `development` and `staging` folders

<a name="compass"></a>
#### `gulp compass`

This task will compile any SASS you write in `src/sass` with all of the bootstrap scss and outputs a single css file to `development/css`

This task uses Compass which means you can work with Susy or Breakpoint, etc.  However, using Commpass means dealing with Ruby.

However, for simple SASS processing you could use the task with gulp-sass and do away with Ruby.


#### `gulp images`

This is the only task not split into development nand staging.  Image files are compressed and sent to both folders...

#### `gulp watchdev`

Gulp has the watch function built in.  When developing the watchdev task will make sure changes you make to your code-base are reflected in `development` folder and the brower is reloaded.



#### `gulp htmlmin`

this task takes the html from development folder and compresses it into staging folder.

#### `gulp jsuglify`

compress js from development to staging


#### `gulp cssnano`  

compress css from development to staging





## How do I know its working

### Check the following:
- Site should be up and running at:  http://localhost:8080
- Bootstrap 4 should be working
- Scripts should be loaded and working (check responsive side-bar menu, errors on the console)
- In terminal gulp should be watching for changes to the code
- Writing changes to: sass stylesheets, jade templates, coffeescripts, js scripts, image files,
should result in a live reload with changes immediately visible in the browser.
- The development folder should contain un-compressed css and js files. with comments and maps intact.



<a name="links"></a>
# Links

## Build System

- [Node.js](https://nodejs.org/en/)

- [NPM](https://www.npmjs.com)

- [Gulp](http://gulpjs.com)

- [Bower](http://bower.io)

## Write HTML

- [Jade Language](http://jade-lang.com)

## Write JavaScript

- [CoffeeScript](http://coffeescript.org)

## Write Style

- [SASS](http://sass-lang.com)

- [Bootstrap](http://getbootstrap.com)

- [Bootstrap 4](http://v4-alpha.getbootstrap.com)


### Ditch Bootstrap and go DIY

- [Compass](http://compass-style.org)

- [Susy](http://susy.oddbird.net)

- [Breakpoint](https://github.com/lesjames/Breakpoint)


### Needed for Compass

- [Ruby](https://www.ruby-lang.org/en/)

- [Ruby Gems](https://rubygems.org)

- [chruby](https://github.com/postmodern/chruby)
