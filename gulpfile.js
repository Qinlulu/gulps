const gulp = require('gulp');
const less = require('gulp-less');
const sass = require('gulp-sass');
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const minifyCss = require("gulp-minify-css");
const minifyHtml = require("gulp-minify-html");
const server = require('gulp-webserver');
const autoprefix = require('gulp-autoprefixer');
const rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
const revCollector = require('gulp-rev-collector');               //- 路径替换
const runSequence = require('run-sequence');//控制task顺序
const del = require('del');

/*const connect = require("gulp-connect");
var plugins = require('gulp-load-plugins')();*/


//编译less
gulp.task('less',function(){
    return gulp.src("./src/*.less")
        .pipe(less())
        .pipe(gulp.dest('./src/'))
});

//自动加css前缀  压缩
gulp.task('minifyautocss',['less'], function () {
    return gulp.src("./src/*.css")
        .pipe(autoprefix(
            'last 2 versions',
            'last 1 Chrome versions',
            'last 2 Explorer versions',
            'last 3 Safari versions',
            'Firefox >= 20',
            'iOS 7',
            'Firefox ESR',
            '> 5%'
        ))
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(rev())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest('./dist/css'))                               //- 输出文件本地
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./dist/rev'));                              //- 将 rev-manifest.json 保存到 rev 目录内
});

gulp.task('rev', function() {
    gulp.src(['./dist/rev/*.json', './src/index.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('./dist/'));                     //- 替换后的文件输出的目录
});

//压缩js
gulp.task('minify-js', function () {
    return gulp.src("./src/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("./dist/js"))
});

//压缩html
gulp.task('minify-html', function () {
    return gulp.src("./dist/index.html")
        .pipe(minifyHtml())
        .pipe(gulp.dest("./dist"))
});

//create dev server
gulp.task('server',function(){
    gulp.watch('./src/*.js',['minify-js']);
    gulp.watch('./src/*.less',['less']);
    gulp.watch('./src/*.css',['minifyautocss']);
    gulp.watch(['./dist/rev/*.json', './src/index.html'],['rev']);
    gulp.watch('./dist/*.html',['minify-html']);
    return gulp.src('./')
        .pipe(server({
            open:"dist/index.html",
            directoryListing: true,
            livereload:{
                enable: true,
                filter: function(fileName) {
                    //if(fileName.match(/node_modules|dist\\js|dist\\css|dist\\html/)){
                    if(fileName.match(/node_modules/)){
                        return false
                    }
                    return true
                }
            },
            port:"8888"
        }))
});
gulp.task('default',function (callback) {
    runSequence(
        'minify-js',
        "minifyautocss",
        "rev",
        "minify-html",
        "server",
        callback);
});


