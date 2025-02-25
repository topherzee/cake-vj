AudioAnalysis.prototype = new Addon();
AudioAnalysis.constructor = AudioAnalysis;

/**
* @summary
*   AudioAnalysis returns a BPM based on music analisis. Either mp3 or microphone
*  Audio Analysis Example on codepen:
*  <a href="https://codepen.io/xangadix/pen/VRGzdY" target="_blank">codepen</a>
*
*
* @description
*   see more at [Joe Sullivan]{@link http://joesul.li/van/beat-detection-using-web-audio/}
*   AudioAnalysis returns a floating point between 1 and 0, in sync with a bpm
*   the BPM is calculated based on an input music stream (mp3 file)
*
*   ```
*     options.audio (String) is a source, like /path/to/mymusic.mp3
*     options.microphone (Boolean) use microphone (true) or audiosource (false)
*   ```
*
*
* @example
* var mixer1 = new Mixer( _renderer, { source1: mySource, source2: myOtherSource })
* var analysis = new AudioAnalysis( renderer, { audio: 'mymusic.mp3' } );
* analysis.add( mixer1.pod )
* @constructor Addon#AudioAnalysis
* @implements Addon
* @param {GlRenderer} renderer - current {@link GlRenderer}
* @param {Object} options - object with several settings
*/

