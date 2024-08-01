var gulp = require('gulp');
var concat = require('gulp-concat'); //合并文件
var rename = require('gulp-rename'); //文件重命名
var uglify = require('gulp-uglify'); //js压缩
var minifycss = require('gulp-minify-css'); //css压缩
var replace = require('gulp-replace'); //替换URL

/**
 * 压缩js(css压缩原理类同)
 * 解压文件路径： ['./js/index.js'] js多个文件进行压缩
 * 解出文件路径： ./js
 */
gulp.task('minifyjs', function() {
    return gulp.src(['./src/gen/GMfuc.js','./src/gen/wsp.js','./src/gen/l1.js','./src/gen/raid.js','./src/gen/tri.js']) //压缩多个文件
        .pipe(concat('wg.js')) //合并js
        .pipe(gulp.dest('./public/wg')) //输出
        .pipe(rename({ suffix: '.min' })) //重命名
        .pipe(uglify()) //压缩
        .pipe(gulp.dest('./public/wg')); //输出
});
/**
 * 压缩js(css压缩原理类同)
 * 解压文件路径： ['./js/index.js'] js多个文件进行压缩
 * 解出文件路径： ./js
 */
gulp.task('minifyjs2', function() {
    return gulp.src(['./src/GMfuc.js','./src/wsp.js','./src/l1.js','./src/raid.js','./src/tri.js']) //压缩多个文件
        .pipe(concat('wg.js')) //合并js
        .pipe(gulp.dest('./public/wg')) //输出   
        .pipe(replace('https://s4.zstatic.net/ajax/libs/jquery-contextmenu/3.0.0-beta.2/jquery.contextMenu.min.css', 'https://cdn.staticfile.org/jquery-contextmenu/3.0.0-beta.2/jquery.contextMenu.min.css')) // 替换URL
        .pipe(replace('https://s4.zstatic.net/ajax/libs/layer/2.3/skin/layer.css', 'https://cdn.staticfile.org/layer/2.3/skin/layer.css')) // 替换URL
        .pipe(replace('https://s4.zstatic.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.css', 'https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css')) // 替换URL
        .pipe(replace('https://s4.zstatic.net/ajax/libs/layer/2.3/layer.js', 'https://cdn.staticfile.org/layer/2.3/layer.js')) // 替换URL
    
        .pipe(rename({ suffix: '.min' })) //重命名
        .pipe(uglify()) //压缩
        .pipe(gulp.dest('./public/wg')); //输出
});
