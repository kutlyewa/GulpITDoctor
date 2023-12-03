const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');//минифицирует CSS-файлы
const babel = require('gulp-babel');//транспилирует код в старый формат
const uglify = require('gulp-uglify'); //делает код нечитаемым (обфусцирование кода)
const concat = require('gulp-concat');//объединять несколько файлов в один
const sourcemaps = require('gulp-sourcemaps');//карта источника
const autoprefixer = require('gulp-autoprefixer');//добавит префиксы в CSS-стили для разных браузеров
const imagemin = require('gulp-imagemin');//сжатие изображений
const htmlmin = require('gulp-htmlmin');//минифицирует HTML-файлы
const size = require('gulp-size');//посмотреть размер файлов в консоли
const newer = require('gulp-newer');//позволяет отслеживать только новые файлы
const browserSync = require('browser-sync').create();//синхронизируйте несколько браузеров и устройств
const del = require('del');//удаление файлов

//структура проекта
const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  styles: {
    src: 'src/styles/**/*.css',
    dest: 'dist/css/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/js/'
  },
  images: {
    src: 'src/images/**',
    dest: 'dist/img/'
  }
}

//очистка каталога dist
function clean() {
  return del(['dist/*', '!dist/img'])
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

//обработка стилей
function styles() {
  return gulp.src(paths.styles.src)
  .pipe(sourcemaps.init())
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(size({
    showFiles: true
  }))
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(browserSync.stream())
}

//обработка скриптов
function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init())//карта источника
  .pipe(babel({           //транспилирует код в старый формат
    presets: ['@babel/env']
  }))
  .pipe(uglify())         //обфусцирование кода
  .pipe(concat('script.min.js'))//переименоввывает
  .pipe(sourcemaps.write('.'))   //карта источника
  .pipe(size({                  //размер файлов в консоли
    showFiles: true
  }))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.stream())      //Синхронизирует
}

//обработка изображений
function img() {
  return gulp.src(paths.images.src)
  .pipe(newer(paths.images.dest))
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(size({
    showFiles: true
  }))
  .pipe(gulp.dest(paths.images.dest))
}

//отслеживать изменения
function watch() {
  browserSync.init({
    server: {
        baseDir: "./dist/"
    }
  })
  gulp.watch(paths.html.dest).on('change', browserSync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)

exports.clean = clean
exports.img = img
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build