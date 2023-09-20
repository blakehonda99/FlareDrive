import { notFound, parseBucketPath } from "@/utils/bucket";

export async function onRequestGet(context) {
  const [bucket, path] = parseBucketPath(context);
  if (!bucket) return notFound();

  const obj = await bucket.get(path);
  if (obj === null) return notFound();

  const url = new URL(context.request.url);

  // Check if the URL path ends with "/download"
  if (url.pathname.endsWith("/download")) {
    // Remove "/download" from the URL path and retrieve the content as usual
    const newPath = path.replace(/\/download$/, '');
    const objWithoutDownload = await bucket.get(newPath);

    if (objWithoutDownload === null) return notFound();

    const headers = new Headers();
    objWithoutDownload.writeHttpMetadata(headers);
    if (newPath.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    return new Response(objWithoutDownload.body, { headers });
  } else {
    // Regular view behavior with appropriate headers
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    if (path.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    return new Response(obj.body, { headers });
  }
}
