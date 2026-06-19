const posts = [
  {
    title: "A Starter Guide to Ethiopian Cinema",
    deck: "From Haile Gerima landmarks to contemporary Addis stories, a compact path into the archive.",
  },
  {
    title: "How Faya Dayi Turns Landscape Into Memory",
    deck: "A close look at texture, ritual, and the hypnotic patience of Jessica Beshir's images.",
  },
  {
    title: "Community Notes: What Addis Watched This Week",
    deck: "New reviews, revived classics, festival chatter, and the films members are adding to watchlists.",
  },
];

export default function JournalPage() {
  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2">
        <h1 className="lb-section-title">Journal</h1>
      </div>
      <div className="grid gap-3">
        {posts.map((post) => (
          <article key={post.title} className="rounded-[4px] border border-border-muted bg-[#101820] p-5">
            <h2 className="text-xl font-semibold text-[#d8e0e8]">{post.title}</h2>
            <p className="mt-2 lb-body">{post.deck}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
