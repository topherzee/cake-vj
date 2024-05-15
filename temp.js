

  //Wipe 1
  if ( currentdistortioneffect == 5 ) {
    vec2 wuv = vec2(0,0);
    wuv = vUv * vec2( 2, 2 ) + vec2( 0., 0. );
    float sil = 1.;

    // top-left
    if ( gl_FragCoord.x < ( screenSize.x * 0.07 ) || ( gl_FragCoord.x > screenSize.x * 0.37 ) ) sil = 0.;
    if ( gl_FragCoord.y < ( screenSize.y * 0.60 ) || ( gl_FragCoord.y > screenSize.y * 0.97 ) ) sil = 0.;
    return texture2D( src, wuv ).rgba * vec4( sil, sil, sil, sil );
  }

  //Wipe 2
  if ( currentdistortioneffect == 6 ) {

    if ( gl_FragCoord.x > 100.0 ) {
     //return vec4(0.0,0.0,0.0,0.0);
     vec2 wuv = vec2(0,0);
     wuv = vUv * vec2( 2, 2 ) + vec2( 0., 0. );
     return texture2D( src, wuv ).rgba * vec4(0.0,0.0,0.0,0.0);
    }else {
    //  return src;
     return texture2D( src, vUv ).rgba;
    }

  }