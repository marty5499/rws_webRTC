function test(id) {}

function test1(id) {
  let src = cv.imread(id);
  let dstx = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  cv.Sobel(src, dstx, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
  cv.imshow(id, dstx);
  src.delete();
  dstx.delete();
}

function test2(id) {
  let src = cv.imread(id);
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let hull = new cv.MatVector();
  cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  // approximates each contour to convex hull
  for (let i = 0; i < contours.size(); ++i) {
    let tmp = new cv.Mat();
    let cnt = contours.get(i);
    // You can try more different parameters
    cv.convexHull(cnt, tmp, false, true);
    hull.push_back(tmp);
    cnt.delete();
    tmp.delete();
  }
  // draw contours with random Scalar
  for (let i = 0; i < contours.size(); ++i) {
    let colorHull = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
      Math.round(Math.random() * 255));
    cv.drawContours(dst, hull, i, colorHull, 1, 8, hierarchy, 0);
  }
  cv.imshow(id, dst);
  src.delete();
  dst.delete();
  hierarchy.delete();
  contours.delete();
  hull.delete();
}

function test3(id) {
  let src = cv.imread(id);
  let dst = new cv.Mat();
  let gray = new cv.Mat();
  let opening = new cv.Mat();
  let coinsBg = new cv.Mat();
  let coinsFg = new cv.Mat();
  let distTrans = new cv.Mat();
  let unknown = new cv.Mat();
  let markers = new cv.Mat();
  // gray and threshold image
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
  // get background
  let M = cv.Mat.ones(3, 3, cv.CV_8U);
  cv.erode(gray, gray, M);
  cv.dilate(gray, opening, M);
  cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 3);
  // distance transform
  cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
  cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);
  // get foreground
  cv.threshold(distTrans, coinsFg, 0.7 * 1, 255, cv.THRESH_BINARY);
  coinsFg.convertTo(coinsFg, cv.CV_8U, 1, 0);
  cv.subtract(coinsBg, coinsFg, unknown);
  // get connected components markers
  cv.connectedComponents(coinsFg, markers);
  for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
      markers.intPtr(i, j)[0] = markers.ucharPtr(i, j)[0] + 1;
      if (unknown.ucharPtr(i, j)[0] == 255) {
        markers.intPtr(i, j)[0] = 0;
      }
    }
  }
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
  cv.watershed(src, markers);
  // draw barriers
  for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
      if (markers.intPtr(i, j)[0] == -1) {
        src.ucharPtr(i, j)[0] = 255; // R
        src.ucharPtr(i, j)[1] = 0; // G
        src.ucharPtr(i, j)[2] = 0; // B
      }
    }
  }
  cv.imshow(id, src);
  src.delete();
  dst.delete();
  gray.delete();
  opening.delete();
  coinsBg.delete();
  coinsFg.delete();
  distTrans.delete();
  unknown.delete();
  markers.delete();
  M.delete();
}