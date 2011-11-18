var HelpAssistant = Class.create({
	setup: function() {
		this.backgroundClassName = "background";
//		$$('body')[0].addClassName('palm-default');
//		$$('body')[0].removeClassName('palm-dark');
		$$('body')[0].removeClassName(this.backgroundClassName);
	},
	
	cleanup: function() {
		$$('body')[0].addClassName(this.backgroundClassName);
//		$$('body')[0].addClassName('palm-dark');
//		$$('body')[0].removeClassName('palm-default');
	}
});
