//
// Each of the event handling methods has already been bound to the
// custom events we have provided for you (event descriptions are provided below).
//
// @author Cameron Guthrie

var LENGTH = 16,                   // number of drum samples
    FREQRATIO = 1.0594630943592,   // multiply frequency by ratio to step between notes
    SRC = "assets/808/",           // base of the urls
    DRUMNAMES = [ "bd", "sd", "lt", "mt", "ht", "lc", "mc", "hc",
                  "rs", "cl", "ma", "cp", "cb", "cy", "oh", "ch" ], // array of the name of each drum sample
    NOTEFREQS = { 'C3' : 130.813,  // converts from note name to frequency
                  'D3' : 146.832,
                  'E3' : 164.814,
                  'F3' : 174.614,
                  'G3' : 195.998,
                  'A3' : 220.000,
                  'B3' : 246.942,
                  'C4' : 261.626,
                  'C#3': 138.591,
                  'D#3': 155.563,
                  'F#3': 184.997,
                  'G#3': 207.652,
                  'A#3': 233.082 };

var context,
    source,
    buffer = null,

    drumSamples = new Array(),       // key-value pairs of sample name and sound object
    sixteenthNoteTime = 15 / 128,    // default length of a 16th note
    isPlaying = false,               // continuous playback flag
    type = 2,                        // type of waveform for oscillator, defaults to 2
    startTime,                       // start time of loop
    endTime,                         // end time of loop

    filter,
    tune = 0,						 // synth filter controls
    accGainValue = 0,
    decayValue = 0,
    resValue = 0,
    cutoff = 0,
    envValue = 0,

    trGain, tbGain, maGain,          // top level gain nodes

    trWaveShaper, trCompressor,
    tbWaveShaper, tbCompressor;


function setupAudioGraph() {
    // setup your audio graph here
    try {
		    window.AudioContext = window.AudioContext || window.webkitAudioContext;
		    context = new AudioContext();
	        // start the animation timer
	        window.webkitRequestAnimationFrame(timer);

	        // setup drum sequencer
	        for (var i = 0; i < LENGTH; i++) {
	            var sample = new sound(SRC + DRUMNAMES[i] + ".wav", context.createGain());
	            sample.load();
	            drumSamples[DRUMNAMES[i]] = sample;
        }

        // setup gain nodes
        trGain = context.createGain();
        trGain.gain.value = .5;
        tbGain = context.createGain();
        tbGain.gain.value = .5;
        maGain = context.createGain();
        maGain.gain.value = .5;

        // distortion and compressor nodes
        trWaveShaper = context.createWaveShaper();
    	trCompressor = context.createDynamicsCompressor();
    	tbWaveShaper = context.createWaveShaper();
    	tbCompressor = context.createDynamicsCompressor();

    } catch(e) {
        alert(e);
    }
}

function timer() {
    if (isPlaying && context.currentTime >= endTime)
        playSequencers();

    // always schedule the next animation frame at the end of your callback
    window.webkitRequestAnimationFrame(timer);
}

function playSequencers() {
    startTime = context.currentTime;
    endTime = startTime + 16 * sixteenthNoteTime; //end time of a single loop

    // loop through note sequencer
    for (var i = 0; i < LENGTH; i++) {
        var note = window.noteSequencer.sequence.notes[i];
        var modifier = window.noteSequencer.sequence.modifiers[i];
        playSound(note, startTime + i * sixteenthNoteTime, modifier, i);
    }

    // loop through each drum sample sequence
    for (property in drumSamples) {
        var seq = window.drumSequencer.sequence[property];
        // check which parts of the sequence are on
        for (var i = 0; i < LENGTH; i++) {
            if (seq[i])
                drumSamples[property].play(startTime + i * sixteenthNoteTime);
        }
    }
}

