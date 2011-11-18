var ViewSentAssistant = Class.create({
	initialize: function(sms) {
		this.sms = sms;
	},
	
	setup: function() {
		$("to").innerText = this.sms.to;
		$("text").innerText = this.sms.text;
		$("date").innerText = Mojo.Format.formatDate(new Date(this.sms.date), {
			format: "dd.MM.yyyy - HH:mm"
		});
	}
});
