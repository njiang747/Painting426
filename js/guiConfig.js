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
];

var sampleDropdownOptions = ['point', 'bilinear', 'gaussian'];
var morphLinesDropdownOptions = ['marker.json','test.json'];

GuiConfig.onInit = function() {
  // starter image, if none loaded from url
  if (Gui.historyFilters.length === 0) {
    Gui.addHistoryEntry(Gui.filterDefs[0], [GuiConfig.imageNames[0]]);
  }
};

// NOTE(drew): filter names must correspond to names of filter functions unless funcName is supplied
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
      // TODO put url stuff here
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
      // TODO put url stuff here
      window.open("anim.html?" + Gui.getUrl());
    },
    paramDefs: [
    ]
  },

  {
    name: "Animation",
    notFilter: true,
    folderName: "Other",
    applyFunc: function() {
      var enableAnimation = true;
      window.open("batch.html?" + Gui.getUrl(enableAnimation));
    },
    paramDefs: [
    ]
  },

  {
    name: "MorphLines",
    notFilter: true,
    folderName: "Other",
    applyFunc: function() {
      // TODO put url stuff here
      var cache = Main.imageCache;
      var lastTwoImages = [];
      for (var i = cache.length-1; i >= 0; i--) {
        if (cache[i].imageName) {
          lastTwoImages.push(cache[i].imageName);
        }
      }
      if (lastTwoImages.length >= 2) {
        window.open("morphLines.html?initialFile=" + lastTwoImages[1] +
                  "&finalFile=" + lastTwoImages[0] + "&marker=images/marker.json")
      }
    },
    paramDefs: [
    ]
  },
  // SETPIXEL OPERATIONS
  {
    name: "Fill",
    folderName: "Other",
    paramDefs: [
      {
        name: "color",
        defaultVal: [0, 0, 0],
        isColor: true,
      },
    ]
  },
  {
    name: "Brush",
    folderName: "Other",
    paramDefs: [
      {
        name: "radius",
        defaultVal: 10,
        sliderRange: [1, 100],
        isFloat: false,
      },
      {
        name: "color",
        defaultVal: [255, 255, 255],
        isColor: true,
      },
      {
        name: "verts",
        defaultVal: "",
        isString: true,
      },
    ]
  },

  // LUMINANCE OPERATIONS
  {
    name: "Brightness",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "brightness",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Contrast",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "contrast",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Gamma",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "gamma",
        defaultVal: 0,
        sliderRange: [-2, 2],
        isFloat: true,
      },
    ]
  },
  {
    name: "Vignette",
    folderName: "Other",
    paramDefs: [
      {
        name: "innerRadius",
        defaultVal: 0.25,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "outerRadius",
        defaultVal: 0.75,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Histogram Equalization",
    funcName: "histogramEqualizationFilter",
    folderName: "Other",
    paramDefs: [
    ]
  },

  // COLOR OPERATIONS
  {
    name: "Grayscale",
    folderName: "Other",
    paramDefs: [
    ]
  },
  {
    name: "Saturation",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "saturation",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "White Balance",
    funcName: "whiteBalanceFilter",
    folderName: "Other",
    paramDefs: [
      {
        name: "white",
        defaultVal: [255, 255, 255],
        isColor: true,
      }
    ]
  },
  {
    name: "Histogram Match",
    funcName: "histogramMatchFilter",
    folderName: "Other",
    numImageInputs: 2,
    paramDefs: [
      {
        name: "value",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      }
    ]
  },

  // FILTER OPERATIONS
  {
    name: "Gaussian",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "sigma",
        defaultVal: 4,
        sliderRange: [1, 8],
        isFloat: false,
      },
    ]
  },
  {
    name: "Fast Gaussian",
    funcName: "fastGaussianFilter",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "sigma",
        defaultVal: 4,
        sliderRange: [1, 8],
        isFloat: false,
      },
    ]
  },
  {
    name: "Sharpen",
    folderName: "Other",
    paramDefs: [
    ]
  },
  {
    name: "Edge",
    folderName: "Other",
    paramDefs: [
    ]
  },
  {
    name: "Median",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "window radius",
        defaultVal: 1,
        sliderRange: [1, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Bilateral",
    folderName: "Other",
    paramDefs: [
      {
        name: "sigmaR",
        defaultVal: 1,
        sliderRange: [1, 6],
        isFloat: false,
      },
      {
        name: "sigmaS",
        defaultVal: 1,
        sliderRange: [1, 18],
        isFloat: false,
      },
    ]
  },

  // DITHERING OPERATIONS
  {
    name: "Quantize",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "bits per channel",
        defaultVal: 1,
        sliderRange: [1, 4],
        isFloat: false,
      }
    ]
  },
  {
    name: "Random",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "bits per channel",
        defaultVal: 1,
        sliderRange: [1, 4],
        isFloat: false,
      }
    ]
  },
  {
    name: "Ordered",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "bits per channel",
        defaultVal: 1,
        sliderRange: [1, 4],
        isFloat: false,
      }
    ]
  },
  {
    name: "Floyd-Steinberg",
    funcName: "floydFilter",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "bits per channel",
        defaultVal: 1,
        sliderRange: [1, 4],
        isFloat: false,
      }
    ]
  },

  // RESAMPLING OPERATIONS

  // TODO: figure out how to handle sampling dropdown

  {
    name: "Scale",
    folderName: "Other",
    paramDefs: [
      {
        name: "ratio",
        defaultVal: 1,
        sliderRange: [0.1, 3],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Translate",
    folderName: "Other",
    paramDefs: [
      {
        name: "x",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
      },
      {
        name: "y",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Rotate",
    folderName: "Other",
    paramDefs: [
      {
        name: "radians",
        defaultVal: 1,
        sliderRange: [0, Math.PI * 2],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Swirl",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "radians",
        defaultVal: 1,
        sliderRange: [0, Math.PI * 2],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },

  // COMPOSITE OPERATIONS
  {
    name: "Get Alpha",
    funcName: "getAlphaFilter",
    folderName: "Other",
    numImageInputs: 2,
    paramDefs: [
    ]
  },
  {
    name: "Composite",
    folderName: "Other",
    numImageInputs: 2,
    paramDefs: [
    ]
  },
  {
    name: "Morph",
    folderName: "Other",
    numImageInputs: 2,
    canAnimate: true,
    paramDefs: [
      {
        name: "alpha",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
      {
        name: "linesFile",
        defaultVal: morphLinesDropdownOptions[0],
        dropdownOptions: morphLinesDropdownOptions,
      },
    ]
  },


  // MISC OPERATIONS
  {
    name: "Palette",
    folderName: "Other",
    paramDefs: [
      {
        name: "num colors",
        defaultVal: 3,
        sliderRange: [1, 6],
        isFloat: false,
      },
    ]
  },
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
  {
    name: "CustomFilter",
    funcName: "customFilter",
    folderName: "Other",
    canAnimate: true,
    paramDefs: [
      {
        name: "input value",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },

];
