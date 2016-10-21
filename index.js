'use strict'
//引入模块
var http = require('http'),
	https = require('https'),
	fs = require('fs'),
	path = require('path'),
	cheerio = require('cheerio')

var opt = {
	hostname:'movie.douban.com',
	path:'/top250',
	port: 80
}

function spiderMovie(index) {
	https.get('https://movie.douban.com/top250?start='+index,function(res){
		var pageSize = 25
		var html = ''
		var movies = []
		res.setEncoding('utf-8')

		res.on('data',function(chunk){
			html += chunk 
		})

		res.on('end',function(){
			var $ = cheerio.load(html)
			$('.item').each(function(){
				var picUrl = $('.pic img',this).attr('src')
				var movie = {
					title: $('.title', this).text(), // 获取电影名称
                    star: $('.info .star .rating_num', this).text(), // 获取电影评分
                    link: $('a', this).attr('href'), // 获取电影详情页链接
                    picUrl: picUrl
				}
				if(movie) movies.push(movie)
				downloadImg('./img/',movie.picUrl)	//下载图片
			})
			saveData('./data' + (index / pageSize) + '.json', movies);
		})

	}).on('error',function(err){
		console.log(err)
	})
}

/**
 * 下载图片
 *
 * @param {string} imgDir 存放图片的文件夹
 * @param {string} url 图片的URL地址
 */
function downloadImg(imgDir,url){
	https.get(url,function(res){
		var data = ''
		res.setEncoding('binary')
		res.on('data',function(chunk){
			data += chunk
		})
		res.on('end',function(){
			fs.writeFile(imgDir+path.basename(url),data,'binary',function(err){
				if(err) return console.log(err)
				console.log('Image downloaded:',path.basename(url))
			})
		})

	}).on('error',function(err){
		console.log(err)
	})
}
/**
 * 保存数据到本地
 *
 * @param {string} path 保存数据的文件夹
 * @param {array} movies 电影信息数组
 */
function saveData(path,movies){
	console.log(movies)
	fs.writeFile(path,JSON.stringify(movies,null,''),function(err){
		if(err) return console.log(err)
		console.log('Data saved')
	})
}


function *doSpider(x) {
    var start = 0;
    console.log(start + ' -------------------------------');
    while (start < x) {
        yield start;
        spiderMovie(start);
        start += 25; //因为豆瓣电影排行榜一页25条记录
    }
}
for (var x of doSpider(250)) {
    console.log(x); //打印函数
}