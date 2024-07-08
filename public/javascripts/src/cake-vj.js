/*
* Example V4
*
* Elaborate mixer that uses several control interfaces
* and chains, to emulate an Edirol v4, More or less.
*
*/

// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

// import  GlRenderer  from "../javascripts/src/GlRenderer.js";
// debugger;
// var renderer2 = new GlRenderer({element: 'glcanvas', width:800, height:450});

// var beatLadder = ["0.25", "0.5", "1.0", "2.0", "4.0"]
// var beatLadderIndex = 2;

// import GlRenderer from GLRenderer
async function start(){

    console.log("CAKE Start --------------------");


var TIME_BY_TOPHER = true;

// debugger;
// renderer
var renderer = new GlRenderer({element: 'glcanvas', width:800, height:450});

// const composer = new EffectComposer( renderer.glrenderer );
// import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
  

function addLayer(destId, i){
    let template = document.getElementById("layer_template");

    let innerHTML = template.innerHTML;
    innerHTML = innerHTML.replaceAll("_4", "_"+i);
    const placeholder = document.createElement("div");
    placeholder.innerHTML = innerHTML;
    const node = placeholder.firstElementChild;

    let dest = document.getElementById(destId);
    dest.appendChild(node);

    
    document.getElementById('layer_' + i).onclick = function() {
        newActiveLayer(i);
    }

    document.getElementById('layer_effect_d_p1_' + i).oninput = function() {
        layer_effects[i].extra(this.value)
        // console.log("layer_effect " + i + " >>", parseFloat(this.value) )
    }
    document.getElementById('layer_effect_d_p2_' + i).oninput = function() {
        layer_effects[i].extra2(this.value)
        // console.log("layer_effect " + i + " >>", parseFloat(this.value) )
    }
    document.getElementById('layer_effect_c1_p1_' + i).oninput = function() {
        layer_effects_color_1[i].extra(this.value)
        console.log("color layer_effect 1 " + i + " >>", parseFloat(this.value) )
    }
    document.getElementById('layer_effect_c2_p1_' + i).oninput = function() {
        layer_effects_color_2[i].extra(this.value)
        console.log("color layer_effect 2 " + i + " >>", parseFloat(this.value) )
    }

    document.getElementById('btn_bpm_layer_' + i).onclick = function() {
        toggleLayerBpmLock(i);
    }

    document.getElementById('layer_play_' + i).onclick = function() {
        console.log("play ", i)
        layerTimes[i].is_playing = true;
    }
    document.getElementById('layer_pause_' + i).onclick = function() {
        console.log("pause ", i)
        layerTimes[i].is_playing = false;
    }

    document.getElementById('layer_in_' + i ).onclick = function() {
        console.log("in ", i);
        setInOnLayer(i);
    }

    document.getElementById('layer_out_' + i).onclick = function() {
        console.log("out ", i);
        setOutOnLayer(i);
    }

    document.getElementById("layer_play_mode_" + i).oninput = function() {
        console.log("layer_play_mode_" + i, this.value);
        setPlayModeOnLayer(i, this.value)
    }

    document.getElementById("layer_bpm_mode_" + i).oninput = function() {
        console.log("layer_bpm_mode" + i, this.value);
        setBpmModeOnLayer(i, this.value)
    }

    document.getElementById("layer_bpm_factor_" + i).oninput = function() {
        console.log("layer_bpm_factor_" + i, parseFloat(this.value));
        // setBpmModeOnLayer(i, this.value)
        layerTimes[i].bpm_factor = parseFloat(this.value);
    }

    document.getElementById('layer_time_' + i ).oninput = function() {
        var time = this.value * sources[i].duration();
        sources[i].currentTime(time);
        layerTimes[i].time_last_beat = Date.now() - time * 1000;
    }
    document.getElementById('layer_time_' + i ).onmousedown = function() {
        layerTimes[i].is_scrubbing = true;
    }
    document.getElementById('layer_time_' + i ).onmouseup = function() {
        layerTimes[i].is_scrubbing = false;
    }

    // Jogging can only start with click in a monitor.
    document.getElementById('monitor_' + i ).onmousedown = function(e) {
        jogging_layer = i;
        newActiveLayer(i);
        is_jogging = true;
        jog_start_x = e.clientX;

        layerTimes[activeLayer].is_jogging = true;
        layerTimes[activeLayer].is_scrubbing = true;
        
    }

    // document.getElementById("cake-mixer" ).onmousedown = function(e) {
    //     jog_start_x = e.clientX;
    //     // is_jogging = true;
    // }

    // Jogging works even when you mouse out of start monitor- so you ccan do long drags.
    document.getElementById("cake-mixer").onmouseup = function(e) {
        is_scrubbing = false;
        is_jogging = false;
        jogging_layer = -1;
        jog_start_x = -1;
        layerTimes[activeLayer].is_scrubbing = false;
        layerTimes[activeLayer].is_jogging = false;
        
    }
    document.getElementById("cake-mixer").onmousemove = function(e) {
        if (typeof is_jogging != 'undefined' && is_jogging && jogging_layer > 0){
            const jog_x = e.clientX - jog_start_x;
            console.log("jog global", jog_x)
            console.log("currenttime", sources[activeLayer].video.currentTime)
            console.log("e.movementX", e.movementX)

            const video = sources[activeLayer].video;
            var newTime = (video.currentTime + e.movementX / 30) % video.duration;
            video.currentTime = newTime;

            //update the time slider control.
            document.getElementById('layer_time_' + activeLayer ).value = newTime / video.duration;

        //     var time = this.value * sources[i].duration();
        // sources[i].currentTime(sources[i].currentTime);
        }
    }

//todo
    document.getElementById('layer_speed_' + i).oninput = function() {
        // rate3 = this.value 
        // TODO use layerTime.
        console.log("layer_speed >>",i,  parseFloat(this.value) )
    }


    document.getElementById('layer_blendmode_' + i).oninput = function() {
        channel_1_b_mixer.blendMode(this.value);
        console.log('layer_blendmode_' + i, parseFloat(this.value) )
    }

    document.getElementById('layer_samples_' + i).oninput = function() {
        loadSample(i, this.value)
        console.log('layer_samples_' + i, parseFloat(this.value) )
    }



    // document.getElementById('bpm_tap_btn').onmousedown = function() {
    //     bpm_tap.tap()
    //     channel_1_b_mixer.bpm(bpm_tap.bpm)
    //     document.getElementById('bpm_display').textContent = Math.round(bpm_tap.bpm)
    //   }

    // D-EFFECT

    var effect_d_select =  document.getElementById("layer_effect_d_" + i)

    for(var j=0; j<dEffects.length; j++){
        var option = document.createElement("option");
        option.text = dEffects[j].n;
        option.value = dEffects[j].v;
        effect_d_select.add(option);
    }

    effect_d_select.oninput = function() {
        console.log("layer_effect_d_" + activeLayer, parseFloat(this.value));
        setDistortionEffect(i, this.value)
        // setBpmModeOnLayer(i, this.value)
        //layerTimes[i].bpm_factor = parseFloat(this.value);
    }

    // C EFFECTS
    var effect_c_select_1 = makeColorEffectSelect(i, 1);
    effect_c_select_1.oninput = function() {
        console.log("layer_effect_c1_" + activeLayer, parseFloat(this.value));
        setColorEffect1(activeLayer, this.value)
    }

    var effect_c_select_2 = makeColorEffectSelect(i, 2);
    effect_c_select_2.oninput = function() {
        console.log("layer_effect_c2_" + activeLayer, parseFloat(this.value));
        setColorEffect2(activeLayer, this.value)
    }

    var sampleArray = [
        {name:"samples", in: -1, out: -1},
        {name:"announcer", in: 6, out: 7},
        {name:"gold pair", in: 31, out: 34}
    ]
    makeSampleSelect(i, sampleArray)
    
}

function makeColorEffectSelect(iLayer, iColor){
    var effect_c_select =  document.getElementById("layer_effect_c" + iColor + "_" + iLayer)
    for(var j=0; j<colorEffects.length; j++){
        var option = document.createElement("option");
        option.text = colorEffects[j].n;
        option.value = colorEffects[j].v;
        effect_c_select.add(option);
    }
    return effect_c_select;
}



function makeSampleSelect(iLayer, sampleArray){
    var sample_select =  document.getElementById("layer_samples_" + iLayer)
    for(var j=0; j<sampleArray.length; j++){
        var option = document.createElement("option");
        option.text = sampleArray[j].name;
        option.value = sampleArray[j].in + "-" + sampleArray[j].out;
        sample_select.add(option);
    }
    return sample_select;
}


function loadSample(i, sample){
    // TODO.
     console.log("loadSample", i, sample);
    let intime = parseFloat(sample.split("-")[0]);
    let outtime = parseFloat(sample.split("-")[1]);
    clobberInOnLayer(i, intime);
     clobberOutOnLayer(i, outtime);

 }

function setDistortionEffect(i, effect){
    layer_effects[i].effect(effect);
}

function setColorEffect1(i, effect){
    layer_effects_color_1[i].effect(effect);
}
function setColorEffect2(i, effect){
    layer_effects_color_2[i].effect(effect);
}


function toggleLayerBpmLock(i){
    layerTimes[i].bpm_on = ! layerTimes[i].bpm_on;

    console.log("bpm layer " + i + " >>", layerTimes[i].bpm_on )

    let el = document.getElementById('btn_bpm_layer_' + i);
    if (layerTimes[i].bpm_on){
        el.classList.add("active");
    }else{
        el.classList.remove("active");
    }
}


//COLOR EFFECT
const LUMAKEY = 50;

const RED = 10;

const NAM = 3;
const FAM = 4;
const LUM1 = 10;
const LUM2 = 11;
const BOOM = 9


//DISTORTION EFFECT


const TOPHER_DIST_MIRROR_CIRCLES = 100;
const TOPHER_DIST_CIRCLES_3 = 102;

const TOPHER_DIST_CIRCLE = 103;
const TOPHER_ONLY_SQUASH = 104;
const TOPHER_ONLY_CIRCLE = 105;

const CAKE_OFF = 1;
const CAKE_MIRROR_VERTICAL = 106;
const CAKE_MIRROR_HORIZONTAL = 107;
const CAKE_WIPE_HORIZONTAL = 108;
const CAKE_MIRROR_BOTH = 109;
const CAKE_KALEIDO = 120;

const CAKE_WIPE_VERTICAL = 110;
const CAKE_WIPE_ANGLE = 111;
const CAKE_WIPE_DONUT = 112;




var dEffects = [
    {n:"No Effect", v:CAKE_OFF},
    {n:"Mirror Horizontal", v: CAKE_MIRROR_HORIZONTAL},
    {n:"Mirror Vertical", v: CAKE_MIRROR_VERTICAL},
    {n:"Wipe Horiz", v: CAKE_WIPE_HORIZONTAL},
    {n:"Wipe Vert", v: CAKE_WIPE_VERTICAL},
    {n:"Wipe Angle", v: CAKE_WIPE_ANGLE},
    {n:"Wipe Donut", v: CAKE_WIPE_DONUT},
    {n:"Mirror Both", v: CAKE_MIRROR_BOTH},
    {n:"Kaleido", v: CAKE_KALEIDO},
];


const CAKE_LUMA_TOPHER = 100;
const CAKE_LUMA_TOPHER_2 = 102;
const CAKE_LUMA = 50;
const COLOR_NEGATIVE_3 = 2;
const COLOR_BLACK_WHITE= 10;
const COLOR_RED= 11;
const COLOR_BLUE= 13;
const COLOR_GREEN = 12;
const COLOR_YELLOW = 14;
const COLOR_TEAL = 15;
const COLOR_PURPLE = 16;
const COLOR_SEPIA = 17;

const COLOR_SWAP_1 = 20;

const COLOR_PAINT = 52;
const COLOR_COLORIZE = 53;
const COLOR_BRIGHTNESS = 60;
const COLOR_CONTRAST = 61;
const COLOR_SATURATION = 62;
const COLOR_HUE= 63;
const COLOR_BLACK_EDGE= 64;

var colorEffects = [
    {n:"No Effect", v:CAKE_OFF},

    {n:"Toph Luma Black", v: CAKE_LUMA_TOPHER},
    {n:"Toph Luma White", v: CAKE_LUMA_TOPHER_2},
    {n:"Negative 3", v: COLOR_NEGATIVE_3},
    {n:"B&W", v: COLOR_BLACK_WHITE},
    {n:"Red", v: COLOR_RED},
    {n:"Blue", v: COLOR_BLUE},
    {n:"Green", v: COLOR_GREEN},
    {n:"Yellow", v: COLOR_YELLOW},
    {n:"Teal", v: COLOR_TEAL},
    {n:"Magenta", v: COLOR_PURPLE},
    {n:"Sepia", v: COLOR_SEPIA},
    {n:"Swap 1", v: COLOR_SWAP_1},

    {n:"Paint", v: COLOR_PAINT},
    {n:"Colorize", v: COLOR_COLORIZE},
    {n:"Brightness", v: COLOR_BRIGHTNESS},
    {n:"Contrast", v: COLOR_CONTRAST},
    {n:"Satur8", v: COLOR_SATURATION},
    {n:"Hue", v: COLOR_HUE},
    {n:"Black Edge", v: COLOR_BLACK_EDGE},

];

function addLayers() {
    console.log("addLayers")
    
    addLayer("channel_2_layers", 4);
    addLayer("channel_2_layers", 3);
    addLayer("channel_1_layers", 2);
    addLayer("channel_1_layers", 1);
}

addLayers();
//key, keyCode, 
window.addEventListener("keydown", (e) => {
    console.log("e.code",e.code);
    
    console.log("target:", e.target.nodeName);

    if (e.target.nodeName.toLowerCase() == 'input') {
        return;
    }

    // console.log("event.code",event.code);
    
    if (e.code == "Digit1"){
        newActiveLayer(1);
    }
    if (e.code == "Digit2"){
        newActiveLayer(2);
    }
    if (e.code == "Digit3"){
        newActiveLayer(3);
    }
    if (e.code == "Digit4"){
        newActiveLayer(4);
    }

    //TODO - also update the controls.
    if (e.code == "ArrowLeft"){
        setControlPlayModeOnLayer(activeLayer, PLAY_MODE_REVERSE)
    }
    if (e.code == "ArrowRight"){
        setControlPlayModeOnLayer(activeLayer, PLAY_MODE_FORWARD)
    }
    if (e.code == "ArrowDown"){
        setControlPlayModeOnLayer(activeLayer, PLAY_MODE_BOUNCE)
    }
    if (e.code == "ArrowUp"){
        setControlPlayModeOnLayer(activeLayer, PLAY_MODE_RANDOM)
    }

    if (e.code == "Space"){
        layerTimes[activeLayer].is_playing = !layerTimes[activeLayer].is_playing;
    }

    if (e.code == "KeyI"){
        setInOnLayer(activeLayer);
    }

    if (e.code == "KeyO"){
        setOutOnLayer(activeLayer);
    }

    // GLOBAL BPM
    if (e.code == "KeyA"){
        bpmTap();
    }
    if (e.code == "KeyD"){
        bpmReset();
    }
    if (e.code == "KeyW"){
        incrementBpm(1);
    }
    if (e.code == "KeyS"){
        incrementBpm(-1);
    }

    // LAYER BPM
    if (e.code == "KeyK"){
        toggleLayerBpmLock(activeLayer)
    }
    if (e.code == "KeyJ"){
        changeBeatFactor(activeLayer, -1)
    }
    if (e.code == "KeyL"){
        changeBeatFactor(activeLayer, +1)
    }
    if (e.code == "KeyU"){
        //toggle mode.
        let newMode = BPM_MODE_STRETCH;
        if (layerTimes[activeLayer].bpm_mode == BPM_MODE_STRETCH){
            newMode = BPM_MODE_CUT;
        }
        let el = document.getElementById("layer_bpm_mode_" + activeLayer);
        el.value = newMode;
        layerTimes[activeLayer].bpm_mode = newMode
    }

    // document.getElementById("layer_bpm_mode_" + i).oninput = function() {
    //     console.log("layer_bpm_mode" + i, this.value);
    //     setBpmModeOnLayer(i, this.value)
    // }


    e.preventDefault();

});

function changeBeatFactor(i, step){
    const select = document.getElementById("layer_bpm_factor_" + i);
    changeOption(select, step) 
    let value = parseFloat(select.value);
    console.log("changeBeatFactor", value)
    layerTimes[i].bpm_factor = value;
}

function changeOption(select, step) {
    const i = select.selectedIndex + step;
    if (i>-1 && i < 9){
        select.selectedIndex = i;
    }
}

function incrementBpm(step){
    let newBpm = bpm_tap.getBpm() + step;
    bpm_tap.setBpm(newBpm);

    let el = document.getElementById('bpm_slide');
    el.value = bpm_tap.getBpm();

    document.getElementById('bpm_display').textContent = Math.round(bpm_tap.getBpm());

}

function setControlPlayModeOnLayer(i, mode){
   
    let el = document.getElementById("layer_play_mode_" + i);
    el.value = mode;
    setPlayModeOnLayer(i, mode)
    
}

document.getElementById('layer_fader_1').oninput = function() {
    channel_1_a_mixer.pod(this.value)
}
document.getElementById('layer_fader_2').oninput = function() {
    channel_1_b_mixer.pod(this.value)
}
document.getElementById('layer_fader_3').oninput = function() {
    channel_2_a_mixer.pod(this.value)
}
document.getElementById('layer_fader_4').oninput = function() {
    channel_2_b_mixer.pod(this.value)
}



// function AnySource(renderer, options){
//     console.log("AnySource")

// let ext = options.src.split('.').pop();
// console.log("ext", ext)
//  if (ext == "mp4"){
//     return new VideoSource(renderer, options);
//  }
//  if (ext == "gif"){
//     return new GifSource(renderer, options);
//  }

//  console.log("Unknown Source:", options.src)
// }


function showBpm(f){
    //console.log("yooooooooooo", i);
    if (f<0.1){
        document.getElementById('bpm_reset').classList.add("phase")
    }else{
        document.getElementById('bpm_reset').classList.remove("phase")
    }
}


// lets not forget the bpm
var bpm_tap = new BPM( renderer );
bpm_tap.add(showBpm)
let sources = new Array();
let layer_effects = new Array();

let layer_effects_color_1 = new Array();
let layer_effects_color_2 = new Array();

// sources[1]= new FlexSource(renderer, {src: "/video/DCVS01/DCVS01 container 01 ominouslong chop.mp4", uuid:"Video_1", fragmentChannel:1, elementId:"monitor_1",});
sources[1]= new FlexSource(renderer, {src: "/video/dancing/Soul Train Line Dance to Jungle Boogie (1973).mp4", uuid:"Video_1", fragmentChannel:1, elementId:"monitor_1",});
sources[2] = new FlexSource(renderer, {src: "/video/DCVS01/DCVS01 container 02 scape.mp4", uuid:"Video_2", fragmentChannel:1, elementId:"monitor_2"});
//var sources[2] = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 wires 03 shift.mp4",});
// var sources[2] = new GifSource(renderer, {src: "/images/640X480.gif",});
// var sources[2] = new VideoSource(renderer, {src: "/video/disco/ymca-nosound.mp4", uuid:"Video_2"});
// var sources[3] = new VideoSource(renderer, {src: "/video/disco/september-nosound.mp4",});
sources[3] = new FlexSource(renderer, {src: "/images/640X480.gif", fragmentChannel:2,  uuid:"Gif_3", elementId:"monitor_3",});
sources[4]= new FlexSource(renderer, {src: "/images/animal.gif", fragmentChannel:2, uuid:"Gif_4" , elementId:"monitor_4", });
// sources[4]= new FlexSource(renderer, {src: "/images/smily1.png", fragmentChannel:2, uuid:"Source_4" , elementId:"monitor_4", });


var FILE_URL_1 = "http://localhost:4000/files/DCVS01"
var FILE_URL_2 = "http://localhost:4000/files/disco"
var FILE_URL_ROOT = "http://localhost:4000/files"
  
function handleClipClick(url) {
    console.log("clip click:" + url);
    url = "/video/" + url;// + "#t20,25";

    //TODO Check if type is changed first.
    var l = activeLayer;
    var channel = 1;
    if (activeLayer > 2){
        channel = 2;
    }
    // sources[l]= new FlexSource(renderer, {src: url, uuid:"Video_" + l, fragmentChannel:channel, elementId:"monitor_" + l,});

    //Prevent crash due to requesting non existant currentTime.
    layerTimes[activeLayer].time_last_beat = Date.now();
    sources[activeLayer].video.currentTime = 0;
    sources[activeLayer].src(url);
    sources[activeLayer].pause();
}
  
layer_effects[1] = new DistortionEffect2(renderer, { source: sources[1],  fragmentChannel:1,  uuid:"Dist_1"} );
layer_effects[2] = new DistortionEffect2(renderer, { source: sources[2],  fragmentChannel:1,  uuid:"Dist_2"} );
layer_effects[3] = new DistortionEffect2(renderer, { source: sources[3],  fragmentChannel:2,  uuid:"Dist_3"} );
layer_effects[4] = new DistortionEffect2(renderer, { source: sources[4],  fragmentChannel:2,  uuid:"Dist_4"} );

layer_effects_color_1[1] = new ColorEffect(renderer, { source: layer_effects[1],  fragmentChannel:1,  uuid:"Color_c1_1"} );
layer_effects_color_1[2] = new ColorEffect(renderer, { source: layer_effects[2],  fragmentChannel:1,  uuid:"Color_c1_2"} );
layer_effects_color_1[3] = new ColorEffect(renderer, { source: layer_effects[3],  fragmentChannel:2,  uuid:"Color_c1_3"} );
layer_effects_color_1[4] = new ColorEffect(renderer, { source: layer_effects[4],  fragmentChannel:2,  uuid:"Color_c1_4"} );

layer_effects_color_2[1] = new ColorEffect(renderer, { source: layer_effects_color_1[1],  fragmentChannel:1,  uuid:"Color_c2_1"} );
layer_effects_color_2[2] = new ColorEffect(renderer, { source: layer_effects_color_1[2],  fragmentChannel:1,  uuid:"Color_c2_2"} );
layer_effects_color_2[3] = new ColorEffect(renderer, { source: layer_effects_color_1[3],  fragmentChannel:2,  uuid:"Color_c2_3"} );
layer_effects_color_2[4] = new ColorEffect(renderer, { source: layer_effects_color_1[4],  fragmentChannel:2,  uuid:"Color_c2_4"} );

var solid_black = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0 }, uuid:"Solid_Black" } );
var solid_black2 = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0, }, fragmentChannel:2, uuid:"Solid_Black2" } );

