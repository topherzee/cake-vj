/*
* Example V4
*
* Elaborate mixer that uses several control interfaces
* and chains, to emulate an Edirol v4, More or less.
*
*/


 async function start(){

    console.log("CAKE Start --------------------");


var TIME_BY_TOPHER = true;

// renderer
var renderer = new GlRenderer({element: 'glcanvas', width:800, height:450});

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

    document.getElementById('layer_effect_' + i).oninput = function() {
        layer_effects[i].extra(this.value)
        // console.log("layer_effect " + i + " >>", parseFloat(this.value) )
    }

    document.getElementById('btn_bpm_layer_' + i).onclick = function() {
        layerTimes[i].bpm_on = ! layerTimes[i].bpm_on;

        console.log("bpm layer " + i + " >>", layerTimes[i].bpm_on )

        let el = document.getElementById('btn_bpm_layer_' + i);
        if (layerTimes[i].bpm_on){
            el.classList.add("active");
        }else{
            el.classList.remove("active");
        }
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



    // document.getElementById('bpm_tab').onmousedown = function() {
    //     bpm_tap.tap()
    //     channel_1_b_mixer.bpm(bpm_tap.bpm)
    //     document.getElementById('bpm_display').textContent = Math.round(bpm_tap.bpm)
    //   }
}





function addLayers() {
    console.log("addLayers")
    
    addLayer("channel_2_layers", 4);
    addLayer("channel_2_layers", 3);
    addLayer("channel_1_layers", 2);
    addLayer("channel_1_layers", 1);
}

addLayers();

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

sources[1]= new FlexSource(renderer, {src: "/video/DCVS01/DCVS01 container 01 ominouslong chop.mp4", uuid:"Video_1", fragmentChannel:1, elementId:"monitor_1",});
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

    sources[activeLayer].src(url);
    sources[activeLayer].pause();
}
  
layer_effects[1] = new DistortionEffect(renderer, { source: sources[1],  fragmentChannel:1,  uuid:"Dist_1"} );
layer_effects[2] = new DistortionEffect(renderer, { source: sources[2],  fragmentChannel:1,  uuid:"Dist_2"} );

layer_effects[3] = new DistortionEffect(renderer, { source: sources[3],  fragmentChannel:2,  uuid:"Dist_3"} );
layer_effects[4] = new DistortionEffect(renderer, { source: sources[4],  fragmentChannel:2,  uuid:"Dist_4"} );

var solid_black = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0 }, uuid:"Solid_Black" } );
var solid_black2 = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0, }, fragmentChannel:2, uuid:"Solid_Black2" } );

// var layer_3_mixer = new Mixer( renderer, { sources[1]: trans_black, sources[2]: layer_3_effect,  uuid: "Mixer_3"  } )
var channel_1_a_mixer = new Mixer( renderer, { source1: layer_effects[1], source2: solid_black,  uuid: "Mixer_1_a"  } )
var channel_1_b_mixer = new Mixer( renderer, { source1: layer_effects[2], source2: channel_1_a_mixer,  uuid: "Mixer_1_b"  } )

var channel_2_a_mixer = new Mixer( renderer, { source1: layer_effects[3], source2: solid_black2,  uuid: "Mixer_2_a", fragmentChannel:2 } )
var channel_2_b_mixer = new Mixer( renderer, { source1: layer_effects[4], source2: channel_2_a_mixer,  uuid: "Mixer_2_b", fragmentChannel:2  } )

// channel_1_b_mixer.setAutoFade(true);

var output;
// if (typeof layer_4_effect !=='undefined'){
//     output = new Output( renderer, layer_3_effect, layer_4_effect )
// }else{
//     output = new Output( renderer, layer_3_effect )
// }

// output = new Output( renderer, channel_1_b_mixer)
// output = new Output( renderer, layer_effects[1])
output = new Output( renderer, channel_1_b_mixer, channel_2_b_mixer )


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
const TOPHER_ONLY_SQUASH = 104;
const TOPHER_ONLY_CIRCLE = 105;

const CAKE_MIRROR_VERICAL = 106;
const CAKE_MIRROR_HORIZONTAL = 107;
const CAKE_WIPE_HORIZONTAL = 108;

layer_effects[1].effect(CAKE_MIRROR_HORIZONTAL);
layer_effects[2].effect(CAKE_MIRROR_HORIZONTAL);

layer_effects[3].effect(TOPHER_ONLY_CIRCLE);
layer_effects[4].effect(TOPHER_ONLY_CIRCLE);

layer_effects[1].extra(0.9);
layer_effects[2].extra(0.9);


const NAM = 3;
const FAM = 4;
const LUM1 = 10;
const LUM2 = 11;
const BOOM = 9

channel_1_b_mixer.pod(0.0);
channel_1_a_mixer.pod(1.0);

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
    for (let i=1;   i<5; i++){
        el = document.getElementById('layer_' + i);
        el.classList.remove("active");
    }

    el = document.getElementById('layer_' + newLayer);
    el.classList.add("active");

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
    video.currentTime = time;
    
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
        // console.log("type", sources[1].type2)
        // time2 = updateVideo(sources[2].video, rate2, time2, "2");
        // time3 = updateVideo(sources[3].video, rate3, time3, "3");
    }
    frameCheck++;
    if (frameCheck == 3){
        frameCheck = 0;
    }

  requestAnimationFrame(playVideos);
};
const PLAY_MODE_FORWARD = "FORWARD";
const PLAY_MODE_REVERSE = "REVERSE";
const PLAY_MODE_BOUNCE = "BOUNCE";
const PLAY_MODE_RANDOM = "RANDOM";

const BPM_MODE_STRETCH = "STRETCH";
const BPM_MODE_CUT = "CUT";


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



if (TIME_BY_TOPHER){
    playVideos();
}else{
    //something
}





  // -----------------------------------------------------------------------------
    // BPM TAP EN SLIDER

    document.getElementById('bpm_tab').onmousedown = function() {
        var tapPhase = bpm_tap.tapCake();
        if (tapPhase == "TAP_PHASE_SET_LENGTH"){
            document.getElementById('bpm_tab').classList.add("bpm-set-length")
        }else{
            document.getElementById('bpm_tab').classList.remove("bpm-set-length")
        }
        // resetLayerTimes();
        //channel_1_b_mixer.bpm(bpm_tap.bpm)
        document.getElementById('bpm_display').textContent = Math.round(bpm_tap.bpm);
        document.getElementById('bpm_slide').value = Math.round(bpm_tap.bpm);
        
      }

      document.getElementById('bpm_reset').onmousedown = function() {
        bpm_tap.resetCake();
        document.getElementById('bpm_reset').classList.add("phase")



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
