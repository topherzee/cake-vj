// old school way to define a class in javascripts
VideoSource.prototype = new Source();   // assign prototype to Class
VideoSource.constructor = VideoSource;  // re-assign constructor

/**
*
* @summary
*  The videosource allows for playback of video files in the Mixer project
*  VideoSource Example on codepen:
*  <a href="https://codepen.io/xangadix/pen/zewydR" target="_blank">codepen</a>
*
*
* @description
*  The videosource allows for playback of video files in the Mixer project
*
* @implements Source
* @constructor Source#VideoSource
* @example 
* //create source
* let myVideoSource = new VideoSource( renderer, { src: 'myfile.mp4' } );
*
* // add to mixer
* someMixer = new Mixer( renderer, { source1: myVideoSource, source2: someOtherSource })
*
* // after init:
* myVideoSource.jump()
* myVideoSource.video.src = "anotherfile.mp4"
* myVideoSource.video.playbackRate = 0.4
*
* @param {GlRenderer} renderer - GlRenderer object
* @param {Object} options - (optional) JSON Object containing the initial src (source) and/or uuid
*/

function VideoSource(renderer, options) {

  // create and instance
  var _self = this;

  var texture_size = 1024

  if ( options.uuid == undefined ) {
    _self.uuid = "VideoSource_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  } else {
    _self.uuid = options.uuid
  }

  // set options
  var _options = {};
  if ( options != undefined ) _options = options;

  _self.currentSrc = "https://virtualmixproject.com/video/placeholder.mp4"
  _self.type = "VideoSource"
  _self.bypass = true;

  // create elements (private)
  var canvasElement, videoElement, canvasElementContext, videoTexture; // wrapperElement
  var alpha = 1;

  // add to renderer
  renderer.add(_self)

  // initialize
  _self.init = function() {

    // FIXME: Can we clean this up and split into several functions

    console.log("init video source", _self.uuid)

    // create video element
    videoElement = document.createElement('video');
    videoElement.setAttribute("crossorigin","anonymous")
    videoElement.setAttribute("playsinline",true)
    videoElement.playsinline = true
    videoElement.preload = 'auto'
    videoElement.muted= true
    videoElement.poster= "https://virtualmixproject.com/gif/telephone-pole-wire-tennis-shoes.jpg"

    // set the source
    if ( options.src == undefined ) {
      videoElement.src = _self.currentSrc;
    } else {
      videoElement.src = options.src
    }
    console.log('loaded source: ', videoElement.src )

    // set properties
    videoElement.height = texture_size;
    videoElement.width = texture_size;
    videoElement.volume = 0;
    videoElement.loop = true          // must call after setting/changing source
    videoElement.load();              // must call after setting/changing source
    _self.firstplay = false

    // Here we wait for a user to click and take over
    var playInterval = setInterval( function() {
      if ( videoElement.readyState == 4 ) {
        var r = Math.random() * videoElement.duration
        //videoElement.currentTime = r
        videoElement.play();
        _self.firstplay = true
        console.log(_self.uuid, "First Play; ", r)
        clearInterval(playInterval)
      }
    }, 400 )

    function firstTouch() {
      //return
      videoElement.play();
      _self.firstplay = true
      document.body.removeEventListener('click', firstTouch)
      document.body.removeEventListener('touchstart', firstTouch)
      console.log("first touch was denied")
    }
    // firstload handler for mobile; neest at least 1 user click
    document.body.addEventListener('click', firstTouch)
    document.body.addEventListener('touchstart', firstTouch)



    // FOR FIREBASE
    // listen for a timer update (as it is playing)
    // video1.addEventListener('timeupdate', function() {firebase.database().ref('/client_1/video1').child('currentTime').set( video1.currentTime );})
    // video2.currentTime = 20;

    // create canvas
    canvasElement = document.createElement('canvas');
    canvasElement.width = texture_size;
    canvasElement.height = texture_size;
    canvasElementContext = canvasElement.getContext( '2d' );

    // create the videoTexture
    videoTexture = new THREE.Texture( canvasElement );
    videoTexture.wrapS = THREE.RepeatWrapping;
    videoTexture.wrapT = THREE.RepeatWrapping;
    // videoTexture.minFilter = THREE.LinearFilter;

    // -------------------------------------------------------------------------
    // Set shader params
    // -------------------------------------------------------------------------

    // set the uniforms
    renderer.customUniforms[_self.uuid] = { type: "t", value: videoTexture }
    renderer.customUniforms[_self.uuid+'_alpha'] = { type: "f", value: alpha }
    renderer.customUniforms[_self.uuid+'_uvmap'] = { type: "v2", value: new THREE.Vector2( 1., 1. ) }
    // renderer.customUniforms[_self.uuid+'_uvmap_mod'] = { type: "v2", value: new THREE.Vector2( 1., 1. ) }

    // add uniform
    renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform sampler2D '+_self.uuid+';\n/* custom_uniforms */')
    renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_alpha;\n/* custom_uniforms */')
    renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform vec2 '+_self.uuid+'_uvmap;\n/* custom_uniforms */')
    // renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform vec2 '+_self.uuid+'_uvmap_mod;\n/* custom_uniforms */')

    // add main
    // split output in distorted and orig?
    renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_main */', `
      vec4 ${_self.uuid+'_output'} = ( texture2D( ${_self.uuid}, vUv * ${_self.uuid+'_uvmap'} ).rgba * ${_self.uuid+'_alpha'} );
      /* custom_main */
      `
    )

    // expose video and canvas
    /**
     * @description exposes the HTMLMediaElement Video for listeners and control
     * @member Source#VideoSource#video
     */
    _self.video = videoElement
    _self.canvas = canvasElement

    // remove the bypass
    _self.bypass = false
  }

  var i = 0
  _self.update = function() {


    if (_self.bypass = false) return    
    if ( videoElement && videoElement.readyState.readyState === videoElement.HAVE_ENOUGH_DATA && !videoElement.seeking) {
      canvasElementContext.drawImage( videoElement, 0, 0, texture_size, texture_size );

      if ( videoTexture ) videoTexture.needsUpdate = true;
    }else{
      canvasElementContext.drawImage( videoElement, 0, 0, texture_size, texture_size );  // send last image
      // TODO: console.log("SEND IN BLACK!") ?
      // canvasElementContext.clearRect(0, 0, 1024, 1024); // send nothing
      //_self.alpha = 0
      if ( videoTexture ) videoTexture.needsUpdate = true;
    }
  }

  // return the video texture, for direct customUniforms injection (or something)
  _self.render = function() {
    return videoTexture
  }

  // ===========================================================================
  // Actual HELPERS
  // ===========================================================================

  /**
   * @description
   *  gets or sets source @file for the videosource
   *  file has to be compatible with HTMLMediaElement Video ie. webm, mp4 etc.
   *  We recommend **mp4**
   *
   * @function Source#VideoSource#src
   * @param {file} Videofile - full path to file
   */
  _self.src = function( _file ) {
    if ( _file == undefined ) return currentSrc

    try {
      _self.currentSrc = _file
    }catch(e){
      console.log("VideoSource returned empty promise, retrying ...")
      return;
    }
    videoElement.src = _file
    videoElement.play();

    // shouldn't be a defulat
    // setTimeout( function() { _self.jump() }, 300 )

    /*
    videoElement.oncanplay( function() {
      if ( videoElement.readyState == 4 ) {
        videoElement.play();
        console.log(_self.uuid, "First Play.")
      }
    })
    */

    //var playInterval = setInterval(
    //    clearInterval(playInterval)
    //  }
    //}, 400 )
  }

  /**
   * @description start the current video
   * @function Source#VideoSource#play
   */
  _self.play =         function() { return videoElement.play() }

  /**
   * @description pauses the video
   * @function Source#VideoSource#pause
   */
  _self.pause =        function() { return videoElement.pause() }

  /**
   * @description returns true then the video is paused. False otherwise
   * @function Source#VideoSource#paused
   */
  _self.paused =       function() { return videoElement.paused }

  /**
   * @description skip to _time_ (in seconds) or gets `currentTime` in seconds
   * @function Source#VideoSource#currentTime
   * @param {float} time - time in seconds
   */
  _self.currentTime = function( _num ) {
    if ( _num === undefined ) {
      return videoElement.currentTime;
    } else {
      console.log("set time", _num)
      videoElement.currentTime = _num;
      return _num;
    }
  }

  // seconds
  /**
   * @description give the duration of the video in seconds (cannot be changed)
   * @function Source#VideoSource#duration
   */
  _self.duration =     function() { return videoElement.duration }    // seconds

  // ===========================================================================
  // For now only here, move to _source?
  // there should be a way te set up initial source data
  // ===========================================================================
  /**
   * @description skip to _time_ (in seconds) or gets `currentTime` in seconds
   * @function Source#VideoSource#setUVMap
   * @param {float} u - U (x) horizontal spacing for the texture, 1 is 1 texture, below zero is 'zooming' over 1 is tiling
   * @param {float} v - V (y) vertical spacing for the texture, 1 is 1 texture, below zero is 'zooming' over 1 is tiling
   * 
   */
  _self.setUVMap = function( _x, _y ) {
     renderer.customUniforms[_self.uuid+'_uvmap'].value = new THREE.Vector2( _x, _y )
  }

    /**
   * @description Not used at this moment
   * @function Source#VideoSource#setUVMapMod
   * @param x (u)
   * @param y (v)
   */
  _self.setUVMapMod = function( _x, _y ) {
    console.log(renderer.customUniforms)
    renderer.customUniforms[_self.uuid+'_uvmap_mod'].value = new THREE.Vector2( _x, _y )
  }

  _self.alpha = function(a) {
    if (a == undefined) {
      return renderer.customUniforms[_self.uuid+'_alpha'].value
    }else{
      renderer.customUniforms[_self.uuid+'_alpha'].value = a
    }
  }

  _self.jump = function( _num) {

    // failsafe
    if ( videoElement.readyState != 4 ) {
      console.warn("Not enough data for jumping through video...")
      return
    }

    // check num, with error handling
    if ( _num == undefined || isNaN(_num) ) {
      try {
        // var jumpto = Math.floor( ( Math.random() * videoElement.duration ) )        
        var jumpto = Math.floor( ( Math.random() * videoElement.buffered.end(0) ) )        
        console.log("jump to ", jumpto)
        videoElement.currentTime = jumpto
      }catch(e){
        console.warn("video jump prevented a race error", e)
        videoElement.currentTime = 0
      }
    } else {
      videoElement.currentTime = _num
    }
    
    return videoElement.currentTime
  }

  // ===========================================================================
  // Rerturn a reference to self
  // ===========================================================================

  // _self.init()
}
