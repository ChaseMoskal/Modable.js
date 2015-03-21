/*//////////////////////////////////////////////////////////////////////////////
================================================================================
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

	SCONE GULPFILE
	--------------
		- JS minification
		- SCSS compilation
		- Outputs in same directory
		- Color coded error handling and status reporting

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
================================================================================
//////////////////////////////////////////////////////////////////////////////*/

var Notery = require('Notery');

var gulp       = require('gulp');
var uglify     = require('gulp-uglify');
var sass       = require('gulp-ruby-sass');

var rename     = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var path       = require('path');


var jsGlobs   = ['**/*.js', '!**/*.min.js', '!**/gulpfile.js'];
var scssGlobs = ['**/*.scss'];


var options = {
	ignores: [
		'!**/node_modules/**',
		'!**/.sass-cache/**', '!**/.sass-cache',
		'!**/vendor/**'
	],
	js: {
		sourcemaps: true,
		mangle: true
	},
	scss: {
		sourcemaps: true,
		compass: true
	}
};




//==============================================================================
//:::: JAVASCRIPT MINIFICATION :::::::::::::::::::::::::::::::::::::::::::::::::
//==============================================================================
//==============================================================================

(function JAVASCRIPT_MINIFICATION () {

	//////// JS NOTIFICATIONS //////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	var note = new Notery('JS')
			.style({
				stamp: Notery.chalk.green.bold,
				label: Notery.chalk.green,
				payload: Notery.chalk.green
			 })
			.note,
		errnote = new Notery('JS')
			.style({
				stamp: Notery.chalk.red.bold,
				label: Notery.chalk.green.bold,
				payload: Notery.chalk.red
			 })
			.note,
		b = Notery.chalk.bold;


	//////// JS TASKS //////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	gulp.task('js', function(){
		var uglifyOptions = { mangle: options.js.mangle };

		var s = gulp.src(jsGlobs.concat(options.ignores));
		if (options.js.sourcemaps) s = s .pipe( sourcemaps.init() );
		s = s.pipe( uglify(uglifyOptions) )
			.on('error', function(e){
				errnote(b("MINIFICATION ERROR"), e.toString());
			 })
			.pipe( rename(function(p){ p.extname = '.min.js'; }) );
		if (options.js.sourcemaps) s = s.pipe( sourcemaps.write('./') );
		s = s.pipe( gulp.dest('') );
	});

	gulp.task('js-watch', function(){
		gulp.watch(jsGlobs.concat(options.ignores), ['js'])
			.on('change', function(event){
				note(
					b(event.type.toUpperCase()),
					path.basename(event.path)
				);
			});
		note(b("WATCHING ALL JS FILES"), "(ready to minify any changes)");
	});


})();




//==============================================================================
//:::: SCSS COMPILATION ::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//==============================================================================
//==============================================================================

(function SCSS_COMPILATION () {

	//////// SCSS NOTIFICATIONS ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	var note = new Notery('SCSS')
			.style({
				stamp: Notery.chalk.cyan.bold,
				label: Notery.chalk.cyan,
				payload: Notery.chalk.cyan
			 })
			.note,
		errnote = new Notery('SCSS')
			.style({
				stamp: Notery.chalk.red.bold,
				label: Notery.chalk.cyan.bold,
				payload: Notery.chalk.red
			 })
			.note,
		b = Notery.chalk.bold;


	//////// SCSS TASKS ////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	gulp.task('scss', function(){
		var sassOptions = { compass: true };
		if (options.scss.sourcemaps) sassOptions.sourcemap = true;
		else sassOptions['sourcemap=none'] = true;

		gulp.src(scssGlobs.concat(options.ignores))
			.pipe(sass(sassOptions))
			.on('error', function(e){
				errnote(b("COMPILATION ERROR"), e.toString());
			 })
			.pipe(gulp.dest(''));
	});

	gulp.task('scss-watch', function(){
		gulp.watch(scssGlobs.concat(options.ignores), ['scss'])
			.on('change', function(event){
				note(
					b(event.type.toUpperCase()),
					path.basename(event.path)
				);
			});
		note(b("WATCHING ALL SCSS FILES"), "(ready to compile any changes)");
	});


})();




//==============================================================================
//:::: GENERAL TASKS AND DEFAULT :::::::::::::::::::::::::::::::::::::::::::::::
//==============================================================================
//==============================================================================

gulp.task('static',  ['js',       'scss']);
gulp.task('watch',   ['js-watch', 'scss-watch']);
gulp.task('default', ['static',   'watch']);
