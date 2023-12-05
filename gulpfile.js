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

//перенос файлов
function resources() {
  return gulp.src('src/resources/**')
    .pipe(gulp.dest('dist/'))
}

//очистка каталога dist
function clean() {
  return del(['dist/*', '!dist/img'])
}

//обработка html-файла
function html() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}

//обработка стилей
function styles() {
  return gulp.src('src/css/**/*.css')
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
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.stream())
}

//обработка скриптов
function scripts() {
  return gulp.src('src/js/**/*.js')
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
    .pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.stream())      //Синхронизирует
}

//обработка изображений
function img() {
  return gulp.src('src/img/**')
    .pipe(newer('dist/img/'))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest('dist/img/'))
}

//отслеживать изменения
function watch() {
  browserSync.init({
    server: {
        baseDir: "./dist/"
    }
  })
  gulp.watch('dist/').on('change', browserSync.reload)
  gulp.watch('src/*.html', html)
  gulp.watch('src/css/**/*.css', styles)
  gulp.watch('src/js/**/*.js', scripts)
  gulp.watch('src/img/**', img)
  gulp.watch('src/resources/**', resources)
}

const build = gulp.series(clean, resources, html, gulp.parallel(styles, scripts, img), watch)

// exports.clean = clean
// exports.img = img
// exports.html = html
// exports.styles = styles
// exports.scripts = scripts
// exports.watch = watch
// exports.build = build
exports.default = build