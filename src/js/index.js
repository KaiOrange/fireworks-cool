
const ipc = require('electron').ipcRenderer;
require('../css/reset.css');
require('../../node_modules/nouislider/distribute/nouislider.min.css');
require('../css/style.css');
require('./prefixfree.min.js');

const SettingFloater = require('./setting-floater.js');
const Fireworks = require('./fireworks.js');
const Utils = require('./utils.js');


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

var guiPresets = {
		"Default": {
			"fworkSpeed": 2,
			"fworkAccel": 4,
			"showShockwave": false,
			"showTarget": true,
			"partCount": 30,
			"partSpeed": 5,
			"partSpeedVariance": 10,
			"partWind": 50,
			"partFriction": 5,
			"partGravity": 1,
			"flickerDensity": 20,
			"hueMin": 150,
			"hueMax": 200,
			"hueVariance": 30,
			"lineWidth": 1,
			"clearAlpha": 25
		},
		"Anti Gravity": {
			"fworkSpeed": 4,
			"fworkAccel": 10,
			"showShockwave": true,
			"showTarget": false,
			"partCount": 150,
			"partSpeed": 5,
			"partSpeedVariance": 10,
			"partWind": 10,
			"partFriction": 10,
			"partGravity": -10,
			"flickerDensity": 30,
			"hueMin": 0,
			"hueMax": 360,
			"hueVariance": 30,
			"lineWidth": 1,
			"clearAlpha": 50
		},
		"Battle Field": {
			"fworkSpeed": 10,
			"fworkAccel": 20,
			"showShockwave": true,
			"showTarget": true,
			"partCount": 200,
			"partSpeed": 30,
			"partSpeedVariance": 5,
			"partWind": 0,
			"partFriction": 5,
			"partGravity": 0,
			"flickerDensity": 0,
			"hueMin": 20,
			"hueMax": 30,
			"hueVariance": 10,
			"lineWidth": 1,
			"clearAlpha": 40
		},
		"Mega Blast": {
			"fworkSpeed": 3,
			"fworkAccel": 3,
			"showShockwave": true,
			"showTarget": true,
			"partCount": 500,
			"partSpeed": 50,
			"partSpeedVariance": 5,
			"partWind": 0,
			"partFriction": 0,
			"partGravity": 0,
			"flickerDensity": 0,
			"hueMin": 0,
			"hueMax": 360,
			"hueVariance": 30,
			"lineWidth": 20,
			"clearAlpha": 20
		},
		"Nimble": {
			"fworkSpeed": 10,
			"fworkAccel": 50,
			"showShockwave": false,
			"showTarget": false,
			"partCount": 120,
			"partSpeed": 10,
			"partSpeedVariance": 10,
			"partWind": 100,
			"partFriction": 50,
			"partGravity": 0,
			"flickerDensity": 20,
			"hueMin": 0,
			"hueMax": 360,
			"hueVariance": 30,
			"lineWidth": 1,
			"clearAlpha": 80
		},
		"Slow Launch": {
			"fworkSpeed": 2,
			"fworkAccel": 2,
			"showShockwave": false,
			"showTarget": false,
			"partCount": 200,
			"partSpeed": 10,
			"partSpeedVariance": 0,
			"partWind": 100,
			"partFriction": 0,
			"partGravity": 2,
			"flickerDensity": 50,
			"hueMin": 0,
			"hueMax": 360,
			"hueVariance": 20,
			"lineWidth": 4,
			"clearAlpha": 10
		},
		"Perma Trail": {
			"fworkSpeed": 4,
			"fworkAccel": 10,
			"showShockwave": false,
			"showTarget": false,
			"partCount": 150,
			"partSpeed": 10,
			"partSpeedVariance": 10,
			"partWind": 100,
			"partFriction": 3,
			"partGravity": 0,
			"flickerDensity": 0,
			"hueMin": 0,
			"hueMax": 360,
			"hueVariance": 20,
			"lineWidth": 1,
			"clearAlpha": 0
		}
	};
	
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
				$("#center-block").fadeOut("fast", () => {
					ipc.send('app-quit');
				});
			}
		}, 3000);
	}, 3000)
	
	var fworks = new Fireworks();
	var bodyEl = $("body");
	fworks.init(bodyEl.width(), bodyEl.height());
	
	var preset = "Default";
	var currentObj = guiPresets[preset];
	if (!!arg && !!arg.settings && Object.keys(arg.settings).length !== 0) {
		currentObj = arg.settings;
		preset = arg.preset;
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
		} else if ( obj.type === "close" ) {
			$("body").fadeOut("fast",function (){
				ipc.send('app-quit');
			});
		}
	},100);
	SettingFloater.init(guiPresets,{settings:currentObj,preset:preset,text:!!arg.texts?(arg.texts[0]||""):""},eventCallBack);//初始化settingFloater
	fworks.autoFires();
})

var Mousetrap = require('mousetrap');
var bindMousetrapEvent = function (){
	$("html").addClass("hidden-mode");
	ipc.send('goto-hidden-mode');
}

Mousetrap.bind('w w s s a a d d j k j k', bindMousetrapEvent);
Mousetrap.bind('up up down down left left right right 1 2 1 2', bindMousetrapEvent);
Mousetrap.bind('up up down down left left right right b a b a', bindMousetrapEvent);