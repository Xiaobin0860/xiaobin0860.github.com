var ModalDialogBox = cc.LayerColor.extend({
	_listener:null,
	_labelMsg:null,
	_btnClose:null,
	_callback:null,
	
	ctor:function(msg, callback) {
		this._super(cc.color(0, 0, 0, 128));
		this._callback = callback;
		var size = cc.winSize;
		
		_labelMsg = new cc.LabelTTF(msg);
		_labelMsg.setPosition(cc.p(size.width/2.0, size.height/2.0+20));
		this.addChild(_labelMsg);
		
		var close = new cc.MenuItemFont("确定", this._onClose, this);
		var menu = new cc.Menu(close);
		menu.setPosition(cc.p(size.width/2.0, size.height/2.0-10));
		this.addChild(menu);
		
		return true;
	},
	
	onEnter:function() {
		this._super();
		this._listener = new cc.EventListener({
			event:cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches:true,
			onTouchBegan:function(touch, event) {
				return true;
			}
		});
		cc.eventManager.addListener(this._listener, this);
	},
	
	onExit:function(){
		cc.eventManager.removeListeners(this);
		this._listener = null;
		this._super();
	},
	
	_onClose:function() {
		if (this._callback) this._callback();
		this.removeFromParent(true);
	},
	
	setMessage:function(msg) {
		this._labelMsg.setString(msg);
	}
	
});