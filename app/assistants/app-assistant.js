var AppAssistant = Class.create({

	handleLaunch: function(params) {
		if (!params || params == {} || !params.query) {
			this.openMainStage();
		} else {
			this.openMainStage(decodeURIComponent(params.query));
		}
	},

	openMainStage: function(query) {
		var mainStageC = this.controller.getStageProxy("main-stage");
		if (mainStageC) {
			if (query) {
				var topScene = mainStageC.topScene().sceneName;
				if (topScene == "view-sent") {
					mainStageC.popScene();
					mainStageC.swapScene("sendsms");
				} else if(topScene == "history") {
					mainStageC.swapScene("sendsms");
				} else if (topScene != "sendsms" && topScene != "login") {
					mainStageC.popScenesTo("sendsms");
				}
				mainStageC.delegateToSceneAssistant("setMessageText", query);
			}
			mainStageC.activate();
		} else {
			this.controller.createStageWithCallback({name: "main-stage", assistantName: "MainStageAssistant"}, function(sc) {
				sc.pushScene("login", query);
			}, "card");
		}
	}
});
