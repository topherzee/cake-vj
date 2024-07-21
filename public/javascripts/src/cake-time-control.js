
function playVideosClosure(sources, layerTimes, bpm_tap, c){

    const FRAME_DELAY = 1 / 60;
    let frameCheck = 0;

    function playVideos () {
        if (frameCheck==0){
            updateVideo(sources[1], "1", layerTimes[1]);
            // updateVideo(sources[2], "2", layerTimes[2]);
    
            // updateVideo(sources[3], "3", layerTimes[3]);
            // updateVideo(sources[4], "4", layerTimes[4]);
        }
        frameCheck++;
        if (frameCheck == 3){
            frameCheck = 0;
        }
        
        let r = bpm_tap.render2(1)//layerTime.bpm_factor
    
        requestAnimationFrame(playVideos);
    };

    playVideos();


function bps(bpm){
    return 1 / (bpm / 60.0);
}

function updateVideo(source, layer, layerTime){

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

    // -----------------------------------------------------------------------------
    // DETERMINE DURATION & TIMERATIO (Including in and out.)

    // TIMERATIO is the ratio in actual playback time.

    var timeRatio;

    let end = video.duration;
    if (layerTime.out != -1){
        end = layerTime.out;
    }
    let start = 0;
    if (layerTime.in != -1){
        start = layerTime.in;
    }
    let duration = (end - start);


    
    // Note: time_last_beat is the last time it reset / jumped.

    let time_elapsed = (Date.now() - layerTime.time_last_beat) / 1000;
   
    //Include speed? maybe time_elapsed += speed?

    if (layerTime.just_reversed){
        // just_reversed - actually means that the play mode changed just now.

        // If direction changed, to prevent a jump in time, 
        // We need to reset layerTime.time_last_beat. Because all timing is based on that time point.

        layerTime.just_reversed = false;
        var timeRatioR = time_elapsed / duration;

        let ratioChunk = (1 - timeRatioR) - timeRatioR;

        layerTime.time_last_beat -= (ratioChunk *  duration) * 1000;

        //recalc.
        time_elapsed = (Date.now() - layerTime.time_last_beat) / 1000;
    }

    // Check for a loop - // Check if BPM wants to create a beat.

    let loopFlag = false;

    if (!layerTime.bpm_on ){

        if (time_elapsed > duration){
            console.log("loop normal")
            loopFlag = true;
        }

    }else if (layerTime.bpm_on ){
        
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


    // Set timeRatio.
    timeRatio = time_elapsed / duration;

    if (layerTime.bpm_on){

        if (layerTime.bpm_mode == c.BPM_MODE_STRETCH){
            timeRatio = bpm_tap.render2(layerTime.bpm_factor) ;
        } 

    }


    // ? What if it is a cut, but the sample time is shorter than beat?

    // -----------------------------------------------------------------------------
    // Use DURATION & TIMERATIO in function.

    let time = 0;
    if (layerTime.play_mode == c.PLAY_MODE_FORWARD){
        time = start + timeRatio * duration;

    } else if (layerTime.play_mode == c.PLAY_MODE_REVERSE){
        time = start + (1.0 -timeRatio) * duration;

    } else if (layerTime.play_mode == c.PLAY_MODE_BOUNCE){

        if (layerTime.is_bounce_reverse == false){
            time = start + timeRatio * duration;
        }else{
            time = start + (1.0 -timeRatio) * duration;
        }
        
    }

    if (isFinite(time)){
        video.currentTime = time;
    }else{
        console.log("warn updateVideo infinite time", time)
    }
    
    //full time scrubber - not the current loop or anything
    var scrubber = document.getElementById('layer_time_' + layer );
    if (scrubber){
        scrubber.value = video.currentTime / video.duration;
    }
}

}//closure