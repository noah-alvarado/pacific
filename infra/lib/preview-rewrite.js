// CloudFront Function (viewer-request, cloudfront-js-2.0) for the preview distribution.
// <sha7>.pacific.alvarado.dev serves the build stored under the S3 prefix "<sha7>/".
function handler(event) {
  var request = event.request;
  var label = request.headers.host.value.split(".")[0];
  var uri = request.uri;
  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);

  // Extensionless paths (including "/") get the app shell.
  request.uri =
    lastSegment.indexOf(".") === -1
      ? "/" + label + "/index.html"
      : "/" + label + uri;

  return request;
}
