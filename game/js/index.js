// TODO:为所有构造函数这只默认值
// 初始化canvas
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
// 设置全局元素对象
var elements = [];
// 设置子弹数组
var bullets = [];
// 兼容requestAnimationFrame()
window.requestAnimationFrame = 
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimaitionFrame ||
window.msRequestAnimationFrame ||
function(callback){
	setTimeout(callback,1000/60);
};
// 设置键盘开关
var key_pressed = {};
// 设置怪兽数组
var enemies = [];
// 设置怪兽初始属性
var enemyOpts = {
	x: 3*enemySize,
	y: enemySize
}
// 设置分数默认值
var score = 0;
/**
 * Plane 飞机构造函数
 */
function Plane(){
	var image = new Image();
	image.src = planeIcon;
	this.img = image; 
	this.width = planeSizeWidth;
	this.height = planeSizeHeight;
	this.x = 350 - (this.width/2);
	this.y = 600 - this.height - canvasPadding;
}
/**
 * 飞机draw方法
 * @param  {Object} context canvas内容对象
 */
Plane.prototype.draw = function(){
	context.drawImage(this.img, this.x, this.y, this.width, this.height);
}
/**
 * fly 飞机移动方法
 * @param  {Number} k keyCode,控制飞机左右移动
 */
// PS：因为速率为5实在觉得太慢了，所以我自行调成7了
Plane.prototype.fly = function(k){
	if(k === 37){
		// 碰撞检测
		if (this.x <= canvasPadding) {
			return;
		}
		this.x -= planeSpeed;
		refresh();
	}else if(k === 39){
		// 碰撞检测
		if (this.x >= 610) {
			return;
		}
		this.x += planeSpeed;
		refresh();
	}
}
// 创建飞机对象并拼入全局
var plane = new Plane({});
elements.push(plane);

/**
 * Bullet 子弹构造函数
 */
function Bullet(){
	this.x = plane.x + (plane.width/2);
	this.y = plane.y;
}
/**
 * draw 子弹draw方法
 */
Bullet.prototype.draw = function(){
	context.beginPath();
	context.moveTo(this.x, this.y);
	context.lineTo(this.x, this.y + bulletSize);
	context.closePath();
	context.strokeStyle = "#fff";
	context.save();
	context.stroke();
}

Bullet.prototype.move = function(){
	this.y -= bulletSpeed;
}
/**
 * keyEvent 键盘事件绑定函数
 * @return 
 */
function keyEvent(){
	// 判断某个案件是否被按下
	document.addEventListener("keyup",function(e){
		var keyCode = e.keyCode || e.which || e.charCode;
		key_pressed[keyCode] = false;
	});
	document.addEventListener("keydown",function(e){
		var keyCode = e.keyCode || e.which || e.charCode;
		key_pressed[keyCode] = true;
	});
	// 监听飞机移动信号
	setInterval(function(){
		for(var k in key_pressed){
			if (key_pressed[k]) {
	           if(k === '37' || k === '39'){
	           	plane.fly(parseInt(k));
	           }
	        }
		}
	},50);
	// 监听发射子弹信号，
	// 能够解决长按空格Space发射一连串子弹的BUG，
	// 但在计时器触发时间间隔内无法监听键盘事件，
	// 造成单点无法发射子弹的BUG
	setInterval(function(){
		for(var k in key_pressed){
			if (key_pressed[k]) {
	            if(k === '32'){
	           		// 控制子弹发射
					var bullet = new Bullet();
			        bullets.push(bullet);
			        refresh();
			        animate(bullet);
	           }
	        }
		}
	},320);
}
/**
 * animate 子弹飞行函数
 * @param  {Object} bullet 子弹对象
 */
function animate(bullet){
	if(bullet.y <= -bulletSize){
		// 解决BUG1方法
		if (bullets.indexOf(bullet) === -1) {
			return;
		}else{
			bullets.splice(bullets.indexOf(bullet), 1);
		}
		bullet = null;
		return;
	}
	bullet.move();
	refresh();
	requestAnimationFrame(function(){
		animate(bullet);
	});
}
/**
 * Enemy 怪兽构造函数
 */
function Enemy(options){
	var image = new Image();
	image.src = enemyIcon;
	this.img = image; 
	this.x = options.x || 3*enemySize;
	this.y = options.y || canvasPadding;
	this.width = enemySize;
	this.height = enemySize;
	this.direction = enemyDirection;
}
/**
 * draw enemy draw方法
 */
Enemy.prototype.draw = function(){
	context.drawImage(this.img, this.x, this.y, this.width, this.height);
}
/**
 * move enemy move方法
 */
