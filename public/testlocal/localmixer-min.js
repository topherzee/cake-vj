function Addon() {}
function AudioAnalysis(e, r) {
  var n = this;
  (n.uuid =
    "Analysis_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (n.type = "Addon"),
    (n.audio = ""),
    (n.bypass = !1),
    (n.bpm = 128),
    (n.beats = 0),
    (n.delayed_bpm = 128),
    (n.use_delay = !0),
    (n.bpm_limit = 256),
    (n.bpm_float = 0),
    (n.mod = 1),
    (n.bps = 1),
    (n.sec = 0),
    (n.count = 0),
    n.dataSet,
    n.tempoData,
    n.audio_src,
    (n.options = {
      audio: "/audio/fear_is_the_mind_killer_audio.mp3",
      microphone: !1,
    }),
    null != r && (n.options = r);
  var t = !0,
    o = [],
    c = 0,
    u = new Date().getTime();
  e.add(n);
  var i = new Audio();
  n.audio = i;
  var a,
    s = new (window.AudioContext || window.webkitAudioContext)(),
    d = s.createBiquadFilter(),
    l = s.createAnalyser(),
    f = Date.now();
  n.dataSet = new Array(4e3);
  var m,
    g = new Array(4e3),
    p = [],
    v = 1,
    h = !1,
    b = [];
  (i.controls = !0),
    (i.loop = !0),
    (i.autoplay = !0),
    (i.crossorigin = "anonymous"),
    (d.type = "lowpass"),
    (d.frequency.value = 350),
    (d.Q.value = 1),
    (l.fftSize = 128),
    (m = l.frequencyBinCount),
    (n.context = s),
    (n.analyser = s),
    (n.bufferLength = m),
    (n.dataArray = void 0),
    (n.disconnectOutput = function () {
      a.disconnect(s.destination);
    }),
    (n.connectOutput = function () {
      a.connect(s.destination);
    }),
    (n.getBpm = function () {
      return n.bpm;
    });
  var _ = function () {
    if (!n.audio.paused)
      return (
        s.resume(),
        document.body.removeEventListener("click", _),
        void document.body.removeEventListener("touchstart", _)
      );
    console.log(
      "AudioAnalysis is re-intialized after click initialized!",
      i.src
    ),
      s.resume().then(() => {
        i.play(),
          console.log("Playback resumed successfully"),
          document.body.removeEventListener("click", _),
          document.body.removeEventListener("touchstart", _);
      });
  };
  document.body.addEventListener("click", _),
    document.body.addEventListener("touchstart", _),
    (n.init = function () {
      console.log("init AudioAnalysis Addon."),
        n.options.microphone
          ? (console.log("Audio analisis using microphone."),
            navigator.mediaDevices
              .getUserMedia({ audio: i })
              .then(function (e) {
                (a = s.createMediaStreamSource(e)), S(), n.disconnectOutput();
              })
              .catch(function (e) {
                console.log(e.name + ": " + e.message);
              }))
          : ((a = s.createMediaElementSource(i)),
            (i.src = n.options.audio),
            (n.audio_src = n.options.audio),
            S());
    }),
    (n.render = function () {
      return n.bpm_float;
    }),
    (n.add = function (e) {
      o.push(e);
    }),
    (n.sync = function () {
      u = new Date().getTime();
    }),
    (n.getBlackOut = function () {}),
    (n.getAmbience = function () {}),
    (n.getHighLevels = function () {}),
    (n.getMidLevels = function () {}),
    (n.getLowLevels = function () {});
  var y = 0;
  n.update = function () {
    n.bypass ||
      (n.disabled ||
        o.forEach(function (e) {
          e(n.render());
        }),
      (n.bpm = n.tempodata_bpm),
      n.bpm > n.bpm_limit &&
        (console.warn(
          "reached bpm limit!: ",
          n.bpm,
          "reset bpm to limit: ",
          n.bpm_limit
        ),
        (n.bpm = n.bpm_limit)),
      (c = (new Date().getTime() - u) / 1e3),
      (n.count = c),
      n.use_delay
        ? (n.delayed_bpm < n.bpm && (n.delayed_bpm += 0.1),
          n.delayed_bpm > n.bpm && (n.delayed_bpm -= 0.1))
        : (n.delayed_bpm = n.bpm),
      (n.sec = (c * Math.PI * n.delayed_bpm) / 60),
      (n.sec = n.sec * (y / n.delayed_bpm)),
      (n.bpm_float = (Math.sin(n.sec * n.mod) + 1) / 2),
      n.bpm != y && (y = n.delayed_bpm * n.mod),
      n.sec > n.delayed_bpm && (u = new Date().getTime()),
      n.bpm_float > 0.9 && !h
        ? ((n.beats += 1), (h = !0))
        : n.bpm_float < 0.1 && h && ((n.beats += 1), (h = !1)));
  };
  var S = function () {
      if (
        (i.play(),
        a.connect(d),
        d.connect(l),
        a.connect(s.destination),
        window.Worker)
      ) {
        console.log("go");
        var e = new Blob([
            '\n      \n        var _self = null;\n        onmessage = function(e) {\n          \n          var data = JSON.parse(e.data)\n          console.log("msgevent:", data.command );          \n          _self = data.module\n          if ( data.command == "start" ) {\n            //setInterval( worker_sampler, 1);\n            console.log("(TEST)start the worker!", _self)\n          }          \n        }\n\n        postMessage(\'Inline worker created\');          \n      ',
          ]),
          r = window.URL.createObjectURL(e),
          n = new Worker(r);
        (n.onmessage = function (e) {
          console.log("module got worker message: ", e.data);
        }),
          (window.my_worker = n),
          setInterval(w, 1);
      } else setInterval(w, 1);
    },
    x = !1,
    w = function () {
      if (!n.audio.muted && !n.bypass) {
        (n.dataArray = new Uint8Array(m)), l.getByteTimeDomainData(n.dataArray);
        var e = Date.now(),
          r = 0;
        if (
          (n.dataArray.forEach((e) => {
            e > r && (r = e);
          }),
          n.dataSet.push([e, r]),
          n.dataSet.length > 4e3 && n.dataSet.splice(0, n.dataSet.length - 4e3),
          0,
          e - f > 20)
        ) {
          var t = M(n.dataSet);
          (n.tempoData = t),
            null == t
              ? (x ||
                  console.warn(
                    " WARNING: sampler is active, but no audio was detected after 20 seconds -- check your audiofile or your microphone and make sure you've clicked in the window and gave it access! Halting."
                  ),
                (x = !0),
                (n.tempodata_bpm = 128))
              : ((n.tempodata_bpm = t.bpm), (x = !1)),
            n.useAutoBPM && (n.sec = (c * Math.PI * (t.bpm * n.mod)) / 60),
            (f = Date.now()),
            0;
        }
      }
    },
    E = function () {
      0 != document.getElementsByClassName("blink").length &&
        (i.paused
          ? (document.getElementsByClassName("blink")[0].style.opacity = 0)
          : 1 == document.getElementsByClassName("blink")[0].style.opacity
          ? (document.getElementsByClassName("blink")[0].style.opacity = 0)
          : (document.getElementsByClassName("blink")[0].style.opacity = 1),
        setTimeout(E, ((60 / n.bpm) * 1e3) / n.mod));
    };
  E();
  var M = function (e) {
      (p = []), (g = new Array(e.length));
      for (var r = 0; r < e.length; r++)
        void 0 !== e[r] &&
          e[r][1] > 128 * v &&
          ((g[r] = [n.dataSet[r][0], 1]), p.push([e[r][0], 1]), (r += 50));
      p.length < 15 && (v -= 0.05),
        p.length > 60 && (v += 0.05),
        v > 2 && (v = 2),
        v < 1 && (v = 1);
      var o = T(k(p));
      if ((o.sort(U), 0 == o.length)) o[0] = { tempo: 128 };
      else {
        var c = "";
        o.reverse().forEach(function (e, r) {
          c += r + ", " + e.tempo + ", " + e.count + "\t [";
          for (var n = 0; n < e.count; ) (c += "#"), n++;
          c += "]<br/>";
        }),
          null != document.getElementById("info") &&
            (document.getElementById("info").html = c);
      }
      var u = "calibrating";
      if (((t = !1), void 0 === e[0]))
        (t = !0),
          document.getElementsByClassName("blink").length > 0 &&
            (document.getElementsByClassName("blink")[0].style.backgroundColor =
              "#999999");
      else {
        if (((t = !1), void 0 === o[0] || void 0 === o[1])) return;
        var i = o[0].count - o[1].count;
        i <= 2
          ? ((u = "low"),
            document.getElementsByClassName("blink").length > 0 &&
              (document.getElementsByClassName(
                "blink"
              )[0].style.backgroundColor = "#990000"))
          : i > 2 && i <= 7
          ? ((u = "average"),
            document.getElementsByClassName("blink").length > 0 &&
              (document.getElementsByClassName(
                "blink"
              )[0].style.backgroundColor = "#999900"))
          : i > 7 &&
            ((u = "high"),
            document.getElementsByClassName("blink").length > 0 &&
              (document.getElementsByClassName(
                "blink"
              )[0].style.backgroundColor = "#CCCCCC"));
      }
      return {
        bpm: o[0].tempo,
        confidence: u,
        calibrating: t,
        treshold: v,
        tempoCounts: o,
        foundpeaks: p,
        peaks: g,
      };
    },
    U = function (e, r) {
      return parseInt(e.count, 10) - parseInt(r.count, 10);
    },
    k = function (e) {
      return (
        (b = []),
        e.forEach(function (r, n) {
          for (var t = 0; t < 10; t++)
            if (void 0 !== e[n + t]) {
              var o = e[n + t][0] - r[0];
              b.some(function (e) {
                if (e.interval === o) return e.count++;
              }) || b.push({ interval: o, count: 1 });
            }
        }),
        b
      );
    },
    T = function (e) {
      var r = [];
      return (
        e.forEach(function (e, n) {
          if (0 != e.interval && !isNaN(e.interval))
            var t = 60 / (e.interval / 1e3);
          for (; t < 90; ) t *= 2;
          for (; t > 180; ) t /= 2;
          (t = 2 * Math.round(t / 2)),
            r.some(function (r) {
              if (r.tempo === t) return (r.count += e.count);
            }) ||
              (t && r.push({ tempo: t, count: e.count }));
        }),
        r
      );
    };
}
function BPM(e, r) {
  var n = this;
  if (
    ((n.function_list = [
      ["AUTO", "method", "toggleAutoBpm"],
      ["MODDOWN", "method", "modDown"],
      ["MODUP", "method", "modUp"],
      ["MOD", "method", "modNum"],
    ]),
    null != e)
  ) {
    (n.uuid =
      "BPM_" +
      ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
      window["bpm_" + n.uuid],
      (n.type = "Addon"),
      (n.options = {}),
      null != r && (n.options = r),
      (n.bpm = 128),
      (n.bps = 2.133333),
      (n.sec = 0),
      (n.bpm_float = 0.46875),
      (n.mod = 1),
      (n.useAutoBpm = !1),
      (n.tempodata_bpm = 128),
      (n.mute = !1),
      (n.autoBpmData = {}),
      (n.audio_src = ""),
      (n.useMicrophone = !1),
      (n.bypass = !1);
    var t = [],
      o = 0;
    e.add(n),
      (n.init = function () {
        console.log("init BPM contoller.");
      });
    var c = new Date().getTime();
    (n.update = function () {
      n.bypass ||
        (n.disabled ||
          t.forEach(function (e) {
            e(n.render());
          }),
        (o = (new Date().getTime() - c) / 1e3),
        (n.sec = (o * Math.PI * (n.bpm * n.mod)) / 60),
        (n.bpm_float = (Math.sin(n.sec) + 1) / 2));
    }),
      (n.add = function (e) {
        t.push(e);
      }),
      (n.render = function () {
        return n.bpm_float;
      }),
      (n.modUp = function () {
        n.mod *= 2;
      }),
      (n.modDown = function () {
        n.mod *= 0.5;
      }),
      (n.modNum = function (e) {
        console.log("MOD ", e);
        var r = n.useAutoBpm;
        (n.mod = e), (n.useAutoBpm = r);
      }),
      (n.toggleAutoBpm = function (e) {
        (n.useAutoBpm = !n.useAutoBpm), console.log("---\x3e", n.useAutoBpm);
      }),
      (n.turnOff = function () {
        (bpm.audio.muted = !1), (bpm.useAutoBpm = !1);
      });
    var u = Number(new Date()),
      i = [128, 128, 128, 128, 128],
      a = 0,
      s = 0;
    (n.tap = function () {
      (n.useAutoBPM = !1),
        (a = Number(new Date()) - u),
        (u = Number(new Date())),
        a < 1e4 &&
          a > 10 &&
          (i.splice(0, 1),
          i.push(6e4 / a),
          (s =
            i.reduce(function (e, r) {
              return e + r;
            }) / i.length),
          (n.bpm = s),
          (n.bps = s / 60));
    }),
      (n.getBpm = function () {
        return n.bpm;
      }),
      console.log("set keypress"),
      window.addEventListener("keypress", function (e) {
        console.log(">>> ", e.which),
          (116 != e.which && 32 != e.which) || (n.tap(), console.log(n.bpm));
      });
  }
}
function FileManager(e) {
  var r = this;
  (r.function_list = [["CHZ", "method", "changez"]]),
    (r.uuid =
      "Filemanager_" +
      ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (r.type = "AddOn"),
    (r.defaultQuality = ""),
    (r.source = e),
    (r.debug = !1),
    (r.set = []),
    (r.load_set = function (e) {
      new Utils().get(e, function (e) {
        r.set = JSON.parse(e);
      });
    }),
    null != window.in_app && (r.eu = window.eu),
    (r.setSrc = function (e) {
      null == window.in_app
        ? (r.source.src(e), console.log("filemanager: set normal source:", e))
        : (r.source.src(r.eu.check_file(e)),
          console.log("filemanager: set checked source:", r.eu.check_file(e)));
    }),
    (r.load = function (e) {
      new Utils().get(e, function (e) {
        (r.set = JSON.parse(e)),
          (r.debug = !1) && console.log("got set: ", r.set);
      });
    }),
    (r.changeToNum = function (e) {
      r.setSrc(r.set[e]),
        (r.debug = !1) && console.log("changed file: ", e, self.set[e]);
    }),
    (r.changeToUrl = function (e) {
      r.setSrc(e),
        (r.debug = !1) &&
          console.log("changed file from url: ", _num, self.set[_num]);
    }),
    (r.change = function (e) {
      if (0 != r.set.length) {
        if (null != e) return void r.changeToNum(e);
        var n = r.set[Math.floor(Math.random() * r.set.length)];
        r.setSrc(n), (r.debug = !1) && console.log("changed file: ", n);
      }
    }),
    (r.changez = function (e) {
      r.change(e);
    }),
    (r.getSrcByTag = function (e) {});
}
function GiphyManager(e) {
  var r = this;
  (r.uuid =
    "GiphyManager_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (r.type = "AddOn"),
    (r.source = e),
    (r.file = ""),
    (r.programs = []),
    (r.program = "");
  (r.needle = function (e, n) {
    new Utils().get(
      "//api.giphy.com/v1/gifs/search?api_key=tIovPHdiZhUF3w0UC6ETdEzjYOaFZQFu&q=" +
        e,
      function (e) {
        console.log(" === GIPHY (re)LOADED === "),
          (r.programs = JSON.parse(e).data),
          null != n && n();
      }
    );
  }),
    (r.search = function (e, n) {
      r.needle(e, n);
    }),
    (r.setSrc = function (e) {
      console.log("set source: ", e), r.source.src(e);
    }),
    (r.change = function () {
      if (0 == r.programs.length) return "no programs found :(";
      (r.program = r.programs[Math.floor(Math.random() * r.programs.length)]),
        (r.file = r.program),
        r.setSrc(r.program.images.original.url);
    }),
    (r.changez = function () {
      r.change();
    });
}
function Behaviour(e, r) {
  var n = this;
  function t(e) {
    "seconds" == e.mod.type
      ? triggers.push([e, n.time + e.mod.value, null])
      : "beats" == e.mod.type
      ? triggers.push([e, n.beats + e.mod.value])
      : "random-seconds" == e.mod.type
      ? triggers.push([e, n.time + Math.random() * e.mod.value, null])
      : "random-beats" == e.mod.type &&
        triggers.push([e, n.beats + Math.random() * e.mod.value]);
  }
  (n.uuid =
    "Behaviour" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (n.type = "Behaviour"),
    e.add(n),
    (n.beats = 0),
    (n.time = new Date().getTime()),
    (n.script = {}),
    (n.sheets = []),
    (n.sheet_index = 0),
    (n.bpm = r.bpm),
    (triggers = []),
    (n.tr = triggers),
    (old_bpm = 1),
    (n.init = function () {}),
    (n.update = function () {
      n.time = new Date().getTime();
      var e = Math.round(4 * bpm.render());
      e != old_bpm && ((n.beats += 1), (old_bpm = e));
    }),
    (n.load = function (e) {
      (n.script = e),
        (n.sheets = e.sheets),
        console.log("loaded A BEHAVIOUR", e.title),
        e.triggers.forEach(function (e, r) {
          t(e);
        });
    }),
    (n.jump = function (e) {
      console.log("how high?", e),
        (e.video.currentTime = Math.random() * e.video.duration);
    });
  var o = 0;
  n.checkSheets = function () {
    n.sheets[0].length;
    checkBeats(o % n.sheets[n.sheet_index].length),
      n.sheets[n.sheet_index][o % n.sheets[n.sheet_index].length].forEach(
        function (e) {
          if ("....." != e[0]) {
            console.log(e);
            var r = n.script.composition[e[0]].target,
              t = n.script.composition[e[0]].functions,
              o = null;
            t.forEach(function (n, t) {
              if (e[1] == n[0]) {
                console.log("TRIGGERED", (o = n[2]));
                var c = e[2];
                (c = isNaN(e[2]) ? e[2] : parseFloat(e[2])),
                  r[n[2]](c),
                  console.log(r, o, c);
              }
            });
          }
        }
      ),
      (o += 1),
      setTimeout(n.checkSheets, ((60 / bpm.bpm) * 1e3) / 4);
  };
  setTimeout(function () {}, 12e3);
}
function Controller(e) {
  (this.type = "Controller"),
    (this.testControllerVar = "test"),
    (this.init = function () {}),
    (this.update = function () {}),
    (this.render = function () {});
}
function GamePadController(e, r) {
  var n = this;
  (n.uuid =
    "GamePadController_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (n.type = "Control"),
    (n.controllers = {}),
    (n.gamepad = {}),
    (n.bypass = !0),
    (n.debug = !1),
    (n.gamepad_index = 0),
    e.add(n);
  (n.connect = function () {
    console.log("start gamepads"),
      window.addEventListener("gamepadconnected", function (e) {
        console.log(
          "Gamepad connected at index %d: %s. %d buttons, %d axes.",
          e.gamepad.index,
          e.gamepad.id,
          e.gamepad.buttons.length,
          e.gamepad.axes.length
        ),
          n.init();
      }),
      window.addEventListener("gamepaddisconnected", function (e) {
        console.log(
          "Gamepad disconnected from index %d: %s",
          e.gamepad.index,
          e.gamepad.id
        );
      }),
      (n.bypass = !1);
  }),
    (n.init = function () {
      console.log("init GamePadController."),
        setTimeout(function () {
          try {
            n.connect();
          } catch (e) {
            console.log(
              "Initial connect failed, hope somebody presses the button v14 ",
              n,
              e
            );
          }
        }, 1200);
    }),
    (n.update = function () {
      if (!n.bypass) {
        if (
          (n.debug && console.log(navigator.getGamepads()[0].axes),
          n.debug && console.log(navigator.getGamepads()[0].buttons),
          void 0 === navigator.getGamepads()[n.gamepad_index] ||
            null === navigator.getGamepads()[0])
        )
          return (
            console.log("Gamepad: No gamepad could be found"),
            void (n.bypass = !0)
          );
        navigator.getGamepads()[n.gamepad_index].axes.forEach(function (e, r) {
          o([r + 100, e]);
        }),
          navigator
            .getGamepads()
            [n.gamepad_index].buttons.forEach(function (e, r) {
              e.pressed &&
                (n.debug && console.log(" Button: ", r, e.value, e),
                o([r, e.value]));
            });
      }
    }),
    (n.render = function () {
      return n.controllers;
    });
  var t = [];
  (self.removeEventListener = function () {}),
    (n.addEventListener = function (e, r) {
      t.push({ target: e, callback: r }), console.log("Gamepad listeners: ", t);
    });
  var o = function (e) {
    t.forEach(function (r, n) {
      e[0] == r.target && r.callback(e);
    });
  };
  n.getNodes = function () {
    return t;
  };
}
function KeyboardController(e, r) {
  var n = this;
  (n.uuid =
    "KeyboardController_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (n.type = "Control"),
    (n.controllers = {}),
    (n.keyboard = {}),
    (n.bypass = !0),
    (n.debug = !1),
    e.add(n);
  (n.init = function () {
    console.log("init KeyboardController."),
      document.addEventListener("keydown", (e) => {
        n.debug && console.log(" down ", [e.keyCode, 1]), o([e.keyCode, 1]);
      }),
      document.addEventListener("keyup", (e) => {
        n.debug && console.log(" up ", [e.keyCode, 0]), o([e.keyCode, 0]);
      });
  }),
    (n.update = function () {
      n.bypass;
    }),
    (n.render = function () {
      return n.controllers;
    });
  var t = [];
  (self.removeEventListener = function () {}),
    (n.addEventListener = function (e, r) {
      t.push({ target: e, callback: r }),
        console.log("Keyboard listeners: ", t);
    });
  var o = function (e) {
    t.forEach(function (r, n) {
      e[0] == r.target && r.callback(e);
    });
  };
  n.getNodes = function () {
    return t;
  };
}
function MidiController(e) {
  var r = this;
  (r.uuid =
    "MidiController_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (r.type = "MidiController"),
    (r.bypass = !0),
    (r.debug = !1),
    (r.ready = !1),
    (r.controllers = {});
  var n,
    t,
    c = [];
  console.log("Midi check... "),
    navigator.requestMIDIAccess &&
      navigator.requestMIDIAccess().then(
        function (e) {
          var c = (n = e).inputs.values(),
            u = n.outputs.values();
          for (i = c.next(); i && !i.done; i = c.next())
            i.value.onmidimessage = r.onMIDIMessage;
          for (o = u.next(); o && !o.done; o = u.next()) t = o.value;
          console.log("Midi READY? ", t, n),
            null != t && (r.ready = !0),
            null != t && (r.bypass = !1);
        },
        function (e) {
          console.error("No access to your midi devices.", e);
        }
      );
  (r.onMIDIMessage = function (e) {
    r.debug && console.log(" MIDIMESSAGE >>", e.data), u(e);
  }),
    (r.init = function () {}),
    (r.update = function () {}),
    (r.send = function (e) {
      r.ready
        ? (console.log("Midi send ", e, "to", t), t.send(e))
        : console.log("Midi is not ready yet");
    }),
    (r.clear = function () {
      for (var e = [], r = 0; r++; r < 100) e.push(144, r, 0);
      t.send(e);
    }),
    (self.removeEventListener = function (e) {
      c.forEach(function (r, n) {
        if (r.target == e);
      }),
        c.splice(i, 1);
    }),
    (r.addEventListener = function (e, r) {
      c.push({ target: e, callback: r }), console.log("MIDI listeners: ", c);
    });
  var u = function (e) {
    c.forEach(function (r) {
      r.target == e.data[1] && r.callback(e.data);
    });
  };
}
function SocketController(e) {
  var r = this;
  (r.io = io.connect()),
    (r.uuid =
      "SocketController_" +
      ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (r.type = "Control"),
    (r.bypass = !0),
    (r.title = ""),
    (r.debug = !1),
    (r.socket_pairing_id = "no_paring_id"),
    (r.target = "");
  var n = [];
  e && "title" in e && (r.title = e.title),
    r.io.on("test", function (e) {
      console.log("got test", e);
    }),
    r.io.on("command", function (e) {
      console.log("got command", e),
        "welcome" == e.command &&
          ((r.target = e.payload),
          n.forEach(function (r, n) {
            ("welcome" != r.target && "ready" != r.target) ||
              r.callback(e.payload);
          })),
        "reset_uuid" == e.command &&
          (console.log("reset uuid", e.payload),
          (r.target = e.payload),
          n.forEach(function (r, n) {
            ("reset_uuid" != r.target && "reset" != r.target) ||
              r.callback(e.payload);
          })),
        document.getElementById("sockets") &&
          (document.getElementById("sockets").innerHTML +=
            "<div>" + r.title + " Socket: " + r.target + "</div>");
    }),
    r.io.on("controller", function (e) {
      r.debug && console.log("got controller", e),
        n.forEach(function (n, t) {
          r.debug && console.log("find node", t, n, e, r.target),
            e.client == r.target &&
              n.target == e.trigger &&
              (r.debug && console.log("execute callback!"),
              n.callback(e.commands));
        });
    }),
    (r.send = function (e, n, t) {
      r.debug &&
        console.log("Socket send to: ", e, ", trigger:", n, " commands ", t),
        r.io.emit("controller", { client: e, trigger: n, commands: t });
    }),
    (self.removeEventListener = function (e) {
      n.forEach(function (r, n) {
        if (r.target == e);
      }),
        n.splice(i, 1);
    }),
    (r.addEventListener = function (e, r) {
      n.push({ target: e, callback: r }), console.log("Socket listeners: ", n);
    });
}
function SourceControl(e, r) {}
function Effect(e, r) {
  (this.type = "Effect"),
    (this.init = function () {}),
    (this.update = function () {}),
    (this.render = function () {});
}
function ColorEffect(e, r) {
  var n = this;
  null == r.uuid
    ? (n.uuid =
        "ColorEffect_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (n.uuid = r.uuid),
    e.add(n),
    (n.type = "Effect"),
    (n.debug = !1);
  var t = r.source,
    o = 1;
  null != r.effect && (o = r.effect);
  var c = 0.8;
  null != r.extra && (c = r.currentExtra),
    (n.init = function () {
      (e.customUniforms[n.uuid + "_currentcoloreffect"] = {
        type: "i",
        value: o,
      }),
        (e.customUniforms[n.uuid + "_extra"] = { type: "f", value: c }),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform vec4 " + n.uuid + "_output;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform int " +
            n.uuid +
            "_currentcoloreffect;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform float " + n.uuid + "_extra;\n/* custom_uniforms */"
        )),
        -1 ==
          renderer.fragmentShader.indexOf(
            "vec4 coloreffect ( vec4 src, int currentcoloreffect, float extra, vec2 vUv )"
          ) &&
          (e.fragmentShader = e.fragmentShader.replace(
            "/* custom_helpers */",
            "\n/*\nfloat rand ( float seed ) {\n  return fract(sin(dot(vec2(seed) ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvec2 displace(vec2 co, float seed, float seed2) {\n  vec2 shift = vec2(0);\n  if (rand(seed) > 0.5) {\n      shift += 0.1 * vec2(2. * (0.5 - rand(seed2)));\n  }\n  if (rand(seed2) > 0.6) {\n      if (co.y > 0.5) {\n          shift.x *= rand(seed2 * seed);\n      }\n  }\n  return shift;\n}\n\nvec4 interlace(vec2 co, vec4 col) {\n  if (int(co.y) % 3 == 0) {\n      return col * ((sin(time * 4.) * 0.1) + 0.75) + (rand(time) * 0.05);\n  }\n  return col;\n}\n*/\n\nvec4 coloreffect ( vec4 src, int currentcoloreffect, float extra, vec2 vUv ) {\n  if ( currentcoloreffect == 1 ) return vec4( src.rgba );                                                                                              // normal\n\n  // negative\n  // negative 3 (reversed channel)\n  if ( currentcoloreffect == 2  ) return vec4( 1.-src.r, 1.-src.g, 1.-src.b, src.a );\n  // negative 3 (inverted channel high)\n  if ( currentcoloreffect == 3  ) return vec4( 1./src.r-1.0, 1./src.g-1.0, 1./src.b-1.0, src.a );\n  // negative 3 (inverted channel, low)\n  if ( currentcoloreffect == 4  ) return vec4( 1./src.r-2.0, 1./src.g-2.0, 1./src.b-2.0, src.a );\n  // negative 4 (inverted colors, inverted bw )\n  if ( currentcoloreffect == 5  ) return vec4( src.g + src.b / 2., src.r + src.b / 2., src.r + src.b / 2., src.a );\n  // negative 5 (normal colors, inverted b/w)\n  if ( currentcoloreffect == 6  ) return vec4( ( (src.r/2.) + ( ( ( (vec3( src.r + src.g + src.b ) / 3.) * -1.) + 1. ).r) ), ( (src.g/2.) + (( ( (vec3( src.r + src.g + src.b ) / 3.) * -1.) + 1. ).g) ), ( (src.b/2.) + ( ( ( (vec3( src.r + src.g + src.b ) / 3.) * -1.) + 1. ).b) ), src.a );\n\n  // monocolor\n  if ( currentcoloreffect == 10 ) return vec4( vec3( src.r + src.g + src.b ) / 3., src.a );                                                            // black and white\n  if ( currentcoloreffect == 11 ) return vec4( vec3( (src.r+src.g+src.b) *3.  , (src.r+src.g+src.b)  /1.7 , (src.r+src.g+src.b) /1.7 ) / 3., src.a );  // mopnocolor red\n  if ( currentcoloreffect == 12 ) return vec4( vec3( (src.r+src.g+src.b) /1.7 , (src.r+src.g+src.b)  *3.  , (src.r+src.g+src.b) /1.7 ) / 3., src.a );  // mopnocolor blue\n  if ( currentcoloreffect == 13 ) return vec4( vec3( (src.r+src.g+src.b) /1.7 , (src.r+src.g+src.b)  /1.7 , (src.r+src.g+src.b) *3.  ) / 3., src.a );  // mopnocolor green\n  if ( currentcoloreffect == 14 ) return vec4( vec3( (src.r+src.g+src.b) *2.  , (src.r+src.g+src.b)  *2.  , (src.r+src.g+src.b) /1.2 ) / 3., src.a );  // mopnocolor yellow\n  if ( currentcoloreffect == 15 ) return vec4( vec3( (src.r+src.g+src.b) *1.2 , (src.r+src.g+src.b)  *2.  , (src.r+src.g+src.b) *2.  ) / 3., src.a );  // mopnocolor turqoise\n  if ( currentcoloreffect == 16 ) return vec4( vec3( (src.r+src.g+src.b) *2.  , (src.r+src.g+src.b)  /1.2 , (src.r+src.g+src.b) *2.  ) / 3., src.a );  // mopnocolor purple\n  if ( currentcoloreffect == 17 ) return vec4( vec3( src.r + src.g + src.b ) / 3. * vec3( 1.2, 1.0, 0.8 ), src.a);                                     // sepia\n\n  // color swapping\n  if ( currentcoloreffect == 20 ) return vec4( src.rrra );\n  if ( currentcoloreffect == 21 ) return vec4( src.rrga );\n  if ( currentcoloreffect == 22 ) return vec4( src.rrba );\n  if ( currentcoloreffect == 23 ) return vec4( src.rgra );\n  if ( currentcoloreffect == 24 ) return vec4( src.rgga );\n  if ( currentcoloreffect == 25 ) return vec4( src.rbra );\n  if ( currentcoloreffect == 26 ) return vec4( src.rbga );\n  if ( currentcoloreffect == 27 ) return vec4( src.rbba );\n  if ( currentcoloreffect == 28 ) return vec4( src.grra );\n  if ( currentcoloreffect == 29 ) return vec4( src.grga );\n  if ( currentcoloreffect == 30 ) return vec4( src.grba );\n  if ( currentcoloreffect == 31 ) return vec4( src.ggra );\n  if ( currentcoloreffect == 32 ) return vec4( src.ggga );\n  if ( currentcoloreffect == 33 ) return vec4( src.ggba );\n  if ( currentcoloreffect == 34 ) return vec4( src.gbra );\n  if ( currentcoloreffect == 35 ) return vec4( src.gbga );\n  if ( currentcoloreffect == 36 ) return vec4( src.gbba );\n  if ( currentcoloreffect == 37 ) return vec4( src.brra );\n  if ( currentcoloreffect == 38 ) return vec4( src.brga );\n  if ( currentcoloreffect == 39 ) return vec4( src.brba );\n  if ( currentcoloreffect == 40 ) return vec4( src.bgra );\n  if ( currentcoloreffect == 41 ) return vec4( src.bgga );\n  if ( currentcoloreffect == 42 ) return vec4( src.bgba );\n  if ( currentcoloreffect == 43 ) return vec4( src.bbra );\n  if ( currentcoloreffect == 44 ) return vec4( src.bbga );\n  if ( currentcoloreffect == 45 ) return vec4( src.bbba );\n\n  // lum key\n  if ( currentcoloreffect == 50 ) {\n    float red = clamp( src.r, extra, 1.) == extra ? .0 : src.r;\n    float green = clamp( src.g, extra, 1.) == extra ? .0 : src.g;\n    float blue = clamp( src.b, extra, 1.) == extra ? .0 : src.b;\n    float alpha = red + green + blue == .0 ? .0 : src.a;\n    return vec4( red, green, blue, alpha );\n  }\n\n  // color key; Greenkey\n  if ( currentcoloreffect == 51 ) {\n    return vec4( src.r, clamp( src.r, extra, 1.) == extra ? .0 : src.g, src.b, clamp( src.r, extra, 1.) == extra ? .0 : src.a );\n  }\n\n  // paint\n  if ( currentcoloreffect == 52 ) {\n    // return vec4( floor( src.r * extra ) / extra, floor( src.g * extra ) / extra, floor( src.b * extra ) / extra, src.a  );\n    // devide the image up in color bars\n    vec4 pnt = vec4(\n      src.x < .1 ? .1 : src.x < .2 ? .2 : src.x < .3 ? .3 : src.x < .4 ? .4 : src.x < .5 ? .5 : src.x < .6 ? .6 : src.x < .7 ? .7 : src.x < .8 ? .8 : src.x < .9 ? .9 : src.x,\n      src.y < .1 ? .1 : src.y < .2 ? .2 : src.y < .3 ? .3 : src.y < .4 ? .4 : src.y < .5 ? .5 : src.y < .6 ? .6 : src.y < .7 ? .7 : src.y < .8 ? .8 : src.y < .9 ? .9 : src.y,\n      src.z < .1 ? .1 : src.z < .2 ? .2 : src.z < .3 ? .3 : src.z < .4 ? .4 : src.z < .5 ? .5 : src.z < .6 ? .6 : src.z < .7 ? .7 : src.z < .8 ? .8 : src.z < .9 ? .9 : src.z,\n      src.a\n    );\n\n    return pnt;\n  }\n\n  // colorise\n  if ( currentcoloreffect == 53 ) {\n\n    // TODO: mix paint and colorize together?\n\n    // devide the image up in color bars\n    vec4 pnt = vec4(\n      src.x < .1 ? .1 : src.x < .2 ? .2 : src.x < .3 ? .3 : src.x < .4 ? .4 : src.x < .5 ? .5 : src.x < .6 ? .6 : src.x < .7 ? .7 : src.x < .8 ? .8 : src.x < .9 ? .9 : src.x,\n      src.y < .1 ? .1 : src.y < .2 ? .2 : src.y < .3 ? .3 : src.y < .4 ? .4 : src.y < .5 ? .5 : src.y < .6 ? .6 : src.y < .7 ? .7 : src.y < .8 ? .8 : src.y < .9 ? .9 : src.y,\n      src.z < .1 ? .1 : src.z < .2 ? .2 : src.z < .3 ? .3 : src.z < .4 ? .4 : src.z < .5 ? .5 : src.z < .6 ? .6 : src.z < .7 ? .7 : src.z < .8 ? .8 : src.z < .9 ? .9 : src.z,\n      src.a\n    );\n\n    // colorize effect, fill the colors with random values\n    ( pnt.r == .1 || pnt.g == .1 || pnt.b == .1 ) ? pnt.rgb = vec3( 1.0, 0.0, 0.0) : pnt.rgb;\n    ( pnt.r == .2 || pnt.g == .2 || pnt.b == .2 ) ? pnt.rgb = vec3( 0.0, 1.0, 0.0) : pnt.rgb;\n    ( pnt.r == .3 || pnt.g == .3 || pnt.b == .3 ) ? pnt.rgb = vec3( 0.0, 0.0, 1.0) : pnt.rgb;\n    ( pnt.r == .4 || pnt.g == .4 || pnt.b == .4 ) ? pnt.rgb = vec3( 1.0, 1.0, 0.0) : pnt.rgb;\n    ( pnt.r == .5 || pnt.g == .5 || pnt.b == .5 ) ? pnt.rgb = vec3( 0.0, 1.0, 1.0) : pnt.rgb;\n    ( pnt.r == .6 || pnt.g == .6 || pnt.b == .6 ) ? pnt.rgb = vec3( 1.0, 0.0, 1.0) : pnt.rgb;\n    ( pnt.r == .7 || pnt.g == .7 || pnt.b == .7 ) ? pnt.rgb = vec3( 1.0, 0.49, 0.49) : pnt.rgb;\n    ( pnt.r == .8 || pnt.g == .8 || pnt.b == .8 ) ? pnt.rgb = vec3( 0.49, 1.0, 0.49) : pnt.rgb;\n    ( pnt.r == .9 || pnt.g == .9 || pnt.b == .9 ) ? pnt.rgb = vec3( 0.49, 0.49, 1.0) : pnt.rgb;\n\n    return pnt;\n  }\n\n  // BRIGHTNESS [ 0 - 1 ]\n  // http://blog.ruofeidu.com/postprocessing-brightness-contrast-hue-saturation-vibrance/\n  if ( currentcoloreffect == 60 ) {\n    return vec4( src.rgb + extra, src.a );\n    //return vec4( src.rgb ^ (extra+1), src.a );\n  }\n\n  // CONTRAST [ 0 - 3 ]\n  if ( currentcoloreffect == 61 ) {\n    extra = extra * 3.;\n    float t = 0.5 - extra * 0.5;\n    src.rgb = src.rgb * extra + t;\n    return vec4( src.rgb, src.a );\n  }\n\n  // SATURATION [ 0 - 5 ]\n  if ( currentcoloreffect == 62 ) {\n    extra = extra * 5.;\n    vec3 luminance = vec3( 0.3086, 0.6094, 0.0820 );\n    float oneMinusSat = 1.0 - extra;\n    vec3 red = vec3( luminance.x * oneMinusSat );\n    red.r += extra;\n\n    vec3 green = vec3( luminance.y * oneMinusSat );\n    green.g += extra;\n\n    vec3 blue = vec3( luminance.z * oneMinusSat );\n    blue.b += extra;\n\n    return mat4(\n      red,     0,\n      green,   0,\n      blue,    0,\n      0, 0, 0, 1 ) * src;\n  }\n\n  // SHIFT HUE\n  if ( currentcoloreffect == 63 ) {\n    vec3 P = vec3(0.55735) * dot( vec3(0.55735), src.rgb );\n    vec3 U = src.rgb - P;\n    vec3 V = cross(vec3(0.55735), U);\n    src.rgb = U * cos( extra * 6.2832) + V * sin( extra * 6.2832) + P;\n    return src;\n  }\n\n  // hard black edge\n  if ( currentcoloreffect == 64 ) {\n    src.r + src.g + src.b > extra * 3.0? src.rgb = vec3( 1.0, 1.0, 1.0 ) : src.rgb = vec3( 0.0, 0.0, 0.0 );\n    return src;\n  }\n\n  // greenkey\n  if ( currentcoloreffect == 80 ) {\n    float temp_g = src.g;\n\n    //if ( src.g > 0.99 ) { // 135\n    if ( src.g > 0.2 && src.r < 0.2 && src.b < 0.2 ){\n      src.r = 0.0;\n      src.g = 0.0;\n      src.b = 0.0;\n      src.a = 0.0;\n    }\n\n    if ( src.g > 0.2 && src.r < 0.2 && src.b < 0.2 ){\n      src.r + src.g + src.b > extra * 3.0? src.rgb = vec3( 1.0, 1.0, 1.0 ) : src.rgb = vec3( 0.0, 0.0, 0.0 );\n    }\n\n\n    float maxrb = max( src.r, src.b );\n    float k = clamp( (src.g-maxrb)*5.0, 0.0, 1.0 );\n\n    //float ll = length( src );\n    //src.g = min( src.g, maxrb*0.8 );\n    //src = ll*normalize(src);\n\n    return vec4( mix(src.xyz, vec3(0.0, 0.0, 0.0), k), src.a );\n\n    //return vec4( src.xyz, src.a );\n    //return src;\n  }\n\n  // greenkey 2\n  if ( currentcoloreffect == 81 ) {\n\n    float maxrb = max( src.r, src.b );\n    float k = clamp( (src.g-maxrb)*5.0, 0.0, 1.0 );\n\n    //\n\n    //float ll = length( src );\n    //src.g = min( src.g, maxrb*0.8 );\n    //src = ll*normalize(src);\n\n    //else\n\n    //float dg = src.g;\n    //src.g = min( src.g, maxrb*0.8 );\n    //src += dg - src.g;\n\n    //#endif\n\n    vec3 bg = src.xyz;\n    bg.r = 0.0;\n    bg.g = 0.0;\n    bg.b = 0.0;\n\n    return vec4( mix(src.xyz, bg, k), mix( 1.0, 0.0, k) );\n    //return src;\n  }\n\n  if ( currentcoloreffect == 70 ) {\n    return src;\n  }\n\n\n\n\n\n  // default\n  return src;\n}\n\n/* custom_helpers */\n"
          )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_main */",
          "vec4 " +
            n.uuid +
            "_output = coloreffect( " +
            t.uuid +
            "_output, " +
            n.uuid +
            "_currentcoloreffect, " +
            n.uuid +
            "_extra, vUv );\n  /* custom_main */"
        ));
    }),
    (n.update = function () {}),
    (n.effect = function (e) {
      return (
        null != e &&
          ((o = e),
          console.log("effect set to: ", o),
          (renderer.customUniforms[n.uuid + "_currentcoloreffect"].value = o)),
        o
      );
    }),
    (n.extra = function (e) {
      return (
        null != e &&
          ((c = e), (renderer.customUniforms[n.uuid + "_extra"].value = c)),
        n.debug && console.log("extra set to: ", c),
        c
      );
    });
}
function DistortionEffect(e, r) {
  var n = this;
  null == r.uuid
    ? (n.uuid =
        "DistortionEffect_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (n.uuid = r.uuid),
    e.add(n),
    (n.type = "Effect");
  var t = r.source,
    o = r.effect,
    c = ((o = 1), 0.8);
  n.init = function () {
    (e.customUniforms[n.uuid + "_currentdistortioneffect"] = {
      type: "i",
      value: 1,
    }),
      (e.customUniforms[n.uuid + "_extra"] = { type: "f", value: 2 }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec4 " + n.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform int " +
          n.uuid +
          "_currentdistortioneffect;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " + n.uuid + "_extra;\n/* custom_uniforms */"
      )),
      -1 ==
        renderer.fragmentShader.indexOf(
          "vec4 distortioneffect ( sampler2D src, int currentdistortioneffect, float extra, vec2 vUv )"
        ) &&
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_helpers */",
          "\nvec4 distortioneffect ( sampler2D src, int currentdistortioneffect, float extra, vec2 vUv ) {\n  // normal\n  if ( currentdistortioneffect == 1 ) {\n    return texture2D( src, vUv ).rgba;\n  }\n\n  // phasing sides (test)\n  if ( currentdistortioneffect == 2 ) {\n    vec2 wuv = vec2(0,0);\n    if ( gl_FragCoord.x > screenSize.x * 0.5 ) wuv = vUv * vec2( 1., cos( time * .01 ) * 1. );\n    if ( gl_FragCoord.x < screenSize.x * 0.5 ) wuv = vUv * vec2( 1., sin( time * .01 ) * 1. );\n    wuv = wuv + vec2( .0, .0 );\n    return texture2D( src, wuv ).rgba;\n  }\n\n  // multi\n  if ( currentdistortioneffect == 3 ) {\n    vec2 wuv = vec2(0,0);\n    wuv = vUv * vec2( extra*6., extra*6. ) - vec2( extra * 3., extra * 3. );\n    // wuv = vUv + vec2( extra, extra );\n    return texture2D( src, wuv ).rgba;\n  }\n\n  // pip\n  if ( currentdistortioneffect == 4 ) {\n    vec2 wuv = vec2(0,0);\n    wuv = vUv * vec2( 2, 2 ) + vec2( 0., 0. );\n    float sil = 1.;\n\n    // top-left\n    if ( gl_FragCoord.x < ( screenSize.x * 0.07 ) || ( gl_FragCoord.x > screenSize.x * 0.37 ) ) sil = 0.;\n    if ( gl_FragCoord.y < ( screenSize.y * 0.60 ) || ( gl_FragCoord.y > screenSize.y * 0.97 ) ) sil = 0.;\n    return texture2D( src, wuv ).rgba * vec4( sil, sil, sil, sil );\n  }\n}\n\n\n\n\n  // -------------\n\n  // wipes (move these to mixer?)\n  //if ( gl_FragCoord.x > 200.0 ) {\n  //  return vec4(0.0,0.0,0.0,0.0);\n  //}else {\n  //  return src;\n  //}\n\n/* custom_helpers */\n"
        )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          n.uuid +
          "_output = distortioneffect( " +
          t.uuid +
          ", " +
          n.uuid +
          "_currentdistortioneffect, " +
          n.uuid +
          "_extra, vUv );\n  /* custom_main */"
      ));
  };
  (n.update = function () {
    0.001;
  }),
    (n.effect = function (e) {
      return (
        null != e &&
          ((o = e),
          renderer.customUniforms[n.uuid + "_currentdistortioneffect"] &&
            (renderer.customUniforms[
              n.uuid + "_currentdistortioneffect"
            ].value = e)),
        o
      );
    }),
    (n.extra = function (e) {
      return (
        null != e &&
          ((c = e),
          renderer.customUniforms[n.uuid + "_extra"] &&
            (renderer.customUniforms[n.uuid + "_extra"].value = c)),
        e
      );
    });
}
function FeedbackEffect(e, r) {
  var n = this;
  null == r.uuid
    ? (n.uuid =
        "FeedbackEffect_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (n.uuid = r.uuid),
    e.add(n),
    (n.type = "Effect");
  var t,
    o,
    c = r.source,
    u = r.effect,
    i = ((u = 12), 0.8),
    a = 128 * window.devicePixelRatio;
  new Uint8Array(a * a * 3);
  n.init = function () {
    ((t = document.createElement("canvas")).width = 1024),
      (t.height = 1024),
      (canvasElementContext = t.getContext("2d")),
      (canvasElementContext.fillStyle = "#000000"),
      canvasElementContext.fillRect(0, 0, 1024, 1024),
      console.log("FeedbackEffect inits, with", e),
      ((o = new THREE.Texture(t)).wrapS = THREE.RepeatWrapping),
      (o.wrapT = THREE.RepeatWrapping),
      o.repeat.set(4, 4),
      (e.customUniforms[n.uuid + "_effectsampler"] = { type: "t", value: o }),
      (e.customUniforms[n.uuid + "_currentfeedbackeffect"] = {
        type: "i",
        value: u,
      }),
      (e.customUniforms[n.uuid + "_extra"] = { type: "i", value: i }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec4 " + n.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform sampler2D  " +
          n.uuid +
          "_effectsampler;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform int  " +
          n.uuid +
          "_currentfeedbackeffect;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float  " + n.uuid + "_extra;\n/* custom_uniforms */"
      )),
      -1 ==
        renderer.fragmentShader.indexOf(
          "vec4 feedbackeffect ( vec4 src, int currentfeedbackeffect, vec2 vUv )"
        ) &&
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_helpers */",
          "\n  vec4 feedbackeffect ( vec4 src, int currentfeedbackeffect, vec2 vUv ) {\n\n    if ( currentfeedbackeffect == 100 ) {\n      // vec4 inbetween = vec4( src.r, src.g, src.b, vUv * 0.9. );\n      // gl_Position = vec4( vec2(0.,0.), 0., 0.);\n      // return inbetween.rrr;\n      // return src;\n\n      // return vec4(0., 0., 1., 1.);\n\n      vec2 wuv = vec2(0.,0.);\n      // wuv = vUv * vec2( 1.0, 1.0 ) - vec2( 0., 0. );\n      wuv = vUv; //* vec2( 1.0, 1.0 ) - vec2( 0., 0. );\n      //wuv = vUv - vec2( 0.1, 0. );\n      // wuv = vUv + vec2( extra, extra );\n      // return texture2D( src, wuv ).rgba;\n\n      return vec4( vec4( ( texture2D( " +
            n.uuid +
            "_effectsampler, wuv ).rgba * 0.9 ) + (src.rgba * .6 ) ).rgb, 1.);\n\n      // return ( texture2D( , vUv + vec2( 1., 0.99999999) ).rgba ) + src * 0.3;\n\n      // return ( texture2D( " +
            n.uuid +
            "_effectsampler, vUv  ).rgb * 1.4 + src * .8) * 0.5; //* vec3(.5, .5, .5\n      // return ( texture2D( src, vUv ).rgb );\n      // return ( texture2D( " +
            n.uuid +
            "_effectsampler, vUv  ).rgb ) * src + src;\n\n      //vec4 wuv = wuv = vUv * vec2( extra*6., extra*6. ) - vec2( extra * 3., extra * 3. );\n      //vec4 tex = texture2D( " +
            n.uuid +
            "_effectsampler, wuv ); //+ vec4( src.r, src.g, src.b, vUv * 2. );\n\n      // return src.rrr;\n      // tex.rgb = vec3(src.r, src.g, src.b);\n      // tex.xy = vec2(1.0,1.0);\n      // tex = tex + vec4( src.r, src.g, src.b, vUv * 2. );\n\n\n      // * 0.52 + vec4( src * 0.52, vUv ) *\n      // vec4 tex = vec4( src, vUv * .5 );\n      // return mix( tex, " +
            n.uuid +
            "_effectsampler, 0.).rgb;\n      // return mix(tex.rgb, src.rgb, 1.);\n    }\n\n    // uniform float noiseScale;\n    // uniform float time;\n    // uniform float baseSpeed;\n    // uniform sampler2D noiseTexture;\n\n    if ( currentfeedbackeffect == 101 ) {\n      // vec2 uvTimeShift = vUv + vec2( -0.7, 1.5 ) * time * baseSpeed;\n      // vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );\n      // vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.a );\n\n      // _effectsampler\n      // return  vec4 texture2D( baseTexture1, uvNoiseTimeShift )\n\n      // https://stackoverflow.com/questions/19872524/threejs-fragment-shader-using-recycled-frame-buffers\n      // http://labs.sense-studios.com/webgl/index4.html?r=sdad\n\n      // return _effectsampler.rgb\n      return src;\n    }\n\n    return src;\n  }\n\n  /* custom_helpers */\n"
        )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          n.uuid +
          "_output = feedbackeffect( " +
          c.uuid +
          "_output, " +
          n.uuid +
          "_currentfeedbackeffect, vUv );\n  /* custom_main */"
      ));
  };
  new THREE.Vector2();
  var s = 0;
  (n.update = function () {
    if ((s++, (glcanvas = document.getElementById("glcanvas")), s % 4 == 0)) {
      var e = 1024 * (1.6 * i),
        r = (1024 - e) / 2;
      canvasElementContext.drawImage(glcanvas, r, r, e, e);
    }
    o && (o.needsUpdate = !0);
  }),
    (n.effect = function (e) {
      return (
        null != e &&
          ((u = e),
          (renderer.customUniforms[n.uuid + "_currentfeedbackeffect"].value =
            u)),
        u
      );
    }),
    (n.extra = function (e) {
      return (
        null != e &&
          ((i = e), (renderer.customUniforms[n.uuid + "_extra"].value = i)),
        i
      );
    });
}
(AudioAnalysis.prototype = new Addon()),
  (AudioAnalysis.constructor = AudioAnalysis),
  (BPM.prototype = new Addon()),
  (BPM.constructor = BPM),
  (FileManager.prototype = new Addon()),
  (FileManager.constructor = FileManager),
  (GiphyManager.prototype = new Addon()),
  (GiphyManager.constructor = GiphyManager),
  (GamePadController.prototype = new Controller()),
  (GamePadController.constructor = GamePadController),
  (KeyboardController.prototype = new Controller()),
  (KeyboardController.constructor = KeyboardController),
  (MidiController.prototype = new Controller()),
  (MidiController.constructor = MidiController),
  (SocketController.prototype = new Controller()),
  (SocketController.constructor = SocketController),
  (ColorEffect.prototype = new Effect()),
  (ColorEffect.constructor = ColorEffect),
  (DistortionEffect.prototype = new Effect()),
  (DistortionEffect.constructor = DistortionEffect),
  (FeedbackEffect.prototype = new Effect()),
  (FeedbackEffect.constructor = FeedbackEffect);
var GlRenderer = function (e) {
  var r = this;
  (r.options = { element: "glcanvas" }),
    null != e && (r.options = e),
    r.options.canvas
      ? (r.element = r.options.canvas)
      : (r.element = document.getElementById(r.options.element)),
    (r.onafterrender = function () {}),
    r.options.width && r.options.height
      ? ((r.width = r.options.width), (r.height = r.options.height))
      : ((r.width = window.innerWidth), (r.height = window.innerHeight)),
    (r.scene = new THREE.Scene()),
    (r.camera = new THREE.PerspectiveCamera(75, r.width / r.height, 0.1, 1e3)),
    (r.camera.position.z = 20),
    (r.nodes = []),
    (r.customUniforms = {}),
    (r.customDefines = {});
  var n = 0;
  (r.customUniforms.time = { type: "f", value: n }),
    (r.customUniforms.screenSize = {
      type: "v2",
      value: new THREE.Vector2(r.width, r.height),
    }),
    (r.vertexShader =
      "\n    varying vec2 vUv;    void main() {      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );      vUv = uv;    }\n  "),
    (r.fragmentShader =
      "\n    uniform float time;\n    uniform vec2 screenSize;\n\n    /* custom_uniforms */    /* custom_helpers */    varying vec2 vUv;    void main() {      /* custom_main */    }\n  "),
    (r.init = function () {
      console.log("init renderer"),
        (r.glrenderer = new THREE.WebGLRenderer({
          canvas: r.element,
          alpha: !1,
          preserveDrawingBuffer: !0,
        })),
        r.nodes.forEach(function (e) {
          e.init();
        }),
        (r.shaderMaterial = new THREE.ShaderMaterial({
          uniforms: r.customUniforms,
          defines: r.customDefines,
          vertexShader: r.vertexShader,
          fragmentShader: r.fragmentShader,
          side: THREE.DoubleSide,
          transparent: !0,
        })),
        (r.flatGeometry = new THREE.PlaneGeometry(67, 38)),
        r.flatGeometry.translate(0, 0, 0),
        (r.surface = new THREE.Mesh(r.flatGeometry, r.shaderMaterial)),
        r.scene.add(r.surface);
    }),
    (r.render = function () {
      requestAnimationFrame(r.render),
        r.glrenderer.render(r.scene, r.camera),
        r.onafterrender(),
        r.glrenderer.setSize(r.width, r.height),
        r.nodes.forEach(function (e) {
          e.update();
        }),
        n++,
        (r.customUniforms.time.value = n);
    }),
    (r.resize = function () {
      r.options.autosize &&
        ((r.height = window.innerHeight), (r.width = window.innerWidth)),
        (r.customUniforms.screenSize = {
          type: "v2",
          value: new THREE.Vector2(r.width, r.height),
        }),
        (r.camera.aspect = r.width / r.height),
        r.camera.updateProjectionMatrix(),
        r.glrenderer.setSize(r.width, r.height);
    }),
    window.addEventListener("resize", function () {
      r.resize();
    }),
    (r.add = function (e) {
      r.nodes.push(e);
    }),
    (r.dispose = function () {
      r.shaderMaterial,
        r.flatGeometry,
        r.scene.remove(r.surface),
        r.glrenderer.resetGLState(),
        (r.customUniforms = {}),
        (r.customDefines = {}),
        (n = 0),
        (r.customUniforms.time = { type: "f", value: n }),
        (r.customUniforms.screenSize = {
          type: "v2",
          value: new THREE.Vector2(r.width, r.height),
        }),
        (r.vertexShader =
          "\n      varying vec2 vUv;\n      void main() {\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n        vUv = uv;\n      }\n    "),
        (r.fragmentShader =
          "\n      uniform int time;\n      uniform vec2 screenSize;\n\n      /* custom_uniforms */\n      /* custom_helpers */\n      varying vec2 vUv;\n      void main() {\n        /* custom_main */\n      }\n    "),
        (r.nodes = []);
    });
};
function Module(e, r) {
  (this.type = "Module"),
    (this.init = function () {}),
    (this.update = function () {}),
    (this.render = function () {});
}
function Chain(e, r) {
  var n,
    t = this;
  null == r.uuid
    ? (t.uuid =
        "Chain_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (t.uuid = r.uuid),
    e.add(t),
    null != r && (n = r),
    (t.type = "Module"),
    (t.sources = n.sources),
    t.sources.forEach(function (r, n) {
      e.customUniforms[t.uuid + "_source" + n + "_alpha"] = {
        type: "f",
        value: 0.5,
      };
    }),
    t.sources.forEach(function (r, n) {
      e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " +
          t.uuid +
          "_source" +
          n +
          "_alpha;\n/* custom_uniforms */"
      );
    }),
    (e.fragmentShader = e.fragmentShader.replace(
      "/* custom_uniforms */",
      "uniform float " + t.uuid + "_alpha;\n/* custom_uniforms */"
    )),
    (e.fragmentShader = e.fragmentShader.replace(
      "/* custom_uniforms */",
      "uniform vec3 " + t.uuid + "_output;\n/* custom_uniforms */"
    )),
    (t.init = function () {
      var r = "vec4(0.0,0.0,0.0,0.0)";
      t.sources.forEach(function (e, n) {
        r +=
          " + (" + e.uuid + "_output * " + t.uuid + "_source" + n + "_alpha )";
      }),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_main */",
          "vec4 " + t.uuid + "_output = vec4( " + r + "); /* custom_main */"
        ));
    }),
    (t.update = function () {}),
    (t.setChainLink = function (r, n) {
      e.customUniforms[t.uuid + "_source" + r + "_alpha"].value = n;
    }),
    (t.getChainLink = function (r) {
      return e.customUniforms[t.uuid + "_source" + r + "_alpha"].value;
    }),
    (t.setAll = function (r = 0) {
      t.sources.forEach(function (n, o) {
        e.customUniforms[t.uuid + "_source" + o + "_alpha"].value = r;
      });
    }),
    (t.toggle = function (r, n) {
      void 0 === n
        ? 1 == e.customUniforms[t.uuid + "_source" + r + "_alpha"].value
          ? (e.customUniforms[t.uuid + "_source" + r + "_alpha"].value = 0)
          : ((e.customUniforms[t.uuid + "_source" + r + "_alpha"].value = 1),
            (current = r))
        : (e.customUniforms[t.uuid + "_source" + r + "_alpha"].value = n);
    });
}
var Mapping = class {
    static function_list() {
      return [];
    }
    static help() {
      return "ownoes";
    }
    constructor(e, r) {
      var n = this;
      null != e &&
        (null == r.uuid
          ? (n.uuid =
              "Mapping_" +
              ((4294967296 * (1 + Math.random())) | 0)
                .toString(16)
                .substring(1))
          : (n.uuid = r.uuid),
        (n.renderer = e),
        (n.source = r.source),
        e.add(n),
        (n.type = "Module"),
        (n.internal_renderer = null),
        (n.init = function () {
          (n.vertexShader_test =
            "\n        varying vec2 vUv;        void main() {          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );          vUv = uv;        }\n      "),
            (n.fragmentShader_test =
              "\n          uniform float time;\n          uniform vec2 screenSize;\n\n          /* custom_uniforms */          /* custom_helpers */          varying vec2 vUv;          void main() {            /* custom_main */          }\n        "),
            (n.internal_renderer = new GlRenderer({ element: r.element })),
            console.log(" fragment_shader: "),
            (n.internal_renderer.fragmentShader = n.renderer.fragmentShader),
            (n.internal_renderer.vertexShader = n.renderer.vertexShader),
            console.log(" uniforms: "),
            console.log(n.renderer.customUniforms),
            (n.internal_renderer.customUniforms = n.renderer.customUniforms),
            (n.internal_renderer.customDefines = n.renderer.customDefines);
          new Output(n.internal_renderer, n.source);
          n.internal_renderer.init(), n.internal_renderer.render();
        }),
        (n.update = function () {
          document.getElementById("sourceCanvas");
        }),
        (n.mapping = {}),
        (n.load_pixelmap = function (e) {
          new Utils().get(e, function (e) {
            n.mapping = JSON.parse(e);
          });
        }));
    }
  },
  Mixer = class {
    static function_list() {
      return [
        ["BLEND", "method", "blendMode"],
        ["MIX", "method", "mixMode"],
        ["POD", "set", "pod"],
      ];
    }
    constructor(e, r) {
      var n = this;
      if (null != e) {
        null == r.uuid
          ? (n.uuid =
              "Mixer_" +
              ((4294967296 * (1 + Math.random())) | 0)
                .toString(16)
                .substring(1))
          : (n.uuid = r.uuid),
          e.add(n),
          null != r && r,
          (n.type = "Module");
        var t = 1,
          o = 0,
          c = 0,
          u = 128,
          i = 1,
          a = function () {
            return u;
          };
        (n.autoFade = !1), (n.fading = !1);
        var s = 1;
        n.mixmodes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var d,
          l,
          f = 1;
        (n.blendmodes = [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
        ]),
          (d = r.source1),
          (l = r.source2),
          (n.init = function () {
            (e.customUniforms[n.uuid + "_mixmode"] = { type: "i", value: 1 }),
              (e.customUniforms[n.uuid + "_blendmode"] = {
                type: "i",
                value: 1,
              }),
              (e.customUniforms[n.uuid + "_alpha1"] = {
                type: "f",
                value: 0.5,
              }),
              (e.customUniforms[n.uuid + "_alpha2"] = {
                type: "f",
                value: 0.5,
              }),
              (e.customUniforms[n.uuid + "_sampler"] = {
                type: "t",
                value: null,
              }),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_uniforms */",
                "uniform int " + n.uuid + "_mixmode;\n/* custom_uniforms */"
              )),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_uniforms */",
                "uniform int " + n.uuid + "_blendmode;\n/* custom_uniforms */"
              )),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_uniforms */",
                "uniform float " + n.uuid + "_alpha1;\n/* custom_uniforms */"
              )),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_uniforms */",
                "uniform float " + n.uuid + "_alpha2;\n/* custom_uniforms */"
              )),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_uniforms */",
                "uniform vec4 " + n.uuid + "_output;\n/* custom_uniforms */"
              )),
              -1 ==
                e.fragmentShader.indexOf(
                  "vec4 blend ( vec4 src, vec4 dst, int blendmode )"
                ) &&
                (e.fragmentShader = e.fragmentShader.replace(
                  "/* custom_helpers */",
                  "\n  vec4 blend ( vec4 src, vec4 dst, int blendmode ) {\n    if ( blendmode ==  1 ) return src + dst;\n    if ( blendmode ==  2 ) return src - dst;\n    if ( blendmode ==  3 ) return src * dst;\n    if ( blendmode ==  4 ) return min(src, dst);\n    if ( blendmode ==  5)  return vec4((src.x == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.x) / src.x)), (src.y == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.y) / src.y)), (src.z == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.z) / src.z)),1.0);\n    if ( blendmode ==  6 ) return (src + dst) - 1.0;\n    if ( blendmode ==  7 ) return max(src, dst);\n    if ( blendmode ==  8 ) return (src + dst) - (src * dst);\n    if ( blendmode ==  9 ) return vec4((src.x == 1.0) ? 1.0 : min(1.0, dst.x / (1.0 - src.x)), (src.y == 1.0) ? 1.0 : min(1.0, dst.y / (1.0 - src.y)), (src.z == 1.0) ? 1.0 : min(1.0, dst.z / (1.0 - src.z)), 1.0);\n    if ( blendmode == 10 ) return src + dst;\n    if ( blendmode == 11 ) return vec4((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)), (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)), (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)), 1.0);\n    if ( blendmode == 12 ) return vec4((src.x <= 0.5) ? (dst.x - (1.0 - 2.0 * src.x) * dst.x * (1.0 - dst.x)) : (((src.x > 0.5) && (dst.x <= 0.25)) ? (dst.x + (2.0 * src.x - 1.0) * (4.0 * dst.x * (4.0 * dst.x + 1.0) * (dst.x - 1.0) + 7.0 * dst.x)) : (dst.x + (2.0 * src.x - 1.0) * (sqrt(dst.x) - dst.x))), (src.y <= 0.5) ? (dst.y - (1.0 - 2.0 * src.y) * dst.y * (1.0 - dst.y)) : (((src.y > 0.5) && (dst.y <= 0.25)) ? (dst.y + (2.0 * src.y - 1.0) * (4.0 * dst.y * (4.0 * dst.y + 1.0) * (dst.y - 1.0) + 7.0 * dst.y)) : (dst.y + (2.0 * src.y - 1.0) * (sqrt(dst.y) - dst.y))), (src.z <= 0.5) ? (dst.z - (1.0 - 2.0 * src.z) * dst.z * (1.0 - dst.z)) : (((src.z > 0.5) && (dst.z <= 0.25)) ? (dst.z + (2.0 * src.z - 1.0) * (4.0 * dst.z * (4.0 * dst.z + 1.0) * (dst.z - 1.0) + 7.0 * dst.z)) : (dst.z + (2.0 * src.z - 1.0) * (sqrt(dst.z) - dst.z))), 1.0);\n    if ( blendmode == 13 ) return vec4((src.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - src.x) * (1.0 - dst.x)), (src.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - src.y) * (1.0 - dst.y)), (src.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - src.z) * (1.0 - dst.z)), 1.0);\n    if ( blendmode == 14 ) return vec4((src.x <= 0.5) ? (1.0 - (1.0 - dst.x) / (2.0 * src.x)) : (dst.x / (2.0 * (1.0 - src.x))), (src.y <= 0.5) ? (1.0 - (1.0 - dst.y) / (2.0 * src.y)) : (dst.y / (2.0 * (1.0 - src.y))), (src.z <= 0.5) ? (1.0 - (1.0 - dst.z) / (2.0 * src.z)) : (dst.z / (2.0 * (1.0 - src.z))),1.0);\n    if ( blendmode == 15 ) return 2.0 * src + dst - 1.0;\n    if ( blendmode == 16 ) return vec4((src.x > 0.5) ? max(dst.x, 2.0 * (src.x - 0.5)) : min(dst.x, 2.0 * src.x), (src.x > 0.5) ? max(dst.y, 2.0 * (src.y - 0.5)) : min(dst.y, 2.0 * src.y), (src.z > 0.5) ? max(dst.z, 2.0 * (src.z - 0.5)) : min(dst.z, 2.0 * src.z),1.0);\n    if ( blendmode == 17 ) return abs(dst - src);\n    if ( blendmode == 18 ) return src + dst - 2.0 * src * dst;\n    return src + dst;\n  }\n  /* custom_helpers */\n  "
                ));
            var r = "";
            (r += "vec4 " + n.uuid + "_output = vec4( blend( "),
              (r += d.uuid + "_output * " + n.uuid + "_alpha1, "),
              (r += l.uuid + "_output * " + n.uuid + "_alpha2, "),
              (r += n.uuid + "_blendmode ) "),
              (r += ")"),
              (r +=
                " + vec4(  " +
                d.uuid +
                "_output.a < 1.0 ? " +
                l.uuid +
                "_output.rgba * ( " +
                n.uuid +
                "_alpha1 - " +
                d.uuid +
                "_output.a ) : vec4( 0.,0.,0.,0. )  ) "),
              (r +=
                " + vec4(  " +
                l.uuid +
                "_output.a < 1.0 ? " +
                d.uuid +
                "_output.rgba * ( " +
                n.uuid +
                "_alpha2 - - " +
                l.uuid +
                "_output.a ) : vec4( 0.,0.,0.,0. )  ) "),
              (r += ";\n"),
              (r += "  /* custom_main */  "),
              (e.fragmentShader = e.fragmentShader.replace(
                "/* custom_main */",
                r
              ));
          });
        var m = new Date().getTime(),
          g = 0,
          p = 0,
          v = 0,
          h = "b",
          b = 0;
        (n.update = function () {
          if (
            (n.autoFade &&
              ((u = a()),
              (g = (new Date().getTime() - m) / 1e3),
              n.pod(Math.sin((g * Math.PI * u * i) / 60) / 2 + 0.5)),
            n.fading)
          ) {
            var e = new Date().getTime(),
              r = (p = v - e) / b;
            "b" == h && (r = Math.abs(r - 1)),
              r < 0 && (r = 0),
              r > 1 && (r = 1),
              n.pod(r),
              p < 0 && ((n.fading = !1), (r = Math.round(r)), n.pod(r));
          }
        }),
          (n.render = function () {
            return c;
          }),
          (n.alpha1 = function () {
            return t;
          }),
          (n.alpha2 = function () {
            return o;
          }),
          (n.mixMode = function (e) {
            return null != e && (s = e), s;
          }),
          (n.blendMode = function (r) {
            return (
              null != r &&
                ((f = r), (e.customUniforms[n.uuid + "_blendmode"].value = f)),
              n.pod(n.pod()),
              f
            );
          }),
          (n.pod = function (r) {
            return (
              null != r &&
                ((c = r),
                1 == s && ((t = c), (o = 1 - c)),
                2 == s && ((t = Math.round(c)), (o = Math.round(1 - c))),
                3 == s &&
                  ((t = 2 * c) > 1 && (t = 1), (o = 2 - 2 * c) > 1 && (o = 1)),
                4 == s && ((t = 2 * c), (o = 2 - 2 * c)),
                5 == s &&
                  ((t = 2 * c) > 1 && (t = 1),
                  (o = 2 - 2 * c) > 1 && (o = 1),
                  (t += 0.36),
                  (o += 0.36)),
                6 == s && ((t = 1), (o = 0)),
                7 == s && ((t = 0), (o = 1)),
                8 == s && ((t = 0.5), (o = 0.5)),
                9 == s && ((t = 1), (o = 1)),
                10 == s && ((t = c), (o = 1)),
                11 == s && ((t = 1), (o = c)),
                (e.customUniforms[n.uuid + "_alpha1"].value = t),
                (e.customUniforms[n.uuid + "_alpha2"].value = o)),
              c
            );
          }),
          (n.bpm = function (e) {
            return null != e && (u = e), u;
          }),
          (n.bpmMod = function (e) {
            return null != e && (i = e), i;
          }),
          (n.bindBpm = function (e) {
            a = e;
          }),
          (n.setAutoFade = function (e) {
            "true" == e.toLowerCase() && (n.autoFade = !0),
              "false" == e.toLowerCase() && (n.autoFade = !1);
          }),
          (n.fade = function (e) {
            n.pod();
            n.fading = !0;
            var r = new Date().getTime();
            (v = r + e),
              (h = n.pod() > 0.5 ? "a" : "b"),
              console.log("fadeTo", h, v, r, e),
              (b = e);
          });
      }
    }
  },
  Monitor = class {
    static function_list() {
      return [];
    }
    static help() {
      return "ownoes";
    }
    constructor(e, r) {
      var n = this;
      null != e &&
        (null == r.uuid
          ? (n.uuid =
              "Mixer_" +
              ((4294967296 * (1 + Math.random())) | 0)
                .toString(16)
                .substring(1))
          : (n.uuid = r.uuid),
        (n.renderer = e),
        (n.source = r.source),
        e.add(n),
        (n.type = "Module"),
        (n.internal_renderer = null),
        (n.init = function () {
          (n.internal_renderer = new GlRenderer({ element: r.element })),
            (n.internal_renderer.fragmentShader = n.renderer.fragmentShader),
            (n.internal_renderer.vertexShader = n.renderer.vertexShader),
            (n.internal_renderer.customUniforms = n.renderer.customUniforms),
            (n.internal_renderer.customDefines = n.renderer.customDefines);
          new Output(n.internal_renderer, n.source);
          n.internal_renderer.init(), n.internal_renderer.render();
        }),
        (n.update = function () {}));
    }
  };
