// (q)unit tests

module("Compressor");
test( "threshold min", function() {
	var min = 0;
	changeComp(trCompressor, "Threshold", min);
	equal(trCompressor.threshold.value, -100, "We expect -100");
});
test( "threshold max", function() {
	var max = 100;
	changeComp(trCompressor, "Threshold", max);
	equal(trCompressor.threshold.value, 0, "We expect 0");
});

test( "knee min", function() {
	var min = 0;
	changeComp(trCompressor, "Knee", min);
	equal(trCompressor.knee.value, 0);
});
test( "knee max", function() {
	var max = 100;
	changeComp(trCompressor, "Knee", max);
	equal(trCompressor.knee.value, 40);
});

test( "ratio min", function() {
	var min = 0;
	changeComp(trCompressor, "Ratio", min);
	equal(trCompressor.ratio.value, 1);
});
test( "ratio max", function() {
	var max = 100;
	changeComp(trCompressor, "Ratio", max);
	equal(trCompressor.ratio.value, 20);
});

test( "reduction min", function() {
	var min = 0;
	changeComp(trCompressor, "Reduction", min);
	equal(trCompressor.reduction.value, -20);
});
test( "reduction max", function() {
	var max = 100;
	changeComp(trCompressor, "Reduction", max);
	equal(trCompressor.reduction.value, 0);
});

test( "attack min", function() {
	var min = 0;
	changeComp(trCompressor, "Attack", min);
	equal(trCompressor.attack.value, 0);
});
test( "attack max", function() {
	var max = 100;
	changeComp(trCompressor, "Attack", max);
	equal(trCompressor.attack.value, 1);
});

// release follows same formula as attack