function AudioAnalysis( _renderer, _options ) {
  var _self = this

  // ---------------------------------------------------------------------------
  // exposed variables.
  _self.uuid = "Analysis_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  _self.type = "Addon"

  /**
   * @description
   *  Audio element, HTMLMediaElement AUDIO reference
   *
   * @member Addon#AudioAnalysis#audio
   * @param {HTMLMediaElement} - reference to the virtual media element
  */
  _self.audio = ""

  /**  @member Controller#AudioAnalysis#bypass {boolean} */
  _self.bypass = false

  /**
   * @description (calculated) bpm
   * @member Addon#AudioAnalysis.bpm {number}
  */
  _self.bpm = 128

  /**
   * @description number of beats since start
   * @member Addon#AudioAnalysis.beats {number}
  */
  _self.beats = 0

  /**
  * @description delayed bpm is a 'tailing' bpm. it eases jumps in bpm
  * that may cause flashes and makes sure the bpm is always 'gliding' to new values
  * @member Controller#AudioAnalysis#delayed_bpm {number}
  */
  _self.delayed_bpm = 128

  /**
  * @description Use delay (default) enables a gliding scale for the bpm and
  * makes sure no flashes occur when the bpm jumps
  * @member Controller#AudioAnalysis#use_delay {boolean}
  */
  _self.use_delay = true

  /**
  * @description The bpm may never be higher then this number
  * @member Controller#AudioAnalysis#bpm_limit {number}
  */
  _self.bpm_limit = 256

  /**
   * @description
   *  the bpm float is a reference to the current beat-edge,
   *  it represents a float between 0 and 1, with ±1 being given back every beat
   * @member Addon#AudioAnalysis.bpm {number}
  */
  _self.bpm_float = 0

  /**
   * @description bpm mod, multiplyer for bpm output, usuall 0.125, 0.25, 0.5, 2, 4 etc.
   * @member Addon#AudioAnalysis#mod
  */
  _self.mod = 1

  /** @member Addon#AudioAnalysis.bps */
  _self.bps = 1

  /** @member Addon#AudioAnalysis.sec */
  _self.sec = 0

  /** @member Addon#AudioAnalysis.count */
  _self.count = 0

  /** @member Addon#AudioAnalysis.dataSet */
  _self.dataSet

  /**
   * @description tempodate gives you a peak into the inner workins of the sampler, including bpm and 'calibrating' status
   * @member Addon#AudioAnalysis.tempoData
  */
  _self.tempoData

  /** @member Addon#AudioAnalysis.audio_src */
  _self.audio_src

  // default options
  _self.options = {
    //audio: '/radio/nsb',
    audio: '/audio/fear_is_the_mind_killer_audio.mp3',
    microphone: false
  }

  if ( _options != undefined ) {
    _self.options = _options;
  }

  // ---------------------------------------------------------------------------
  // somewhat private private
  var calibrating = true
  var nodes = []
  var c = 0
  var starttime = (new Date()).getTime()

  // add to renderer
  _renderer.add(_self)

  // setup ---------------------------------------------------------------------
  var audio = new Audio()
  _self.audio = audio

  // on mobile this is only allowed AFTER user interaction
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  var context = new(window.AudioContext || window.webkitAudioContext); // AudioContext object instance  
  var source //= context.createMediaElementSource(audio);
  var bandpassFilter = context.createBiquadFilter();
  var analyser = context.createAnalyser();
  var start = Date.now();
  var d = 0; // counter for non-rendered bpm

  // config --------------------------------------------------------------------
  // with ~ 200 samples/s it takes ~ 20 seconds to adjust at 4000 sampleLength
  var sampleLength = 4000;
  _self.dataSet = new Array(sampleLength);
  var peaks = new Array(sampleLength);
  var bufferLength
  var dataArray
  var foundpeaks = [];
  var peak_max = 60;
  var peak_min = 15;
  var treshold = 1;
  var beats_set = false;
  var intervalCounts = [];

  audio.controls = true;
  audio.loop = true;
  audio.autoplay = true;
  audio.crossorigin = "anonymous"

  // or as argument(settings.passFreq ? settings.passFreq : 350);
  bandpassFilter.type = "lowpass";
  bandpassFilter.frequency.value = 350
  bandpassFilter.Q.value = 1
  analyser.fftSize = 128;
  bufferLength = analyser.frequencyBinCount;

  _self.context = context
  _self.analyser = context
  _self.bufferLength = bufferLength
  _self.dataArray = dataArray


  /**
   * @description
   *  disconnects audio to output, this will mute the analalyser, but won't stop analysing
   * @function Addon#AudioAnalysis#disconnectOutput
   *
  */
  _self.disconnectOutput = function() {
    source.disconnect(context.destination);
  }

  /**
   * @description
   *   connects the audio source to output, making it audible
   * @function Addon#AudioAnalysis#connectOutput
   *
  */
  _self.connectOutput = function() {
    source.connect(context.destination);
  }

  /**
   * @description
   *   helper function, get's the bpm and retursn is, useful for ```mixer.bind( func )```
   * @function Addon#AudioAnalysis#getBpm
   *
  */
  _self.getBpm = function() {
    return _self.bpm
  }

  /**
   * @description
   *  firstload for mobile, forces all control to the site on click
   *  tries and forces another play-event after a click
   * @function Addon#AudioAnalysis~forceAudio
   *
  */
  var forceAudio = function() {

    // no need to force if we already have playing audio    
    if (!_self.audio.paused) { 
      context.resume()
      document.body.removeEventListener('click', forceAudio);
      document.body.removeEventListener('touchstart', forceAudio);
      return
    }
    
    console.log("AudioAnalysis is re-intialized after click initialized!", audio.src);
    context.resume().then(() => {
      audio.play();
      console.log('Playback resumed successfully');
      document.body.removeEventListener('click', forceAudio);
      document.body.removeEventListener('touchstart', forceAudio);
    });
  }

  document.body.addEventListener('click', forceAudio)
  document.body.addEventListener('touchstart', forceAudio)


  // MAIN ----------------------------------------------------------------------

  // INIT
  /** @function Addon#AudioAnalysis~init */
  _self.init = function() {
    console.log("init AudioAnalysis Addon.")

    // set audio src to optioned value
    if ( !_self.options.microphone ) {
      source = context.createMediaElementSource(audio);
      audio.src = _self.options.audio  // NSB RADIO --> 'http://37.220.36.53:7904';
      _self.audio_src = _self.options.audio
      initializeAutoBpm()

    } else {
      console.log("Audio analisis using microphone.")
      navigator.mediaDevices.getUserMedia({ audio })
      .then(function(mediaStream) {
        source = context.createMediaStreamSource(mediaStream);
        initializeAutoBpm()
        _self.disconnectOutput()
      }).catch(function(err) {
        console.log(err.name + ": " + err.message);
      }); // always check for errors at the end.
    }
  }

  // RENDER
  // returns a floating point between 1 and 0, in sync with a bpm
  /** @function Addon#AudioAnalysis#render */
  _self.render = function() {
    // returns current bpm 'position' as a value between 0 - 1
    return _self.bpm_float
  }

  // ADD
  // Adds callback function from another node and gives the
  // bpm float ( result of render() ) as an argument to that function
  /** @function Addon#AudioAnalysis#add */
  _self.add = function( _callback ) {
    nodes.push( _callback )
  }

  // SYNC
  // syncs the bpm again on the first beat
  /** @function Addon#AudioAnalysis#sync */
  _self.sync = function() {    
    starttime = new Date().getTime()
  }

  // TODO: getBlackOut
  // tries and detects "blackouts", no sound or no-beat moments
  /** @function Addon#AudioAnalysis#getBlackOut */
  _self.getBlackOut = function() {

  }

  // TODO: getAmbience
  // tries and detects "ambience", or the complexity/ sphere of sounds
  /** @function Addon#AudioAnalysis#getAmbience */
  _self.getAmbience = function() {

  }

  // TODO: getHighLevels -> also check this tutorial
  // https://www.youtube.com/watch?v=gUELH_B2wsE
  // returns 1 on high level tick
  /** @function Addon#AudioAnalysis#getHighLevels */
  _self.getHighLevels = function() {

  }

  // TODO: getMidLevels
  // returns 1 on mid level tick
  /** @function Addon#AudioAnalysis#getMidLevels */
  _self.getMidLevels = function() {

  }

  // TODO: getLowLevels
  // returns 1 on low level tick
  /** @function Addon#AudioAnalysis#getLowLevels */
  _self.getLowLevels = function() {

  }


  // ----------------------------------------------------------------------------

  // UPDATE
  /** @function Addon#AudioAnalysis~update */
  var old_bpm = 0
  _self.update = function() {
    if ( _self.bypass ) return

    // var tempoData = getTempo(dataSet)
    // getBlackout // TODO
    // getAmbience // TODO

    // TODO: Nodebase execution seems to be causing race errors in the 
    // BPM engine, propose to use mixer1.pod( audioanalysis1.render() )
    // instead of this, it seems more accurate and less error prone.
    // right now I'll leave it as a recomendation, but later we should
    // depricate this function

    // update nodes
    if ( !_self.disabled ) {
      nodes.forEach( function( node ) {
        node( _self.render() );
      });
    }

    // TODO: shouldn't we have a "sync"
    // function here, that only updates after 4 beats
    // and resets to the first beat ?
    // --> resetting start time, should do this

    // TODO: if confidence is low, don't switch ?

    // set new numbers
    _self.bpm = _self.tempodata_bpm

    if (_self.bpm > _self.bpm_limit) {
      console.warn("reached bpm limit!: ", _self.bpm, "reset bpm to limit: ", _self.bpm_limit)
      _self.bpm = _self.bpm_limit
    }

    c = ((new Date()).getTime() - starttime) / 1000;    
    _self.count = c
    //c = 0

    // make it float toward the right number
    if ( _self.use_delay ) {
      if ( _self.delayed_bpm < _self.bpm  ) { _self.delayed_bpm += 0.1 }
      if ( _self.delayed_bpm > _self.bpm  ) { _self.delayed_bpm -= 0.1 }
    }else{
      _self.delayed_bpm = _self.bpm
    }

    // what the fuck is going on...
    // 
    // sec 
    // it takes the bpm and converts it in beats per second
    // than it multiplies with count time pi
    // count is rougly 1/60 in onanumteframe
    // it needs to go through a full cycle, hence Pi (up and down)
    // c is for moving it forward along the wave

    // then sec is multiplied by a number around one for the bpm difference

    // _self.sec = ( c * Math.PI * ( (_self.bpm  )  * _self.mod ) / 60 ) // * _self.mod
    _self.sec = ( c * Math.PI * ( _self.delayed_bpm ) / 60 )      // * _self.mod
    _self.sec = _self.sec * ( old_bpm / ( _self.delayed_bpm ) )
    
    _self.bpm_float = ( Math.sin( _self.sec * _self.mod  ) + 1 ) / 2    // Math.sin( 128 / 60 ) -> 0 - 1
    
    // so actually we should move the cursor here to the 'same' point on the float
    // 

    if (_self.bpm != old_bpm) {
      //starttime = (new Date()).getTime()
      old_bpm = ( _self.delayed_bpm * _self.mod)
      // _self.sec 
    }

    if ( _self.sec > _self.delayed_bpm ) {
       starttime = (new Date()).getTime()      
       //console.warn("reset bpm ", c, Math.PI * ( _self.delayed_bpm * _self.mod) / 60)
    }

    // calculate beats based on bpm_float
    if ( _self.bpm_float > 0.9 && !beats_set ) {
      _self.beats += 1
      beats_set = true
    }else if ( _self.bpm_float < 0.1 && beats_set ) {
      _self.beats += 1
      beats_set = false 
    }
  }

  // actual --------------------------------------------------------------------

  /**
   * @description
   *  initialize autobpm, after {@link Addon#AudioAnalysis.initializeAudio}
   *  start the {@link Addon#AudioAnalysis~sampler}
   *
   * @function Addon#AudioAnalysis~initializeAutoBpm
   *
  */

  var initializeAutoBpm = function() {
    // tries and play the audio
    audio.play();

    // connect the analysier and the filter
    source.connect(bandpassFilter);
    bandpassFilter.connect(analyser);

    // send it to the speakers (or not)
    source.connect(context.destination);

    // start the sampler

    // -------------------------------------------------------------------------
    /*
      Intercept HERE -- this part should be loaded of into a web worker so it
      can be offloaded into another thread -- also do this for gif!
    */
    // -------------------------------------------------------------------------

    // this is new
    // opens in domain.com/mixer.js
    if (window.Worker) {

      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
      // var myWorker = new Worker('worker.js');
      // and myWorker.terminate();
      /*
       Inline worker (so we can pack it)
        var bb = new BlobBuilder();
        bb.append("onmessage =
        function(e)
        {
        postMessage('Inline worker creation');
        }");

        var blobURL = window.URL.createObjectURL(bb.getBlob());

        var worker = new Worker(blobURL);
        worker.onmessage = function(e) {
          alert(e.data)
        };
        worker.postMessage();
      */

      // this wil be replaced.
      // setInterval( sampler, 1);
      
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
      // var myWorker = new Worker('worker.js');
      // and myWorker.terminate();

      // Inline worker, so we can package it later
      // we only use the worker to load of this work to another thread
      console.log("go")      
      var data = `
      
        var _self = null;
        onmessage = function(e) {
          
          var data = JSON.parse(e.data)
          console.log("msgevent:", data.command );          
          _self = data.module
          if ( data.command == "start" ) {
            //setInterval( worker_sampler, 1);
            console.log("(TEST)start the worker!", _self)
          }          
        }

        postMessage('Inline worker created');          
      `

      // convert the worker to a blob and 'load' it
      var bb = new Blob([data]);
      var blobURL = window.URL.createObjectURL( bb );
      var worker = new Worker(blobURL);
      worker.onmessage = function(e) {
        console.log("module got worker message: ", e.data)
      };

      window.my_worker = worker
      //console.log("post message")      
      //worker.postMessage( JSON.stringify( {"command":"start", "module":_self }) );

      // =======================================================================            
      setInterval( sampler, 1);

    }else{
      // this is now the fallback
      setInterval( sampler, 1);
    }
  }

  // ANYLISIS STARTS HERE ------------------------------------------------------
  /**
   * @description
   *   gets the analyser.getByteTimeDomainData
   *   calculates the tempodata every 'slowpoke' (now set at samples 10/s)
   *   returns the most occuring bpm
   *
   * @function Addon#AudioAnalysis~sampler
   *
  */
  var warningWasSet = false

  // MAIN Sampler
  var sampler = function() {
    //if ( !_self.useAutoBpm ) return;
    if ( _self.audio.muted ) return;

    //if ( _self.audio_src != "" && !_self.useMicrophone ) return;
    if ( _self.bypass ) return;
    // if  no src && no mic -- return

    _self.dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(_self.dataArray)

    // precalculculations, push only the highest value of the frequency range
    var now = Date.now()
    var high = 0
    _self.dataArray.forEach( (d) => { if ( d > high ) high = d })
    _self.dataSet.push( [ now, high ] )

    // keep the set on sampleLength
    if (_self.dataSet.length > sampleLength) _self.dataSet.splice(0, _self.dataSet.length - sampleLength)
    d++

    // SLOWPOKE
    // take a snapshot every 1/10 second and calculate beat
    if ( ( now - start ) > 20 ) {

      var tempoData = getTempo(_self.dataSet)
      _self.tempoData = tempoData
      // Here are some ideas for a more complete analisis range

      // var tempoCounts = tempoData.tempoCounts
      // getBlackout // TODO -- detects blackout, prolonged, relative silence in sets
      // getAmbience // TODO -- detects overal 'business' of the sound, it's ambience

      if ( tempoData == undefined ) {
        if ( !warningWasSet ) console.warn(" WARNING: sampler is active, but no audio was detected after 20 seconds -- check your audiofile or your microphone and make sure you've clicked in the window and gave it access! Halting.")
        warningWasSet = true
        _self.tempodata_bpm = 128
        // return
      }else{
        _self.tempodata_bpm = tempoData.bpm
        warningWasSet = false
      }

      if ( _self.useAutoBPM ) _self.sec = c * Math.PI * (tempoData.bpm * _self.mod) / 60
      start = Date.now()
      d = 0
    }
  }

  // blink on the beat with element with class .blink
  var doBlink = function() {
    if ( document.getElementsByClassName('blink').length == 0 ) return
    if ( audio.paused ) {
      document.getElementsByClassName('blink')[0].style.opacity = 0
    }else{
      if (document.getElementsByClassName('blink')[0].style.opacity == 1) {
        document.getElementsByClassName('blink')[0].style.opacity = 0
      }else{
        document.getElementsByClassName('blink')[0].style.opacity = 1
      }
    }
    setTimeout( doBlink, (60/ (_self.bpm) )*1000 / _self.mod    )
  }
  doBlink()

  /**
   * @description
   *  returns 'tempodata', a list of found BPMs sorted on occurrence
   *  object includes: bpm (ie. 128), confidence (0-1), calibrating (true/false),
   *  treshold, tempocounts, foundpeaks and peaks
   * @function Addon#AudioAnalysis~getTempo
   * @params _date {object}
   *
  */
  var getTempo = function( _data ) {
    foundpeaks = []                    // reset foundpeaks
    peaks = new Array( _data.length )  // reset peaks

    // find peaks
    for ( var i = 0; i < _data.length; i++ ) {
      if ( _data[i] !== undefined && _data[i][1] > ( treshold * 128 ) ) {
        peaks[i] = [ _self.dataSet[i][0], 1 ];           // update in peaks
        foundpeaks.push( [ _data[i][0], 1 ] );     // add to foundpeaks
        i += 50;                                   // += 0.4s, to move past this peak
      }
    }

    // make sure we have enough peaks by adjusting the treshhold
    if ( foundpeaks.length < peak_min ) treshold -= 0.05;
    if ( foundpeaks.length > peak_max ) treshold += 0.05;
    if ( treshold > 2 ) treshold = 2;
    if ( treshold < 1 ) treshold = 1;

    // calculate tempo by grouping peaks and calculate interval between them
    // see: http://joesul.li/van/beat-detection-using-web-audio/
    // for more information on this method and the sources of the algroritm
    var tempoCounts = groupNeighborsByTempo( countIntervalsBetweenNearbyPeaks( foundpeaks ) );
    tempoCounts.sort( sortHelper );                             // sort tempo's by 'score', or most neighbours
    if ( tempoCounts.length == 0 ) {
      tempoCounts[0] = { tempo: 128 }; // if no temp is found, return 128

    }else{

      // DISPLAY, for debugging, requires element with an .info class
      var html = ""
      tempoCounts.reverse().forEach(function(v,i) {
        html += i + ", " + v.tempo + ", " + v.count + "\t ["
        var j = 0
        while( j < v.count) {
          html += '#'
          j++
        }
        html += ']<br/>'
      })

      if (document.getElementById('info') != null) {
        document.getElementById('info').html = html
      }

    }

    // Callibration feedback (~24 seconids)
    var confidence = "calibrating"
    calibrating = false
    
    if ( _data[0] === undefined ) {
      calibrating = true
      if ( document.getElementsByClassName('blink').length > 0 ) document.getElementsByClassName('blink')[0].style.backgroundColor = '#999999';
    }else{
      calibrating = false

      // race condition
      if (tempoCounts[0] === undefined  || tempoCounts[1] === undefined ) {
        // console.log("holdit")
        return
      }

      var confidence_mod = tempoCounts[0].count - tempoCounts[1].count
      if ( confidence_mod <= 2 ) {
        confidence = "low"
        if ( document.getElementsByClassName('blink').length > 0 ) document.getElementsByClassName('blink')[0].style.backgroundColor = '#990000';
      }else if( confidence_mod > 2 && confidence_mod <= 7) {
        confidence = "average"
        if ( document.getElementsByClassName('blink').length > 0 ) document.getElementsByClassName('blink')[0].style.backgroundColor = '#999900';
      }else if( confidence_mod > 7 ) {
        confidence = "high"
        if ( document.getElementsByClassName('blink').length > 0 ) document.getElementsByClassName('blink')[0].style.backgroundColor = '#CCCCCC';
      }
    }

    // return an object with all the necc. data.
    var tempoData = {
      bpm: tempoCounts[0].tempo,     // suggested bpm
      confidence: confidence,        // String
      calibrating: calibrating,      // ~24 seconds
      treshold: treshold,            // current treshold
      tempoCounts: tempoCounts,      // current tempoCounts
      foundpeaks: foundpeaks,        // current found peaks
      peaks: peaks                   // all peaks, for display only
    }

    //console.log(tempoData.bpm, tempoData.confidence)

    return tempoData;
  }

  // HELPERS
  // sort helper
  var sortHelper = function ( a,b ) {
    return parseInt( a.count, 10 ) - parseInt( b.count, 10 );
  }

  /**
   * @description Finds peaks in the audiodata and groups them together
   * @function Addon#AudioAnalysis~countIntervalsBetweenNearbyPeaks
   *
  */
  var countIntervalsBetweenNearbyPeaks = function( _peaks ) {

    // reset
    intervalCounts = [];

    _peaks.forEach(function(peak, index) {
      for(var i = 0; i < 10; i++) {
        if ( _peaks[index + i] !== undefined ) {
          var interval = _peaks[index + i][0] - peak[0];
          var foundInterval = intervalCounts.some( function(intervalCount) {
            if (intervalCount.interval === interval) return intervalCount.count++;
          });
          if (!foundInterval) intervalCounts.push({ interval: interval, count: 1 });
        }
      }
    });

    return intervalCounts;
  }

  // group intervalcounts by temp
  /**
   * @description
   *  map found intervals together and returns 'tempocounts', a list of found
   *  tempos and their occurences
   * @function Addon#AudioAnalysis~groupNeighborsByTempo
   *
  */
  var groupNeighborsByTempo = function( intervalCounts ) {

    // reset
    var tempoCounts = []
    var noTempo = false

    // start the interval counts
    intervalCounts.forEach(function(intervalCount, i) {

      // Convert an interval to tempo
      if (intervalCount.interval != 0 && !isNaN(intervalCount.interval)) {
        var theoreticalTempo = 60 / (intervalCount.interval / 1000)
      }

      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;

      // round to 2 beat
      theoreticalTempo = Math.round( theoreticalTempo/2 ) * 2

      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo && !noTempo )
          return tempoCount.count += intervalCount.count;
      });

      // add it to the tempoCounts
      if (!foundTempo) {
        if ( theoreticalTempo && !noTempo ) {
          tempoCounts.push({
            tempo: theoreticalTempo,
            count: intervalCount.count
          })
        }
      }
    });

    return tempoCounts
  } // end groupNeighborsByTempo
}// end AudioAnalysis
