BPM.prototype = new Addon(); // assign prototype to marqer
BPM.constructor = BPM;  // re-assign constructor

/**
 * @summary
 *   BPM calculates beat per minutes based on a 'tap' function
 *   Tapped BPM Example on codepen:
 *   <a href="https://codepen.io/xangadix/pen/drqzPr" target="_blank">codepen</a>
 *
 * @description
 *   BPM returns a floating point between 1 and 0, in sync with a bpm the BPM is calculated based on a 'tap' function
 *
 * @example
 * var mixer1 = new Mixer( renderer, { source1: mySource, source2: myOtherSource })
 * var bpm = new BPM( renderer );
 * bpm.add( mixer1.pod )
 * window.addEventListener('keypress', function(ev) {
 *   if (ev.which == 13) bpm.tap()
 * })
 *
 * @constructor Addon#BPM
 * @implements Addon
 * @param {GlRenderer} renderer
 * @param {Object} options optional
 */

function BPM( renderer, options ) {

  var _self = this
  _self.function_list = [
    ["AUTO", "method", "toggleAutoBpm"],
    ["MODDOWN", "method", "modDown"],
    ["MODUP", "method", "modUp"],
    ["MOD", "method", "modNum"]
  ]

  // only return the functionlist
  if ( renderer == undefined ) return

  // exposed variables.
  _self.uuid = "BPM_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  window["bpm_" + _self.uuid]
  _self.type = "Addon"

  // set options
  _self.options = {}
  if ( options != undefined ) _self.options = options
  /**
   * @description Beats Per Minute
   * @member Addon#BPM#bpm
   * @param {number} Beats per minute
   *
   *  actual Beats Per Minute
   *
  */
  _self.bpm = 128

  /**
   * @description Tapping beat control
   * @member Addon#BPM#bps
   *
   *  beats per second
   *
  */
  _self.bps = 2.133333         //


  /**
   * @description Second counter
   * @member Addon#BPM#sec
   *
   *  second counter, from which the actual float is calculated
   *
  */
  _self.sec = 0                //

  /**
   * @description
   *  BPM Float, current *position* of the BPM
   *  If the BMP is a Sinus going up and down, the float shows up where it is on the curve
   *  'up' is 1 and down is '0', oscillating.
   * @member Addon#BPM#bpm_float
  */
  _self.bpm_float = 0.46875    // 60 / 128, current float of bpm

  /**
   * @description Tapping beat control
   * @member Addon#BPM#mod
  */
  _self.mod = 1                // 0.25, 0.5, 1, 2, 4, etc.

  /**
   * @description Audio analysis
   * @member Addon#BPM#useAutoBpm#
   * @member Addon#BPM#autoBpmData#
   * @member Addon#BPM#tempodata_bpm#
   * @member Addon#BPM#audio_src
   * @member Addon#BPM#useMicrophone
   */
  _self.useAutoBpm = false      // auto bpm
  _self.tempodata_bpm = 128     // from music
  _self.mute = false
  _self.autoBpmData = {}       // info object for the auto bpm

  _self.audio_src = ""         // audio file or stream (useMicrophone = false)

  // TODO
  _self.useMicrophone = false  // use useMicrophone for autoBPM

  // DEPRICATED
  _self.bypass = false


  // source.renderer ?
  var nodes = []

  // counter
  var c = 0

  // add to renderer
  renderer.add( _self )


  // main ----------------------------------------------------------------------
  // init with a tap contoller
  _self.init = function() {
    console.log("init BPM contoller.")

    // initialize autoBPM with an audio object
    // initializeAutoBpm()
  }

  // UPDATE
  var starttime = (new Date()).getTime()
  var timeElapsed = 0;

  _self.update = function() {

    if ( !_self.disabled ) {
      nodes.forEach( function( node ) {
        node( _self.render() );
      });
    }

    timeElapsed = ((new Date()).getTime() - starttime) / 1000;
    var secondsPerBeat = 1 / _self.bpm * 60;
    _self.bpm_float = (timeElapsed % secondsPerBeat) / secondsPerBeat;
    // console.log("bpm float: ", (_self.bpm_float).toFixed(2))
  }

  // add nodes, implicit
  _self.add = function( _func ) {
    nodes.push( _func )
  }

  _self.render = function(factor) {
    // returns current bpm 'position' as a value between 0 - 1
    return _self.bpm_float
    
  }

  //Pass in factor to get different speeds.
  _self.render2 = function(factor) {
    // returns current bpm 'position' as a value between 0 - 1

    if (factor === undefined){
      return _self.bpm_float
    } else{
      var secondsPerBeat = 1 / _self.bpm * 60 * factor;
      return (timeElapsed % secondsPerBeat) / secondsPerBeat;
    }
    
  }

  


  // actual --------------------------------------------------------------------
  /**
   * @description double the bpm
   * @function Addon#BPM#modUp
  */
  _self.modUp = function() { _self.mod *= 2; }
  /**
   * @description half the bpm
   * @function Addon#BPM#modDown
  */
  _self.modDown = function() { _self.mod *= .5; }


  _self.modNum = function(_num) {
    console.log("MOD ", _num)
    var oldState = _self.useAutoBpm
    _self.mod = _num;
    _self.useAutoBpm = oldState
  }

  _self.toggleAutoBpm = function( _num ) {
    _self.useAutoBpm  = !_self.useAutoBpm
    console.log("--->", _self.useAutoBpm  )
  }

  _self.turnOff = function() {
    bpm.audio.muted = false
    bpm.useAutoBpm = false
  }

  // ---------------------------------------------------------------------------
  // Tapped beat control
  // var last = Number(new Date());
  var bpms = [ 128, 128 ,128 ,128 ,128 ];
  // var time = 0;
  var avg = 0;


  /** A different tap. Uses no averages.
   * Tap 1. Set the time.
   * Tapp 2. Set the duration.
   */
  const TAP_PHASE_PRIME = "TAP_PHASE_PRIME";
  const TAP_PHASE_SET_LENGTH = "TAP_PHASE_SET_LENGTH";
  var tapPhase = TAP_PHASE_PRIME;

  var timeStart = 0;

  _self.tapCake = function() {
    _self.useAutoBPM = false

    if ( tapPhase == TAP_PHASE_PRIME) {

      tapPhase = TAP_PHASE_SET_LENGTH;
      timeStart  = Number(new Date());
      console.log("BPM TAP. Start.");

    }else if (tapPhase == TAP_PHASE_SET_LENGTH) {
      tapPhase = TAP_PHASE_PRIME;

      var timeBetweenClicks = Number(new Date()) - timeStart;
      _self.bpm = 60000 / timeBetweenClicks;
      _self.resetCake();

      console.log("BPM TAP. Complete. seconds:", (timeBetweenClicks/1000).toFixed(2));
      console.log("BPM TAP. Complete. bpm:", (_self.bpm).toFixed(2));
    }

    return tapPhase;
  }

  //reset the bpm time
  _self.resetCake = function() {
    // _self.bpm_float;
    starttime = (new Date()).getTime()
    _self.update();
    console.log("ResetCake bpm", _self.bpm_float)
    // console.log("ResetCake sec", _self.sec )
  }

  /**
   * @description Gets the current BPM (in bpm, as render() gives a float)
   * @function Addon#BPM#getBpm
   */
  _self.getBpm = function() {
    return _self.bpm
  }

  _self.setBpm = function(newBpm) {
    _self.bpm = newBpm;
    console.log("setBpm", newBpm);
  }

  console.log("set keypress")
  window.addEventListener('keypress', function(ev) {
    console.log(">>> ", ev.which)
    if ( ev.which == 116 || ev.which == 32    ) {
      _self.tap()
      console.log(_self.bpm)
    }
  })

} // end BPM
