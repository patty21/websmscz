var PhoneNumberLabelsDe = {
	0: "Home",
	1: "Work",
	2: "Other",
	3: "Mobile",
	4: "Pager",
	5: "Fax (home)",
	6: "Fax (work)",
	7: "Primary"
};

var SendsmsAssistant = Class.create({

	initialize: function(query) {
		this.query = query;
	},
	
	setup: function() {
		this.addedPersons = [];
		
		this.controller.setupWidget("toField", {
			hintText: "Enter phone number...",
			modifierState: Mojo.Widget.numLock,
			charsAllow: this.allowChar.bind(this)
		}, this.toFieldModel = { value: ""});	
		this.controller.setupWidget("messageText", {
			multiline: true,
			hintText: "Enter message...",
			autoFocus: true,
			changeOnKeyPress: true,
			preventResize: false,
			charsAllow: function(c) {
				return this.messageTextModel.value.length < maxChars;
			}.bind(this)
		}, this.messageTextModel = { value: this.query ? this.query : "" });

		if (web2sms.anon>0) {
			this.controller.setupWidget("captchatext", {
				hintText: "Enter captcha..."
			}, this.CaptchaModel = { value: ""});	
			$("captcha").src="http://sms.t-zones.cz/open/captcha.jpg";
			this.controller.get("op").show();
			maxChars=160;
		}
		$("remainingChars").innerText = maxChars;
//		var height = this.controller.window.innerHeight;
//		var screen = window.screen.height;
//		$("messageText").style.minHeight = (210 - (screen - height))+"px";
//		$("messageText").style.minHeight = "180px";

		if(inputCookie.get()) {
			var input = inputCookie.get();
			this.toFieldModel.value = input.to;
			this.messageTextModel.value = input.text;
			this.controller.modelChanged(this.toFieldModel, this);
			this.controller.modelChanged(this.messageTextModel, this);
		}
		this.controller.setupWidget("sendButton", { type: Mojo.Widget.activityButton }, this.sendButtonModel = {buttonLabel: "Send"});
		this.controller.listen("pickContactButton", Mojo.Event.tap, this.lpicker = this.pick.bindAsEventListener(this));
		this.controller.listen("sendButton", Mojo.Event.tap, this.lsend = this.send.bindAsEventListener(this));
		this.controller.listen("messageText", Mojo.Event.propertyChange, this.lchange = this.changed.bindAsEventListener(this));

		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
			visible: true,
			items: [{}, {
				toggleCmd: "sendsms",
				items: [{
					icon: "sendsms",
					command: "sendsms"
				}, {
					icon: "conversation",
					command: "history"
				}]
			}, {}
			]
		});
	},

	handleCommand: function(event) {
		if(event.type == Mojo.Event.command) {
			switch(event.command) {
				case "history":
					this.controller.stageController.swapScene({name: "history", transition: Mojo.Transition.crossFade});				
				break;
			}
		}
	},
	
	activate: function(response) {
		if(response) {
			var person;
			var name = null;
			if(response.details && response.details.record) {	// webOS 1.x
				person = response.details.record;
				name = person.firstName;
				if(person.lastName)
					name += " " + person.lastName;
			} else {											// webOS 2.0 and later
				person = response;
				name = person.name.givenName;
				if(person.name.familyName)
					name += " " + person.name.familyName;
			}
			
			var phones = person.phoneNumbers;

			if(phones && phones.length != 0) {
				if(phones.length == 1) {
					this.addNumberToRecipients(phones[0].value, name);
				} else {
					var items = [{label: "Select number"}];
					for(var i = 0; i < phones.length; i++) {
						var number = phones[i].value;
						var type = PhoneNumberLabelsDe[phones[i].label];
						items.push({label: number, type: type, command: number});
					}
					this.controller.popupSubmenu({
						onChoose: function(mobile) {
							if(mobile) {
								this.addNumberToRecipients(mobile, name);
							}
						}.bind(this),
						items: items,
						itemTemplate: "sendsms/number-row"
					});
				}
			}
		}
	},

	addNumberToRecipients: function(number, name) {
		var str = this.toFieldModel.value;
		if(str.length != 0) {
			str += ", "+ number;
		} else {
			str = number;
		}
		this.addedPersons.push({name: name, number: number});
		this.toFieldModel.value = str;
		this.controller.modelChanged(this.toFieldModel, this);
	},
	
	allowChar: function(c) {
		var str = String.fromCharCode(c);
		return Mojo.Char.isDigit(c) || Mojo.Char.isDeleteKey(c) || str == "," || c == Mojo.Char.spaceBar || str == "+";
	},
	
	changed: function() {
		var length = this.messageTextModel.value.length;
		$("remainingChars").innerText = Math.max(maxChars - length, 0);
		$("numSms").innerText = Math.floor((length - 1) / charsPerSms) + 1;
	},
	
	pick: function() {
		this.controller.stageController.pushScene(
			{ appId :'com.palm.app.contacts', name: 'list' },
			{ mode: 'picker', message: "Pick contact"}
		 ); 
	},

	setMessageText: function(text) {
		this.messageTextModel.value = text;
		this.controller.modelChanged(this.messageTextModel, this);
	},
	
	send: function() {
		this.sendButtonModel.disabled = true;
		this.controller.modelChanged(this.sendButtonModel, this);
		var from = "";
		var flash = false;
		var confi = false;
		if(prefsCookie.get()) {
			var p = prefsCookie.get();
			flash = p.flash;
			confi = p.confi;
		}
		if (web2sms.anon>0) {
			confi=this.CaptchaModel.value;
		}			
		var ok = web2sms.sendSMS(this.toFieldModel.value, this.messageTextModel.value, confi, flash, this.callback.bind(this));
		if(!ok) {
			this.controller.showAlertDialog({
				title: "Error",
				message: "Error sending message, please relogin.",
				choices: [{label: "ok"}],
				onChoose: function() {
					this.controller.stageController.popScene();
				}.bind(this)
			});
		}
	},
	
	callback: function(info) {
		var success = info.status == "ok";
//		var recipients = info.recipients;
		var remainingBefore = web2sms.remaining;
//		web2sms.fetchInfo(function(info) {
			this.sendButtonModel.disabled = false;
			$("sendButton").mojo.deactivate();
			if(!success) { // wahrscheinlich fehler aufgetreten
				this.controller.showAlertDialog({
					title: "Error",
					message: "SMS was not sent. Please check the list of recipients.",
					choices: [{label: "Ok"}],
					onChoose: function() {}
				});
			} else {
				var to = "";
				var timeout=2500;
				var numbers = this.toFieldModel.value.split(",");
				for(var i = 0; i < numbers.length; i++) {
					var number = numbers[i].strip();
					var nextRecip = number;
					for(var j = 0; j < this.addedPersons.length; j++) {
						var p = this.addedPersons[j];
						if(p.number == number) {
							nextRecip = p.name;
							if(!nextRecip)
								nextRecip = number;
//							this.addedPersons.splice(j, 1);		// maybe we should remove the entry here
							break;
						}
					}
					if(to.length != 0)
						to += ", ";
					to += nextRecip;
				}
				outboxItems.splice(0, 0, {
					to: to,
					text: this.messageTextModel.value,
					date: new Date().getTime()
				});
				this.addedPersons = [];
				historyDepot.add("outbox", outboxItems);
//				$("numRemainingSms").innerText = info.remainingSms;			
				this.toFieldModel.value = "";
				this.messageTextModel.value = "";
				$("remainingChars").innerText = maxChars;
				this.sendButtonModel.buttonLabel = "SMS Sent";
				if (web2sms.anon) {
					this.sendButtonModel.buttonLabel = "SMS Sent - waiting 30 sec";
					timeout=30000;
				}
				setTimeout(function() {
					this.sendButtonModel.buttonLabel = "Send";
					this.controller.modelChanged(this.sendButtonModel, this);
				}.bind(this), timeout);
			}
			this.controller.modelChanged(this.sendButtonModel, this);
			this.controller.modelChanged(this.toFieldModel, this);
			this.controller.modelChanged(this.messageTextModel, this);
			if (web2sms.anon) {
				$("captcha").src="http://sms.t-zones.cz/open/captcha.jpg#"+Math.floor(Math.random()*10000);
				this.CaptchaModel.value = "";
				this.controller.modelChanged(this.CaptchaModel, this);
//				this.controller.stageController.swapScene("sendsms", this.query);
			}
//		}.bind(this));
	},
	
	deactivate: function() {
		inputCookie.put({
			to: this.toFieldModel.value,
			text: this.messageTextModel.value
		});
	},
	
	cleanup: function() {
		this.controller.stopListening("pickContactButton", Mojo.Event.tap, this.lpicker);
		this.controller.stopListening("sendButton", Mojo.Event.tap, this.lsend);
		this.controller.stopListening("messageText", Mojo.Event.propertyChange, this.lchange);
	}
});
