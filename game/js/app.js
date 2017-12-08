/**
 * 游戏相关配置
 * @type {Object}
 */
var CONFIG = {
  status: 'start', // 游戏开始默认为开始前
  level: 1, // 游戏默认等级
  totalLevel: 6, // 总共6关
  numPerLine: 7, // 游戏默认每行多少个怪兽
  canvasPadding: 30, // 默认画布的间隔
  bulletSize: 10, // 默认子弹长度
  bulletSpeed: 10, // 默认子弹的移动速度
  enemySpeed: 2, // 默认敌人移动距离
  enemySize: 50, // 默认敌人的尺寸
  enemyIcon: './img/enemy.png', // 怪兽的图像
  enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
  enemyDirection: 'right', // 默认敌人一开始往右移动
  planeSpeed: 7, // 默认飞机每一步移动的距离
  planeSize: {
    width: 60,
    height: 100
  }, // 默认飞机的尺寸,
  planeIcon: './img/plane.png',
};
// CONFIG初始化
var configStatus = CONFIG.status || 'start',
    level = CONFIG.level || 1, // 游戏默认等级
    totalLevel = CONFIG.totalLevel || 6, // 总共6关
    numPerLine = CONFIG.numPerLine || 7, // 游戏默认每行多少个怪兽
    canvasPadding = CONFIG.canvasPadding || 30, // 默认画布的间隔
    bulletSize = CONFIG.bulletSize || 10, // 默认子弹长度
    bulletSpeed = CONFIG.bulletSpeed || 10, // 默认子弹的移动速度
    enemySpeed = CONFIG.enemySpeed || 2, // 默认敌人移动距离
    enemySize = CONFIG.enemySize || 50, // 默认敌人的尺寸
    enemyIcon = CONFIG.enemyIcon || './img/enemy.png', // 怪兽的图像
    enemyBoomIcon = CONFIG.enemyBoomIcon || './img/boom.png', // 怪兽死亡的图像
    enemyDirection = CONFIG.enemyDirection || 'right', // 默认敌人一开始往右移动
    planeSpeed = CONFIG.planeSpeed || 7, // 默认飞机每一步移动的距离
    planeSizeWidth = CONFIG.planeSizeWidth || 60,
    planeSizeHeight = CONFIG.planeSizeHeight || 100
    planeIcon = CONFIG.planeIcon || './img/plane.png';
// 元素
var container = document.getElementById('game');

/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function(opts) {
    this.status = configStatus;
    this.bindEvent();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
      // 传入游戏关卡并创建相应数目的怪兽对象
      createEnm(1);
      draw();
      enemyAnt();
    };
    // 重置游戏按钮绑定
    var replayBtn = document.querySelectorAll('.js-replay');
    replayBtn[0].onclick = function(){
      self.setStatus("start");
    };
    replayBtn[1].onclick = function(){
      self.setStatus("start");
    };
    var nextBtn = document.querySelector('.js-next');
    nextBtn.onclick = function(){
      self.play();
      // 传入游戏关卡并创建相应数目的怪兽对象
      createEnm(level);
      draw();
      enemyAnt();
    }
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
  },
  play: function() {
    this.setStatus('playing');
  },
  failed: function(){
    var scoreSpan = document.querySelector('.score');
    scoreSpan.innerHTML = score; 
    clear();
    level = 1;
    score = 0;
    this.setStatus('failed');
  },
  success: function(){
    clear();
    this.setStatus('success');
  },
  allSuccess: function(){
    var scoreSpan = document.querySelectorAll('.score')[1];
    scoreSpan.innerHTML = score; 
    clear();
    level = 1;
    score = 0;
    this.setStatus('all-success')
  }
};
// 初始化
GAME.init();
// 定义用户识别码
var uuid = document.querySelector('[name = "uuid"]');
if(localStorage.getItem('UUID')){
    var uuidStr = localStorage.getItem('UUID');
}else{
    var uuidStr = generateUUID();
    localStorage.setItem('UUID',uuidStr);
}
uuid.value = uuidStr;
/**
 * generateUUID 单浏览器密钥识别函数
 * @return {String} 系统随机生成的用户密钥
 */
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};
