var canvasOffset;
var $painting;
var $degree;
var $current_degree;
var $rate;
var degree = 0;
var degree_step = 0.0174533;
var rateMs = 10;
var picWidth;
var picHeight;
var oX;
var oY;
var isSpinning = false;
var lineColor;
var lineWidth;
var ctx;
var theCanvas;
var letsdraw = false;
var lineBroke = false;

var cursorMoving = false;
var lastCursorPosition = new Map();

$(function () {
  $painting = $('#paint');
  $degree = $('#degree');
  $current_degree = $('#current_degree');
  $rate = $('#rate');
  $save_btn = $('#save_btn');
  var $select_color = $('#select_color')
  var $select_line_width = $('#select_line_width')

  // default
  $rate.val(rateMs);
  $degree.val(degree_step);

  var shortSide = window.innerWidth > window.innerHeight ? window.innerHeight / 1.5 : window.innerWidth / 1.5;

  picWidth = shortSide * 0.95;
  picHeight = picWidth;
  oX = picWidth / 2;
  oY = picHeight / 2;

  theCanvas = document.getElementById('paint');
  ctx = theCanvas.getContext('2d');
  theCanvas.width = picWidth;
  theCanvas.height = picHeight;

  // grid_tools size

  var tools_height = (window.innerHeight - picHeight) * 0.8;

  $(".grid_tools").css("height", tools_height);

  canvasOffset = $('#paint').offset();

  // disable selection

  $painting.disableSelection();

  createDefaultCirle();

  console.log("offset left: " + canvasOffset.left + ", offset top: " + canvasOffset.top);

  $painting.on('mousemove touchmove', function (e) {

    if (letsdraw === true) {

      try {

        cursorMoving = true;

        if (e.type === 'mousemove') {
          lastCursorPosition.set('x', e.pageX);
          lastCursorPosition.set('y', e.pageY);
        } else {
          lastCursorPosition.set('x', e.originalEvent.changedTouches[0].pageX);
          lastCursorPosition.set('y', e.originalEvent.changedTouches[0].pageY);
        }

        draw();

      } finally {
        cursorMoving = false;
      }

    }
  });

  $painting.on('mousedown touchstart', function (e) {
    if (e.type === 'mousedown') {
      lastCursorPosition.set('x', e.pageX);
      lastCursorPosition.set('y', e.pageY);
    } else {
      lastCursorPosition.set('x', e.originalEvent.changedTouches[0].pageX);
      lastCursorPosition.set('y', e.originalEvent.changedTouches[0].pageY);
    }
    letsdraw = true;
    beginLine();
  });

  $painting.on('mouseup touchend touchcancel', function (e) {
    letsdraw = false;
  });

  $select_color.change(function (e) {
    lineColor = e.target.value;
  });

  $select_line_width.change(function (e) {
    lineWidth = e.target.value;
  });

  $save_btn.on('click', function (e) {
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = $painting[0].toDataURL();
    link.click();
    link.delete;
  });

  $('#size_up').click(() => {
    changeCanvasSize(100);
  });

  $('#size_down').click(() => {
    changeCanvasSize(-100);
  });

  $('#drop_btn').click(() => {
    createDefaultCirle();
  })

  $('#rotrate_btn').click(() => {
    rotrateLoop();
  })

  $('#degree_increase_btn').click(() => {
    $degree.val(degree_step = degree_step * 2);
  })

  $('#degree_decrease_btn').click(() => {
    $degree.val(degree_step = degree_step / 2);
  })

  $degree.on('input', () => {
    var value = parseFloat(this.value);
    if (value != 0) {
      degree_step = value;
    }
  })

  $('#rate_increase_btn').click(() => {
    $rate.val(rateMs = rateMs * 2);
  })

  $('#rate_decrease_btn').click(() => {
    $rate.val(rateMs = rateMs / 2);
  })

  $rate.on('input', () => {
    var value = parseFloat(this.value);
    if (value != 0 && value > 0) {
      rateMs = value;
    }
  })

});

/*
 *
 * Functions
 *
 */

function changeCanvasSize(px) {
  if (picWidth + px <= 0 || picHeight + px <= 0 ||
    picWidth + px >= window.innerWidth || picHeight + px >= window.innerHeight / 1.5) {
    return;
  }
  picWidth = picWidth + px;
  picHeight = picHeight + px;
  oX = picWidth / 2;
  oY = picHeight / 2;
  theCanvas.width = picWidth;
  theCanvas.height = picHeight;
  createDefaultCirle();
  canvasOffset = $('#paint').offset();
}

function createDefaultCirle() {
  createCirle(ctx, picWidth / 2, "white");
}

function createCirle(ctx, radius, color) {

  ctx.clearRect(0, 0, picWidth, picHeight);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(oX, oY, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(oX, 0);
  ctx.lineTo(oX, picHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, oY);
  ctx.lineTo(picWidth, oY);
  ctx.stroke();

}

function rotratePainting() {

  degree = degree_step + degree;
  $painting.css('transform', "rotate(" + degree * (180 / Math.PI) + "deg)")
  $current_degree.html(degree);

}

async function rotrateLoop() {

  if (isSpinning) {
    isSpinning = false;
    return;
  }

  isSpinning = true;

  while (isSpinning) {
    rotratePainting();
    if (letsdraw && !cursorMoving) {
      draw();
    }
    await delay(parseInt(rateMs));
  }

}

async function draw() {

  var x_base_Weighted = lastCursorPosition.get('x') - canvasOffset.left;
  var y_base_Weighted = lastCursorPosition.get('y') - canvasOffset.top;

  var rotrateDegree = degree;

  // convert to relative coordinates
  var x_Relative = x_base_Weighted - oX;
  var y_Relative = oY - y_base_Weighted;

  // rotrate relative
  var x_Relative_Rotrated = x_Relative * Math.cos(rotrateDegree) - y_Relative * Math.sin(rotrateDegree);
  var y_Relative_Rotrated = x_Relative * Math.sin(rotrateDegree) + y_Relative * Math.cos(rotrateDegree);

  if (Math.abs(x_Relative_Rotrated) > oX || Math.abs(y_Relative_Rotrated) > oY || !inBounds(x_Relative_Rotrated, y_Relative_Rotrated)) {
    breakLine();
    return;
  }

  if (lineBroke) {
    beginLine();
  }

  console.info("x: " + x_Relative_Rotrated + " y: " + y_Relative_Rotrated);

  // convert to original coordinates
  var xResult = x_Relative_Rotrated + oX;
  var yResult = oY - y_Relative_Rotrated;

  ctx.lineTo(xResult, yResult);
  ctx.stroke();
}

const delay = async (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));


$.fn.extend({
  disableSelection: function () {
    this.each(function () {
      this.onselectstart = function () {
        return false;
      };
      this.unselectable = "on";
      $(this).css('-moz-user-select', 'none');
      $(this).css('-webkit-user-select', 'none');
    });
    return this;
  }
});

function inBounds(x, y) {
  var result = Math.sqrt(Math.pow(picHeight / 2, 2) - Math.pow(x, 2));
  return !isNaN(result) && Math.abs(y) < result;
}

function beginLine() {
  lineBroke = false;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
}

function breakLine() {
  lineBroke = true;
  ctx.stroke();
}

