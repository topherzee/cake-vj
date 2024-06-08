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

    document.getElementById('btn_switch_layer_' + i).onclick = function() {
        newActiveLayer(i);
    }
}

function addLayers() {
    console.log("addLayers")
    
    addLayer("channel_2_layers", 4);
    addLayer("channel_2_layers", 3);
    addLayer("channel_1_layers", 2);
    addLayer("channel_1_layers", 1);
}

addLayers();

// lets not forget the bpm
var bpm_tap = new BPM( renderer );
let sources = new Array();
sources[1]= new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 grate 03 texture.mp4", uuid:"Video_1", fragmentChannel:1, elementId:"monitor_1",});
sources[2] = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 container 02 scape.mp4", uuid:"Video_2", fragmentChannel:1, elementId:"monitor_2"});
//var sources[2] = new VideoSource(renderer, {src: "/video/DCVS01/DCVS01 wires 03 shift.mp4",});
// var sources[2] = new GifSource(renderer, {src: "/images/640X480.gif",});
// var sources[2] = new VideoSource(renderer, {src: "/video/disco/ymca-nosound.mp4", uuid:"Video_2"});

// var sources[3] = new VideoSource(renderer, {src: "/video/disco/september-nosound.mp4",});

sources[3] = new VideoSource(renderer, {src: "/images/640X480.gif", fragmentChannel:2,  uuid:"Gif_3", elementId:"monitor_3",});
sources[4]= new VideoSource(renderer, {src: "/images/animal.gif", fragmentChannel:2, uuid:"Gif_4" , elementId:"monitor_4", });

var FILE_URL_1 = "http://localhost:4000/files/DCVS01"
var FILE_URL_2 = "http://localhost:4000/files/disco"
var FILE_URL_ROOT = "http://localhost:4000/files"
  
function handleClipClick(url) {
    console.log("clipp click:" + url);
    url = "/video/" + url;
    sources[activeLayer].src(url);
}

//TODO - does not seem like is should be necessary - or setTimeout() instead.
var playInterval = setInterval( function() {
    // sources[2].video.pause();
    // sources[1].pause();
    // sources[2].pause();
    // sources[3].pause();
    // sources[3].pause();
    // sources[4].pause();
    // console.log("FDSFDSFDSFDSFDSFDFSFS-------")


},1000);
  
var layer_1_effect = new DistortionEffect(renderer, { source: sources[1],  fragmentChannel:1,  uuid:"Dist_1"} );
var layer_2_effect = new DistortionEffect(renderer, { source: sources[2],  fragmentChannel:1,  uuid:"Dist_2"} );

var layer_3_effect = new DistortionEffect(renderer, { source: sources[3],  fragmentChannel:2,  uuid:"Dist_3"} );
var layer_4_effect = new DistortionEffect(renderer, { source: sources[4],  fragmentChannel:2,  uuid:"Dist_4"} );

var solid_black = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0 }, uuid:"Solid_Black" } );
var solid_black2 = new SolidSource( renderer, { color: { r:0.0, g:0.0, b:0.0, }, fragmentChannel:2, uuid:"Solid_Black2" } );

// var layer_3_mixer = new Mixer( renderer, { sources[1]: trans_black, sources[2]: layer_3_effect,  uuid: "Mixer_3"  } )
var channel_1_a_mixer = new Mixer( renderer, { source1: sources[1], source2: solid_black,  uuid: "Mixer_1_a"  } )
var channel_1_b_mixer = new Mixer( renderer, { source1: sources[2], source2: channel_1_a_mixer,  uuid: "Mixer_1_b"  } )

var channel_2_a_mixer = new Mixer( renderer, { source1: sources[3], source2: solid_black2,  uuid: "Mixer_2_a", fragmentChannel:2 } )
var channel_2_b_mixer = new Mixer( renderer, { source1: sources[4], source2: channel_2_a_mixer,  uuid: "Mixer_2_b", fragmentChannel:2  } )


var output;
// if (typeof layer_4_effect !=='undefined'){
//     output = new Output( renderer, layer_3_effect, layer_4_effect )
// }else{
//     output = new Output( renderer, layer_3_effect )
// }

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

layer_1_effect.effect(TOPHER_ONLY_CIRCLE);
layer_2_effect.effect(TOPHER_ONLY_CIRCLE);