function Output(e, r) {
  (this.uuid =
    "Output_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (this.type = "Module"),
    e.add(this);
  var n = r;
  (this.init = function () {
    e.fragmentShader = e.fragmentShader.replace(
      "/* custom_main */",
      "\n  gl_FragColor = vec4( " + n.uuid + "_output );\n"
    );
  }),
    (this.update = function () {});
}
function Switcher(e, r) {
  var n = this;
  (n.uuid =
    "Switcher_" +
    ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1)),
    (n.type = "Module"),
    e.add(n),
    (n.sources = [r.source1, r.source2]),
    (n.active_source = 0),
    (n.init = function () {
      console.log("Switcher", n.uuid, n.sources),
        (e.customUniforms[n.uuid + "_active_source"] = { type: "i", value: 1 }),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform int " + n.uuid + "_active_source;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform vec4 " + n.uuid + "_output;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_helpers */",
          "\nvec4 get_source_" +
            n.uuid +
            " ( int active_source, vec4 src1, vec4 src2 ) {\n  if ( active_source ==  0 ) return src1;  if ( active_source ==  1 ) return src2;}\n/* custom_helpers */\n"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_main */",
          "vec4 " +
            n.uuid +
            "_output = get_source_" +
            n.uuid +
            "(" +
            n.uuid +
            "_active_source, " +
            n.sources[0].uuid +
            "_output, " +
            n.sources[1].uuid +
            "_output );\n  /* custom_main */"
        ));
    }),
    (n.update = function () {}),
    (n.render = function () {
      return n.sources[n.active_source];
    }),
    (n.doSwitch = function (r) {
      return (
        null == r
          ? 0 == n.active_source
            ? (n.active_source = 1)
            : (n.active_source = 0)
          : 0 != r && 1 != r
          ? console.log(n.uuid, r, "not allowed")
          : (n.active_source = r),
        (e.customUniforms[n.uuid + "_active_source"] = {
          type: "i",
          value: n.active_source,
        }),
        n.active_source
      );
    });
}
var Source = class {
  constructor(e, r) {
    (this.type = "Source"),
      (this.function_list = [["JUMP", "method", "jump"]]),
      (this.init = function () {}),
      (this.update = function () {}),
      (this.render = function () {}),
      (this.start = function () {}),
      (this.src = function (e) {}),
      (this.play = function () {}),
      (this.pause = function () {}),
      (this.paused = function () {}),
      (this.currentFrame = function (e) {}),
      (this.duration = function () {}),
      (this.jump = function () {});
  }
};
function GifSource(e, r) {
  var n,
    t,
    o,
    c,
    u,
    i = this;
  null == r.uuid
    ? (i.uuid =
        "GifSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (i.uuid = r.uuid),
    (i.type = "GifSource"),
    (i.bypass = !0),
    e.add(i),
    null == r.src
      ? (i.currentSrc =
          "https://virtualmixerproject.com/gif/a443ae90a963a657e12737c466ddff95.gif")
      : (i.currentSrc = r.src);
  i.init = function () {
    ((n = document.createElement("canvas")).width = 1024),
      (n.height = 1024),
      (o = n.getContext("2d")),
      (c = new THREE.Texture(n)),
      (e.customUniforms[i.uuid] = { type: "t", value: c }),
      (e.customUniforms[i.uuid + "_alpha"] = { type: "f", value: 1 }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform sampler2D " + i.uuid + ";\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec4 " + i.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " + i.uuid + "_alpha;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          i.uuid +
          "_output = ( texture2D( " +
          i.uuid +
          ", vUv ).rgba * " +
          i.uuid +
          "_alpha );\n  /* custom_main */"
      )),
      (i.gif = u),
      (i.canvas = n),
      (window.image_source = new Image()),
      (t = document.createElement("img")).setAttribute("id", "gif_" + i.uuid),
      t.setAttribute("rel:auto_play", "1"),
      ((u = new SuperGif({
        gif: t,
        c_w: "1024px",
        c_h: "576px",
      })).draw_while_loading = !0),
      console.log(i.uuid, " Load", i.currentSrc, "..."),
      u.load_url(i.currentSrc, function () {
        console.log("play initial source"), u.play();
      }),
      console.log("Gifsource Loaded First source!", i.currentSrc, "!"),
      (i.bypass = !1);
  };
  var a = 0;
  (i.update = function () {
    try {
      a % 6 == 0 &&
        (o.clearRect(0, 0, 1024, 1024),
        o.drawImage(u.get_canvas(), 0, 0, 1024, 1024),
        c && (c.needsUpdate = !0)),
        a++;
    } catch (e) {}
  }),
    (i.render = function () {
      return c;
    }),
    (i.src = function (e) {
      if (null == e) return i.currentSrc;
      console.log("load new src: ", e),
        (i.currentSrc = e),
        u.pause(),
        u.load_url(e, function () {
          console.log("play gif", e), u.play();
        });
    }),
    (i.play = function () {
      return u.play();
    }),
    (i.pause = function () {
      return u.pause();
    }),
    (i.paused = function () {
      return !u.get_playing();
    }),
    (i.currentFrame = function (e) {
      return void 0 === e ? u.get_current_frame() : (u.move_to(e), e);
    }),
    (i.duration = function () {
      return u.get_length();
    });
}
function MultiVideoSource(e, r) {
  var n,
    t,
    o,
    c = this;
  null == r.uuid
    ? (c.uuid =
        "MultiVideoSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (c.uuid = r.uuid),
    (c.type = "MultiVideoSource"),
    (c.bypass = !0),
    e.add(c);
  (c.init = function () {
    console.log("init video source", c.uuid),
      (videoElement = document.createElement("video")),
      videoElement.setAttribute("crossorigin", "anonymous"),
      (videoElement.muted = !0),
      null == r.src
        ? (videoElement.src = "/streamable.com/w0skqb")
        : (videoElement.src = r.src),
      console.log("loaded source: ", videoElement.src),
      (videoElement.height = 1024),
      (videoElement.width = 1024),
      (videoElement.loop = !0),
      videoElement.load(),
      (c.firstplay = !1);
    var u = setInterval(function () {
      if (4 == videoElement.readyState) {
        var e = Math.random() * videoElement.duration;
        (videoElement.currentTime = e),
          videoElement.play(),
          (c.firstplay = !0),
          console.log(c.uuid, "First Play; ", e),
          clearInterval(u);
      }
    }, 400);
    document.body.addEventListener("click", function () {
      videoElement.play(), (c.firstplay = !0);
    }),
      (videoElement.volume = 0),
      ((n = document.createElement("canvas")).width = 1024),
      (n.height = 1024),
      (t = n.getContext("2d")),
      (o = new THREE.Texture(n)),
      (e.customUniforms[c.uuid] = { type: "t", value: o }),
      (e.customUniforms[c.uuid + "_alpha"] = { type: "f", value: 1 }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform sampler2D " + c.uuid + ";\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec4 " + c.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " + c.uuid + "_alpha;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          c.uuid +
          "_output = ( texture2D( " +
          c.uuid +
          ", vUv ).rgba * " +
          c.uuid +
          "_alpha );\n  /* custom_main */"
      )),
      (c.video = videoElement),
      (c.canvas = n),
      (c.bypass = !1);
  }),
    (c.update = function () {
      (c.bypass = !1) ||
        (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA ||
        videoElement.seeking
          ? (t.clearRect(0, 0, 1024, 1024), (c.alpha = 0))
          : (t.drawImage(videoElement, 0, 0, 1024, 1024),
            o && (o.needsUpdate = !0)));
    }),
    (c.render = function () {
      return o;
    }),
    (c.src = function (e) {
      videoElement.src = e;
      var r = setInterval(function () {
        4 == videoElement.readyState &&
          (videoElement.play(),
          console.log(c.uuid, "First Play."),
          clearInterval(r));
      }, 400);
    }),
    (c.play = function () {
      return videoElement.play();
    }),
    (c.pause = function () {
      return videoElement.pause();
    }),
    (c.paused = function () {
      return videoElement.paused;
    }),
    (c.currentTime = function (e) {
      return void 0 === e
        ? videoElement.currentTime
        : (console.log("set time", e), (videoElement.currentTime = e), e);
    }),
    (c.duration = function () {
      return videoElement.duration;
    }),
    (c.alpha = function (r) {
      if (null == r) return e.customUniforms[c.uuid + "_alpha"].value;
      e.customUniforms[c.uuid + "_alpha"].value = r;
    }),
    (c.jump = function (e) {
      if (null == e || isNaN(e))
        try {
          videoElement.currentTime = Math.floor(Math.random() * c.duration());
        } catch (e) {
          console.log("prevented a race error");
        }
      else videoElement.currentTime = e;
      return videoElement.currentTime;
    });
}
function SocketSource(e, r) {}
function SolidSource(e, r) {
  var n,
    t = this;
  null == r.uuid
    ? (t.uuid =
        "SolidSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (t.uuid = r.uuid),
    (t.bypass = !0),
    e.add(t);
  var o = { r: 0, g: 0, b: 0, a: 1 };
  null != r && (n = r),
    (t.init = function () {
      console.log("init solid", n),
        null != n.color && (o = n.color),
        (e.customUniforms[t.uuid + "_color"] = {
          type: "v4",
          value: new THREE.Vector4(o.r, o.g, o.b, o.a),
        }),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform vec4 " + t.uuid + "_color;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform vec4 " + t.uuid + "_output;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_main */",
          "vec4 " +
            t.uuid +
            "_output = " +
            t.uuid +
            "_color;\n  /* custom_main */"
        ));
    }),
    (t.update = function () {}),
    (t.render = function () {
      return o;
    }),
    (t.color = function (r) {
      return (
        null != r &&
          (null == (o = r).a && (o.a = 1),
          console.log(t.uuid, " sets color: ", o),
          (e.customUniforms[t.uuid + "_color"] = {
            type: "v4",
            value: new THREE.Vector4(o.r, o.g, o.b, o.a),
          })),
        o
      );
    }),
    (t.jump = function (e) {
      console.log("no");
    });
}
function SVGSource(e, r) {}
function TextSource(e, r) {
  var n,
    t,
    o,
    c,
    u = this;
  null == r.uuid
    ? (u.uuid =
        "TextSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (u.uuid = r.uuid),
    (u.type = "TextSource"),
    (u.bypass = !0),
    e.add(u);
  u.init = function () {
    console.log("init text source", u.uuid),
      ((t = document.createElement("DIV")).innerHTML =
        "<h1> Awaiting text </h1>"),
      (t.height = 1024),
      (t.width = 1024),
      (u.firstplay = !1),
      (n = document.createElement("canvas")),
      document.body.appendChild(n),
      (n.width = 1024),
      (n.height = 1024),
      (o = n.getContext("2d")),
      (c = new THREE.CanvasTexture(n)),
      (e.customUniforms[u.uuid] = { type: "t", value: c }),
      (e.customUniforms[u.uuid + "_alpha"] = { type: "f", value: 1 }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform sampler2D " + u.uuid + ";\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec4 " + u.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " + u.uuid + "_alpha;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          u.uuid +
          "_output = ( texture2D( " +
          u.uuid +
          ", vUv ).rgba * " +
          u.uuid +
          "_alpha );\n  /* custom_main */"
      )),
      (u.divElement = t),
      (u.canvas = n),
      (u.bypass = !1);
  };
  var i = null;
  utils.get("/texts/fear_is_the_mind_killer.txt", function (e) {
    (i = e), console.log("get text", e);
  });
  var a = 0,
    s = "",
    d = 0,
    l = 12,
    f = 600,
    m = 300,
    g = 64,
    p = 512;
  (u.update = function () {
    (g *= 0.99),
      (u.bypass = !1) ||
        (null != i &&
          (o.clearRect(0, 0, n.width, n.height),
          (o.fillStyle = "rgba(60, 60, 60, 0.4)"),
          (o.font = "604px IMPACT"),
          (o.textAlign = "center"),
          o.fillText(s.split(".").join(""), 10 * bpm.render() + m, f),
          (o.fillStyle = "white"),
          (o.font = g + "px IMPACT"),
          (o.textAlign = "center"),
          o.fillText(s.split(".").join(""), p, 460),
          a > l &&
            ((s = i.split(",")[d]),
            (l = i.split(",")[d].length * (bpm.bpm / 72) + 3),
            ++d == i.split(",").length && (d = 0),
            (a = 0),
            (f = Math.floor(200 * Math.random()) + 600),
            (m = Math.floor(200 * Math.random()) + 200),
            (p = Math.floor(100 * Math.random()) + 470),
            (g = Math.floor(30 * Math.random()) + 70)),
          a++,
          c && (c.needsUpdate = !0)));
  }),
    (u.render = function () {
      return c;
    }),
    (u.alpha = function (r) {
      if (null == r) return e.customUniforms[u.uuid + "_alpha"].value;
      e.customUniforms[u.uuid + "_alpha"].value = r;
    });
}
function VideoSource(e, r) {
  var n = this,
    t = 1024;
  null == r.uuid
    ? (n.uuid =
        "VideoSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (n.uuid = r.uuid);
  var o, c, u, i;
  r.texture_size &&
    (console.log("texture size now is: ", r.texture_size),
    (t = r.texture_size)),
    (n.currentSrc = "https://virtualmixproject.com/video/placeholder.mp4"),
    (n.type = "VideoSource"),
    (n.bypass = !0);
  e.add(n),
    (n.init = function () {
      console.log("init video source", n.uuid),
        (c = document.createElement("video")).setAttribute(
          "crossorigin",
          "anonymous"
        ),
        c.setAttribute("playsinline", !0),
        (c.playsinline = !0),
        (c.preload = "auto"),
        (c.muted = !0),
        (c.poster =
          "https://virtualmixproject.com/gif/telephone-pole-wire-tennis-shoes.jpg"),
        null == r.src ? (c.src = n.currentSrc) : (c.src = r.src),
        console.log("loaded source: ", c.src),
        (c.height = t),
        (c.width = t),
        (c.volume = 0),
        (c.loop = !0),
        c.load(),
        (n.firstplay = !1);
      var a = setInterval(function () {
        if (4 == c.readyState) {
          var e = Math.random() * c.duration;
          c.play(),
            (n.firstplay = !0),
            console.log(n.uuid, "First Play; ", e),
            clearInterval(a);
        }
      }, 400);
      function s() {
        c.play(),
          (n.firstplay = !0),
          document.body.removeEventListener("click", s),
          document.body.removeEventListener("touchstart", s),
          console.log("first touch was denied");
      }
      document.body.addEventListener("click", s),
        document.body.addEventListener("touchstart", s),
        ((o = document.createElement("canvas")).width = t),
        (o.height = t),
        (u = o.getContext("2d")),
        ((i = new THREE.Texture(o)).wrapS = THREE.RepeatWrapping),
        (i.wrapT = THREE.RepeatWrapping),
        (e.customUniforms[n.uuid] = { type: "t", value: i }),
        (e.customUniforms[n.uuid + "_alpha"] = { type: "f", value: 1 }),
        (e.customUniforms[n.uuid + "_uvmap"] = {
          type: "v2",
          value: new THREE.Vector2(1, 1),
        }),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform sampler2D " + n.uuid + ";\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform float " + n.uuid + "_alpha;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_uniforms */",
          "uniform vec2 " + n.uuid + "_uvmap;\n/* custom_uniforms */"
        )),
        (e.fragmentShader = e.fragmentShader.replace(
          "/* custom_main */",
          `\n      vec4 ${n.uuid + "_output"} = ( texture2D( ${n.uuid}, vUv * ${
            n.uuid + "_uvmap"
          } ).rgba * ${n.uuid + "_alpha"} );\n      /* custom_main */\n      `
        )),
        (n.video = c),
        (n.canvas = o),
        (n.bypass = !1);
    });
  (n.update = function () {
    (n.bypass = !1) ||
      (c && c.readyState.readyState === c.HAVE_ENOUGH_DATA && c.seeking,
      u.drawImage(c, 0, 0, t, t),
      i && (i.needsUpdate = !0));
  }),
    (n.render = function () {
      return i;
    }),
    (n.src = function (e) {
      if (null == e) return currentSrc;
      try {
        n.currentSrc = e;
      } catch (e) {
        return void console.log(
          "VideoSource returned empty promise, retrying ..."
        );
      }
      (c.src = e), c.play();
    }),
    (n.play = function () {
      return c.play();
    }),
    (n.pause = function () {
      return c.pause();
    }),
    (n.paused = function () {
      return c.paused;
    }),
    (n.currentTime = function (e) {
      return void 0 === e
        ? c.currentTime
        : (console.log("set time", e), (c.currentTime = e), e);
    }),
    (n.duration = function () {
      return c.duration;
    }),
    (n.setUVMap = function (r, t) {
      e.customUniforms[n.uuid + "_uvmap"].value = new THREE.Vector2(r, t);
    }),
    (n.setUVMapMod = function (r, t) {
      console.log(e.customUniforms),
        (e.customUniforms[n.uuid + "_uvmap_mod"].value = new THREE.Vector2(
          r,
          t
        ));
    }),
    (n.alpha = function (r) {
      if (null == r) return e.customUniforms[n.uuid + "_alpha"].value;
      e.customUniforms[n.uuid + "_alpha"].value = r;
    }),
    (n.jump = function (e) {
      if (4 == c.readyState) {
        if (null == e || isNaN(e))
          try {
            var r = Math.floor(Math.random() * c.buffered.end(0));
            console.log("jump to ", r), (c.currentTime = r);
          } catch (e) {
            console.warn("video jump prevented a race error", e),
              (c.currentTime = 0);
          }
        else c.currentTime = e;
        return c.currentTime;
      }
      console.warn("Not enough data for jumping through video...");
    });
}
function WebcamSource(e, r) {
  var n,
    t,
    o,
    c,
    u = this;
  null == r.uuid
    ? (u.uuid =
        "WebcamSource_" +
        ((4294967296 * (1 + Math.random())) | 0).toString(16).substring(1))
    : (u.uuid = r.uuid),
    (u.type = "WebcamSource"),
    (u.bypass = !0),
    e.add(u);
  (u.init = function () {
    console.log("init video source", u.uuid),
      (t = document.createElement("video")).setAttribute(
        "crossorigin",
        "anonymous"
      ),
      (t.height = 1024),
      (t.width = 1024),
      (t.loop = !0),
      t.load(),
      (u.firstplay = !1);
    navigator.mediaDevices
      .getUserMedia({ audio: !1, video: { width: 1024, height: 1024 } })
      .then(function (e) {
        (t.srcObject = e),
          (t.onloadedmetadata = function (e) {
            t.play();
          });
      })
      .catch(function (e) {
        console.log(e.name + ": " + e.message);
      });
    var r = setInterval(function () {
      if (4 == t.readyState) {
        var e = Math.random() * t.duration;
        t.play(),
          (u.firstplay = !0),
          console.log(u.uuid, "First Play; ", e),
          clearInterval(r);
      }
    }, 400);
    document.body.addEventListener("click", function () {
      t.play(), (u.firstplay = !0);
    }),
      (t.volume = 0),
      ((n = document.createElement("canvas")).width = 1024),
      (n.height = 1024),
      (o = n.getContext("2d")),
      (c = new THREE.Texture(n)),
      (e.customUniforms[u.uuid] = { type: "t", value: c }),
      (e.customUniforms[u.uuid + "_alpha"] = { type: "f", value: 1 }),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform sampler2D " + u.uuid + ";\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform vec3 " + u.uuid + "_output;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_uniforms */",
        "uniform float " + u.uuid + "_alpha;\n/* custom_uniforms */"
      )),
      (e.fragmentShader = e.fragmentShader.replace(
        "/* custom_main */",
        "vec4 " +
          u.uuid +
          "_output = ( texture2D( " +
          u.uuid +
          ", vUv ).rgba * " +
          u.uuid +
          "_alpha );\n  /* custom_main */"
      )),
      (u.video = t),
      (u.canvas = n),
      (u.bypass = !1);
  }),
    (u.update = function () {
      (u.bypass = !1) ||
        (t.readyState !== t.HAVE_ENOUGH_DATA || t.seeking
          ? (o.clearRect(0, 0, 1024, 1024), (u.alpha = 0))
          : (o.drawImage(t, 0, 0, 1024, 1024), c && (c.needsUpdate = !0)));
    }),
    (u.render = function () {
      return c;
    }),
    (u.play = function () {
      return t.play();
    }),
    (u.pause = function () {
      return t.pause();
    }),
    (u.paused = function () {
      return t.paused;
    }),
    (u.duration = function () {
      return t.duration;
    }),
    (u.alpha = function (r) {
      if (null == r) return e.customUniforms[u.uuid + "_alpha"].value;
      e.customUniforms[u.uuid + "_alpha"].value = r;
    });
}
(GifSource.prototype = new Source()),
  (GifSource.constructor = GifSource),
  (MultiVideoSource.prototype = new Source()),
  (MultiVideoSource.constructor = MultiVideoSource),
  (SocketSource.prototype = new Source()),
  (SocketSource.constructor = SocketSource),
  (SolidSource.prototype = new Source()),
  (SolidSource.constructor = SolidSource),
  (SVGSource.prototype = new Source()),
  (SVGSource.constructor = SVGSource),
  (TextSource.prototype = new Source()),
  (TextSource.constructor = TextSource),
  (VideoSource.prototype = new Source()),
  (VideoSource.constructor = VideoSource),
  (WebcamSource.prototype = new Source()),
  (WebcamSource.constructor = WebcamSource);