var TILE_WIDTH  = 99;
var TILE_HEIGHT = 171;
var BORDER_OFF	= 80;
var BIRD_W		= 40;
var BIRD_H		= 40;
var EV_START_GAME = "EV_START_GAME";

function getGameRect() {
    var rect = cc.view.getViewPortRect();
    rect.x -= TILE_WIDTH;
    rect.y -= TILE_HEIGHT;
    rect.width += 2 * TILE_WIDTH;
    rect.height += + 2 * TILE_HEIGHT;
    return rect;
}

var BackgroundLayer = cc.Layer.extend({
    ctor : function() {
        this._super();
        var winSize = cc.winSize;
        var width = 0;
        var height = 0;
        for (var i=0; i<winSize.width; i=i+TILE_WIDTH) {
        	width += TILE_WIDTH;
        	for (var j=0; j<winSize.height; j=j+TILE_HEIGHT) {
        		if (0 == i) height += TILE_HEIGHT;
                var pos = cc.p(i, j);
                var tile = new cc.Sprite(res.pic_jpg);
                tile.setAnchorPoint(0, 0);
                cc.log("add sprite at {" + pos.x + ", " + pos.y + "}.");
                tile.setPosition(pos);
                this.addChild(tile);
            }
        }
        
        cc.log("BackgroundLayer width=" + width + ", height=" + height);
        this.setContentSize(width, height);

        return true;
    }
});

