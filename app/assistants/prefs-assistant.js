var PrefsAssistant = Class.create({
	setup: function() {
		this.backgroundClassName = "background";
//		$$('body')[0].addClassName('palm-default');
//		$$('body')[0].removeClassName('palm-dark');
		$$('body')[0].removeClassName(this.backgroundClassName);
		
		this.prefs = prefsCookie.get() || {
			flash: false,
			confi: false,
		};

		this.controller.setupWidget("flashSmsCheckbox", {
			modelProperty: "flash"
		}, this.prefs);
		this.controller.setupWidget("confirmSmsCheckbox", {
			modelProperty: "confi"
		}, this.prefs);

		this.changed();
	},
	
	changed: function() {
//		this.prefs.textDisabled = (this.prefs.sender != 3);
		this.controller.modelChanged(this.prefs, this);
	},
	
	deactivate: function() {
		prefsCookie.put(this.prefs);
	},
	
	cleanup: function() {
		$$('body')[0].addClassName(this.backgroundClassName);
//		$$('body')[0].addClassName('palm-dark');
//		$$('body')[0].removeClassName('palm-default');
	}
});
