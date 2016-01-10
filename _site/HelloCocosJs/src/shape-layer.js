var ShapeLayer = cc.Layer.extend({
	_draw:null,
	
	ctor:function() {
		this._super();
		
		_draw = new cc.DrawNode();
		this.addChild(_draw);
		
		return true;
	},
	
});