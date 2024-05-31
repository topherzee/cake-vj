/*
* Example V4
*
* Elaborate mixer that uses several control interfaces
* and chains, to emulate an Edirol v4, More or less.
*
*/

console.log("CAKE Start --------------------");

var TIME_BY_TOPHER = false;

// renderer
var renderer = new GlRenderer({element: 'glcanvas', width:320, height:240});

// lets not forget the bpm
var bpm_tap = new BPM( renderer )
var source1 = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 grate 03 texture.mp4",});
//   var source2 = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 container 02 scape.mp4",});
var source2 = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 wires 03 shift.mp4",});

var source3 = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 poles 01 pure.mp4",});
var source4 = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 wires 03 shift.mp4",});
var source5 = new GifSource(renderer, {src: "/images/smily1.gif",});
var source6 = new GifSource(renderer, {src: "/images/640x480.gif",});
var source7 = new GifSource(renderer, {src: "/images/animal.gif",});


var playInterval = setInterval( function() {
    // source2.video.pause();
    source1.pause();
    source2.pause();
    source3.pause();
    source4.pause();
},1000);
  
// preview out
var monitor1 = new Monitor( renderer, { source: source1, element: 'monitor_1',width:128, height:96 })
var monitor2 = new Monitor( renderer, { source: source4, element: 'monitor_2',width:128, height:96 })





// transformers
// mix transformer signals (white and black)
var trans_white = new SolidSource( renderer, { color: { r:1.0, g:1.0, b:1.0 } } );
var trans_black = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0 } } );


// var layer_1_mixer = new Mixer( renderer, { source1: trans_black, source2: source1 }  )
// // var layer_1_effect = new ColorEffect(renderer, { source: layer_1_mixer } ); 

// var layer_2_mixer = new Mixer( renderer, { source1: layer_1_mixer, source2: source2 }  )
// var layer_2_effect = new ColorEffect(renderer, { source: layer_2_mixer } ); 

var layer_1_effect = new DistortionEffect(renderer, { source: source1 } );

var layer_1_mixer = new Mixer( renderer, { source1: trans_black, source2: layer_1_effect }  )
// var layer_1_effect = new ColorEffect(renderer, { source: layer_1_mixer } ); 

// var layer_2_effect = new ColorEffect(renderer, { source: source7 } ); 
var layer_2_effect = new DistortionEffect(renderer, { source: source4 } ); 
var layer_2_mixer = new Mixer( renderer, { source1: layer_1_mixer, source2: layer_2_effect }  )


// wire the last one to the output
var output = new Output( renderer, layer_2_mixer )

console.log("CAKE Call renderer.init() --------------------");

// start to render
renderer.init();
renderer.render();

//COLOR EFFECT
const LUMAKEY = 50;
const TOPHER_COLOR_LUMAKEY = 100;
const TOPHER_COLOR_CIRCLE = 101;
const RED = 10;

//DISTORTION EFFECT
const TOPHER_DIST_MIRROR_CIRCLES = 100;
const TOPHER_DIST_CIRCLES_3 = 102;

const TOPHER_DIST_CIRCLE = 103;
// layer_1_effect.effect(70);
// layer_1_effect.extra(0.5);

layer_1_effect.effect(TOPHER_DIST_CIRCLE);
layer_1_effect.extra(0.5);
layer_2_effect.effect(TOPHER_DIST_MIRROR_CIRCLES);
layer_2_effect.extra(0.5);

//  layer_1_effect.extra( Number(document.getElementById('effects_a_control').value) )
const NAM = 3;
const FAM = 4;
const LUM1 = 10;
const LUM2 = 11;
const BOOM = 9
layer_2_mixer.mixMode(NAM)
layer_1_mixer.mixMode(NAM)



setTimeout(() => {
    layer_2_mixer.pod(0.0)
    layer_1_mixer.pod(0.0)
    document.getElementById('layer_2_fader').value = 1.0
    document.getElementById('layer_1_fader').value = 1.0
  }, 1000);

