(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/CallingComponent.vue?vue&type=script&lang=js&":
/*!***************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/CallingComponent.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _signalwire_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @signalwire/js */ "./node_modules/@signalwire/js/dist/esm/js/index.js");


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: ['project_credientials'],
  mounted: function mounted() {
    console.log('Component mounted.');
  },
  data: function data() {
    return {
      currentCall: null,
      connectStatus: 'Not Connected',
      connected_call: 0,
      connected_button: true,
      dis_connected_button: false,
      client: null,
      dialer: '',
      hang_call: 1,
      hang_call_display: 1
    };
  },
  methods: {
    connect: function connect() {
      var self = this;
      self.client = new _signalwire_js__WEBPACK_IMPORTED_MODULE_1__["Relay"]({
        project: 'd96c3f14-c40f-4b4b-bf26-056bcf976d22',
        token: this.project_credientials.jwt_token
      });
      self.client = this.checkDevices(self.client);
      self.client.on('signalwire.ready', function () {
        console.log("READY STATE"); // this.connected_button = false;
        // this.dis_connected_button = true;
        // this.connectStatus = 'Connected';
        // this.connected_call = 1;

        btnConnect.classList.add('d-none');
        btnDisconnect.classList.remove('d-none');
        connectStatus.innerHTML = 'Connected';
        startCall.disabled = false;
      }); // Update UI on socket close

      self.client.on('signalwire.socket.close', function () {
        // this.connected_button = true;
        // this.dis_connected_button = false;
        // this.connectStatus = 'DisConnected';
        btnConnect.classList.remove('d-none');
        btnDisconnect.classList.add('d-none');
        connectStatus.innerHTML = 'Disconnected';
      }); // Handle error...

      self.client.on('signalwire.error', function (error) {
        console.log("ERROR STATE");
        console.error("SignalWire error:", error);
      });
      self.client.on('signalwire.notification', self.handleNotification); // this.connectStatus = 'Connecting...';

      connectStatus.innerHTML = 'Connecting...';
      self.client.connect();
      return self.client;
    },
    checkDevices: function checkDevices(client) {
      client.remoteElement = 'remoteVideo';
      client.localElement = 'localVideo';
      client.iceServers = [{
        urls: ['stun:localhost:8000']
      }];

      if (document.getElementById('audio').checked) {
        client.enableMicrophone();
      } else {
        client.disableMicrophone();
      }

      if (document.getElementById('video').checked) {
        client.enableWebcam();
      } else {
        client.disableWebcam();
      }

      return client;
    },
    saveInLocalStorage: function saveInLocalStorage() {
      console.log("SAVE IN LOCAL STORAGE");
    },
    makeCall: function makeCall() {
      var _this = this;

      return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee() {
        var self, params;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                self = _this;
                params = {
                  destinationNumber: _this.dialer,
                  // required!
                  audio: document.getElementById('audio').checked,
                  video: document.getElementById('video').checked ? {
                    aspectRatio: 16 / 9
                  } : false
                };
                console.log(params);
                self.currentCall = self.client.newCall(params);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    handleNotification: function handleNotification(notification) {
      var _this2 = this;

      return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee2() {
        var self;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                self = _this2;
                _context2.t0 = notification.type;
                _context2.next = _context2.t0 === 'callUpdate' ? 4 : _context2.t0 === 'userMediaError' ? 6 : 7;
                break;

              case 4:
                self.handleCallUpdate(notification.call);
                return _context2.abrupt("break", 7);

              case 6:
                return _context2.abrupt("break", 7);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    hangup: function hangup() {
      var self = this;

      if (self.currentCall) {
        self.currentCall.hangup();
      }
    },
    handleCallUpdate: function handleCallUpdate(call) {
      var _this3 = this;

      return _asyncToGenerator( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee3() {
        var self;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("CALL UPDATE");
                console.log(call.state);
                self = _this3;
                self.currentCall = call;
                _context3.t0 = call.state;
                _context3.next = _context3.t0 === 'new' ? 7 : _context3.t0 === 'trying' ? 8 : _context3.t0 === 'recovering' ? 9 : _context3.t0 === 'ringing' ? 11 : _context3.t0 === 'active' ? 13 : _context3.t0 === 'hangup' ? 16 : _context3.t0 === 'destroy' ? 19 : 21;
                break;

              case 7:
                return _context3.abrupt("break", 21);

              case 8:
                return _context3.abrupt("break", 21);

              case 9:
                // Call is recovering from a previous session
                if (confirm('Recover the previous call?')) {
                  self.currentCall.answer();
                } else {
                  self.currentCall.hangup();
                }

                return _context3.abrupt("break", 21);

              case 11:
                // Someone is calling you
                if (confirm('Pick up the call?')) {
                  self.currentCall.answer();
                } else {
                  self.currentCall.hangup();
                }

                return _context3.abrupt("break", 21);

              case 13:
                // Call has become active
                startCall.classList.add('d-none');
                hangupCall.classList.remove('d-none'); // this.connected_call = 1;
                // this.hang_call_display = 1;

                return _context3.abrupt("break", 21);

              case 16:
                // Call is over
                startCall.classList.remove('d-none');
                hangupCall.classList.add('d-none'); // this.connected_call = 0;
                // this.hang_call_display = 1;
                // hangupCall.disabled = true;

                return _context3.abrupt("break", 21);

              case 19:
                // Call has been destroyed
                self.currentCall = null;
                return _context3.abrupt("break", 21);

              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    }
  }
});

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84&":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84& ***!
  \*******************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "container" }, [
    _c("div", { staticClass: "row py-3" }, [
      _c("div", { staticClass: "col-12 col-md-4" }, [
        _c("div", { staticClass: "card" }, [
          _c("div", { staticClass: "card-body" }, [
            _c("h5", [_vm._v("Connect")]),
            _vm._v(" "),
            _c("div", { staticClass: "form-group" }, [
              _c("label", { attrs: { for: "project" } }, [_vm._v("Project")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.project_credientials.project_id,
                    expression: "project_credientials.project_id"
                  }
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "project",
                  placeholder: "Enter Project ID"
                },
                domProps: { value: _vm.project_credientials.project_id },
                on: {
                  click: function($event) {
                    return _vm.saveInLocalStorage()
                  },
                  input: function($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(
                      _vm.project_credientials,
                      "project_id",
                      $event.target.value
                    )
                  }
                }
              })
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "form-group" }, [
              _c("label", { attrs: { for: "token" } }, [_vm._v("Token")]),
              _vm._v(" "),
              _c("input", {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.project_credientials.jwt_token,
                    expression: "project_credientials.jwt_token"
                  }
                ],
                staticClass: "form-control",
                attrs: {
                  type: "text",
                  id: "token",
                  placeholder: "Enter your JWT"
                },
                domProps: { value: _vm.project_credientials.jwt_token },
                on: {
                  input: function($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.$set(
                      _vm.project_credientials,
                      "jwt_token",
                      $event.target.value
                    )
                  }
                }
              })
            ]),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass: "btn btn-block btn-success",
                class: _vm.connected_button ? "" : "d-none",
                attrs: { id: "btnConnect" },
                on: {
                  click: function($event) {
                    return _vm.connect()
                  }
                }
              },
              [_vm._v("Connect")]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass: "btn btn-block btn-danger",
                class: _vm.dis_connected_button ? "" : "d-none",
                attrs: { id: "btnDisconnect" },
                on: {
                  click: function($event) {
                    return _vm.disconnect()
                  }
                }
              },
              [_vm._v("Disconnect")]
            ),
            _vm._v(" "),
            _vm._m(0)
          ])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "col-12 col-md-8 mt-4 mt-md-1" }, [
        _vm._m(1),
        _vm._v(" "),
        _c("div", { staticClass: "form-group" }, [
          _c("label", { attrs: { for: "number" } }, [_vm._v("Call To:")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.dialer,
                expression: "dialer"
              }
            ],
            staticClass: "form-control",
            attrs: {
              type: "text",
              id: "number",
              placeholder: "Enter Resource or Number to Dial"
            },
            domProps: { value: _vm.dialer },
            on: {
              input: function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.dialer = $event.target.value
              }
            }
          })
        ]),
        _vm._v(" "),
        _c("div", [_vm._v("Call Options:")]),
        _vm._v(" "),
        _vm._m(2),
        _vm._v(" "),
        _vm._m(3),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "btn btn-primary px-5 mt-4",
            attrs: { id: "startCall", disabled: _vm.connected_call == 0 },
            on: {
              click: function($event) {
                return _vm.makeCall()
              }
            }
          },
          [_vm._v("Call")]
        ),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "btn btn-danger px-5 mt-4",
            class: _vm.hang_call_display == 0 ? "" : "d-none",
            attrs: { id: "hangupCall", disabled: _vm.hang_call == 0 },
            on: {
              click: function($event) {
                return _vm.hangup()
              }
            }
          },
          [_vm._v("Hang up")]
        )
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "text-center mt-3 text-muted" }, [
      _c("small", [
        _vm._v("Status: "),
        _c("span", { attrs: { id: "connectStatus" } }, [
          _vm._v("Not Connected")
        ])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "row" }, [
      _c("div", { staticClass: "col-6" }, [
        _c("h5", [_vm._v("Local Video")]),
        _vm._v(" "),
        _c("video", {
          staticClass: "w-100",
          staticStyle: {
            "background-color": "#000",
            border: "1px solid #ccc",
            "border-radius": "5px"
          },
          attrs: { id: "localVideo", autoplay: "true" }
        })
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "col-6" }, [
        _c("h5", [_vm._v("Remote Video")]),
        _vm._v(" "),
        _c("video", {
          staticClass: "w-100",
          staticStyle: {
            "background-color": "#000",
            border: "1px solid #ccc",
            "border-radius": "5px"
          },
          attrs: { id: "remoteVideo", autoplay: "true", playsinline: "" }
        })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "form-check" }, [
      _c("input", {
        attrs: { type: "checkbox", id: "audio", value: "1", checked: "" }
      }),
      _vm._v(" "),
      _c(
        "label",
        { staticClass: "form-check-label", attrs: { for: "audio" } },
        [_vm._v("\n            Include Audio\n          ")]
      )
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "form-check" }, [
      _c("input", {
        attrs: { type: "checkbox", id: "video", value: "1", checked: "" }
      }),
      _vm._v(" "),
      _c(
        "label",
        { staticClass: "form-check-label", attrs: { for: "video" } },
        [_vm._v("\n            Include Video\n          ")]
      )
    ])
  }
]
render._withStripped = true



/***/ }),

/***/ "./resources/js/components/CallingComponent.vue":
/*!******************************************************!*\
  !*** ./resources/js/components/CallingComponent.vue ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CallingComponent.vue?vue&type=template&id=4e1bde84& */ "./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84&");
/* harmony import */ var _CallingComponent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CallingComponent.vue?vue&type=script&lang=js& */ "./resources/js/components/CallingComponent.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _CallingComponent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__["render"],
  _CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/components/CallingComponent.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./resources/js/components/CallingComponent.vue?vue&type=script&lang=js&":
/*!*******************************************************************************!*\
  !*** ./resources/js/components/CallingComponent.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CallingComponent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib??ref--4-0!../../../node_modules/vue-loader/lib??vue-loader-options!./CallingComponent.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/CallingComponent.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CallingComponent_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84&":
/*!*************************************************************************************!*\
  !*** ./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84& ***!
  \*************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib??vue-loader-options!./CallingComponent.vue?vue&type=template&id=4e1bde84& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/js/components/CallingComponent.vue?vue&type=template&id=4e1bde84&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CallingComponent_vue_vue_type_template_id_4e1bde84___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

}]);