var TouchTestLayer = cc.Layer.extend({
    _drawNode : null,
    _touchListener : null,
    _lastPos : null,
    _self : null,
    // 实现无限地图，需要4块大于窗口的背景
    _bg00 : null,
    _bg01 : null,
    _bg10 : null,
    _bg11 : null,
    _bird : null,
    _bezierPos1 : null,
    _bezierPos2 : null,
    _shapeScale : null,
    _debugDraw : null,
    _customEventListener:null,

    _moveBackground : function(off) {
    	var winSize = cc.winSize;
    	var bgSize = _bg00.getContentSize();
    	var pos00 = _bg00.getPosition();
    	pos00.x += off.x;
    	pos00.y += off.y;
    	var pos01 = _bg01.getPosition();
    	pos01.x += off.x;
    	pos01.y += off.y;
    	var pos10 = _bg10.getPosition();
    	pos10.x += off.x;
    	pos10.y += off.y;
    	var pos11 = _bg11.getPosition();
    	pos11.x += off.x;
    	pos11.y += off.y;

    	if (pos00.x < -bgSize.width) {	//00.x, 10.x
    		pos00.x = pos01.x + bgSize.width;
    		pos10.x = pos11.x + bgSize.width;
    	}
    	else if (pos00.x > bgSize.width) {
    		pos00.x = pos01.x - bgSize.width;
    		pos10.x = pos11.x - bgSize.width;
    	}
    	if (pos00.y < -bgSize.height) {	//00.y, 01.y
    		pos00.y = pos10.y + bgSize.height;
    		pos01.y = pos11.y + bgSize.height;
    	}
    	else if (pos00.y > bgSize.height) {
    		pos00.y = pos10.y - bgSize.height;
    		pos01.y = pos11.y - bgSize.height;
    	}
    	
    	if (pos11.x < -bgSize.width) {	//11.x, 01.x
    		pos11.x = pos10.x + bgSize.width;
    		pos01.x = pos00.x + bgSize.width;
    	}
    	else if (pos11.x > bgSize.width) {
    		pos11.x = pos10.x - bgSize.width;
    		pos01.x = pos00.x - bgSize.width;
    	}
    	
    	if (pos11.y < -bgSize.height) {	//11.y, 10.y
    		pos11.y = pos01.y + bgSize.height;
    		pos10.y = pos00.y + bgSize.height;
    	}
    	else if (pos11.y > bgSize.height) {
    		pos11.y = pos01.y - bgSize.height;
    		pos10.y = pos00.y - bgSize.height;
    	}

    	_bg00.setPosition(pos00);
    	_bg01.setPosition(pos01);
    	_bg10.setPosition(pos10);
    	_bg11.setPosition(pos11);
    	
//    	var pos = _drawNode.getPosition();
//    	pos.x += off.x;
//    	pos.y += off.y;
//    	_drawNode.setPosition(pos);
    	var pos = _bird.getPosition();
    	pos.x += off.x;
    	pos.y += off.y;
    	_bird.setPosition(pos);
    },

    ctor:function() {
        this._super();
        
        _self = this;
        
        _shapeScale = 1.0;
        
        _bg00 = new BackgroundLayer();	//左下
        _bg01 = new BackgroundLayer();	//右下
        _bg10 = new BackgroundLayer();	//左上
        _bg11 = new BackgroundLayer();	//右上
        var bgSize = _bg00.getContentSize();
        _bg00.setPosition(cc.p(0, 0));
        _bg01.setPosition(cc.p(bgSize.width, 0));
        _bg10.setPosition(cc.p(0, bgSize.height));
        _bg11.setPosition(cc.p(bgSize.width, bgSize.height));
        this.addChild(_bg00);
        this.addChild(_bg01);
        this.addChild(_bg10);
        this.addChild(_bg11);

        _drawNode = new cc.DrawNode();
        this.addChild(_drawNode);
        
        _debugDraw = new cc.DrawNode();
        this.addChild(_debugDraw);
        
        _bird = new Bird();
        _bird.setVisible(false);
        this.addChild(_bird);

        return true;
    },

    onEnter:function() {
        this._super();
        
        this._customEventListener = cc.eventManager.addCustomListener(EV_START_GAME, this._onCustomEvent.bind(this, this._onCustomEvent));
        
        this.startGame();
    },

    onExit : function() {
    	cc.eventManager.removeListener(this._customEventListener);
    	
    	cc.director.getScheduler().unscheduleCallbackForTarget(this, this.gameLoop);
    	this.unscheduleUpdate();
    	if (_touchListener) {
    		cc.eventManager.removeListener(_touchListener);
    		_touchListener = null;
    	}
        this._super();
    },
    onTouchBegan: function(touch, event) {
        _lastPos = touch.getLocation();
        return true;
    },
    onTouchMoved: function(touch, event) {
        var pos = touch.getLocation();
        if (_lastPos) this.moveBackground(cc.p(pos.x-_lastPos.x, pos.y-_lastPos.y));
        _lastPos = pos;
    },
    onTouchEnded: function(touch, event) {
        _lastPos = null;
    },
    
    gameLoop:function(dt) {
//    	cc.log("gameLoop: " + dt);
//  	this._moveBackground(cc.p(1, 0));
    	_shapeScale -= 0.04;
    	var size = _drawNode.getContentSize();
    	var winSize = cc.winSize;
    	var pos = cc.p((winSize.width-size.width*_shapeScale)/2.0, (winSize.height-size.height*_shapeScale)/2.0);

    	_bird.stopAllActions();
    	_drawNode.runAction(cc.spawn([cc.moveTo(1, pos),
    	                              cc.scaleTo(1, _shapeScale, _shapeScale),
    	                              cc.blink(0.5, 4)]));
    	
    	var winSize = cc.winSize;
    	var p3 = cc.p((0.5-Math.random())*winSize.width,(0.5-Math.random())*winSize.height);
    	_bird.runAction(cc.bezierBy(3, [_bezierPos1, _bezierPos2, p3]));
    	_bezierPos1 = _bezierPos2;
    	_bezierPos2 = p3;
    },
    
    update:function(dt) {
//		cc.log("update " + dt);
    	var size = cc.winSize;
    	var shapeSize = _drawNode.getContentSize();
    	var scale = _drawNode.getScale();
//    	cc.log("draw node " + _drawNode + ", scale=" + scale);
    	var shapePos = _drawNode.getPosition();
    	var birdPos = _bird.getPosition();
    	var birdSize = _bird.getContentSize();
//    	var birdRect = _bird.getTextureRect();
    	var valideRect = cc.rect(shapePos.x+birdSize.width/2.0+1, shapePos.y+birdSize.height/2.0+1,
    			shapeSize.width*scale-birdSize.width-2, shapeSize.height*scale-birdSize.height-2);

//    	_debugDraw.clear();
//    	_debugDraw.drawPoly([cc.p(valideRect.x, valideRect.y),
//    	                     cc.p(valideRect.x, valideRect.y+valideRect.height),
//    	                     cc.p(valideRect.x+valideRect.width, valideRect.y+valideRect.height),
//    	                     cc.p(valideRect.x+valideRect.width, valideRect.y)],
//    	                     cc.color(0, 255, 0, 128), 2, cc.color(0, 255, 0, 255));
//    	
//    	_debugDraw.drawDot(birdPos, 21, cc.color(0, 0, 255, 200));
    	
    	//var valideRect = cc.rect(0, 0, size.width, size.height);
    	if (!cc.rectContainsPoint(valideRect, birdPos)) {
    		this.stopGame();
    		this.showResult();
    	}
    },

    startGame:function() {
    	var size = cc.winSize;
    	_bezierPos1 = cc.p((0.5-Math.random())*size.width, (0.5-Math.random())*size.height);
    	_bezierPos2 = cc.p((0.5-Math.random())*size.width, (0.5-Math.random())*size.height);
    	var contentSize = cc.size(size.width-2*BORDER_OFF, size.height-2*BORDER_OFF);
    	_drawNode.setContentSize(contentSize);
    	_drawNode.setPosition(cc.p((size.width-contentSize.width)/2.0, (size.height-contentSize.height)/2.0));
    	_drawNode.clear();
    	_shapeScale = 1.0;
    	_drawNode.setScale(_shapeScale);
    	_drawNode.drawPoly([cc.p(0, 0),
    	                    cc.p(0, size.height-2*BORDER_OFF),
    	                    cc.p(size.width-2*BORDER_OFF, size.height-2*BORDER_OFF),
    	                    cc.p(size.width-2*BORDER_OFF, 0)],
    	                    null, 2, cc.color(255, 0, 0, 200));
    	var pos = cc.p(Math.random()*(size.width-BORDER_OFF*3)+BORDER_OFF*1.5,
    			Math.random()*(size.height-BORDER_OFF*3)+BORDER_OFF*1.5);
    	_bird.setPosition(pos);
    	_bird.setVisible(true);
    	
    	_touchListener = cc.EventListener.create({
    		event: cc.EventListener.TOUCH_ONE_BY_ONE,
    		swallowTouches: true,
    		onTouchBegan : this.onTouchBegan,
    		onTouchMoved : this.onTouchMoved,
    		onTouchEnded : this.onTouchEnded,
    		moveBackground : this._moveBackground
    	});

    	cc.eventManager.addListener(_touchListener, this);

    	this.scheduleUpdate();
    	cc.director.getScheduler().scheduleCallbackForTarget(this, this.gameLoop, 2, cc.REPEAT_FOREVER, 0, false);
    },
    
    stopGame:function() {
    	cc.director.getScheduler().unscheduleCallbackForTarget(this, this.gameLoop);
    	_bird.stopAllActions();
    	_drawNode.stopAllActions();
    	this.unscheduleUpdate();
    	cc.eventManager.removeListener(_touchListener);
    	_touchListener = null;
    },
    
    showResult:function() {
    	var shapeSize = _drawNode.getContentSize();
    	var scale = _drawNode.getScale();
    	var area = shapeSize.width*scale*shapeSize.height*scale;
    	var result = new ModalDialogBox("面积: "+area, function(){
    		cc.eventManager.dispatchCustomEvent(EV_START_GAME, null);
    	});
    	this.addChild(result);
    },
    
    _onCustomEvent:function(event) {
//    	var name = event.getEventName();
//    	if (EV_START_GAME == name) {
    		this.startGame();
//    	}
    }
});

var TouchTestScene = cc.Scene.extend({
    ctor : function() {
        this._super();
        this.addChild(new TouchTestLayer());
    }
});