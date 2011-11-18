var LoginAssistant = Class.create({
	
	loginPerformed: false,

	initialize: function(query) {
		this.query = query;
	},
	
	setup: function() {
		this.controller.setupWidget("username", {
		}, this.usernameModel = {});
		this.controller.setupWidget("password", {
			focusMode: Mojo.Widget.focusSelectMode
		}, this.passwordModel = {});
		var login = loginCookie.get();
		if(login) {
			this.usernameModel.value = login.user;
			this.passwordModel.value = login.pass;
		}
		this.controller.setupWidget("loginButton", {
			type: Mojo.Widget.activityButton
		}, this.buttonModel = {
			buttonLabel: "Login"
		});
		this.controller.setupWidget("helpButton", {}, {
			buttonLabel: "Help"
		});
		this.controller.setupWidget("anonButton", {
			type: Mojo.Widget.activityButton
		}, this.buttonModel = {
			buttonLabel: "send anonymous SMS"
		});
		this.controller.listen("loginButton", Mojo.Event.tap, this.llogin = this.login.bindAsEventListener(this));
		this.controller.listen("helpButton", Mojo.Event.tap, this.lhelp = this.help.bindAsEventListener(this));
		this.controller.listen("anonButton", Mojo.Event.tap, this.lanon = this.anon.bindAsEventListener(this));

	},
	
	activate: function() {
		if(!this.loginPerformed && loginCookie.get()) {
			this.login();
		}
	},
	
	cleanup: function() {
		if(web2sms && web2sms.loggedIn) {
			web2sms.logout();
		}
		this.controller.stopListening("loginButton", Mojo.Event.tap, this.llogin);
		this.controller.stopListening("helpButton", Mojo.Event.tap, this.lhelp);
		this.controller.stopListening("anonButton", Mojo.Event.tap, this.lanon);
	},
	
	login: function(event) {
		$("loginButton").mojo.activate();
		this.buttonModel.disabled = true;
		this.controller.modelChanged(this.buttonModel, this);
		$("errorPanel").style.display = 'none';
		
		web2sms = new Web2Sms(this.usernameModel.value, this.passwordModel.value);
		web2sms.logout(function() {
			web2sms.login(this.callback.bind(this));
		}.bind(this));

	},


	anon: function(event) {
		$("anonButton").mojo.activate();
		this.buttonModel.disabled = true;
		this.controller.modelChanged(this.buttonModel, this);
		$("errorPanel").style.display = 'none';
		
		web2sms = new Web2Sms("","");
		web2sms.load(this.callback.bind(this));
	},



	callback: function(info) {
		if(info.status == "error") {
			$("errorPanel").style.display = 'block';
		} else {
			this.loginPerformed = true;
			loginCookie.put({
				user: this.usernameModel.value,
				pass: this.passwordModel.value
			});
			this.controller.stageController.pushScene("sendsms", this.query);
		}
		this.buttonModel.disabled = false;
		this.controller.modelChanged(this.buttonModel, this);
		$("loginButton").mojo.deactivate();
		$("anonButton").mojo.deactivate();
	},
	
	captchaCallback: function(callback) {
		this.controller.showDialog({
			template: "login/captcha-dialog",
			assistant: new CaptchaAssistant(this, callback),
			preventCancel: false
		});
	},
	
	help: function(event) {
		this.controller.stageController.pushScene("help");
	}
});

var CaptchaAssistant = Class.create({
	initialize: function(sceneAssistant, callback) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		this.callback = callback;
	},
	
	setup: function(widget) {
		this.widget = widget;
		this.controller.setupWidget("captchaField", {
			textReplacement: false
		}, this.captchaModel = {});
		$("captcha").src = "https://login.o2online.de/loginRegistration/jcaptchaReg";
		this.controller.listen("ok", Mojo.Event.tap, this.ok.bindAsEventListener(this));
		this.controller.listen("cancel", Mojo.Event.tap, this.cancel.bindAsEventListener(this));
	},
	
	ok: function() {
		$("captcha").src = "";
		this.widget.mojo.close();
		var that = this.sceneAssistant;
		this.callback(that.callback.bind(that), that.captchaCallback.bind(that), this.captchaModel.value);
	},
	
	cancel: function() {
		$("captcha").src = "";
		this.widget.mojo.close();
	}
});
