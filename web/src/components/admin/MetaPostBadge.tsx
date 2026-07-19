"use client";

type MetaPostBadgeProps = {
  postedAt?: string | null;
  fbPostId?: string | null;
  lastError?: string | null;
  metaConfigured: boolean;
  onPost?: () => void;
  posting?: boolean;
};

const pillBase = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";

export function MetaPostBadge({
  postedAt,
  fbPostId,
  lastError,
  metaConfigured,
  onPost,
  posting,
}: MetaPostBadgeProps) {
  if (!metaConfigured) return null;

  if (postedAt) {
    const pill = <span className={`${pillBase} bg-green-100 text-green-800`}>✓ Posted</span>;
    return fbPostId ? (
      <a
        href={`https://www.facebook.com/${fbPostId}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open the Facebook post"
        className="hover:opacity-80"
      >
        {pill}
      </a>
    ) : (
      pill
    );
  }

  const isSkip = lastError?.startsWith("Skipped:");

  return (
    <span className="inline-flex items-center gap-1.5">
      {lastError ? (
        isSkip ? (
          <span className={`${pillBase} bg-amber-100 text-amber-800`} title={lastError}>
            Not posted
          </span>
        ) : (
          <span className={`${pillBase} bg-red-100 text-red-700`} title={lastError}>
            ✗ Post failed
          </span>
        )
      ) : (
        <span className="text-xs text-neutral-400" aria-hidden>
          —
        </span>
      )}
      {onPost ? (
        <button
          type="button"
          onClick={onPost}
          disabled={posting}
          className="text-xs font-semibold text-[#E8500A] underline-offset-2 hover:underline disabled:opacity-50"
        >
          {posting ? "Posting…" : lastError && !isSkip ? "Retry" : "Post"}
        </button>
      ) : null}
    </span>
  );
}
