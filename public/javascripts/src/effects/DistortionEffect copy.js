DistortionEffect.prototype = new Effect(); // assign prototype to marqer
DistortionEffect.constructor = DistortionEffect;  // re-assign constructor

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
 *   let myEffect = new DistortionEffect( renderer, { source: myVideoSource, effect: 1 });
 *
 * @constructor Effect#DistortionEffect
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

function DistortionEffect( _renderer, _options ) {

  // create and instance
  var _self = this;

  // set or get uid
  if ( _options.uuid == undefined ) {
    _self.uuid = "DistortionEffect_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
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
  
  vec4 distortioneffect ( sampler2D src, int currentdistortioneffect, float extra, vec2 vUv ) {
    
    // normal
    if ( currentdistortioneffect == 1 ) {
      return texture2D( src, vUv ).rgba;
    }
  
    // TOPHER_DIST_MIRROR_CIRCLES
    if ( currentdistortioneffect == 100 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      float radius = 0.06;
      float x = -0.24;
      float y = +0.0;
      float scale = 4.0;
  
      if(mask_circle(uv, radius, x, y)  || mask_circle(uv, radius, -x, y)) {
        //gl_FragColor = texture2D( src, vUv ).rgba;
  
        vec2 uvs = vec2(uv);
        
        if ( uv.x < 0.0){
            uvs.x -= x;
            uvs *= scale;
        }else{
            uvs.x += x;
            uvs *= scale;
            uvs.x = - uvs.x;
        }
  
        if (uvs.x < -0.5 || uvs.x > 0.5 || uvs.y < -0.5 || uvs.y > 0.5 ){
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else{
            vec4 pixelColor = texture2D(src, vec2(uvs.x + 0.5, uvs.y + 0.5)); 
            gl_FragColor = vec4(pixelColor);
        }
  
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.2, 1.0);	
      }
      return gl_FragColor;
    }
  
  
    // TOPHER_DIST_CIRCLE_2 - 2 circles on the side.
    if ( currentdistortioneffect == 101 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5);
      float radius = 0.2;
      float x = -0.2;
      float y = +0.0;
      float scale = 4.0;
  
      if(mask_circle(uv, radius, x, y)  || mask_circle(uv, radius, -x, y)) {
        gl_FragColor = texture2D( src, vUv ).rgba;
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.3, 1.0);	
      }
      return gl_FragColor;
    }
  
    // TOPHER_DIST_CIRCLE_3 - 3 circles
    if ( currentdistortioneffect == 102 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5);
      float radius = 0.06;
      float x = -0.24;
      float y = +0.0;
  
      if(mask_circle(uv, radius, x, y)  ||  mask_circle(uv, radius, -x, y) ||  mask_circle(uv, 0.12, 0.0, 0.0)) {
       
        gl_FragColor = texture2D( src, vUv ).rgba;
      }else{
        gl_FragColor = vec4(0.0, 0.1, 0.0, 1.0);	
      }
      return gl_FragColor;
    }
  
  
    // TOPHER_DIST_CENTER_CIRCLE
    if ( currentdistortioneffect == 103 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      float radius = 0.12;
      float x = -0.0;
      float y = +0.0;
      float scale = 2.5;
  
      if(mask_circle(uv, radius, x, y)) {
  
        vec2 uvs = vec2(uv);
        uvs *= scale;
        
        if (uvs.x < -0.5 || uvs.x > 0.5 || uvs.y < -0.5 || uvs.y > 0.5 ){
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else{
            vec4 pixelColor = texture2D(src, vec2(uvs.x + 0.5, uvs.y + 0.5)); 
            gl_FragColor = vec4(pixelColor);
        }
  
      }else{
        gl_FragColor = vec4(0.0, 0.0, 0.4, 1.0);	
        // gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);	//transpparent
        //discard;
      }
      // gl_FragColor = vec4(0.4, 0.0, 0.2, 1.0);
      return gl_FragColor;
    }//103
  
    //ONLY SQUASH
    if ( currentdistortioneffect == 104 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      float radius = 0.3;
      float x = -0.0;
      float y = +0.0;
      float scale = 1.5;
  
      vec2 uvs = vec2(uv);
      // uvs *= scale;
      uvs.x *= 1.333;
      
      vec4 pixelColor = texture2D(src, vec2(uvs.x + 0.5, uvs.y + 0.5)); 
      gl_FragColor = vec4(pixelColor);
  
  
  
      // gl_FragColor = vec4(0.4, 0.0, 0.2, 1.0);
      return gl_FragColor;
    }//104
  
    //ONLY CIRCLE
    if ( currentdistortioneffect == 105 ) {
  
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
  
    //MIRROR
    if ( currentdistortioneffect == 106 ) {
  
      vec2 uv = vec2(vUv.x - 0.5, vUv.y - 0.5); //assuming they are 0 to 1.
      
      if (uv.y > 0.0){
        vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, uv.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
       
      }else{
        // gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0);
        // discard;
        vec4 pixelColor = texture2D(src, vec2(uv.x + 0.5, -uv.y + 0.5)); 
        gl_FragColor = vec4(pixelColor);
      }

      if (uv.y > 0.3){
        discard;
      }
        	
      gl_FragColor = vec4(0.0, 0.2, 0.0, 1.0);
      
      return gl_FragColor;
    }//105
  
  
    // phasing sides (test)
    if ( currentdistortioneffect == 2 ) {
      vec2 wuv = vec2(0,0);
      if ( gl_FragCoord.x > screenSize.x * 0.5 ) wuv = vUv * vec2( 1., cos( time * .01 ) * 1. );
      if ( gl_FragCoord.x < screenSize.x * 0.5 ) wuv = vUv * vec2( 1., sin( time * .01 ) * 1. );
      wuv = wuv + vec2( .0, .0 );
      return texture2D( src, wuv ).rgba;
    }
  
    // multi
    if ( currentdistortioneffect == 3 ) {
      vec2 wuv = vec2(0,0);
      wuv = vUv * vec2( extra*6., extra*6. ) - vec2( extra * 3., extra * 3. );
      // wuv = vUv + vec2( extra, extra );
      return texture2D( src, wuv ).rgba;
    }
  
    // pip
    if ( currentdistortioneffect == 4 ) {
      vec2 wuv = vec2(0,0);
      wuv = vUv * vec2( 2, 2 ) + vec2( 0., 0. );
      float sil = 1.;
  
      // top-left
      if ( gl_FragCoord.x < ( screenSize.x * 0.07 ) || ( gl_FragCoord.x > screenSize.x * 0.37 ) ) sil = 0.;
      if ( gl_FragCoord.y < ( screenSize.y * 0.60 ) || ( gl_FragCoord.y > screenSize.y * 0.97 ) ) sil = 0.;
      return texture2D( src, wuv ).rgba * vec4( sil, sil, sil, sil );
    }
  }
  
  
  
  
    // -------------
  
    // wipes (move these to mixer?)
    //if ( gl_FragCoord.x > 200.0 ) {
    //  return vec4(0.0,0.0,0.0,0.0);
    //}else {
    //  return src;
    //}
  
  /* custom_helpers */
  
  
  `


  _self.init = function() {
    // add uniforms to renderer
    _renderer.customUniforms[_self.uuid+'_currentdistortioneffect'] = { type: "i", value: 1 }
    _renderer.customUniforms[_self.uuid+'_extra'] = { type: "f", value: 2.0 }

    if (_self._fragmentChannel == 1){

      // add uniforms to fragmentshader
      _renderer.fragmentShader = _renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform vec4 '+_self.uuid+'_output;\n/* custom_uniforms */')
      _renderer.fragmentShader = _renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform int '+_self.uuid+'_currentdistortioneffect;\n/* custom_uniforms */')
      _renderer.fragmentShader = _renderer.fragmentShader.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_extra;\n/* custom_uniforms */')

      if ( renderer.fragmentShader.indexOf('vec4 distortioneffect ( sampler2D src, int currentdistortioneffect, float extra, vec2 vUv )') == -1 ) {
        console.log("DistortionEffect REPLACE"); 
        _renderer.fragmentShader = _renderer.fragmentShader.replace('/* custom_helpers */',shaderScript);
      };

      _renderer.fragmentShader = _renderer.fragmentShader.replace('/* custom_main */', '\
      vec4 '+_self.uuid+'_output = distortioneffect( '+source.uuid+', ' + _self.uuid+'_currentdistortioneffect' + ', '+ _self.uuid+'_extra' +', vUv );\n  /* custom_main */');
      

    }else{
      // add uniforms to fragmentshader
      _renderer.fragmentShader2 = _renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform vec4 '+_self.uuid+'_output;\n/* custom_uniforms */')
      _renderer.fragmentShader2 = _renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform int '+_self.uuid+'_currentdistortioneffect;\n/* custom_uniforms */')
      _renderer.fragmentShader2 = _renderer.fragmentShader2.replace('/* custom_uniforms */', 'uniform float '+_self.uuid+'_extra;\n/* custom_uniforms */')

      if ( renderer.fragmentShader2.indexOf('vec4 distortioneffect ( sampler2D src, int currentdistortioneffect, float extra, vec2 vUv )') == -1 ) {
        console.log("DistortionEffect REPLACE"); 
        _renderer.fragmentShader2 = _renderer.fragmentShader2.replace('/* custom_helpers */',shaderScript);

      };

      _renderer.fragmentShader2 = _renderer.fragmentShader2.replace('/* custom_main */', '\
      vec4 '+_self.uuid+'_output = distortioneffect( '+source.uuid+', ' + _self.uuid+'_currentdistortioneffect' + ', '+ _self.uuid+'_extra' +', vUv );\n  /* custom_main */');


    }



} // init

  var i = 0.;
  _self.update = function() {
    i += 0.001
    // renderer.customUniforms[_self.uuid+'_uvmap'] = { type: "v2", value: new THREE.Vector2( 1 - Math.random() * .5, 1 - Math.random() * .5 ) }

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
   * @function Effect#DistortionEffect#effect
   * @param {Number} effectnumber CurrentDistortionEffect number 1
   */

  _self.effect = function( _num ){
    if ( _num != undefined ) {
      currentEffect = _num
      if (renderer.customUniforms[_self.uuid+'_currentdistortioneffect']) renderer.customUniforms[_self.uuid+'_currentdistortioneffect'].value = _num
      // update uniform ?
    }

    return currentEffect
  }
  /**
   * @description the extra, for several effects, usually between 0 and 1, but go grazy
   * @function Effect#DistortionEffect#extra
   * @param {float} floatValue between 0 and 1
   */
  _self.extra = function( _num ){

    if ( _num != undefined ) {
      currentExtra = _num
      if (renderer.customUniforms[_self.uuid+'_extra']) renderer.customUniforms[_self.uuid+'_extra'].value = currentExtra
      // update uniform ?
    }
    return _num
  }
}