Enemy.prototype.move = function(){
	if(this.direction === 'right'){
		this.x += enemySpeed;
	}else{
		this.x -= enemySpeed;
	}
}
/**
 * died enemy死亡效果
 */
Enemy.prototype.died = function(){
	var img = new Image();
	img.src = enemyBoomIcon;
	this.img = img;
}
/**
 * createEnm 创建所有怪兽对象方法
 * @param  {Nunber} level 关卡等级，每增加一个等级增加七个怪兽
 */
function createEnm(level){
	for(var l = 0;l < level;l++){
		for(var i = 0;i < numPerLine;i++){
		    var enemy = new Enemy(enemyOpts);
		    enemies.push(enemy);
		    enemyOpts.x += enemySize;
		}
		enemyOpts.x = 3*enemySize;
		enemyOpts.y += enemySize;
	}
	// 怪兽配置初始化
	enemyOpts = {
		x: 3*enemySize,
		y: canvasPadding
	};
}
/**
 * collision 碰撞检测监听方法，监听子弹是否击中怪兽
 * @return
 */
function collision(){
	setInterval(function(){
		bullets.forEach(function(bulletItem){
			enemies.forEach(function(enemyItem){
				var validRangeObj = validRange(enemyItem);
				if(bulletItem.x + 1 < validRangeObj.minx ||
				   bulletItem.y + bulletSize < validRangeObj.miny ||
				   validRangeObj.maxx < bulletItem.x ||
				   validRangeObj.maxy < bulletItem.y){

				}else{
					// TODO:击中怪兽后后期子弹自动消失（BUG1）
					// 子弹已经被移除，但animate并未结束，后期子弹消失是因为animate中的splice
					// 解决方法见147
					score += 1;
					bullets.splice(bullets.indexOf(bulletItem),1);
					enemyItem.died();
					refresh();
					setTimeout(function(){
					    enemies.splice(enemies.indexOf(enemyItem),1);
					    refresh();
					},100);
				}
			})
		})
	},50);
}
collision();
/**
 * validRange 划定子弹击中怪兽的有效范围方法
 * @param  {Object} enemies 怪兽对象
 * @return {Object} obj 怪兽有效范围对象
 */
function validRange(enemies){
	var obj = new Object();
	obj.validWidth = enemies.width - 20;
	obj.validHeight = enemies.height - 20;
	obj.minx = enemies.x + 10;
	obj.miny = enemies.y + 10;
	obj.maxx = obj.minx + obj.validWidth;
	obj.maxy = obj.miny + obj.validHeight;
	return obj;
}
/**
 * drawText 绘制分数方法
 */
function drawText(){
	context.font = '18px 微软雅黑';
	context.fillStyle = "#fff"
	context.save();
	context.fillText('分数：' + score, 20, 20);
}
/**
 * enemyAnt 怪兽移动方法
 */
function enemyAnt(){
	// 判断怪兽是否被清空
	if (enemies.length === 0) {
		if (level === totalLevel) {
			GAME.allSuccess();
			return;
		}else{
			GAME.success();
			level += 1;
			return;
		}
	}
	// 判断怪兽是否到达底部边界
	for(var i = 0,len = enemies.length;i < len;i++){
		if(enemies[i].y >= 470){
			enemies = [];
			GAME.failed();
			return;
		}
	}
	var enemiesWidth = enemies[0].width;
	var maxx = 700 - canvasPadding - enemiesWidth;
	for(var i = 0,len = enemies.length;i < len;i++){
	    if(enemies[i].x <= canvasPadding){
	        enemies.forEach(function(enemyItem){
				enemyItem.direction = 'right';
				enemyItem.y += enemyItem.width;
			})
			break;
	    }else if(enemies[i].x >= maxx){
			enemies.forEach(function(enemyItem){
				enemyItem.direction = 'left';
				enemyItem.y += enemyItem.width;
			})
			break;
		}
	}
	enemies.forEach(function(enemyItem){
	    enemyItem.move();
	});
	refresh();
	requestAnimationFrame(enemyAnt);
}
// 画布擦除函数
function clear(){
	context.clearRect(0, 0, canvas.width, canvas.height);
}
// 全局draw函数
function draw(){
	elements.forEach(function(elements){
		elements.draw();
	});
	bullets.forEach(function(bullets){
		bullets.draw();
	});
	enemies.forEach(function(enenmies){
	    enenmies.draw();
	});
	drawText();
}
// 刷新画布
function refresh(){
	clear();
	draw();
}
// 键盘事件绑定
if (elements.length) {
	keyEvent();
}