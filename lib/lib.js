
    window.lib = {};
    
    window.lib.currentDrumSound = "bd";
    window.lib.currentNote  = "C3";
    window.lib.currentNoteStep = 1;
    window.lib.currentBPM = 120;
    
    var mouseStartX, mouseStartY, mouseMoveX, mouseMoveY, mouseEndX, mouseEndY;
    var rotationRegex = new RegExp();
    rotationRegex.compile(/rotate\((\d*)deg\)/);
    var drSeqRegex = new RegExp();
    drSeqRegex.compile(/trSqBtn(\d*)/);
    var dialUnderControl = null;
    var dialControlName = '';
    var dialStartRotation;
    
    var TBfilterNames = ["tbCutoff", "tbResonance", "tbEnv", "tbDecay", "tbAccent"];

    var noteNames = new Array();
    noteNames['whiteNote1'] = 'C3';
    noteNames['whiteNote2'] = 'D3';
    noteNames['whiteNote3'] = 'E3';
    noteNames['whiteNote4'] = 'F3';
    noteNames['whiteNote5'] = 'G3';
    noteNames['whiteNote6'] = 'A3';
    noteNames['whiteNote7'] = 'B3';
    noteNames['whiteNote8'] = 'C4';
    noteNames['blackNote1'] = 'C#3';
    noteNames['blackNote2'] = 'D#3';
    noteNames['blackNote3'] = 'F#3';
    noteNames['blackNote4'] = 'G#3';
    noteNames['blackNote5'] = 'A#3';

    window.lib.noteNames = noteNames;
    
    var noteModifierNames = [];
    noteModifierNames['tbNoteAccent'] = 'accent';
    noteModifierNames['tbNoteSlide'] = 'slide';
    noteModifierNames['tbOctaveDown'] = 'down';
    noteModifierNames['tbOctaveUp'] = 'up';
    
    window.lib.noteClickHandler = function(note) {
        var n;
        var noteID= note.id;
        n = noteNames[noteID];
        window.lib.currentNote = n;
        var on = document.getElementById("tbNoteOn");
        if (on.classList.contains("tbSeqBtnOn")) {
            window.noteSequencer.sequence.notes[window.lib.currentNoteStep-1] = window.lib.currentNote;
            window.lib.dispatchNoteEvent();
        }
        window.lib.refreshNoteUI(note);

    }
    
    window.lib.refreshNoteUI = function(note) {
        var noteView = document.querySelector("#tbNoteView");
        var notes = noteView.children;
        var i=0;
        var len = notes.length;
        for (;i<len;i++)
        {
            var n = notes[i];
            n.classList.remove("noteOn");
        }
        
        note.classList.add("noteOn");
    };
    
    window.lib.sequencerButtonHandler = function(target)
    {
        var targetID = target.id;
        var stepView = document.querySelector("#tbCurrentStepView");
        var ns = window.noteSequencer.sequence;
        var shouldDispatchNoteEvent = false;
        if (targetID == 'tbNextStep' || targetID == 'tbPrevStep')
        {
            var currentValue = parseInt(stepView.innerText);
            var inc = (targetID == 'tbNextStep') ? 1 : -1;
            var newValue =(currentValue + inc);
            if (newValue > 16)
                newValue = 1;
            if (newValue < 1)
                newValue = 16;
            stepView.innerText = newValue;
            window.lib.currentNoteStep = newValue;
            window.lib._note = window.noteSequencer.sequence.notes[window.lib.currentNoteStep-1];
        }
        
        if (targetID == 'tbNoteAccent' || 
            targetID == 'tbOctaveDown' || 
            targetID == 'tbOctaveUp' || 
            targetID == 'tbNoteSlide')
        {
            var modifier = noteModifierNames[targetID];
            var modifiers = ns.modifiers[window.lib.currentNoteStep-1];
            
            var containsMod = modifiers.indexOf(modifier);
            if (containsMod != -1) 
                modifiers.splice(containsMod, 1);
            else
                modifiers.push(modifier);
                
            if (modifier == "up")
            {
                var didx = modifiers.indexOf("down");
                if (didx != -1)
                    modifiers.splice(didx, 1);
            }
            
            if (modifier == "down")
            {
                var didx = modifiers.indexOf("up");
                if (didx != -1)
                    modifiers.splice(didx, 1);
            }
            shouldDispatchNoteEvent = true;
        }
        
        if (targetID == 'tbNoteOn' || targetID == 'tbNoteOff')
        {
            if (targetID == 'tbNoteOn') {
                ns.notes[window.lib.currentNoteStep-1] = window.lib.currentNote;
            } else {
                ns.notes[window.lib.currentNoteStep-1] = 0;
            }
            shouldDispatchNoteEvent = true;
        }
        

        var noteView = Object.keys(window.lib.noteNames).filter( function(el){ return window.lib.noteNames[el] == window.lib._note; });

        if (noteView.length > 0)
        {
            window.lib.refreshNoteUI(document.getElementById(noteView[0]));
        }
        window.lib.noteSequencerRefreshUI();
        if (shouldDispatchNoteEvent)
            window.lib.dispatchNoteEvent();
    }
    
    window.lib.noteSequencerRefreshUI = function() {
        var s = window.noteSequencer.sequence;
        var note = s.notes[window.lib.currentNoteStep-1];
        var mods = s.modifiers[window.lib.currentNoteStep-1];

        var onBtn = document.getElementById("tbNoteOn");
        var offBtn = document.getElementById("tbNoteOff");
       
        onBtn.classList.remove("tbSeqBtnOn");
        offBtn.classList.remove("tbSeqBtnOn");
        
        if (note != 0)
            onBtn.classList.add("tbSeqBtnOn");

        if (note == 0)
            offBtn.classList.add("tbSeqBtnOn");
        
        var accBtn = document.getElementById("tbNoteAccent");
        var slideBtn = document.getElementById("tbNoteSlide");
        var ocDownBtn = document.getElementById("tbOctaveDown");
        var ocUpBtn = document.getElementById("tbOctaveUp");
        
        accBtn.classList.remove("tbSeqBtnOn");
        slideBtn.classList.remove("tbSeqBtnOn");
        ocDownBtn.classList.remove("tbSeqBtnOn");
        ocUpBtn.classList.remove("tbSeqBtnOn");
        
        if (mods.length > 0)
        {
        mods.forEach(function(el) {
            var mod = el;
            if (mod == "accent")
                accBtn.classList.add("tbSeqBtnOn");
            if (mod == "slide")
                slideBtn.classList.add("tbSeqBtnOn");
            if (mod == "down")
                ocDownBtn.classList.add("tbSeqBtnOn");
            if (mod == "up")
                ocUpBtn.classList.add("tbSeqBtnOn");
        });
        }
    };
    
    window.lib.dispatchNoteEvent = function() {
        var noteEvent = new Event("NoteSequencerEvent");
        document.dispatchEvent(noteEvent);
    };
    
    window.lib.bpmClickHandler = function (target)
    {
        var bpmEl = document.getElementById("bpmLabel");
        var currentBPM = parseInt(bpmEl.innerText);
        var targetID = target.id;
        var newBPM;
        if (targetID == 'bpmUp')
        {
            newBPM = currentBPM + 1;
        }
        
        if (targetID == 'bpmDown')
        {
            newBPM = currentBPM - 1;
        }
        
        bpmEl.innerText = newBPM;
        window.lib.currentBPM = newBPM;
        var be = new Event('TempoChangeEvent');
        be.bpm = newBPM;
        document.dispatchEvent(be);
    }
    

    
    window.lib.drumSoundClickHandler = function(btn)
    {
        var btns = document.querySelectorAll("div.sampleBtn");
        var i=0;
        var len = btns.length;
        for (;i<len;i++)
        {
            var b = btns[i];
            b.classList.remove("sampleBtnOn");
        }
        
        btn.classList.toggle("sampleBtnOn");

        var sampleName = btn.id.substr(0, 2);
        var evtDetails = { 'drumSoundName' : sampleName };
        var dsEvt = new Event('DrumSoundChangeEvent');
        dsEvt.drumSoundName = sampleName;
        document.dispatchEvent(dsEvt);
        
        window.lib.currentDrumSound = sampleName;
        window.lib.drumSequencerUpdateUI();
    };
    
    window.lib.drumSequencerUpdateUI = function() {
        var seq = window.drumSequencer.sequence[window.lib.currentDrumSound];
        var trButtons = document.querySelectorAll("div.trButton");
        var len = trButtons.length;
        for (var i=0;i<len;i++)
        {
            var btn = trButtons[i];
            btn.classList.remove("trButtonOn");
            
            if (seq[i] == 1)
            {
                btn.classList.add("trButtonOn");
            }
        }
    };
    
    window.lib.drumSequencerClickHandler = function(event)
    {
        var target = event.target;
        var targetID = target.id;
        target.classList.toggle("trButtonOn");
        
        var drSeqOn  = (target.classList.contains("trButtonOn")) ? 1 : 0;
        var drSeqPos = parseInt(drSeqRegex.exec(targetID)[1]) - 1;

        var seq = window.drumSequencer.sequence[window.lib.currentDrumSound];
        seq[drSeqPos] = drSeqOn;

        var evtDetails = { 'drumSequencePosition' : drSeqPos, 
                           'drumSequenceValue' : drSeqOn };
        var dsEvt = new Event('DrumSequencerEvent');
        dsEvt.drumSequencePosition = drSeqPos;
        dsEvt.drumSequenceValue = drSeqOn;
        document.dispatchEvent(dsEvt);
    }
    
    window.lib.waveformClickHandler = function(target)
    {
        var btns = document.querySelectorAll('div.waveformBtn');
        var i = 0;
        var len = btns.length;
        for (;i<len;i++){
            var b = btns[i];
            b.classList.remove('waveformBtnOn');
        }

        var waveform = (target.id == 'tbSawtoothWaveform') ? 'saw' : 'square';
        target.classList.toggle('waveformBtnOn');
        
        var wcEvt = new Event('WaveformChangeEvent');
        wcEvt.waveform = waveform;
        document.dispatchEvent(wcEvt);
    }
    
    window.lib.onMouseDown = function(event) {
        mouseStartX = event.x;
        mouseStartY = event.y;
        
        var target = event.target;
        var targetClass = target.className;
        var targetID = target.id;

        if (target.classList.contains("fxToggle"))
        {
            target.classList.toggle("fxToggleOn");
            var fxVal = (target.classList.contains("fxToggleOn")) ? "off" : "on";
            var fxEvt = new Event("FxDeviceEvent");
            fxEvt.fxDeviceName = targetID;
            fxEvt.fxDeviceValue = fxVal;
            document.dispatchEvent(fxEvt);
        }
        
        if (targetClass == "dialControl")
        {
            dialControlName = targetID;
            dialUnderControl = target.children[0].children[0];
            dialStartRotation = parseInt(rotationRegex.exec(dialUnderControl.style.webkitTransform)[1]);
        }
    }
    
    window.lib.onMouseMove = function(event) {
        if (dialUnderControl != null)
        {
            mouseMoveX = event.x;
            mouseMoveY = event.y;
        
            var changeAmount = mouseStartY - mouseMoveY;
            var newRotation = dialStartRotation + changeAmount;
            
            if (newRotation < 0)
                newRotation = 0;
            if (newRotation > 270)
                newRotation = 270;

            dialUnderControl.style.webkitTransform = "rotate(" + newRotation +"deg)";
            
            var newValue = 100/270 * newRotation;
            newValue = Math.round(newValue);
            var newEvent = null;
            if (dialControlName == "tbTune")
            {
                newEvent = new Event('TuneChangeEvent');
                newEvent.tuneValue = newValue;
            } else if (TBfilterNames.indexOf(dialControlName) != -1) {
                newEvent = new Event('FilterChangeEvent');
                newEvent.filterParamName = dialControlName;
                newEvent.filterParamValue = newValue;
            } else {
                newEvent = new Event('FxParamChangeEvent');
                newEvent.fxParamName = dialControlName;
                newEvent.fxParamValue = newValue;
            }
            
            if (newEvent != null)
            {
                document.dispatchEvent(newEvent);
            }
        }
        
    }
    
    window.lib.onMouseUp = function (event) {
        mouseEndX = event.x;
        mouseEndY = event.y;
        dialUnderControl = null;
        dialControlName = '';
    }
    
    window.lib.onChange = function(changeEvent) {
        var targetFader = changeEvent.target.id;
        var faderValue = changeEvent.target.value;
        var e = new Event("FaderChangeEvent");
        e.fader = targetFader;
        e.faderValue = faderValue;
        document.dispatchEvent(e);
    }
    

    window.lib.transportClickHandler = function(target) { 
        if (target.classList.contains('transportBtnOn') == 0)
        {
            var btns = document.querySelectorAll('div.transportBtn');
            var len = btns.length;
            for (var i=0;i<len;i++)
            {
                var btn = btns[i];
                btn.classList.toggle('transportBtnOn');
            }
            
            var targetID = target.id;
            var evtType = (targetID == 'transportPlayButton') ? 'play' : 'stop';
            var te = new Event('TransportControlEvent');
            te.transportControl = evtType;
            document.dispatchEvent(te);
        }
    }
    
    /*
    document.addEventListener("touchstart", touchesStarted);
    document.addEventListener("touchmove", touchesMoved);
    document.addEventListener("touchend", touchesEnded);
    */
    
    document.addEventListener("mousedown", lib.onMouseDown);
    document.addEventListener("mousemove", lib.onMouseMove);
    document.addEventListener("mouseup", lib.onMouseUp);
    document.addEventListener("change", lib.onChange);
    

    ///Sound function Object and prototype methods
    function sound(url, gain)
    {
        //var buffer, src;
        this.url = url;
        this.gain = gain;
        this.gain.gain.value = .5; // set to default value
    }

    //create getters/setters for variables you want to retrieve more than once
    sound.prototype.setBuffer = function(buffer) { this.buffer = buffer; }; 
    sound.prototype.getBuffer = function() { return this.buffer; };  
    sound.prototype.getURL = function() { return this.url; };
    sound.prototype.getGain = function() { return this.gain; };
    sound.prototype.getSource = function() { return this.source; };

    sound.prototype.play = 
        function(time) 
        { 
            this.source = context.createBufferSource();  //create a new source for playback... having a constant 
                                                         //reference lets us call source.stop(0) later if we want to

            this.source.buffer = this.getBuffer();       //always call loadSound first, or do a check to 
                                                         //make sure you have something in this buffer

            var gain = this.getGain(); // 
            this.source.connect(gain);
            gain.connect(trGain);
            trGain.connect(maGain);
            maGain.connect(context.destination);

            this.source.start(time);
        };

    sound.prototype.load = 
        function() 
        { 
            var sound = this; //lets us access member variables and prototype functions inside other functions (like request.onload)

            var request = new XMLHttpRequest();     //you must use a server for this to work
            
            //setup sound object with source URL via mySound.url before calling this
            request.open('GET', sound.getURL(), true);
            request.responseType = 'arraybuffer';

            request.onload = function() {
                sound.setBuffer(context.createBuffer(request.response, false));
            }
            request.send();
        };

    // sound.prototype.stop =
    //     function()
    //     {
    //         // console.log(this.source);
    //         src = this.getSource();
    //         if (src)
    //             src.stop(0);
    //     };
