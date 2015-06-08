var gulp = require('gulp');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');

gulp.task('scripts',function(){
	gulp.src(['src/**/*.js'])
		.pipe(concat('app.js'))
		.pipe(gulp.dest('www/js'));
});
gulp.task('watch',function(){
	gulp.watch('src/**/*.js',['scripts'])
});
gulp.task('livereload',function(){
	livereload.listen();
	gulp.watch('www/{js,css}/**/*.{css,js}').on('change',livereload.changed);
})