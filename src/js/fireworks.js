
const Utils = require('./utils.js');

var Fireworks = function(){
	/*=============================================================================*/	
	/* Utility
	/*=============================================================================*/
	var self = this;
	var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
	var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
	window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();
	
	/*=============================================================================*/	
	/* Initialize
	/*=============================================================================*/
	self.init = function(cw,ch){	
    self.dt = 0;
		self.oldTime = Date.now();
		self.canvas = document.createElement('canvas');				
		self.canvasContainer = $('#canvas-container');
		
		var canvasContainerDisabled = document.getElementById('canvas-container');
		self.canvas.onselectstart = function() {
			return false;
		};
		
		self.canvas.width = self.cw = cw||600;
		self.canvas.height = self.ch = ch||400;	
		
		self.particles = [];	
		self.partCount = 30;
		self.fireworks = [];	
		self.mx = self.cw/2;
		self.my = self.ch/2;
		self.currentHue = 170;
		self.partSpeed = 5;
		self.partSpeedVariance = 10;
		self.partWind = 50;
		self.partFriction = 5;
		self.partGravity = 1;
		self.hueMin = 150;
		self.hueMax = 200;
		self.fworkSpeed = 2;
		self.fworkAccel = 4;
		self.hueVariance = 30;
		self.flickerDensity = 20;
		self.showShockwave = false;
		self.showTarget = true;
		self.clearAlpha = 25;

		self.canvasContainer.append(self.canvas);
		self.ctx = self.canvas.getContext('2d');
		self.ctx.lineCap = 'round';
		self.ctx.lineJoin = 'round';
		self.lineWidth = 1;
		self.bindEvents();			
		self.canvasLoop();
		self.fworkNumber = 10;
		
		self.canvas.onselectstart = function() {
			return false;
		};
    
		
	};		
	
	/*=============================================================================*/	
	/* Particle Constructor
	/*=============================================================================*/
	var Particle = function(x, y, hue){
		this.x = x;
		this.y = y;
		this.coordLast = [
			{x: x, y: y},
			{x: x, y: y},
			{x: x, y: y}
		];
		this.angle = rand(0, 360);
		this.speed = rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance));
		this.friction = 1 - self.partFriction/100;
		this.gravity = self.partGravity/2;
		this.hue = rand(hue-self.hueVariance, hue+self.hueVariance);
		this.brightness = rand(50, 80);
		this.alpha = rand(40,100)/100;
		this.decay = rand(10, 50)/1000;
		this.wind = (rand(0, self.partWind) - (self.partWind/2))/25;
		this.lineWidth = self.lineWidth;
	};
	
	Particle.prototype.update = function(index){
		var radians = this.angle * Math.PI / 180;
		var vx = Math.cos(radians) * this.speed;
		var vy = Math.sin(radians) * this.speed + this.gravity;
		this.speed *= this.friction;
						
		this.coordLast[2].x = this.coordLast[1].x;
		this.coordLast[2].y = this.coordLast[1].y;
		this.coordLast[1].x = this.coordLast[0].x;
		this.coordLast[1].y = this.coordLast[0].y;
		this.coordLast[0].x = this.x;
		this.coordLast[0].y = this.y;
		
		this.x += vx * self.dt;
		this.y += vy * self.dt;
		
		this.angle += this.wind;				
		this.alpha -= this.decay;
		
		if(!hitTest(0,0,self.cw,self.ch,this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2) || this.alpha < .05){					
			self.particles.splice(index, 1);	
		}			
	};
	
	Particle.prototype.draw = function(){
		var coordRand = (rand(1,3)-1);
		self.ctx.beginPath();								
		self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
		self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
		self.ctx.closePath();				
		self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
		self.ctx.stroke();				
		
		if(self.flickerDensity > 0){
			var inverseDensity = 50 - self.flickerDensity;					
			if(rand(0, inverseDensity) === inverseDensity){
				self.ctx.beginPath();
				self.ctx.arc(Math.round(this.x), Math.round(this.y), rand(this.lineWidth,this.lineWidth+3)/2, 0, Math.PI*2, false)
				self.ctx.closePath();
				var randAlpha = rand(50,100)/100;
				self.ctx.fillStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+randAlpha+')';
				self.ctx.fill();
			}	
		}
	};
	
	/*=============================================================================*/	
	/* Create Particles
	/*=============================================================================*/
	self.createParticles = function(x,y, hue){
		var countdown = self.partCount;
		while(countdown--){						
			self.particles.push(new Particle(x, y, hue));
		}
	};
	
	/*=============================================================================*/	
	/* Update Particles
	/*=============================================================================*/		
	self.updateParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];
			p.update(i);
		};
	};
	
	/*=============================================================================*/	
	/* Draw Particles
	/*=============================================================================*/
	self.drawParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];				
			p.draw();				
		};
	};
	
	/*=============================================================================*/	
	/* Firework Constructor
	/*=============================================================================*/
	var Firework = function(startX, startY, targetX, targetY){
		this.x = startX;
		this.y = startY;
		this.startX = startX;
		this.startY = startY;
		this.hitX = false;
		this.hitY = false;
		this.coordLast = [
			{x: startX, y: startY},
			{x: startX, y: startY},
			{x: startX, y: startY}
		];
		this.targetX = targetX;
		this.targetY = targetY;
		this.speed = self.fworkSpeed;
		this.angle = Math.atan2(targetY - startY, targetX - startX);
		this.shockwaveAngle = Math.atan2(targetY - startY, targetX - startX)+(90*(Math.PI/180));
		this.acceleration = self.fworkAccel/100;
		this.hue = self.currentHue;
		this.brightness = rand(50, 80);
		this.alpha = rand(50,100)/100;
		this.lineWidth = self.lineWidth;
		this.targetRadius = 1;
	};
	
	Firework.prototype.update = function(index){
		self.ctx.lineWidth = this.lineWidth;
			
		vx = Math.cos(this.angle) * this.speed,
		vy = Math.sin(this.angle) * this.speed;
		this.speed *= 1 + this.acceleration;				
		this.coordLast[2].x = this.coordLast[1].x;
		this.coordLast[2].y = this.coordLast[1].y;
		this.coordLast[1].x = this.coordLast[0].x;
		this.coordLast[1].y = this.coordLast[0].y;
		this.coordLast[0].x = this.x;
		this.coordLast[0].y = this.y;
		
		if(self.showTarget){
			if(this.targetRadius < 8){
				this.targetRadius += .25 * self.dt;
			} else {
				this.targetRadius = 1 * self.dt;	
			}
		}
		
		if(this.startX >= this.targetX){
			if(this.x + vx <= this.targetX){
				this.x = this.targetX;
				this.hitX = true;
			} else {
				this.x += vx * self.dt;
			}
		} else {
			if(this.x + vx >= this.targetX){
				this.x = this.targetX;
				this.hitX = true;
			} else {
				this.x += vx * self.dt;
			}
		}
		
		if(this.startY >= this.targetY){
			if(this.y + vy <= this.targetY){
				this.y = this.targetY;
				this.hitY = true;
			} else {
				this.y += vy * self.dt;
			}
		} else {
			if(this.y + vy >= this.targetY){
				this.y = this.targetY;
				this.hitY = true;
			} else {
				this.y += vy * self.dt;
			}
		}				
		
		if(this.hitX && this.hitY){
			var randExplosion = rand(0, 9);
			self.createParticles(this.targetX, this.targetY, this.hue);
			self.fireworks.splice(index, 1);					
		}
	};
	
	Firework.prototype.draw = function(){
		self.ctx.lineWidth = this.lineWidth;
			
		var coordRand = (rand(1,3)-1);					
		self.ctx.beginPath();							
		self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
		self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
		self.ctx.closePath();
		self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
		self.ctx.stroke();	
		
		if(self.showTarget){
			self.ctx.save();
			self.ctx.beginPath();
			self.ctx.arc(Math.round(this.targetX), Math.round(this.targetY), this.targetRadius, 0, Math.PI*2, false)
			self.ctx.closePath();
			self.ctx.lineWidth = 1;
			self.ctx.stroke();
			self.ctx.restore();
		}
			
		if(self.showShockwave){
			self.ctx.save();
			self.ctx.translate(Math.round(this.x), Math.round(this.y));
			self.ctx.rotate(this.shockwaveAngle);
			self.ctx.beginPath();
			self.ctx.arc(0, 0, 1*(this.speed/5), 0, Math.PI, true);
			self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+rand(25, 60)/100+')';
			self.ctx.lineWidth = this.lineWidth;
			self.ctx.stroke();
			self.ctx.restore();
		}								 
	};
	
	/*=============================================================================*/	
	/* Create Fireworks
	/*=============================================================================*/
	self.createFireworks = function(startX, startY, targetX, targetY){			
		self.fireworks.push(new Firework(startX, startY, targetX, targetY));
	};
	
	/*=============================================================================*/	
	/* Update Fireworks
	/*=============================================================================*/		
	self.updateFireworks = function(){
		var i = self.fireworks.length;
		while(i--){
			var f = self.fireworks[i];
			f.update(i);
		};
	};
	
	/*=============================================================================*/	
	/* Draw Fireworks
	/*=============================================================================*/
	self.drawFireworks = function(){
		var i = self.fireworks.length;			
		while(i--){
			var f = self.fireworks[i];		
			f.draw();
		};
	};
	
	/*=============================================================================*/	
	/* Events
	/*=============================================================================*/
	self.bindEvents = function(){
		$(window).on('resize', function(){			
			clearTimeout(self.timeout);
			self.timeout = setTimeout(function() {
				self.ctx.lineCap = 'round';
				self.ctx.lineJoin = 'round';
			}, 100);
		});
		
		$(self.canvas).on('mousedown', function(e){
			if (Utils.isHiddenMode()) {
				self.mx = e.pageX - self.canvasContainer.offset().left;
				self.my = e.pageY - self.canvasContainer.offset().top;
				self.currentHue = rand(self.hueMin, self.hueMax);
				self.createFireworks(self.cw / 2, self.ch, self.mx, self.my);

				$(self.canvas).on('mousemove.fireworks', function (e) {
					self.mx = e.pageX - self.canvasContainer.offset().left;
					self.my = e.pageY - self.canvasContainer.offset().top;
					self.currentHue = rand(self.hueMin, self.hueMax);
					self.createFireworks(self.cw / 2, self.ch, self.mx, self.my);
				});		
			}
		});
		
		$(self.canvas).on('mouseup', function(e){
			$(self.canvas).off('mousemove.fireworks');									
		});
					
	}
	
	/*=============================================================================*/	
	/* Clear Canvas
	/*=============================================================================*/
	self.clear = function(){
		self.particles = [];
		self.fireworks = [];
		self.ctx.clearRect(0, 0, self.cw, self.ch);
	};
  
  /*=============================================================================*/	
	/* Delta
	/*=============================================================================*/
  self.updateDelta = function(){
		var newTime = Date.now();
		self.dt = (newTime - self.oldTime)/16;
		self.dt = (self.dt > 5) ? 5 : self.dt;
		self.oldTime = newTime;	
	}
	
	/*=============================================================================*/	
	/* Main Loop
	/*=============================================================================*/
	self.canvasLoop = function(){
		requestAnimFrame(self.canvasLoop, self.canvas);
    	self.updateDelta();
		self.ctx.globalCompositeOperation = 'destination-out';
		self.ctx.fillStyle = 'rgba(0,0,0,'+self.clearAlpha/100+')';
		self.ctx.fillRect(0,0,self.cw,self.ch);
		self.ctx.globalCompositeOperation = 'lighter';
		self.updateFireworks();
		self.updateParticles();
		self.drawFireworks();			
		self.drawParticles();			
	};
  
  
  self.autoFires = function () {
	  var fworkNumber = self.fworkNumber;
	  while (fworkNumber--) {
		  setTimeout(function () {
			var firework = new Firework(self.cw / 2, self.ch, rand(50, self.cw - 50), rand(50, self.ch / 2) - 50);
			firework.hue = rand(self.hueMin, self.hueMax);
			self.fireworks.push(firework);
		  }, fworkNumber * 250);
	  }
  };
	
}

module.exports = Fireworks;