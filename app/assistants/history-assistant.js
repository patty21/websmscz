var HistoryAssistant = Class.create({
	setup: function() {
		this.controller.setDefaultTransition(Mojo.Transition.crossFade);
		
		this.controller.setupWidget("historyList", {
			itemTemplate: "history/historyItem",
			emptyTemplate: "history/empty",
//			filterFunction: this.searchList.bind(this),
//			itemsCallback: this.searchList.bind(this),
			formatters: {
				dateString: function(v, m) { m.dateString = Mojo.Format.formatDate(new Date(m.date), {	format: "'Date' dd.MM. 'Time' HH:mm"	}); }
			},
			renderLimit: 50,
			delay: 300,
			swipeToDelete: true
		}, this.historyModel = {
			items: outboxItems
		});
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, {
			visible: true,
			items: [{}, {}, {
				toggleCmd: "history",
				items: [{
					icon: "sendsms",
					command: "sendsms"
				}, {
					icon: "conversation",
					command: "history"
				}]
			}, {}, {
				icon: "delete",
				command: "clearOutbox"
			}
			]
		});
		
		this.controller.listen("historyList", Mojo.Event.listDelete, this.lremove = this.remove.bindAsEventListener(this));
		this.controller.listen("historyList", Mojo.Event.listTap, this.lopen = this.open.bindAsEventListener(this));
	},
	
	remove: function(event) {
		outboxItems.splice(event.index, 1);
		historyDepot.add("outbox", outboxItems);
	},
	
	open: function(event) {
		this.controller.stageController.pushScene("view-sent", event.item);
	},
	
	searchList: function(filterString, listWidget, offset, count) {
		filterString = filterString.toLowerCase();
		var results = new Array();
		for(var i = 0; i < outboxItems.length; i++) {
			var item = outboxItems[i];
			if(item.text.toLowerCase().indexOf(filterString) != -1) {
				item.dateString = Mojo.Format.formatDate(new Date(item.date), {	format: "'am' dd.MM 'um' HH:mm"	});
				results.push(item);
			}
		}
		listWidget.mojo.noticeUpdatedItems(offset, results);
		listWidget.mojo.setLength(results.length);
		listWidget.mojo.setCount(results.length);
	},

	handleCommand: function(event) {
		if(event.type == Mojo.Event.command) {
			switch(event.command) {
				case "sendsms":
					this.controller.stageController.swapScene({name: "sendsms", transition: Mojo.Transition.crossFade});				
				break;
				case "clearOutbox":
					this.controller.showAlertDialog({
						onChoose: function(c) {
							if(c == "del") {
								outboxItems = [];
								historyDepot.add("outbox", outboxItems);
								this.historyModel.items = [];
								this.controller.modelChanged(this.historyModel, this);
							}
						}.bind(this),
						title: "Flush outbox",
						message: "All messages in outbox will be removed.",
						choices: [{label: "Remove", type: "negative", value: "del"}, {label: "Cancel", type: "secondary"}]
					});
				break;
			}		
		}
	}

});
