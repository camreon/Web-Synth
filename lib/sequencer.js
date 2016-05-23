//  @comment
//  The objects below can be used to represent a 16 step sequence.

//  @class          DrumSequence
//  @constructor    DrumSequence    takes the length of the sequence in bars
//  @property       bd      array containing the sequence for the bass drum sound
//  @property       sd      array containing the sequence for the snare drum sound
//  @property       lt      array containing the sequence for the low tom
//  @property       mt      array containing the sequence for the medium tom
//  @property       ht      array containing the sequence for the high tom
//  @property       lc      array containing the sequence for the low conga
//  @property       mc      array containing the sequence for the medium conga
//  @property       hc      array containing the sequence for the high conga
//  @property       rs      array containing the sequence for the rimshot
//  @property       cl      array containing the sequence for the clave
//  @property       ma      array containing the sequence for the maraca/shaker
//  @property       cp      array containing the sequence for the clap
//  @property       cb      array containing the sequence for the cowbell
//  @property       cy      array containing the sequence for the cymbal
//  @property       oh      array containing the sequence for the open hi hat
//  @property       ch      array containing the sequence for the closed hi hat
DrumSequence = function(length) {
        this.bd = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.sd = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.lt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.mt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.ht = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.lc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.mc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.hc = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.rs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cl = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.ma = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.cy = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.oh = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.ch = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

};

DrumSequence.prototype.constructor = DrumSequence;

DrumSequencer = function() {
    this.sequence = new DrumSequence(1);
};

DrumSequencer.prototype.constructor = DrumSequencer;

//  @class NoteSequence
//  @property notes  sequence of notes for steps 1-16, you can store the notes as either
//                          numerical values or named note values (e.g. 63 or "C3");
//  @property modifiers corresponding modifiers (e.g. accent, slide) for notes in noteSequence
NoteSequence = function() {
        this.notes   = ["C3", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.modifiers  = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
};

NoteSequence.prototype.constructor = NoteSequence;

NoteSequencer = function () {
   this.sequence = new NoteSequence();
};

window.noteSequencer = new NoteSequencer();
window.drumSequencer = new DrumSequencer();
