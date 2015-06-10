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

        var bg =  cc.LayerColor.create(cc.color(128, 128, 128, 225));
        this.addChild(bg);

        var rect = getGameRect();
        cc.log("game rect: {{" + rect.x + ", " + rect.y + "}, {" + rect.width + ", " + rect.height + "}}.");
        for (var i=rect.x; i<rect.x+rect.width; i=i+TILE_WIDTH) {
            for (var j=rect.y; j<rect.y+rect.height; j=j+TILE_HEIGHT) {
                var pos = cc.p(i, j);
                var tile = cc.Sprite.create(res.pic_jpg);
                tile.setAnchorPoint(0, 0);
                cc.log("add sprite at {" + pos.x + ", " + pos.y + "}.");
                tile.setPosition(pos);
                this.addChild(tile);
            }
        }

        return true;
    }
});

var TouchTestLayer = cc.Layer.extend({
    _drawNode : null,
    _touchListener : null,
    _lastPos : null,
    _bg : null,

    _moveBackground : function(off) {
        var pos = _bg.getPosition();
        _bg.setPosition(cc.p(pos.x + off.x, pos.y + off.y));
    },

    ctor:function() {
        this._super();

        //var bg =  cc.LayerColor.create(cc.color(128, 128, 128, 225));
        //this.addChild(bg);
        _bg = new BackgroundLayer();
        this.addChild(_bg);

        _drawNode = cc.DrawNode.create();
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

        cc.log("this=" + this);
        return true;
    },

    onEnter:function() {
        this._super();

        cc.log("this=" + this);
        cc.log(this._moveBackground);
        this._moveBackground(cc.p(200, 200));
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
        cc.log(_drawNode);
        cc.log(this._moveBackground);
        _drawNode.drawSegment(_lastPos, pos, 10.0, cc.color(255, 0, 0, 255));
        if (_lastPos) this.moveBackground(cc.p(pos.x-_lastPos.x, pos.y-_lastPos.y));
        cc.log("this=" + this);
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