layer_3_effect.effect(TOPHER_ONLY_CIRCLE);
layer_4_effect.effect(TOPHER_ONLY_CIRCLE);

//  layer_1_effect.extra( Number(document.getElementById('effects_a_control').value) )
const NAM = 3;
const FAM = 4;
const LUM1 = 10;
const LUM2 = 11;
const BOOM = 9

setTimeout(() => {
    
    document.getElementById('layer_2_fader').value = 1.0
    document.getElementById('layer_1_fader').value = 1.0
    sources[1].pause();
    sources[2].pause();
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

var blend_select_2 =  document.getElementById('layer_2_blendmode')

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


document.getElementById('layer_2_blendmode').oninput = function() {
    channel_1_b_mixer.blendMode(this.value);
    console.log("channel_1_b_mixer >>", parseFloat(this.value) )
}


document.getElementById('layer_1_fader').oninput = function() {
    channel_1_a_mixer.pod(this.value)
    // console.log("layer_1_fader >>", parseFloat(this.value) )
}
document.getElementById('layer_2_fader').oninput = function() {
    channel_1_b_mixer.pod(this.value)
    // console.log("layer_2_fader >>", parseFloat(this.value) )
}
document.getElementById('layer_3_fader').oninput = function() {
    channel_2_a_mixer.pod(this.value)
    // console.log("layer_3_fader >>", parseFloat(this.value) )
}
document.getElementById('layer_4_fader').oninput = function() {
    channel_2_b_mixer.pod(this.value)
    // console.log("layer_4_fader >>", parseFloat(this.value) )
}


// document.getElementById('layer_1_effect').oninput = function() {
//     layer_1_effect.extra(this.value)
//     console.log("layer_1_effect >>", parseFloat(this.value) )
// }
// document.getElementById('layer_2_effect').oninput = function() {
//     layer_2_effect.extra(this.value)
//     console.log("layer_2_effect >>", parseFloat(this.value) )
// }
// // document.getElementById('layer_2_effect').oninput = function() {
// //     layer_2_effect.extra(this.value)
// //     console.log("layer_2_effect >>", parseFloat(this.value) )
// // }

// document.getElementById('layer_1_time').oninput = function() {
//     var sec = this.value * sources[1].duration();
//     sources[1].currentTime(sec);
//     console.log("layer_1_time >>", parseFloat(this.value) , parseFloat(sec) )
// }
// document.getElementById('layer_2_time').oninput = function() {
//     var sec = this.value * sources[1].duration();
//     sources[2].currentTime(sec);
//     console.log("layer_2_time >>", parseFloat(this.value) , parseFloat(sec) )
// }
// document.getElementById('layer_3_time').oninput = function() {
//     var sec = this.value * sources[1].duration();
//     sources[3].currentTime(sec);
//     console.log("layer_3_time >>", parseFloat(this.value) , parseFloat(sec) )
// }





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
let rate1 = 0.1;
let rate2 = 0.1;
let rate3 = 0.1;
let rate4 = 0.1;

let time1 = 0.0;
let time2 = 0.0;
let time3 = 0.0;

function updateVideo(video, rate, time, layer){

    if (video == null || ! video.hasOwnProperty("duration")){
        return;

    }
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
        // time1 = updateVideo(sources[1].video, rate1, time1, "1");
        // time2 = updateVideo(sources[2].video, rate2, time2, "2");
        // time3 = updateVideo(sources[3].video, rate3, time3, "3");
    }
    frameCheck++;
    if (frameCheck == 3){
        frameCheck = 0;
    }

  requestAnimationFrame(playVideos);
};

if (TIME_BY_TOPHER){
    playVideos();
}else{
    //something
}

// document.getElementById('layer_3_speed').oninput = function() {
//     rate3 = this.value
//     console.log("layer_3_speed >>", parseFloat(this.value) )
// }
// document.getElementById('layer_2_speed').oninput = function() {
//     rate2 = this.value
//     console.log("layer_2_speed >>", parseFloat(this.value) )
// }
// document.getElementById('layer_1_speed').oninput = function() {
//     rate1 = this.value
//     console.log("layer_1_speed >>", parseFloat(this.value) )
// }



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
