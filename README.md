# Static Site Generator Built with Gulp and using Jade, Coffeescript and Bootstrap


This project is a static site generator.  It uses Gulp to manage a workflow that does the following:
- compiles coffeescript to javascript
- concatenates your javascript and any libraries you add into a single `main.js` file.
- compiles SCSS to CSS (Bootstrap!)
- compiles Jade to HTML
- generates, and serves a development version of the site on localhost
- compresses HTML, Javascript, CSS and Images into a staging folder and serves that locally to be able to check the build
- adds a base url to the staging build a deploys the site to gh-pages


![App Screenshot](https://raw.githubusercontent.com/smerth/bootstrap-jade-and-coffeescript-with-gulp-and-bower/master/screenshot.png)



## Requirements

Make sure you have the following installed globally:

- node.js
- npm
- ruby
- compass
- bower

## Usage

### Clone

```bash
git clone https://github.com/smerth/bootstrap-jade-and-coffeescript-with-gulp-and-bower.git YOUR-PROJECT-NAME
```

### Install npm assets

```bash
cd YOUR-PROJECT-NAME && npm install
```

### Install bower assets

```bash
gulp bower
```

## Transfer bower main assets to `src/vendor`

```bash
gulp vendor
```

### Serve the dev build

```bash
gulp
```

This runs a collection of tasks and serves up the built development folder contents at: http://localhost:8080.

### Build the staging folder

```bash
gulp stage
```

This will copy all the necessary files from the `development` folder to the `staging` folder after compression the CSS, HTML and Javascript.  Then it serves the `staging` folder at: http://localhost:8001.

### Build staging to deploy to gh-pages

First create a repo on Github to host your code. Next you will need to create a `gh-pages` branch.

When deploying to `gh-pages` the paths to assets need to be prefixed with the project name for your repository.  Otherwise the assets will not be found when the server looks for them.

Instead of build in a gulp task to prefix assets and pages I have opted to add `<base>`element to the layout of the site. 

You can edit the base url @ `base_url.jade`

```jade
- var base = locals
case base
  when 0
    base(href="/")
  when 1
    base(href="http://smerth.github.io/bootstrap-jade-and-coffeescript-with-gulp-and-bower/")   
  default
    base(href="/")
```

Now you can set a local variable for the label `base`

@ terminal

```bash
base=0
or 
base=1
```

When the local variable `base` is set to `1` the jade compiler will include the `<base>` element in the layout with the url to your project.

When it is set to `0` the jade compiler will include the `<base>` element in the layout with the url set to `/`.

Now build the staging folder

```bash
gulp stage
```



### Push the staging folder to gh-pages

```bash
gulp deploy
```

You have to have set the base url and built the staging folder first, before you deploy.

Give Github a few minutes to propagate your files around the globe before checking the site.

## Development Worflow

> Write code in `src`.
> Develop and Debug in `development` mode.
> Compress site to `staging` and then
> Push `staging` to the live server.

## Directory structure

The installation and build process will add the following folders and contents:

- bower_components
- src/vendor
- builds/\*
- node_modules

The jade files and folder structure in `src/templates/sections` will be replicated in HTML in the `builds/development` and `builds/staging` folders by Gulp.

CoffeeScript files will be processed to JavaScript prior to all JavaScript files being concatenated.

### Misc. files

.gitignore - useful to exclude staging/ if you want to track that folder separately and push it somewhere else.

.atomignore - useful to exclude annoying files from the Atom finder side-bar if you use Atom Text Editor

config.rb - useful if you want to explicitly define your ruby and gems for use with compass to process SASS.

.ruby-version - you might want to specify a ruby-version (in which case chruby is nice way to control your ruby version on a per project basis.)

## Gulp tasks

### `gulp`

Does the following:

- `connectdev` - serves the contents of the development folder at: http://localhost:8080
- `vendor` - moves the main files from bower_components to src_vendor, main files are defined in each dependancies package.json file.
- `coffee` - compiles CoffeeScript files to js files and places them in 'src/scripts'
- `js` - concatenates all js files in 'src/scripts' and the bower dependancy js files in 'vendor' into a single JS file and outputs it to development and staging.
- `jadedev` and `jadestage` - each compile jade template files into html and place them into `development` and `staging`. `jadestage` also compresses the output HTML and sends a local variable to the jade processor which is used to swich the base url used to compile the staging site (to make it easy to host the site on gh-pages.)
- `images` - compresses image files and moves them to development and staging.
- `watchdev` - watches for changes to any of the folders your likely to edit during development and then runs related tasks when changes are detected and reloads the browser.

### `gulp install-assets`

Does the following:

- bower - download bower dependancies to bower_components
- vendor - move bower dependancy main assets to vendor

### `gulp stage`

The purpose of gulp stage is move files from development to staging while minifying,
compressing, removing maps and comments...

### Other gulp tasks

`gulp bower`

Downloads and installs the libraries listed as dependencies in bower.json file. Normally you would only run this once when setting up, or after including a new Bower dependency.

`gulp vendor`

Moves only the main Bower dependencies to `src/vendor` In this build the Javascript processing tasks rely on the .js files (jquery.js and Bootstrap.js) being in `src/vendor`. (You'll also see bootstrap.scss is also moved to `src/vendor` but in fact that bootstrap.scss is referenced from bower_components in style.scss. That way all of Boostrap's partial .scss files can be pulled in by Compass... there are alot of ways of organizing the bootstrap styles... this is just one way...)

`gulp coffee`

Processes CoffeeScript files into js files and places them in the `src/js` folder.

`gulp js`

Concatenates js files from `src/vendor` and `scripts/js`. You can control the order of Concatenation by changing the jsSource variable.

`gulp jade`

Compiles Jade into HTML. The option: `{base: }` tells `gulp.dest` to recreate the directory structure found inside the specified base folder. So you can build directory structure in the sections folder inside templates and it will be reflected in the `development` and `staging` folders

`gulp compass`

This task will compile any SASS you write in `src/sass` with all of the bootstrap scss and outputs a single css file to `development/css`

This task uses Compass which means you can work with Susy or Breakpoint, etc. However, using Compass means dealing with Ruby. For simple SASS processing you could use gulp-sass and do away with Ruby.

`gulp images`

This is the only task not split into development and staging. Image files are compressed and sent to images in both development and staging...

`gulp watchdev`

Gulp has the watch function built in. When developing the `watchdev` task will make sure changes you make to your code-base are reflected in `development` folder and the brower is reloaded.

`gulp htmlmin`

This task takes the html from development folder and compresses it into staging folder. Not used in this build process since Gulp-jade can output compressed HTML.

`gulp jsuglify`

Compress JS from development to staging

`gulp cssnano`

Compress css from development to staging

## Is it working?

### Check the following:

- Site should be up and running at: http://localhost:8080
- Bootstrap 4 should be working
- Scripts should be loaded and working (check responsive side-bar menu, errors on the console)
- In terminal gulp should be watching for changes to the code
- Writing changes to: sass stylesheets, jade templates, coffeescripts, js scripts, image files,
  should result in a live reload with changes immediately visible in the browser.
- The development folder should contain un-compressed css and js files. with comments and maps intact.
- After running `gulp stage` the development folder contents should be compressed and the base url should be swapped out according to the switch in the `base_url.jade` include.

## Useful Links

### Build System

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com)
- [Gulp](http://gulpjs.com)
- [Bower](http://bower.io)

### Write HTML

- [Jade Language](http://jade-lang.com)

### Write JavaScript

- [CoffeeScript](http://coffeescript.org)

### Write Style

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
