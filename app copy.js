    //
    // Each of the event handling methods has already been bound to the
    // custom events we have provided for you (event descriptions are provided below).
    // 
    
    var context;
    var source;
    var buffer = null;

    var url;                    // url of each sample
    var src = "assets/808/";    // base of the url
    var bufferLoader;
    
    function setupAudioGraph() {
        // setup your audio graph here
        // this method is called automatically once the DOM loads
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();

        bufferLoader = new BufferLoader(
            context,
            [
              src + "sd.wav", 
              src + "lt.wav", 
              src + "mt.wav",
              src + "ht.wav", 
              src + "lc.wav", 
              src + "mc.wav", 
              src + "hc.wav", 
              src + "rs.wav", 
              src + "cl.wav", 
              src + "ma.wav", 
              src + "cp.wav", 
              src + "cb.wav", 
              src + "cy.wav", 
              src + "oh.wav", 
              src + "ch.wav",
            ],
            finishedLoading
            );

          bufferLoader.load();
    }

    // create all 16 sources
    function finishedLoading(bufferList) {
        var sourceList = [];
        for (var i = 0; i < bufferList.length; i++) {
            sourceList[i] = context.createBufferSource();
            sourceList[i].buffer = bufferList[0];
        }
    }

    function playSound(buffer, time) {
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(time);
    }

    function onTempoChangeEvent(tempoEvent){
        console.log(tempoEvent.bpm);
    }

    function onTransportControlEvent(transportEvent) {
        // console.log(transportEvent.transportControl);
        if (transportEvent.transportControl == "play") {
	        
            for (var bar = 0; bar < 2; bar++) {
                var time = startTime + bar * 8 * eighthNoteTime;
                // Play the bass (kick) drum on beats 1, 5
                playSound(kick, time);
                playSound(kick, time + 4 * eighthNoteTime)
                
                // Play the snare drum on beats 3, 7
                playSound(snare, time + 2 * eighthNoteTime);
                playSound(snare, time + 6 * eighthNoteTime)
                
                // Play the hi-hat every eighth note.
                for (var i = 0; i < 8; ++i) {
                    playSound(hihat, time + i * eighthNoteTime);
                }
            }

        } else {
        	
        } 
    }
    
    function onFaderChangeEvent(faderEvent) {
        console.log(faderEvent.fader);
        console.log(faderEvent.faderValue);
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
        //url = "assets/" + ;
        console.log(drumSoundEvent.drumSoundName);
    }
    
    function onDrumSequencerEvent(drumSeqEvent) {
        var currDrum = window.lib.currentDrumSound;
        buffer = window.drumSequencer.sequence[currDrum];
        
        console.log(window.drumSequencer.sequence[currDrum]);
    }
    
    function onNoteSequencerEvent() {
        console.log(window.lib.currentNoteStep);
        console.log(window.noteSequencer.sequence.notes);
        console.log(window.noteSequencer.sequence.modifiers);
    }
    
    function onWaveformChangeEvent(waveformEvent) {
        console.log(waveformEvent.waveform);
    }    
        
    function onTuneChangeEvent(tuneEvent) {
        console.log(tuneEvent.tuneValue);
    }
    
    function onFilterChangeEvent(filterEvent) {
        console.log(filterEvent.filterParamName);
        console.log(filterEvent.filterParamValue);
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
