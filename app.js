'use strict';

const Homey = require('homey');

let buttonPressedTriggerGeneric = new Homey.FlowCardTrigger('receive_signal_generic');
buttonPressedTriggerGeneric.register();

// create & register a signal using the id from your app.json
let doorbellSignal = new Homey.Signal433('WA638SSignal');
doorbellSignal.register()
	.then(() => {
		console.log("WA638SSignal.register.then");

		doorbellSignal.on('payload', function(payload, first) {
			// [1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,1]
			console.log('received: signal:[' + payload + '], first:' + first);
			var chime = payload[17]*4 + payload[19] * 2 + payload[21];
			var channel = payload[1]*32 + payload[3]*16 + payload[5]*8 + payload[7]*4 + payload[9]*2 + payload[11];
			console.log(chime);
			console.log(channel);

			if (!first)
				return;

			var tokensGeneric = {
				'channelId': channel,
				'chime': chime,
				};
			var stateGeneric = {
				};
			buttonPressedTriggerGeneric
				.trigger(tokensGeneric, stateGeneric)
				.catch(this.error)
				.then(this.log);
		});
	}).catch(this.error);

let ringBellActionIdGeneric = new Homey.FlowCardAction('send_ring_generic');
ringBellActionIdGeneric.register();

function getBits(channelId, chime)
{
	var payload = [1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,1];
}

class DoorBellWA638S extends Homey.App {
	
	onInit() {
		this.log('DoorBellWA638S is running...');
		ringBellActionIdGeneric.registerRunListener((args, state) => {
			var channelId = args['channelId']
			this.log('RING-ID-GENERIC: channelId:' + channelId);
			var bits = getBits(channelId, 0);
			this.log("bits:", JSON.stringify(bits));
			doorbellSignal.tx(bits, this.logit);
			return true;
		});
	}
	
}

module.exports = DoorBellWA638S;
