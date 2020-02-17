import { ml_table, shg_table } from './matrix';

export function BlurStack() {
  return {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
    next: null
  };
}

export function stackBlurCanvasRGB(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  top_x: number,
  top_y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (isNaN(radius) || radius < 1) return;
  radius |= 0;
  let imageData;

  imageData = context.getImageData(top_x, top_y, width, height);
  const pixels = imageData.data;

  let x,
    y,
    i,
    p,
    yp,
    yi,
    yw,
    r_sum,
    g_sum,
    b_sum,
    r_out_sum,
    g_out_sum,
    b_out_sum,
    r_in_sum,
    g_in_sum,
    b_in_sum,
    pr,
    pg,
    pb,
    rbs;

  const div = radius + radius + 1;
  // var w4 = width << 2;
  const widthMinus1 = width - 1;
  const heightMinus1 = height - 1;
  const radiusPlus1 = radius + 1;
  const sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2;

  const stackStart = BlurStack();
  let stack = stackStart, stackEnd;
  for (i = 1; i < div; i++) {
    stack = stack.next = BlurStack();
    if (i === radiusPlus1) stackEnd = stack;
  }
  stack.next = stackStart;
  let stackIn = null;
  let stackOut = null;

  yw = yi = 0;

  const mul_sum = ml_table[radius];
  const shg_sum = shg_table[radius];

  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;

    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;

      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;
    for (x = 0; x < width; x++) {
      pixels[yi] = (r_sum * mul_sum) >> shg_sum;
      pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
      pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;

      p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

      r_in_sum += stackIn.r = pixels[p];
      g_in_sum += stackIn.g = pixels[p + 1];
      b_in_sum += stackIn.b = pixels[p + 2];

      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;

      stackIn = stackIn.next;

      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;

      stackOut = stackOut.next;

      yi += 4;
    }
    yw += width;
  }

  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;

    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    yp = width;

    for (i = 1; i <= radius; i++) {
      yi = (yp + x) << 2;

      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;

      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = (r_sum * mul_sum) >> shg_sum;
      pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
      pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;

      p =
        (x +
          ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width) <<
        2;

      r_sum += r_in_sum += stackIn.r = pixels[p];
      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p + 2];

      stackIn = stackIn.next;

      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;

      stackOut = stackOut.next;

      yi += width;
    }
  }

  context.putImageData(imageData, top_x, top_y);
}
