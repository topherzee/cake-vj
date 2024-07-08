DistortionEffect2.prototype = new Effect(); // assign prototype to marqer
DistortionEffect2.constructor = DistortionEffect2;  // re-assign constructor

/**
 * @summary
 *   The Distortion effect has a series of simple distortion effects, ie. it manipulates, broadly, the UV mapping and pixel placements
 *   Effects Example on codepen:
 *   <a href="https://codepen.io/xangadix/pen/eXLGwJ" target="_blank">codepen</a>
 *
 * @description
 *   Distortion  effect allows for a series of color Distortion, mostly
 *   mimicing classic mixers like MX50 and V4
 *   ```
 *    1. normal
 *    2. phasing sides
 *    3. multi
 *    4. PiP (Picture in picture)
 *
 *   ```
 *
 * @example
 *   let myEffect = new DistortionEffect2( renderer, { source: myVideoSource, effect: 1 });
 *
 * @constructor Effect#DistortionEffect2
 * @implements Effect
 * @param renderer:GlRenderer
 * @param options:Object
 * @author Sense Studios
 */

// fragment
// vec3 b_w = ( source.x + source.y + source.z) / 3
// vec3 amount = source.xyz + ( b_w.xyx * _alpha )
// col = vec3(col.r+col.g+col.b)/3.0;
// col = vec4( vec3(col.r+col.g+col.b)/3.0, _alpha );

// TO THINK ON: Seems we need to connect this to SOURCES somehow

