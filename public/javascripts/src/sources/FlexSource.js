// old school way to define a class in javascripts
FlexSource.prototype = new Source();   // assign prototype to Class
FlexSource.constructor = FlexSource;  // re-assign constructor

/**
*
* @summary
*  The videosource allows for playback of video files in the Mixer project
*  FlexSource Example on codepen:
*  <a href="https://codepen.io/xangadix/pen/zewydR" target="_blank">codepen</a>
*
*
* @description
*  The videosource allows for playback of video files in the Mixer project
*
* @implements Source
* @constructor Source#FlexSource
* @example 
* //create source
* let myFlexSource = new FlexSource( renderer, { src: 'myfile.mp4' } );
*
* // add to mixer
* someMixer = new Mixer( renderer, { source1: myFlexSource, source2: someOtherSource })
*
* // after init:
* myFlexSource.jump()
* myFlexSource.video.src = "anotherfile.mp4"
* myFlexSource.video.playbackRate = 0.4
*
* @param {GlRenderer} renderer - GlRenderer object
* @param {Object} options - (optional) JSON Object containing the initial src (source) and/or uuid
*/

function FlexSource(renderer, options) {

  // create and instance
  var _self = this;

  var texture_size = 1024

  if ( options.uuid == undefined ) {
    _self.uuid = "FlexSource_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  } else {
    _self.uuid = options.uuid
  }

  if ( options.fragmentChannel == undefined ) {
    _self._fragmentChannel = 1;
    } else {
    _self._fragmentChannel = options.fragmentChannel;
  }

  // set options
  var _options = {};
  if ( options != undefined ) _options = options;

  if ( options.texture_size ) {
    console.log("texture size now is: ", options.texture_size)
    texture_size = options.texture_size
  }

  if ( options.elementId ) {
    // console.log("texture size now is: ", options.texture_size)
    _self.elementId = options.elementId
  }else{
    _self.elementId = "monitor_1";
  }



  _self.currentSrc = "https://virtualmixproject.com/video/placeholder.mp4"
  
  _self.type = "FlexSource"
  _self.bypass = true;

  _self.currentSrc = options.src;

  // Determine type.
  let ext = options.src.split('.').pop();
  console.log("FlexSource. ext", ext)
  if (ext == "mp4"){
    _self.type2 = "Video" //Video or image
  } else if (ext == "png" || ext == "jpg"  || ext == "gif"){
    _self.type2 = "Image" //Video or image
  } else {
    console.log("Unknown Source:", options.src)
  }


     // hoist an own bpm here
     var currentBPM = 128
     var currentMOD = 1
     var currentBpmFunc = function() { return currentBPM; }
     _self.bpmFollow = false
     _self.fading = false
  
  

  // create elements (private)
  var canvasElement, videoElement, canvasElementContext, videoTexture; // wrapperElement
  var gifElement;
  var alpha = 1;

  // add to renderer
  renderer.add(_self)

  // initialize
  _self.init = function() {

    // FIXME: Can we clean this up and split into several functions

    console.log("init Flex video source", _self.uuid)

    // if (_self.type2 == "Video" ){
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

      videoElement.addEventListener( "loadedmetadata", function (e) {
        var width = this.videoWidth,
            height = this.videoHeight;
            console.log("WWWWW video width: ", width, height)
            console.log("WWWWW video duration: ", videoElement.duration)
      }, false );

      // Here we wait for a user to click and take over
      var playInterval = setInterval( function() {
        if ( videoElement.readyState == 4 ) {
          var r = Math.random() * videoElement.duration
          //videoElement.currentTime = r
          // videoElement.play(); We want it paused because cake controls the playback.

          _self.firstplay = true
          console.log(_self.uuid, "First Play; ", r)
          clearInterval(playInterval)
        }
      }, 400 )


      function firstTouch() {
        //return
        // videoElement.play(); We want it paused because cake controls the playback.
        _self.firstplay = true
        document.body.removeEventListener('click', firstTouch)
        document.body.removeEventListener('touchstart', firstTouch)
        console.log("first touch was denied")
      }
      // firstload handler for mobile; neest at least 1 user click
      document.body.addEventListener('click', firstTouch)
      document.body.addEventListener('touchstart', firstTouch)
  

    // }// Type == Video
   

    // create canvas
    
    // canvasElement = document.createElement('canvas');
    canvasElement = document.getElementById(_self.elementId);
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


    if (_self._fragmentChannel == 1){
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
  }else{
      // add uniform
      renderer.fragmentShader2 = renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform sampler2D '+_self.uuid+';\n/* custom_uniforms */')
      renderer.fragmentShader2 = renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_alpha;\n/* custom_uniforms */')
      renderer.fragmentShader2 = renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform vec2 '+_self.uuid+'_uvmap;\n/* custom_uniforms */')
      // renderer.fragmentShader = renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform vec2 '+_self.uuid+'_uvmap_mod;\n/* custom_uniforms */')
      // add main
      // split output in distorted and orig?
      renderer.fragmentShader2 = renderer.fragmentShader2.replace('/* custom_main */', `
        vec4 ${_self.uuid+'_output'} = ( texture2D( ${_self.uuid}, vUv * ${_self.uuid+'_uvmap'} ).rgba * ${_self.uuid+'_alpha'} );
        /* custom_main */
        `
      )

  }



    // expose video and canvas
    /**
     * @description exposes the HTMLMediaElement Video for listeners and control
     * @member Source#FlexSource#video
     */
    _self.video = videoElement
    _self.canvas = canvasElement


    // if (_self.type2 == "Image" ){

      // actual gif stuff
      window.image_source = new Image()

      // $('body').append("<div id='gif_"+_self.uuid+"' rel:auto_play='1'></div>");
      gifElement = document.createElement('img')
      gifElement.setAttribute('id', 'gif_'+_self.uuid)
      gifElement.setAttribute('rel:auto_play', '1')
      // supergifelement = new SuperGif( { gif: gifElement, c_w: "1024px", c_h: "576px" } );
      // supergifelement = new SuperGif( { gif: gifElement, c_w: "640px", c_h: "480px" } );
      // supergifelement.draw_while_loading = true

      // sup1.load();
      console.log(_self.uuid, " Load", _self.currentSrc, "..." )
      //supergifelement.load_url( _self.currentSrc )

      _self.newImg = new Image();

      _self.newImg.onload = function() {
        var height = _self.newImg.height;
        var width = _self.newImg.width;
        // console.log ('MMMMMM The image size is '+width+'*'+height);
        _self.imageWidth = width;
        _self.imageHeight = height;

      }

      
      _self.newImg.src = _self.currentSrc;
      

      console.log('FlexSource/Image Loaded First source!', _self.currentSrc, "!")
    // }

    // remove the bypass
    _self.bypass = false
  }


  var i = 0
  _self.update = function() {

    // Handle aspect ratio of source. Convert to 16x9.
    let raw_ratio = 16.0 / 9.0;
    let image_ratio= 4.0/ 3.0;
    
    if (_self.type2 == "Video" ){
      if (videoElement.videoWidth){
        image_ratio= videoElement.videoWidth/ videoElement.videoHeight;
      }
    }
    if (_self.type2 == "Image" ){
      if (_self.imageWidth){
        image_ratio= _self.imageWidth/ _self.imageHeight;
      }
    }

    let ratio = raw_ratio / image_ratio;
    let widthS = texture_size / ratio;
    let offsetS = (texture_size - widthS) /2;


    if (_self.bypass = false) return    


    if (_self.type2 == "Video" ){
      if ( videoElement && videoElement.readyState.readyState === videoElement.HAVE_ENOUGH_DATA && !videoElement.seeking) {
        canvasElementContext.drawImage( videoElement, offsetS, 0, widthS, texture_size );  // send last image
        
        if ( videoTexture ) videoTexture.needsUpdate = true;
      }else{
        canvasElementContext.drawImage( videoElement, offsetS, 0, widthS, texture_size );  // send last image
        if ( videoTexture ) videoTexture.needsUpdate = true;
      }
    }
    if (_self.type2 == "Image" ){
      try {
        canvasElementContext.clearRect(0, 0, 1024, 1024);
        // canvasElementContext.drawImage( supergifelement.get_canvas(), offsetS, 0, widthS, 1024  );
        canvasElementContext.drawImage( _self.newImg, offsetS, 0, widthS, 1024  );
        if ( videoTexture ) videoTexture.needsUpdate = true;
        // if ( gifTexture ) gifTexture.needsUpdate = true;
      }catch(e){
        // not yet
      }
    }

    if ( _self.bpmFollow ) { // maybe call this bpmFollow?
      // pod = currentBPM
      currentBPM = currentBpmFunc()
      c = ((new Date()).getTime() - starttime) / 1000;
      let timeRatio = ( Math.sin( c * Math.PI * currentBPM * currentMOD / 60 ) / 2 + 0.5 )
      // _self.pod(  )
      videoElement.currentTime = timeRatio;

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
   * @function Source#FlexSource#src
   * @param {file} Videofile - full path to file
   */
  _self.src = function( _file ) {
    if ( _file == undefined ) return currentSrc

    try {
      _self.currentSrc = _file
      console.log("FlexSource set", _self.currentSrc)
    }catch(e){
      console.log("FlexSource returned empty promise, retrying ...")
      return;
    }

      // Determine type.
      let ext = _file.split('.').pop();
      console.log("FlexSource. ext", ext)
      if (ext == "mp4"){
        _self.type2 = "Video" //Video or image
      } else if (ext == "png" || ext == "jpg"){
        _self.type2 = "Image" //Video or image
      } else {
        console.log("Unknown Source:", options.src)
      }

    if (_self.type2 == "Video" ){
      videoElement.src = _file
      // videoElement.play(); We want it paused because cake controls the playback.
    }
    if (_self.type2 == "Image" ){
      console.log("load new src: ", _file)
      _self.currentSrc = _file
      _self.newImg.src = _self.currentSrc;
    }
    if ( videoTexture ) videoTexture.needsUpdate = true;

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
   * @function Source#FlexSource#play
   */
  _self.play =         function() { return videoElement.play() }

  /**
   * @description pauses the video
   * @function Source#FlexSource#pause
   */
  _self.pause =        function() { return videoElement.pause() }

  /**
   * @description returns true then the video is paused. False otherwise
   * @function Source#FlexSource#paused
   */
  _self.paused =       function() { return videoElement.paused }

  /**
   * @description skip to _time_ (in seconds) or gets `currentTime` in seconds
   * @function Source#FlexSource#currentTime
   * @param {float} time - time in seconds
   */
  _self.currentTime = function( _num ) {
    if ( _num === undefined ) {
      return videoElement.currentTime;
    } else {
      // console.log("set time", _num)
      videoElement.currentTime = _num;
      return _num;
    }
  }



  // seconds
  /**
   * @description give the duration of the video in seconds (cannot be changed)
   * @function Source#FlexSource#duration
   */
  _self.duration =     function() { return videoElement.duration }    // seconds

  // ===========================================================================
  // For now only here, move to _source?
  // there should be a way te set up initial source data
  // ===========================================================================
  /**
   * @description skip to _time_ (in seconds) or gets `currentTime` in seconds
   * @function Source#FlexSource#setUVMap
   * @param {float} u - U (x) horizontal spacing for the texture, 1 is 1 texture, below zero is 'zooming' over 1 is tiling
   * @param {float} v - V (y) vertical spacing for the texture, 1 is 1 texture, below zero is 'zooming' over 1 is tiling
   * 
   */
  _self.setUVMap = function( _x, _y ) {
     renderer.customUniforms[_self.uuid+'_uvmap'].value = new THREE.Vector2( _x, _y )
  }

    /**
   * @description Not used at this moment
   * @function Source#FlexSource#setUVMapMod
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

      // autofade bpm
      var starttime = (new Date()).getTime()
      var c = 0
      var cnt = 0
  
      // fade time
      var fadeAtTime = 0
      var fadeTime = 0
      var fadeTo = "b"
      var fadeDuration = 0

  _self.setBpmFollow = function( _bool ) {
    _self.bpmFollow = _bool;
    // if ( _bool.toLowerCase() == "true" ) _self.autoFade = true
    // if ( _bool.toLowerCase() == "false" ) _self.autoFade = false
  }

  // ===========================================================================
  // Rerturn a reference to self
  // ===========================================================================

  // _self.init()
}
