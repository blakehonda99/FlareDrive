import { notFound, parseBucketPath } from "@/utils/bucket";

export async function onRequestGet(context) {
  const [bucket, path] = parseBucketPath(context);
  if (!bucket) return notFound();

  const obj = await bucket.get(path);
  if (obj === null) return notFound();

  const url = new URL(context.request.url);

  // Check if the URL has a "download" query parameter
  if (url.searchParams.has("download")) {
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${path.split('/').pop()}"`);
    
    // Set "Cache-Control" header for download requests
    if (path.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    // Optionally, set other headers like Content-Type if needed
    // headers.set("Content-Type", "application/octet-stream");

    return new Response(obj.body, { headers });
  } else {
    // Regular view behavior with appropriate headers
    const headers = new Headers();
    obj.writeHttpMetadata(headers);

    // Set "Cache-Control" header for regular view behavior
    if (path.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    return new Response(obj.body, { headers });
  }
}