function DistortionEffect2( _renderer, _options ) {

  // create and instance
  var _self = this;

  // set or get uid
  if ( _options.uuid == undefined ) {
    _self.uuid = "DistortionEffect2_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  } else {
    _self.uuid = _options.uuid
  }

  if ( _options.fragmentChannel == undefined ) {
    _self._fragmentChannel = 1;
    } else {
    _self._fragmentChannel = _options.fragmentChannel;
  }

  // add to renderer
  _renderer.add(_self)
  _self.type = "Effect"

  var source = _options.source
  // var currentEffect = _options.effect
  // var currentEffect = 12

  var currentEffect = _options.effect
  var currentEffect = 1
  var currentExtra = 0.8
  var currentExtra2 = 0.0

  var shaderScript = `

  bool mask_circle(vec2 uv, float radius, float x, float y){
      
    // uv.x *= 1.6; 
     uv.y /= (16.0 / 9.0);
    float len = sqrt(pow((uv.x - x),2.0) + pow(uv.y - y,2.0));
    if(len < radius){
      return true;
    }
    return false;
  }
  
  bool tophTest(float a){
    return true;
  }
  
  vec4 DistortionEffect2 ( sampler2D src, int currentDistortionEffect2, float extra, float extra2, vec2 vUv ) {
    
    // normal
    if ( currentDistortionEffect2 == 1 ) {
      return texture2D( src, vUv ).rgba;
    }
  
    //ONLY CIRCLE
    if ( currentDistortionEffect2 == 105 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      float radius = 0.28;
      float scale = 1.0; //Size of video.
  
      if(mask_circle(uv, radius, 0.0, 0.0)) {
        vec2 uvs = vec2(uv);
        uvs *= scale;
        vec4 pixelColor = texture2D(src, vec2(uvs.x + 0.5, uvs.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
      }else{
        gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0);	
        discard;
      }
      return gl_FragColor;
    }//105
  
    //MIRROR_VERTICAL
    if ( currentDistortionEffect2 == 106 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      vec4 pixelColor;
      if (uv.y >= 0.0){
       pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
      }else{
        pixelColor = texture2D(src, vec2(uv.x + 0.5, -uv.y + 0.5)); 
      }
      // gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0); 
      gl_FragColor = vec4(pixelColor);
      return gl_FragColor;
    }//MIRROR_VERTICAAL
  
    //MIRROR_HORIZONTAL
    if ( currentDistortionEffect2 == 107 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      vec4 pixelColor;
      if (uv.x > 0.0){
        pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
      }else{
        pixelColor = texture2D(src, vec2(-uv.x + 0.5, uv.y + 0.5)); 
      }
      // gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0); 
      gl_FragColor = vec4(pixelColor);
      return gl_FragColor;
    }//MIRROR_VERTICAAL

      //MIRROR_BOTH
    if ( currentDistortionEffect2 == 109 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      vec4 pixelColor;

      if (uv.x > 0.0){
        if (uv.y >= 0.0){
          pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
        }else{
          pixelColor = texture2D(src, vec2(uv.x + 0.5, -uv.y + 0.5)); 
        }      
      }else{
        if (uv.y >= 0.0){
          pixelColor = texture2D(src, vec2(-uv.x + 0.5, uv.y + 0.5));          
        }else{
          pixelColor = texture2D(src, vec2(-uv.x + 0.5, -uv.y + 0.5));        
        }
      }
      gl_FragColor = vec4(pixelColor);

        // gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0); 

      return gl_FragColor;
    }//MIRROR_BOTH


    //WIPE_HORIZONTAL
    if ( currentDistortionEffect2 == 108 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      if (uv.x > (extra - 0.5)){
        vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
      }

      return gl_FragColor;
    }//WIPE_HORIZONTAL
  
        //WIPE_VERTICAL
    if ( currentDistortionEffect2 == 110 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      if (uv.y > (extra - 0.5)){
        vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
      }

      return gl_FragColor;
    }//WIPE_VERTICAL



     //WIPE_ANGLE
    if ( currentDistortionEffect2 == 111 ) {

    float ratio = extra;
    float angle = extra2;
      // Convert angle to radians
      float angleRad = angle * 3.141 * 2.0;

      // Calculate the direction of the wipe
      vec2 direction = vec2(cos(angleRad), sin(angleRad));

      // Compute the position relative to the center
      vec2 center = vec2(0.5, 0.5);
      vec2 relativePos = vUv - center;

      // Project the relative position onto the direction vector
      float projection = dot(relativePos, direction);

      // Determine if the current pixel is before or after the wipe threshold
      if (projection < ratio - 0.5) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Black
      } else {
          // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White
        vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
          vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5));
          gl_FragColor = vec4(pixelColor);
      }

      return gl_FragColor;
    }//WIPE_ANGLE

            //WIPE_DONUT
    if ( currentDistortionEffect2 == 112 ) {
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.

      vec2 p = vUv - 0.5;
			// float r = length(p)*2.0;
			float r = length(p);

      if (r > extra){
        vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
      }

      return gl_FragColor;
    }//WIPE_DONUT

        //KALEIDO - https://github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/KaleidoShader.js
    if ( currentDistortionEffect2 == 110 ) {


      float sides = 0.0 + 20.0 * extra;
      float angle = 1.0;
      // float angle = 2.0 * extra2;
      vec2 p = vUv - 0.5;
			// float r = length(p)*2.0;
			float r = length(p);
			float a = atan(p.y, p.x) + angle;
			float tau = 2. * 3.1416;
			a = mod(a, tau/sides);
			a = abs(a - tau/sides/2.) + extra2 * 3.14 ;
			p = r * vec2(cos(a), sin(a));
			vec4 color = texture2D(src, p + 0.5);
			gl_FragColor = color;

      // vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      // if (uv.x > (extra - 0.5)){
      //   vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
      //   gl_FragColor = vec4(pixelColor);
      // }else{
      //   gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
      // }

      return gl_FragColor;
    }//WIPE_HORIZONTAL
  
    
  }
  
  
  
  
    // -------------
  

  
  /* custom_helpers */
  
  
  `


  _self.init = function() {
    // add uniforms to renderer
    _renderer.customUniforms[_self.uuid+'_currentDistortionEffect2'] = { type: "i", value: 1 }
    _renderer.customUniforms[_self.uuid+'_extra'] = { type: "f", value: 2.0 }
    _renderer.customUniforms[_self.uuid+'_extra2'] = { type: "f", value: 2.0 }

    var _fs;
    if (_self._fragmentChannel == 1){
      _fs = _renderer.fragmentShader;
    }else{
      _fs = _renderer.fragmentShader2;
    }

      // add uniforms to fragmentshader
      _fs = _fs.replace('/* custom_uniforms */', 'uniform vec4 '+_self.uuid+'_output;\n/* custom_uniforms */')
      _fs = _fs.replace('/* custom_uniforms */', 'uniform int '+_self.uuid+'_currentDistortionEffect2;\n/* custom_uniforms */')
      _fs = _fs.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_extra;\n/* custom_uniforms */')
      _fs = _fs.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_extra2;\n/* custom_uniforms */')

      if ( _fs.indexOf('vec4 DistortionEffect2 ( sampler2D src, int currentDistortionEffect2, float extra, float extra2, vec2 vUv )') == -1 ) {
        console.log("DistortionEffect2 REPLACE"); 
        _fs = _fs.replace('/* custom_helpers */',shaderScript);
      };

      _fs = _fs.replace('/* custom_main */', '\
      vec4 '+_self.uuid+'_output = DistortionEffect2( '+source.uuid+', ' + _self.uuid+'_currentDistortionEffect2' + ', '+ _self.uuid+'_extra' +', '+ _self.uuid+'_extra2' +', vUv );\n  /* custom_main */');
      

      if (_self._fragmentChannel == 1){
        _renderer.fragmentShader = _fs;
      }else{
        _renderer.fragmentShader2 = _fs;
      }


} // init

  var i = 0.;
  _self.update = function() {
    i += 0.001
    // _renderer.customUniforms[_self.uuid+'_uvmap'] = { type: "v2", value: new THREE.Vector2( 1 - Math.random() * .5, 1 - Math.random() * .5 ) }

    /*
    if (currentEffect == 1) {
      source.setUVMapMod(0., 0.)
      source.setUVMap(0., 0.)
    }

    // multi
    if (currentEffect == 2) {
      source.setUVMapMod(0.25, 0.25)
      source.setUVMap(2., 2.)
    }

    // pip
    if (currentEffect == 3 ) {
      source.setUVMapMod(0.2,0.2)
      source.setUVMap(0.5,0.4)
    }
    */

    if (currentEffect == 4) {
    }
    //--------------------------------------------------------------------------------------------------------
    // testSource1.setUVMapMod(0.25, 0.25)
    // testSource1.setUVMapMod(0.25, 0.25)

    // testSource1.setUVMap(1, 1)
    // testSource1.setUVMap(1, 1)

    // pip
    /*
    testSource1.setUVMapMod(0, 0)
    var c = 0
    setInterval( function() {
      c+= 0.02
      //testSource1.setUVMap( Math.sin(c)+2, Math.sin(c)+1 )
      testSource1.setUVMapMod( Math.sin(c)-1, -Math.cos(c)-1 )
    }, 50)
    */
    //--------------------------------------------------------------------------------------------------------


    // ONLY WORKS ON VIDEO SOURCE, IF IT WORKS
    //renderer.customUniforms[source.uuid+'_uvmap_mod'] = { type: "v2", value: new THREE.Vector2( i, Math.cos(i) ) }
    //renderer.customUniforms[source.uuid+'_uvmap'] = { type: "v2", value: new THREE.Vector2( 1 - Math.random() * .82, 1 - Math.random() * .82 ) }
  }

  /**
   * @description currentDistortionffect number
   * @function Effect#DistortionEffect2#effect
   * @param {Number} effectnumber CurrentDistortionEffect2 number 1
   */

  _self.effect = function( _num ){
    if ( _num != undefined ) {
      currentEffect = _num
      if (_renderer.customUniforms[_self.uuid+'_currentDistortionEffect2']) _renderer.customUniforms[_self.uuid+'_currentDistortionEffect2'].value = _num
      // update uniform ?
    }

    return currentEffect
  }
  /**
   * @description the extra, for several effects, usually between 0 and 1, but go grazy
   * @function Effect#DistortionEffect2#extra
   * @param {float} floatValue between 0 and 1
   */
  _self.extra = function( _num ){

    if ( _num != undefined ) {
      currentExtra = _num
      if (_renderer.customUniforms[_self.uuid+'_extra']) _renderer.customUniforms[_self.uuid+'_extra'].value = currentExtra
      // update uniform ?
    }
    return _num
  }

  _self.extra2 = function( _num ){

    if ( _num != undefined ) {
      currentExtra2 = _num
      if (_renderer.customUniforms[_self.uuid+'_extra2']) _renderer.customUniforms[_self.uuid+'_extra2'].value = currentExtra2
      // update uniform ?
    }
    return _num
  }
}