// Plays sounds from a new oscillator based on the note parameter converted
// to frequency. Starts at the time parameter and stops after a 16th beat.
function playSound(note, time, modifier, i) {
    if (note != 0) {
        var now = context.currentTime;
        var osc = context.createOscillator(); // create new oscillator node on every play
        osc.frequency.value = NOTEFREQS[note]; // set frequency based on note name
        osc.type = type;

        var gainNode = context.createGain();
        gainNode.gain.value = .5; // default value

        // adjust tune
        if (tune)
            osc.detune.value = Math.pow(2, 1/12) * tune;

        // update based on existing modifiers
        if (modifier) {
            if (modifier == "up")
                osc.frequency.value *= FREQRATIO;
            else if (modifier == "down")
                osc.frequency.value /= FREQRATIO;
            // set next note to current note
            if (modifier == "slide")
                window.noteSequencer.sequence.notes[i + 1] = note;
            // accent means turning volume up
            if (modifier == "accent") {
                gainNode.gain.value = accGainValue;
            }
        }

        // filter settings
        filter = context.createBiquadFilter();
        filter.Q.value = resValue;
        filter.frequency.value = cutoff; // TODO: test this
        if (decayValue)
            filter.gain.setTargetAtTime(0, time + decayValue, 1);
        if (envValue)
            filter.frequency.setTargetAtTime(0, time + envValue, 1);
        // TODO: filter mutes osc
        // TODO: something increases volume every loop (overlapping oscillators?)

        // connect nodes
        osc.connect(filter);
        filter.connect(tbCompressor);
        tbCompressor.connect(tbWaveShaper);
        tbWaveShaper.connect(gainNode);
        gainNode.connect(tbGain);
        tbGain.connect(maGain);
        maGain.connect(context.destination);

        console.log(time);
        osc.start(time);
        osc.stop(time + sixteenthNoteTime);
    }
}

function onTempoChangeEvent(tempoEvent){
    sixteenthNoteTime = 15 / tempoEvent.bpm;
}

function onTransportControlEvent(transportEvent) {
    if (transportEvent.transportControl == "play") {
        isPlaying = true;
        playSequencers();
    } else
        isPlaying = false;
}

function onFaderChangeEvent(faderEvent) {
    // get sound based on first 2 letters of fader name
    var name = faderEvent.fader.substring(0,2);

    if (name == "tr")      trGain.gain.value = faderEvent.faderValue / 100.0;
    else if (name == "tb") tbGain.gain.value = faderEvent.faderValue / 100.0;
    else if (name == "ma") maGain.gain.value = faderEvent.faderValue / 100.0;
    else                   drumSamples[name].gain.gain.value = faderEvent.faderValue / 100.0;
}

function onFxParamChangeEvent(fxEvent) {
    // console.log(fxEvent.fxParamName);
    // console.log(fxEvent.fxParamValue);
    var prefix = fxEvent.fxParamName.substring(0,2);
    var firstName = fxEvent.fxParamName.substring(2,6);
    var lastName = fxEvent.fxParamName.substring(6);

    if (prefix == "tr") {
    	if (firstName == "Dist")
	    	changeDist(trWaveShaper, lastName, fxEvent.fxParamValue);
	    else
	    	changeComp(trCompressor, lastName, fxEvent.fxParamValue);
	} else {
		if (firstName == "Dist")
	    	changeDist(tbWaveShaper, lastName, fxEvent.fxParamValue);
	    else
	    	changeComp(tbCompressor, lastName, fxEvent.fxParamValue);
	}
	// TODO: is there a way to improve this?
}

function changeDist(waveShaper, lastName, value) {
	if (lastName == "Type") {
		if (value < 30)
			waveShaper.oversample = "none";
		else if (value > 70)
			waveShaper.oversample = "4x";
		else
			waveShaper.oversample = "2x";
	}
	else { // Amount
		waveShaper.curve = makeDistortionCurve(value);
    }
}

function changeComp(compressor, lastName, value) {
	if (lastName == "Threshold") compressor.threshold.value = value - 100; 	  	  	// -100 to 0
	else if (lastName == "Knee") compressor.knee.value = (value/100) * 40; 	  	  	// 0 to 40
	else if (lastName == "Ratio") compressor.ratio.value = ((value/100) * 19) + 1;  // 1 to 20
	else if (lastName == "Reduction") compressor.reduction.value = (value-100) / 5; // -20 to 0
	else if (lastName == "Attack") compressor.attack.value = value / 100; 	  	  	// 0 to 1
	else compressor.release.value = value / 100; 								  	// 0 to 1

    // else { // Dela y

    // }

    // set default values instead of 0?
}

// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

function onFxDeviceEvent(fxEvent) {
    console.log(fxEvent.fxDeviceName);
    console.log(fxEvent.fxDeviceValue);
}

function onDrumSoundChangeEvent(drumSoundEvent) {
    // console.log(drumSoundEvent.drumSoundName);
}

function onDrumSequencerEvent(drumSeqEvent) {
    // console.log(drumSeqEvent.drumSequencePosition);
    // console.log(drumSeqEvent.drumSequenceValue);
}

function onNoteSequencerEvent() {
    // console.log("current note step : "+window.lib.currentNoteStep);
    // console.log("updated note sequence : "+window.noteSequencer.sequence.notes);
    // console.log("modifiers : "+window.noteSequencer.sequence.modifiers);
    // console.log(window.noteSequencer.sequence);
}

