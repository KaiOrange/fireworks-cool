
const ipc = require('electron').ipcRenderer;
require('../css/reset.css');
require('../../node_modules/nouislider/distribute/nouislider.min.css');
require('../css/style.css');
require('./prefixfree.min.js');

const SettingFloater = require('./setting-floater.js');
const Fireworks = require('./fireworks.js');
const Utils = require('./utils.js');
const GuiPresets = require('../config/GuiPresets.json');
const Mousetrap = require('mousetrap');

let flickerTimer = null;
var fworks = new Fireworks();
var bodyEl = $("body");
fworks.init(bodyEl.width(), bodyEl.height());

// 绑定事件
$(fworks.canvas).on('mousedown', function(e){
  // Cool模式下可以点击
  if (Utils.isCoolMode()) {
    fworks.mx = e.pageX - fworks.canvasContainer.offset().left;
    fworks.my = e.pageY - fworks.canvasContainer.offset().top;
    fworks.currentHue = fworks.rand(fworks.hueMin, fworks.hueMax);
    fworks.createFireworks(fworks.cw / 2, fworks.ch, fworks.mx, fworks.my);

    $(fworks.canvas).on('mousemove.fireworks', function (e) {
      fworks.mx = e.pageX - fworks.canvasContainer.offset().left;
      fworks.my = e.pageY - fworks.canvasContainer.offset().top;
      fworks.currentHue = fworks.rand(fworks.hueMin, fworks.hueMax);
      fworks.createFireworks(fworks.cw / 2, fworks.ch, fworks.mx, fworks.my);
    });		
  }
});

$(fworks.canvas).on('mouseup', function(e){
  $(fworks.canvas).off('mousemove.fireworks');									
});

function closeApp(){
  if (flickerTimer) {
    window.clearInterval(flickerTimer);
  }
	$("body").fadeOut("fast",function (){
		ipc.send('app-quit');
	});
}

function debounce(fn, delay) {
	// 维护一个 timer
	let timer = null;
  
	return function() {
		// 通过 ‘this’ 和 ‘arguments’ 获取函数的作用域和变量
		let context = this;
		let args = arguments;
	
		clearTimeout(timer);
		timer = setTimeout(function() {
			fn.apply(context, args);
		}, delay);
	}
}

// 获取模式信息
ipc.send('get-mode-main')
ipc.on('get-mode-reply', function (event, arg) {
  if (arg === "cool") {
    handle2CoolMode();
  } else if (arg === "flicker") {
    handle2FlickerMode();
  }
});

// 获取设置信息
ipc.send('get-text-main')
ipc.on('get-text-reply', function (event, arg) {
	let text = "";
	if (!!arg.texts && arg.texts.length > 0) {
		text = arg.texts[0];
	}
	setTimeout(function () {
		$("#center-block").text(text).fadeIn("fast");
		setTimeout(function () {
			if (!Utils.isHiddenMode()) {//如果这个时候还没有进入隐藏模式的话 那么就退出程序
				closeApp()
			} else if (Utils.isFlickerMode()) {
        // Flicker模式下文字淡出
        $("#center-block").fadeOut("fast");
      }
		}, 3000);
	}, 3000)
	
	var preset = "Default";
	var currentObj = GuiPresets[preset];
	if (!!arg && !!arg.settings && Object.keys(arg.settings).length !== 0) {
		currentObj = Object.assign({},currentObj,arg.settings||{});
		preset = arg.preset || preset;
	} else {
		ipc.send('setting-change-all',{settings:currentObj,preset:"Default"});
	}
	Object.keys(currentObj).map((item)=>{
		fworks[item] = currentObj[item];
	})

	var eventCallBack = debounce(function (obj){
		if (obj.type === "single") {
			ipc.send('setting-change',{
				key:obj.key,
				value:obj.value
			});
			fworks[obj.key] = obj.value;
		} else if (obj.type === "all"){
			Object.keys(obj.value.settings).forEach((item)=>{
				fworks[item] = obj.value.settings[item];
			});
			ipc.send('setting-change-all',obj.value);
		} else if (obj.type === "text"){
			ipc.send('set-text',obj.value);
			$("#center-block").text(obj.value);
		} else if (obj.type === "clear"){
			fworks.clear();
		} else if ( obj.type === "close" ) {
			closeApp();
		}
	},100);
	SettingFloater.init(GuiPresets,{settings:currentObj,preset:preset,text:!!arg.texts?(arg.texts[0]||""):""},eventCallBack);//初始化settingFloater
	fworks.autoFires();
})


var handle2CoolMode = function (){
  if (Utils.isCoolMode()) {
      return ;
  }
  $("html").addClass("cool-mode");
  ipc.send('goto-hidden-mode','cool')
}

var handle2FlickerMode = function (){
    if (Utils.isFlickerMode()) {
        return ;
    }
    $("html").addClass("flicker-mode");
    ipc.send('goto-hidden-mode','flicker')
    flickerTimer = setInterval(function (){
        fworks.randomFire();
    },2000);
    //进入Flicker模式 给出退出提示
    $("#flicker-tip").fadeIn("fast",function (){
        setTimeout(() => {
            $("#flicker-tip").fadeOut("fast");
        }, 6000);
    })
}

Mousetrap.bind('c o o l', handle2CoolMode);
Mousetrap.bind('f l i c k e r', handle2FlickerMode);
Mousetrap.bind('shift+esc', function (){
    closeApp();
});