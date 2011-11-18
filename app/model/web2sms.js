var Web2Sms = Class.create({

	initialize: function(login, password) {
		this.loginName = login;
		this.password = password;
		this.anon=0;
	},
	
	logout: function(callback) {
		this._request("get", "https://www.t-mobile.cz/.gang/logout-url", function() {
			this.loggedIn = false;
			this.postBody = null;
			this.remaining = -1;
			if (callback)
				callback();
		}.bind(this));
	},


	login: function(callback) {
		this._request("post", "https://www.t-mobile.cz/.gang/login-url/portal", function(t) {
			var html = t.responseText;
//			for (var i=0;i<html.length;i+=800) {
	//			Mojo.Log.error(html.substr(i,i+800));
		//	}

			var m = html.match(/Jste p.ihl..en jako:/);
			if (m)
				m = 50;
			else
				m = null;
			if (m != null) {
			    try {
				var start = html.indexOf("<form method=\"post\" accept");
				var end = html.indexOf("</form>", start);
				var s = html.substring(start, end);
				
				var postBody = {};
				var v = s.match(/<input type="hidden" name="counter" value="(.*)"/i)[1];
				postBody["counter"] = v;
				this.postBody = postBody;
				Mojo.Log.error('Success : ' + Object.toJSON(postBody));
			    } catch(e) {
			    	Mojo.Log.error('Error : ' + Object.toJSON(e));
			    } 
				
			} else {
			for (var i=0;i<html.length;i+=800) {
				Mojo.Log.error(html.substr(i,i+800));
			}
			
			
			
			}
			this.remaining = m;
			this.loggedIn = m != null;
			if (callback) {
				callback({
					status: m == null ? "error" : "ok",
					remainingSms: m
				});
			}
		}, {
			"username": this.loginName,
			"password": this.password,
			"nexturl": "https://sms.client.tmo.cz/closed.jsp"
		});
	},



	load: function(callback) {
		this._request("get", "http://sms.t-zones.cz/open.jsp", function(t) {
			var html = t.responseText;
//			for (var i=0;i<html.length;i+=800) {
	//			Mojo.Log.error(html.substr(i,i+800));
		//	}

 		    try {
				var start = html.indexOf("<form method=\"post\" accept");
				var end = html.indexOf("</form>", start);
				var s = html.substring(start, end);
				
				var postBody = {};
				var v = s.match(/<input type="hidden" name="counter" value="(.*)"/i)[1];
				postBody["counter"] = v;
				this.postBody = postBody;
				Mojo.Log.error('Success : ' + Object.toJSON(postBody));
			    } catch(e) {
			    	Mojo.Log.error('Error : ' + Object.toJSON(e));
				return false;
			    } 
				
			this.remaining = 10;
			this.loggedIn = 1;
			this.anon = 1;
			if (callback) {
				callback({
					status: "ok",
					remainingSms: 10
				});
			}
		}, {});
	},




	sendSMS: function(receiver, text, confi, flash, callback) {
		if (!this.loggedIn || !this.postBody) {
			return false;
		}
		var url="https://sms.client.tmo.cz/closed.jsp";
		var recvs = receiver.replace(/[^\d,+]+/g, '').split(",");
		receiver = "";
		for (var i = 0; i < recvs.length; i++) {
			var r = recvs[i];
//			if (r.startsWith("0")) {
//				if (!r.startsWith("00")) {
//					r = "+49" + r.substring(1);
//				}
//			}
			if (i != 0)
				receiver += ",";
			receiver += r;
		}
		var postBody = this.postBody;
		postBody["mtype"] = (flash ? 1 : 0);
		if (this.anon>0) {
			postBody["captcha"]=confi;
			url="http://sms.t-zones.cz/open.jsp";
		} else {
			postBody["confirmation"] = (confi ? 1 : 0);
			
		}
		postBody["recipients"] = receiver;
		postBody['text'] = text;
//		postBody['SMSFrom'] = from;
//		postBody['Frequency'] = 5;
		this._request("post", url, function(t) {
			var html = t.responseText;
			var s=html;
//			for (var i=0;i<s.length;i+=800) {
//				Mojo.Log.error(s.substr(i,i+800));
//			}
			var success;
			try {		
				success = html.match(/SMS zpr.v. byl. odesl/);
				if (!success) {
					success = html.match(/SMS was sent/);
				}
				if (callback)
					callback({
						status: success ? "ok" : "error",
						recipients: receiver
					});
				var postBody = {};
				postBody["counter"] = s.match(/<input type="hidden" name="counter" value="(.*)"/i)[1];
				this.postBody = postBody;

			} catch (e) {
				Mojo.Log.error('Error : ' + Object.toJSON(e));
			}
			Mojo.Log.error('Success : ' + Object.toJSON(success));
		}, postBody);
		return true;
	},

	_request: function(method, url, callback, parameters) {
		new Ajax.Request(url, {
			method: method,
//			postBody: postBody,
			parameters: parameters,
			requestHeaders: ["User-Agent", "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.5) Gecko/20091102 Firefox/3.5.5"],
			onSuccess: callback.bind(this),
			onFailure: function(t) {
				console.log("fail: " + t.status);
			}
		});
	}
});
