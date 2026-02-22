interface DemoMediaPreviewProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    }

    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    // not a valid URL
  }
  return null;
}

export default function DemoMediaPreview({ imageUrl, videoUrl }: DemoMediaPreviewProps) {
  const embedUrl = videoUrl ? youtubeEmbedUrl(videoUrl) : null;

  if (!imageUrl && !videoUrl) return null;

  return (
    <div className="space-y-4">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Exercise demo"
          className="w-full max-h-64 rounded-xl object-cover border border-gray-200"
        />
      )}

      {videoUrl && (
        <div>
          {embedUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
              <iframe
                src={embedUrl}
                title="Exercise demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
            >
              🎬 Watch demo video
            </a>
          )}
        </div>
      )}
    </div>
  );
}