var channel_1_a_mixer = new Mixer( renderer, { source1: layer_effects_color_2[1], source2: solid_black,  uuid: "Mixer_1_a"  } )
var channel_1_b_mixer = new Mixer( renderer, { source1: layer_effects_color_2[2], source2: channel_1_a_mixer,  uuid: "Mixer_1_b"  } )

var channel_2_a_mixer = new Mixer( renderer, { source1: layer_effects_color_2[3], source2: solid_black2,  uuid: "Mixer_2_a", fragmentChannel:2 } )
var channel_2_b_mixer = new Mixer( renderer, { source1: layer_effects_color_2[4], source2: channel_2_a_mixer,  uuid: "Mixer_2_b", fragmentChannel:2  } )

var output = new Output( renderer, channel_1_b_mixer, channel_2_b_mixer )


// var output = new Output( renderer, sources[2], sources[4] )


console.log("CAKE Call renderer.init() --------------------");

// start to render
renderer.init();
renderer.render();



if (typeof channel_1_b_mixer !== 'undefined') channel_1_b_mixer.pod(0.0);
if (typeof channel_1_a_mixer !== 'undefined') channel_1_a_mixer.pod(1.0);

function pauseAll(){
    console.log("pauseAll")
    // sources[1].pause();
    // sources[2].pause();
    // sources[3].pause();
    // sources[4].pause();
    layerTimes[1].is_playing = false;
    layerTimes[2].is_playing = false;
    layerTimes[3].is_playing = false;
    layerTimes[4].is_playing = false;
}

