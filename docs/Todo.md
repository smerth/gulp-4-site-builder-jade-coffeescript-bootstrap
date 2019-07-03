# Todo

## Clean up Pug demo site

- extract a layout from `index.html`
- make sure you implement the base url include for production
- go through includes, keep and discard according to the their relevance, using the new layout.

## Fix JS concatenation

- Try to concatenate library javascript into a single file `main.js`, now that you have the correct `popper.js` file loading

## Fix SCSS processing

- Currently bootstrap css is loaded from a cnd in index.html
- It should load from the `build/environment/css` folder
- In the gulp task the bootstrap scss should be loaded from `node_modules` ~ `"node_modules/bootstrap/scss/bootstrap.scss"` additional scss files should be sourced in the right order.
- Should be able to change variables in the `custom.scss` file and have them take effect
- Mixins should be available in `style.scss`

## Re-write the Gulp file

better image processing and better scss transpiling
https://www.sitepoint.com/automate-css-tasks-gulp/
