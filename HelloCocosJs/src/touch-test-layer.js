var TILE_WIDTH  = 99;
var TILE_HEIGHT = 171;

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
    },

    ctor:function() {
        this._super();
        
        _self = this;
        
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

        var size = cc.winSize;
        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = new cc.MenuItemImage(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
                cc.director.popScene();
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: size.height - 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);

        return true;
    },

    onEnter:function() {
        this._super();

        _touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan : this.onTouchBegan,
            onTouchMoved : this.onTouchMoved,
            onTouchEnded : this.onTouchEnded,
            moveBackground : this._moveBackground
        });

        cc.eventManager.addListener(_touchListener, this);
    },

    onExit : function() {
        cc.eventManager.removeListener(_touchListener);
        this._super();
    },
    onTouchBegan: function(touch, event) {
        _drawNode.clear();
        var pos = touch.getLocation();
        _drawNode.drawDot(pos, 10.0, cc.color(255, 0, 0, 255));
        _lastPos = pos;
        return true;
    },
    onTouchMoved: function(touch, event) {
        var pos = touch.getLocation();
        _drawNode.drawSegment(_lastPos, pos, 10.0, cc.color(255, 0, 0, 255));
        if (_lastPos) this.moveBackground(cc.p(pos.x-_lastPos.x, pos.y-_lastPos.y));
        _lastPos = pos;
    },
    onTouchEnded: function(touch, event) {
        var pos = touch.getLocation();
        _drawNode.drawDot(pos, 10.0, cc.color(255, 0, 0, 255));
        _lastPos = null;
    }
});

var TouchTestScene = cc.Scene.extend({
    ctor : function() {
        this._super();
        this.addChild(new TouchTestLayer());
    }
});