setTimeout(() => {
    
    document.getElementById('layer_fader_2').value = 0.0
    document.getElementById('layer_fader_1').value = 1.0
    sources[1].pause();
    sources[2].pause();
    // sources[3].pause();
    // sources[4].pause();
  }, 1000);

// -----------------------------------------------------------------------------


// Some helper vars
var original_mixmode = 1




// ---------------------------------------------------------------------------
    // CAKE MIXER
// ---------------------------------------------------------------------------
var activeLayer = 1;




// // TOPHER
var blendModes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
var blendModesNames = ["add", "substract", "multiply", "darken", "color burn", "linear burn", "lighten", "screen", "color dodge", "linear dodge", "overlay", "soft light", "hard light", "vivid light", "linear light", "pin light", "difference", "exclusion"]

var blend_select_2 =  document.getElementById('layer_blendmode_2') //TODO expand to other ones.

for(var i=0; i<blendModes.length; i++){
    var option = document.createElement("option");
    option.text = blendModesNames[i];
    option.value = blendModes[i];
    blend_select_2.add(option);
}

function newActiveLayer(newLayer){
    console.log("new active laayer: ", newLayer)
    activeLayer = newLayer;
    let el;
    for (let i=1;   i<5; i++){
        el = document.getElementById('layer_' + i);
        el.classList.remove("active");
    }

    el = document.getElementById('layer_' + newLayer);
    el.classList.add("active");

}

