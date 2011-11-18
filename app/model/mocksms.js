var Web2Sms = Class.create({
	
	remaining: 43,
	loggedIn: false,
	
	initialize: function(login, password) {
		this.loginName = login;
		this.password = password;
	},
	
	login: function(callback, captchaCallback) {
		this.loggedIn = true;
		this.fetchInfo(callback);
	},
	
	logout: function(callback) {
		this.loggedIn = false;
		if(callback)
			callback();
	},
	
	fetchInfo: function(callback) {
		callback({
			status: "ok",
			remainingSms: 42
		});	
	},
	
	sendSMS: function(receiver, text, from, flash, callback) {
		if(!this.loggedIn) {
			return false;
		}
		var recvs = receiver.replace(/[^\d,+]+/g, '').split(",");
		receiver = "";
		for(var i = 0; i < recvs.length; i++) {
			var r = recvs[i];
//			if(r.startsWith("0")) {
//				if(!r.startsWith("00")) {
//					r = "+"+r.substring(2);
//				} else {
//					r = "+49"+r.substring(1);
//				}
//			}
			if(i != 0)
				receiver += ",";
			receiver += r;
		}
		console.log("to: " + receiver);
		if(callback)
			callback({
				status: "ok",
				recipients: receiver,
				remainingSms: this.remaining - 1
			});
		return true;
	}
	
});
