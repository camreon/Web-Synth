//
// Each of the event handling methods has already been bound to the
// custom events we have provided for you (event descriptions are provided below).
// 
// @author Cameron Guthrie

var context;
var source;
var buffer = null;

var src = "assets/808/";        // base of the urls
var drumNames = [ "bd",         // array of the name of each drum sample
                  "sd", 
                  "lt", 
                  "mt",
                  "ht", 
                  "lc", 
                  "mc", 
                  "hc", 
                  "rs", 
                  "cl", 
                  "ma", 
                  "cp", 
                  "cb", 
                  "cy", 
                  "oh", 
                  "ch" ];  
var noteFreqs = { 'C3' : 130.813,  // converts from note name to frequency
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
var drumSamples = new Array();       // key-value pairs of sample name and sound object
var length = 16;                     // number of drum samples
var tempo = 128;                     // BPM
var sixteenthNoteTime = 15 / tempo;  // length of a 16th note
var isPlaying = false;               // continuous playback flag
var freqRatio = 1.0594630943592;     // multiply frequency by ratio to step between notes
var type = 2;                        // type of waveform for oscillator, defaults to 2


function setupAudioGraph() {
    // setup your audio graph here
    // this method is called automatically once the DOM loads
    try {
		    window.AudioContext = window.AudioContext || window.webkitAudioContext;
		    context = new AudioContext();
        // start the animation timer
        window.webkitRequestAnimationFrame(timer);

        // setup sound objects
        for (var i = 0; i < length; i++) {
            var sample = new sound();
            var name = drumNames[i];            // add sample name
            sample.url = src + name + ".wav";   // add file URL
            sample.gain = context.createGain(); // add gain node
            sample.gain.gain.value = .5;        // set to default value
            sample.load();
            drumSamples[name] = sample;
        }

    } catch(e) {
        alert(e);
    }
}

function timer() {
    if (isPlaying)
    {
       // the timer method will be called back in sync with the refresh rate of your display
       // (normally 60hz)
       //
       // you will need to look at context.currentTime to determine where you are in time
       // and if you should schedule the next set of notes to play based on how much time
       // has passed
       console.log("we are playing");
       console.log(context.currentTime);
    } else {
       // stop all the sounds that are currently playing
      console.log("not playing");
    }
 
    // always schedule the next animation frame at the end of your callback
    window.webkitRequestAnimationFrame(timer);
 }

// Plays sounds from a new oscillator based on the note parameter converted 
// to frequency. Starts at the time parameter and stops after a 16th beat. 
function playSound(note, time, modifier, i) { 
    if (note != 0) {
        var now = context.currentTime;
        var osc = context.createOscillator(); // create new oscillator node on every play
        osc.frequency.value = noteFreqs[note]; // set frequency based on note name
        osc.type = type; 

        var gainNode = context.createGain();
        gainNode.gain.value = .5; // default value

        // update based on existing modifiers
        if (modifier) {
            if (modifier == "up")
                osc.frequency.value *= freqRatio;
            else if (modifier == "down")
                osc.frequency.value /= freqRatio;
            // set next note to current note
            if (modifier == "slide")
                window.noteSequencer.sequence.notes[i + 1] = note;
            // accent means turning volume controls on
            if (modifier == "accent") {
                gainNode.gain.value = 1;
            }
        }
        
        osc.connect(gainNode);
        gainNode.connect(context.destination);
        osc.start(time); 
        osc.stop(time + sixteenthNoteTime);
    }
}

function onTempoChangeEvent(tempoEvent){
    // save tempo in global var
    tempo = tempoEvent.bpm;
}

function onTransportControlEvent(transportEvent) {
    if (transportEvent.transportControl == "play") {
        
        // start playing the rhythm "now"
        var startTime = context.currentTime;
        var time = startTime + 16 * sixteenthNoteTime;
        
        // loop through note sequencer
        for (var i = 0; i < length; i++) {
            var note = window.noteSequencer.sequence.notes[i];
            var modifier = window.noteSequencer.sequence.modifiers[i];
            playSound(note, time + i * sixteenthNoteTime, modifier, i);
        }

        // loop through each drum sample sequence
        for (property in drumSamples) {
            var seq = window.drumSequencer.sequence[property];
            // check which parts of the sequence are on
            for (var i = 0; i < length; i++) {
                if (seq[i]) 
                    drumSamples[property].play(time + i * sixteenthNoteTime);
            }
        }

    } else {
        // stop everything
        // for (var seq in window.drumSequencer.sequence) {
        for (var sample in drumSamples) {
            //sample.stop(); // err: undefined is not a function?
        }
        // }

    }
}

function onFaderChangeEvent(faderEvent) {
    // get sound based on first 2 letters of fader name
    var name = faderEvent.fader;
    console.log(name);
    name = name.substring(0,2);
    // sound's gain = adjusted faderValue
    drumSamples[name].gain.gain.value = faderEvent.faderValue / 100.0;

    // add tr, tb, and master mix cases

}

function onFxParamChangeEvent(fxEvent) {
    console.log(fxEvent.fxParamName);
    console.log(fxEvent.fxParamValue);
}

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
    console.log(tuneEvent.tuneValue);
}

function onFilterChangeEvent(filterEvent) {
    // console.log(filterEvent.filterParamName);
    // console.log(filterEvent.filterParamValue / 100.0);
    // get sound based on first 2 letters of fader name
    var name = filterEvent.filterParamName;
    name = name.substring(0,2); 

    // oscillator gain node value = filterEvent.filterParamValue / 100.0
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
