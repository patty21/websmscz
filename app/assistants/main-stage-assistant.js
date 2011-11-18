var inputCookie = new Mojo.Model.Cookie("sendsmsinput");
var prefsCookie = new Mojo.Model.Cookie("prefs");

var loginCookie = new Mojo.Model.Cookie("login");
var outboxItems = [/*{
 to: "Max Mustermann",
 text: "Hallo Max, Test.",
 date: 1266175981
 },
 {to: "Petra Peters, 0123 1234567", text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.", date: 1265306266},
 {
 to: "Hans Meier",
 text: "Lorem ipsum dolor sit amet",
 date: 1265206266
 }*/];
var historyDepot;
var web2sms;
var maxChars = 765;
var charsPerSms = 160;

var MainStageAssistant = Class.create({
	setup: function() {
		historyDepot = new Mojo.Depot({name: "history", replace: false}, function() {
			historyDepot.get("outbox", function(res) {
				outboxItems = res || [];
			});
		});
	},

	handleCommand: function(event) {
		if (event.type == Mojo.Event.commandEnable) {
			switch (event.command) {
				case Mojo.Menu.helpCmd:
					event.stopPropagation();
					break;
				case Mojo.Menu.prefsCmd:
					if (this.controller.getScenes().length != 1)
						event.stopPropagation();
					break;
			}
		} else if (event.type == Mojo.Event.command) {
			switch (event.command) {
				case Mojo.Menu.helpCmd:
					this.controller.pushAppSupportInfoScene();
					break;
				case Mojo.Menu.prefsCmd:
					this.controller.pushScene("prefs");
					break;
			}
		} else if (event.type == Mojo.Event.back) {
			var scenes = this.controller.getScenes();
			if (scenes.length == 2) {	// zurück zur login scene
				web2sms.logout();
			}
		}
	},

	cleanup: function() {
		inputCookie.remove();
	}
});