// sets global waveform type enum to be used by oscillator
function onWaveformChangeEvent(waveformEvent) {
    // console.log(waveformEvent.waveform);
    if (waveformEvent.waveform == "square")
        type = 1;
    else
        type = 2;
}

function onTuneChangeEvent(tuneEvent) {
    tune = tuneEvent.tuneValue / 4.166666666;
}

function onFilterChangeEvent(filterEvent) {
    var prefix = filterEvent.filterParamName.substring(0,2);
    var name = filterEvent.filterParamName.substring(2);
    // console.log(name);

    if (prefix == "tb") {
        if (name == "Cutoff")
            cutoff = filterEvent.filterParamValue * 10.0;
        else if (name == "Resonance")
            resValue = filterEvent.filterParamValue * 10.0;
        else if (name == "Env")
            envValue = filterEvent.filterParamValue / 1000.0;
        else if (name == "Decay")
            decayValue = filterEvent.filterParamValue / 1000.0;
        else if (name == "Accent")
            accGainValue = filterEvent.filterParamValue / 100.0;
    }
}

//  Custom Events
//
//  Each of the custom events is wrapped in an HTML5 Event.
//
//  Note regarding custom event values:
//  You are responsible for properly interpolating between the raw values provided
//  by the user interface callbacks and values appropriate for the audio graph.
//  For example, if you have an audio parameter that takes a value between 0 and 1
//  you are responsible for computing that value based on the the UI value (which
//  will normally be between 0 and 100)./
//
//  Event Descriptions
//
//  @event  TempoChangeEvent
//  @description Fired when the tempo / BPM is modified
//  @param  bpm     an integer from 0 to 999.
//
//  @event  TransportControlEvent
//  @description    Fired when the Play or Stop button is pressed
//  @param  transportControl    possible values are "play" and "stop"
//
//  @event   FaderChangeEvent
//  @description     Triggered whenever a mixing fader is interacted with
//  @param   faderName   the name of the fader being modified
//  @param   faderValue  the current value of the fader being modified
//
//  @event  FxParamChangeEvent
//  @description    Fired whenever an FX parameter is interacted with
//  @param   fxParamName     the name of the parameter being adjusted
//  @param   fxParamValue    the value of the parameter being adjusted
//
//  @event  FxDeviceEvent
//  @description    Fired whenever an FX unit is toggled on or off
//  @param  fxDeviceName    name of the device being toggled
//  @param  fxDeviceValue   either "on" or "off"
//
//  @event  DrumSoundChangeEvent
//  @description    Fired whenever the selected drums sound is changed
//  @param  drumSoundName   name of the newly selected drum sound
//
//  @event DrumSequencerEvent
//  @description    Fired when the drum sequencer is interacted with
//  @param  drumSequencePosition    a number between 1 and 16 that identifies the
//  drum step sequence position activated
//  @param  drumSequenceValue       possible values are 1 or 0
//
//  @event NoteSequencerEvent
//  @description     Fired when the TB note sequencer is interacted wth
//                   The note sequence will automatically be encoded
//                   by the time this event is dispatched
//                   You can obtain the current note step from the global
//                   window.lib.currentNoteStep property
//                   You can obtain the updated note sequence by accessing
//                   the window.noteSequencer.sequence property
//
//  @event  WaveformChangeEvent
//  @description    Fired when the TB synth's waveform is changed
//  @param  waveform    possible values are "saw" and "square"
//
//  @event  TuneChangeEvent
//  @description    Fired when the TB synth's "Tune" parameter is modified
//  @param  tuneValue   number between 0 and 100
//
//  @event  FilterChangeEvent
//  @description    Fired when the TB synth's filter parameters are modified
//  @param  filterParamName     name of the filter parameter being modified
//  @param  filterParamValue    value of the filter parameter between 0 and 100
//

document.addEventListener("TempoChangeEvent", onTempoChangeEvent);
document.addEventListener("TransportControlEvent", onTransportControlEvent);
document.addEventListener("FaderChangeEvent", onFaderChangeEvent);
document.addEventListener("FxParamChangeEvent", onFxParamChangeEvent);
document.addEventListener("FxDeviceEvent", onFxDeviceEvent);
document.addEventListener("DrumSoundChangeEvent", onDrumSoundChangeEvent);
document.addEventListener("DrumSequencerEvent", onDrumSequencerEvent);
document.addEventListener("NoteSequencerEvent", onNoteSequencerEvent);
document.addEventListener("WaveformChangeEvent", onWaveformChangeEvent);
document.addEventListener("TuneChangeEvent", onTuneChangeEvent);
document.addEventListener("FilterChangeEvent", onFilterChangeEvent);
