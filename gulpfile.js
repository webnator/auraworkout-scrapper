var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');


var shell = require('gulp-shell');

gulp.task('lint', function() {
  return gulp.src('./server/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('start', ['lint' ], function () {
  nodemon({
    script: 'server',
    ext: 'js',
    env: { 'AURA_NODE_ENV': 'local' },
    tasks: ['lint']
  })
  .on('restart', function () {
    console.log('server restarted!');
  });
});

gulp.task('default', ['start']);
