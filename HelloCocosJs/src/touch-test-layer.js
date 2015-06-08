var TouchTestLayer = cc.Layer.extend({
    _drawNode:null,
    _touchListener:null,
    _lastPos:null,

    ctor:function() {
        this._super();

        var bg =  cc.LayerColor.create(cc.color(128, 128, 128, 225));
        this.addChild(bg);

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

        return true;
    },

    onEnter:function() {
        this._super();

        _touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
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
                _lastPos = pos;
            },
            onTouchEnded: function(touch, event) {
                var pos = touch.getLocation();
                _drawNode.drawDot(pos, 10.0, cc.color(255, 0, 0, 255));
                _lastPos = 0;
            }
        });

        cc.eventManager.addListener(_touchListener, this);
    },

    onExit:function() {
        cc.eventManager.removeListener(_touchListener);
        this._super();
    }
});

var TouchTestScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        this.addChild(new TouchTestLayer());
    }
});