let isWords = false;
function toggleWords(){
    isWords = !isWords;
    let elMain = document.getElementById("word_main");
    let elLeft = document.getElementById("word_left");
    let elRight = document.getElementById("word_right");

    if (isWords){ 
        elMain.classList.add("show");
        elLeft.classList.add("show");
        elRight.classList.add("show");
    }else{
        elMain.classList.remove("show");
        elLeft.classList.remove("show");
        elRight.classList.remove("show");
    }
}











// Function to fetch image URLs and create image elements
async function fetchAndDisplayImages(filesUrl, domElementId) {
    console.log("fetchAndDisplayImages")
    try {
        // Replace 'https://example.com/api/images' with the actual URL of the REST endpoint
        const response = await fetch(filesUrl);
        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        // Assuming the API returns an array of image URLs
        const imageUrls = await response.json();

        // Get the container div
        const container = document.getElementById(domElementId);

        container.innerHTML = '';

        // Iterate over the image URLs and create image elements
        imageUrls.forEach(url => {
            const div = document.createElement('div');
            div.className = 'clip';

            const text = document.createElement('span');
            const msg = url.replace("/video/DCVS01/DCVS01 ","");
            text.textContent = msg;
 
            // const img = document.createElement('img');
            // img.src = url;
            // img.alt = 'Image';
            // div.appendChild(img);
            div.appendChild(text);
            // div.onclick = handleClipClick(url);
            div.onclick = () => handleClipClick(url);

            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

// Call the function to fetch and display images on page load
fetchAndDisplayImages(FILE_URL_1, 'clip_bank_1');
fetchAndDisplayImages(FILE_URL_2, 'clip_bank_2');


// Function
async function fetchFileDirs(filesUrl) {
    console.log("fetchFileDirs")
    try {
        const response = await fetch(filesUrl);   
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // Assuming the API returns an array of image URLs
        const dirs = await response.json();
        return dirs;
    } catch (error) {
        console.error('Error fetching images:', error);
    }
    
}

const dirs = await fetchFileDirs("http://localhost:4000/dirs/");

var clip_bank_select_1 =  document.getElementById('clip_bank_select_1')
dirs.forEach(dir => {
    var option = document.createElement("option");
    option.text = dir;
    option.value = dir;
    clip_bank_select_1.add(option);
});

var clip_bank_select_2 =  document.getElementById('clip_bank_select_2')
dirs.forEach(dir => {
    var option = document.createElement("option");
    option.text = dir;
    option.value = dir;
    clip_bank_select_2.add(option);
});


clip_bank_select_1.oninput = function() {
    console.log("clip_bank_select_1 >>", this.value);
    fetchAndDisplayImages(FILE_URL_ROOT + this.value, 'clip_bank_1');
}
clip_bank_select_2.oninput = function() {
    console.log("clip_bank_select_2 >>", this.value);
    fetchAndDisplayImages(FILE_URL_ROOT + this.value, 'clip_bank_2');
}



// ---------------------------------------------------------------------------
    // TIMING
// ---------------------------------------------------------------------------

const FRAME_DELAY = 1 / 60;
let frameCheck = 0;
let rate1 = 0.5;
let rate2 = 0.1;
let rate3 = 0.1;
let rate4 = 0.1;

// let time1 = 0.0;
// let time2 = 0.0;
// let time3 = 0.0;

function bps(bpm){
    return 1 / (bpm / 60.0);
}
function updateVideo(source, rate, layer, layerTime){
    let video = source.video;
    if (video == null || source.type2 != "Video" ){//|| ! video.hasOwnProperty("duration")){
        return;
    }
    if (layerTime.is_playing==false){
        return;
    }
    if (layerTime.is_scrubbing==true){
        return;
    }

    // DETERMINE DURATION & TIMERATIO
    let end = video.duration;
    if (layerTime.out != -1){
        end = layerTime.out;
    }
    let start = 0;
    if (layerTime.in != -1){
        start = layerTime.in;
    }
    let duration = end - start;


    
    // Note: time_last_beat is the last time it reset / jumped.

    let time_elapsed = (Date.now() - layerTime.time_last_beat) / 1000;
   
    //Include speed? maybe time_elapsed += speed?

    if (layerTime.just_reversed){
        
        layerTime.just_reversed = false;
        let timeRatio = time_elapsed / duration;
        // console.log("duration", duration.toFixed(2))
        // console.log("time_elapsed", time_elapsed.toFixed(2))
        // console.log("just reversed - ratio", timeRatio.toFixed(2))

        let ratioGoal = (1 - timeRatio)
        let ratioChunk = (1 - timeRatio) - timeRatio;
        // console.log("ratioGoal", ratioGoal.toFixed(2))
        // console.log("ratioChunk", ratioChunk.toFixed(2))
        // console.log("secondsToMove", (ratioChunk *  duration).toFixed(2))
        
        // debugger;
        layerTime.time_last_beat -= (ratioChunk *  duration) * 1000;

        //recalc.
        
        time_elapsed = (Date.now() - layerTime.time_last_beat) / 1000;
        timeRatio = time_elapsed / duration;
        // console.log("time_elapsed", time_elapsed.toFixed(2))
        // console.log("just reversed - ratio", timeRatio.toFixed(2))
    }

    let loopFlag = false;
    if (time_elapsed > duration){
        console.log("loop normal")
        loopFlag = true;

    }
    //Check if BPM wants to create a beat.
    if (layerTime.bpm_on && layerTime.bpm_mode == BPM_MODE_CUT){
        
        if (bpm_tap.render2(layerTime.bpm_factor) < layerTime.last_bpm_tap_render){
            // it looped.
            console.log("loop BPM")
            loopFlag = true;
        }
    }
    layerTime.last_bpm_tap_render = bpm_tap.render2(layerTime.bpm_factor);

    if (loopFlag){
        time_elapsed = 0;
        layerTime.time_last_beat = Date.now();
        layerTime.is_bounce_reverse = !layerTime.is_bounce_reverse;
    }
    loopFlag = false;


    let timeRatio = time_elapsed / duration;

    if (layerTime.bpm_on){

        if (layerTime.bpm_mode == BPM_MODE_STRETCH){
            timeRatio = bpm_tap.render2(layerTime.bpm_factor) ;
        } else if(layerTime.bpm_mode == BPM_MODE_CUT) {

        }
        
        //todo for bounce - still need to know when it loops.
    }

    // USE IN FUNCTION
    let time = 0;
    if (layerTime.play_mode == PLAY_MODE_FORWARD){
        time = start + timeRatio * duration;
    } else if (layerTime.play_mode == PLAY_MODE_REVERSE){
        time = start + (1.0 -timeRatio) * duration;
    } else if (layerTime.play_mode == PLAY_MODE_BOUNCE){

       if (layerTime.is_bounce_reverse == false){
        time = start + timeRatio * duration;
       }else{
        time = start + (1.0 -timeRatio) * duration;
       }
        
    }



    // let time_in_range = start + time_elapsed;
    // if (layerTime.bpm_on){
    //     time_in_range = start + bpm_tap.render() * duration;
    // }else{
    //     if (time_elapsed > duration){
    //         time_elapsed = 0;
    //         layerTime.time_last_beat = Date.now();
    //         console.log("loop")
    //     }
    // }

    //BPM - Map the beat to whatever in and out and speed stuff going on above.
    //Based on time_in_range and duration.
        // time_in_range = 
    // video.currentTime = time_in_range;

    if (isFinite(time)){
        video.currentTime = time;
    }else{
        console.log("warn updateVideo infinite time")
    }
    
    
    //full time scrubber - not the current loop or anything
    var scrubber = document.getElementById('layer_time_' + layer );
    if (scrubber){
        scrubber.value = video.currentTime / video.duration;
    }
}
function setPlayModeOnLayer(i, mode){

    if (mode != layerTimes[i].play_mode){
        layerTimes[i].just_reversed = true;
    }
    layerTimes[i].play_mode = mode;
}
function setBpmModeOnLayer(i, mode){

    // if (mode != layerTimes[i].play_mode){
    //     layerTimes[i].just_reversed = true;
    // }
    layerTimes[i].bpm_mode = mode;
    console.log("setBpmModeOnLayer", i, mode)
}

function playVideos () {
    if (frameCheck==0){
        updateVideo(sources[1], rate1, "1", layerTimes[1]);
        updateVideo(sources[2], rate2, "2", layerTimes[2]);

        updateVideo(sources[3], rate3, "3", layerTimes[3]);
        updateVideo(sources[4], rate4, "4", layerTimes[4]);
    }
    frameCheck++;
    if (frameCheck == 3){
        frameCheck = 0;
    }

    let r = bpm_tap.render2(1)//layerTime.bpm_factor


  requestAnimationFrame(playVideos);
};
const PLAY_MODE_FORWARD = "FORWARD";
const PLAY_MODE_REVERSE = "REVERSE";
const PLAY_MODE_BOUNCE = "BOUNCE";
const PLAY_MODE_RANDOM = "RANDOM";

const BPM_MODE_STRETCH = "STRETCH";
const BPM_MODE_CUT = "CUT";



let is_jogging = false;
let jog_start_x = -1;
let is_scrubbing = false;
let jogging_layer = -1;

let layerTimes = new Array();
function initLayerTimes(lt){
    lt =  {
        is_playing:false,
        play_mode: PLAY_MODE_FORWARD,
        bpm_on: false,
        bpm_mode: BPM_MODE_STRETCH,
        bpm_factor: 1.0,

        in:-1,
        out:-1,
        time_last_beat: Date.now(), 

        just_reversed: false,
        is_bounce_reverse: false,
        last_bpm_tap_render: 0, 
        is_scrubbing: false,
        is_jogging: false,
        jog_start_x: -1,
    }
    return lt;
}
//play_mode: PLAY_MODE_FORWARD,
for (let i=1; i<5; i++){
    layerTimes[i] =initLayerTimes(layerTimes[i]);
}

function resetLayerTimes(){
    for (let i=1; i<5; i++){
        layerTimes[i].time_last_beat = Date.now();
    }
}

function setInOnLayer(i){
    if (layerTimes[i].in == -1){
        //set in
        layerTimes[i].in = sources[i].video.currentTime;
        layerTimes[i].time_last_beat = Date.now();
        document.getElementById('layer_in_' + i).classList.add("active");
    }else{
        //clear in
        console.log("time_last_beat", layerTimes[i].time_last_beat)
        layerTimes[i].time_last_beat = layerTimes[i].time_last_beat - layerTimes[i].in * 1000;
        console.log("time_last_beat", layerTimes[i].time_last_beat)
        layerTimes[i].in = -1;
        document.getElementById('layer_in_' + i).classList.remove("active");
    }
    console.log("setInOnLayer", layerTimes[i].in)
    
}
function setOutOnLayer(i){
    if (layerTimes[i].out == -1){
        //set out
        layerTimes[i].out = sources[i].video.currentTime;
        document.getElementById('layer_out_' + i).classList.add("active");
    }else{
        layerTimes[i].out = -1;
        document.getElementById('layer_out_' + i).classList.remove("active");
    }
    console.log("setOutOnLayer", layerTimes[i].out)
}

function clobberInOnLayer(i, time){
        //set in
        layerTimes[i].in = time;
        layerTimes[i].time_last_beat = Date.now();

        layerTimes[i].is_playing = true;
        document.getElementById('layer_in_' + i).classList.add("active");
    
}
function clobberOutOnLayer(i, time){
        //set out
        layerTimes[i].out = time;
        document.getElementById('layer_out_' + i).classList.add("active");
}



if (TIME_BY_TOPHER){
    playVideos();
}else{
    //something
}





  // -----------------------------------------------------------------------------
    // BPM TAP EN SLIDER
function bpmTap(){
    var tapPhase = bpm_tap.tapCake();
    if (tapPhase == "TAP_PHASE_SET_LENGTH"){
        document.getElementById('bpm_tap_btn').classList.add("bpm-set-length")
    }else{
        document.getElementById('bpm_tap_btn').classList.remove("bpm-set-length")
    }
    // resetLayerTimes();
    //channel_1_b_mixer.bpm(bpm_tap.bpm)
    document.getElementById('bpm_display').textContent = Math.round(bpm_tap.bpm);
    document.getElementById('bpm_slide').value = Math.round(bpm_tap.bpm);
}
function bpmReset(){
    bpm_tap.resetCake();
    document.getElementById('bpm_reset').classList.add("phase");
}

document.getElementById('bpm_reset').onmousedown = function() {
    bpmReset();
}   

document.getElementById('bpm_tap_btn').onmousedown = function() {
    bpmTap();
}

document.getElementById('bpm_slide').oninput = function() {
    //channel_1_b_mixer.bpm(document.getElementById('bpm_slide').value)
    let sliderValue = Math.round(document.getElementById('bpm_slide').value);
    document.getElementById('bpm_display').textContent = sliderValue;

    bpm_tap.setBpm(sliderValue)
}

document.getElementById('pause_all').onmousedown = function() {
    console.log("pause all button clicked")
    pauseAll();
}


// GLOBAAL EFECTS
document.getElementById('effect_slide_feedback').oninput = function() {
    let sliderValue = this.value;
    renderer.setFeedbackEffect(sliderValue);
}

document.getElementById('effect_slide_rotate_vel_1').oninput = function() {
    let sliderValue = this.value;
    renderer.setRotationVel1(parseFloat(sliderValue));
}
document.getElementById('effect_slide_rotate_accel_1').oninput = function() {
    let sliderValue = this.value;
    renderer.setRotationAccel1(parseFloat(sliderValue));
}
document.getElementById('effect_slide_rotate_vel_2').oninput = function() {
    let sliderValue = this.value;
    renderer.setRotationVel2(parseFloat(sliderValue));
}

document.getElementById('rotate_vel_reset_1').onmousedown = function() {
    renderer.resetRotationVel1();
    document.getElementById('effect_slide_rotate_vel_1').value = 0;
} 
document.getElementById('rotate_accel_reset_1').onmousedown = function() {
    renderer.resetRotationAccel1();
    document.getElementById('effect_slide_rotate_vel_1').value = 0;
    document.getElementById('effect_slide_rotate_accel_1').value = 0;
} 
document.getElementById('rotate_vel_reset_2').onmousedown = function() {
    renderer.resetRotationVel2();
    document.getElementById('effect_slide_rotate_vel_2').value = 0;
} 

document.getElementById('word_input_main').oninput = function(event) {
    console.log("word", this.value)
    document.getElementById('word_main').textContent = this.value;
}
document.getElementById('word_input_left').oninput = function(event) {
    console.log("word", this.value)
    document.getElementById('word_left').textContent = this.value;
}
document.getElementById('word_input_right').oninput = function(event) {
    console.log("word", this.value)
    document.getElementById('word_right').textContent = this.value;
}

document.getElementById('words_on').onmousedown = function() {
    toggleWords();
}

}//start


// window.addEventListener('load', function () {
//     alert("It's loaded!")
//   })



// console.log("added buttons 1")


// document.getElementById('btn_switch_layer_2').onclick = function() {
//     newActiveLayer(2);
// }
// document.getElementById('btn_switch_layer_3').onclick = function() {
//     console.log("btn_switch_layer_3")
//     newActiveLayer(3);
// }
// document.getElementById('btn_switch_layer_4').onclick = function() {
//     newActiveLayer(4);
// }
// console.log("added buttons 2")







document.body.onload = function(){
    console.log("--------- cake.js onload ------------");
    
    start();
};
