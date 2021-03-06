
//==============================================================================
//:::: NOTERY ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//==============================================================================
//==============================================================================

var Notery = (function(){
	var chalk = require('chalk');


	//////// STAMP /////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	var Stamp = (function(){
		function Stamp () {
			if (!(this instanceof Stamp)) return (new Stamp).toString();
			var d = new Date;
			this.hours   = Stamp.lz(d.getHours(),   2);
			this.minutes = Stamp.lz(d.getMinutes(), 2);
			this.seconds = Stamp.lz(d.getSeconds(), 2);
		}

		Stamp.lz = function leadingZeros (v, n) {
			v += '';
			n -= v.length;

			var o = '';
			while (o.length < n)
				o += '0';

			return o + v;
		};

		Stamp.prototype.toString = function stampToString () {
			return '[' +
				this.hours +
				 ':' +
				this.minutes +
				 ':' +
				this.seconds +
			']';
		};

		return Stamp;
	})();


	//////// NOTERY CONSTRUCTOR ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	function Notery (label, styles) {
		this.label  = label  || '';
		this.styles = styles || {};
		this.note = Notery.prototype.note.bind(this);
	}


	//////// NOTERY INSTANCE METHODS ///////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	Notery.prototype.style = function style (a) {
		if (!a) throw new Error;

		if (a.constructor == Object) {
			for (var key in a)
				this.styles[key] = a[key];
		}

		else if (a.constructor == String) { 
			return (a in this.styles) 
				? this.styles[a]
				: null;
		}

		return this;
	};


	Notery.prototype.stylize = function stylize (style, x) {
		var s = this.style(style);
		return s ? s(x) : x;
	};


	Notery.prototype.note = function note () {
		var notery = this;
		var o = [];
		var s;

		o.push(notery.stylize('stamp', (new Stamp).toString()));

		if (notery.label) o.push(
			notery.stylize('label', '[' + notery.label + ']')
		);

		Array.prototype.forEach.call(arguments, function(arg){
			o.push( notery.stylize('payload', arg) );
		});

		console.log();
		console.log.apply(notery, o);
		console.log();

		return this;
	};


	//////// EXPORTATION ///////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	Notery.chalk = chalk;
	Notery.Stamp = Stamp;
	return Notery;
})();




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
