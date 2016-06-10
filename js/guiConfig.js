"use strict";

var GuiConfig = GuiConfig || {

};

GuiConfig.imageNames = [
  'blair.jpg',
  'nassau.jpg',
  'tiger.jpg',
  'mountain.jpg',
  'mountainClouds.jpg',
  'floatingMountain.jpg',
  'sunsetLake.jpg',
  'waterfall.jpg',
  'pagoda.jpg',
  'venice.jpg',
  'newyork.jpg',
  'hongkong.jpg',
  'lamborghini.jpg',
  'veniceBg.jpg',
  '-- Upload Image --',
];

GuiConfig.onInit = function() {
  // starter image, if none loaded from url
  if (Gui.historyFilters.length === 0) {
    Gui.addHistoryEntry(Gui.filterDefs[0], [GuiConfig.imageNames[0]]);
  }
};

GuiConfig.filterDefs = [
  // GENERAL
  {
    name: "Push Image",
    folderName: undefined,
    notFilter: true,
    pushImage: true,
    paramDefs: [
      {
        name: "image name",
        defaultVal: GuiConfig.imageNames[0],
        dropdownOptions: GuiConfig.imageNames,
      },
    ]
  },
  {
    name: "Batch Mode",
    notFilter: true,
    folderName: undefined,
    applyFunc: function() {
      window.open("batch.html?" + Gui.getUrl());
    },
    paramDefs: [
    ]
  },
  {
    name: "Animate Paint",
    notFilter: true,
    folderName: undefined,
    applyFunc: function() {
      window.open("anim.html?" + Gui.getUrl());
    },
    paramDefs: [
    ]
  },

/******************************************************************************/

  {
    name: "Paint",
    funcName: "paintFilter",
    folderName: "Paint",
    paramDefs: [
      {
        name: "threshold",
        defaultVal: 25,
        sliderRange: [0, 255],
        isFloat: false,
      },
      {
        name: "brush sizes",
        defaultVal: "x8x4x2",
        isString: true,
      },
      {
        name: "curve const",
        defaultVal: 1,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "blur const",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "alpha",
        defaultVal: 1,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "spacing const",
        defaultVal: 1,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "min length",
        defaultVal: 4,
        sliderRange: [0, 25],
        isFloat: false,
      },
      {
        name: "max length",
        defaultVal: 16,
        sliderRange: [0, 25],
        isFloat: false,
      },
      {
        name: "hue jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "saturation jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "value jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "red jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "blue jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "green jitter",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },

  {
    name: "Impressionism",
    funcName: "impressionFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },

  {
    name: "Impressionism-HD",
    funcName: "impressionFilterHD",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },
  {
    name: "Expressionism",
    funcName: "expressionFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },
  {
    name: "Color Wash",
    funcName: "coloristFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },
  {
    name: "Pointillism",
    funcName: "pointFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },
  {
    name: "Watercolor",
    funcName: "watercolorFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },
  {
    name: "Crazy",
    funcName: "psychFilter",
    folderName: "Paint",
    canAnimate: false,
    paramDefs: [
    ]
  },

];