// we're done here
// TODO document.getElementById('loader').remove()

// -----------------------------------------------------------------------------


// Some helper vars
var original_mixmode = 1





// ---------------------------------------------------------------------------
    // CAKE MIXER
// ---------------------------------------------------------------------------

// TOPHER
var blend_select_2 =  document.getElementById('layer_2_blendmode')


var blendModes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
var blendModesNames = ["add", "substract", "multiply", "darken", "color burn", "linear burn", "lighten", "screen", "color dodge", "linear dodge", "overlay", "soft light", "hard light", "vivid light", "linear light", "pin light", "difference", "exclusion"]
for(var i=0; i<blendModes.length; i++){
    // option(value=blendModes[i]) 
    // = blendModesNames[i]

    var option = document.createElement("option");
    option.text = blendModesNames[i];
    option.value = blendModes[i];
    blend_select_2.add(option);

}

document.getElementById('layer_2_blendmode').oninput = function() {
    layer_2_mixer.blendMode(this.value);
    console.log("layer_2_blendmode >>", parseFloat(this.value) )
}


document.getElementById('layer_2_fader').oninput = function() {
    layer_2_mixer.pod(1- this.value)
    console.log("layer_2_fader >>", parseFloat(this.value) )
}
document.getElementById('layer_1_fader').oninput = function() {
    layer_1_mixer.pod(1- this.value)
    console.log("layer_1_fader >>", parseFloat(this.value) )
}

document.getElementById('layer_1_effect').oninput = function() {
    layer_1_effect.extra(this.value)
    console.log("layer_1_effect >>", parseFloat(this.value) )
}
document.getElementById('layer_2_effect').oninput = function() {
    layer_2_effect.extra(this.value)
    console.log("layer_2_effect >>", parseFloat(this.value) )
}

document.getElementById('layer_1_time').oninput = function() {
    var sec = this.value * source1.duration();
    source1.currentTime(sec);
    console.log("layer_1_time >>", parseFloat(this.value) , parseFloat(sec) )
}
document.getElementById('layer_2_time').oninput = function() {
    var sec = this.value * source1.duration();
    source2.currentTime(sec);
    console.log("layer_2_time >>", parseFloat(this.value) , parseFloat(sec) )
}



const FRAME_DELAY = 1 / 60;
let frameCheck = 0;
let rate1 = 0.1;
let rate2 = 0.1;
let rate3 = 0.1;
let rate4 = 0.1;

let time1 = 0.0;
let time2 = 0.0;

function updateVideo(video, rate, time, layer){

    let new_time = time + rate * FRAME_DELAY;
    if (new_time > video.duration){
        new_time = 0;
    }else if (new_time < 0){
        new_time = video.duration - (rate * FRAME_DELAY);
        // console.log("layer_2_speed >>", parseFloat(this.value) )
    }
    video.currentTime = new_time;
    time = new_time;
// console.log("updateTime : ", parseFloat(time))

    var scrubber = document.getElementById('layer_' + layer + '_time');
    if (scrubber){
        scrubber.value = time / video.duration;
    }
    
    return(time);
}
function playVideos () {
    if (frameCheck==0){
        time1 = updateVideo(source1.video, rate1, time1, "1");
        time2 = updateVideo(source4.video, rate2, time2, "2");
    }
    frameCheck++;
    if (frameCheck == 3){
        frameCheck = 0;
    }

  requestAnimationFrame(playVideos);
};

if (TIME_BY_TOPHER){

}

playVideos();

document.getElementById('layer_2_speed').oninput = function() {
    rate2 = this.value
    console.log("layer_2_speed >>", parseFloat(this.value) )
}
document.getElementById('layer_1_speed').oninput = function() {
    rate1 = this.value
    console.log("layer_1_speed >>", parseFloat(this.value) )
}
  
  
