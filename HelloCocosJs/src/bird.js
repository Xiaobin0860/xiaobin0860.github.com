var Bird = cc.Node.extend({
	_animation:null,
	ctor:function() {
		this._super();
		
		_animation = new cc.Sprite("res/CloseNormal.png");
		this.addChild(_animation);
		
		return true;
	}
});