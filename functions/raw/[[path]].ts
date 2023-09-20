import { notFound, parseBucketPath } from "@/utils/bucket";

export async function onRequestGet(context) {
  const [bucket, path] = parseBucketPath(context);
  if (!bucket) return notFound();

  const obj = await bucket.get(path);
  if (obj === null) return notFound();

  const url = new URL(context.request.url);

  // Check if the URL path ends with "/download"
  if (url.pathname.endsWith("/download")) {
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${path.split('/').pop()}"`);
    
    // Optionally, set other headers like Content-Type if needed
    // headers.set("Content-Type", "application/octet-stream");

    return new Response(obj.body, { headers });
  } else {
    // Regular view behavior with appropriate headers
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    if (path.startsWith("_$flaredrive$/thumbnails/"))
      headers.set("Cache-Control", "max-age=31536000");

    return new Response(obj.body, { headers });
  }
}
