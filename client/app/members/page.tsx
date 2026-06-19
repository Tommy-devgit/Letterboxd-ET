import { communityUsers } from "@/lib/letterboxd-et-seed";

export default function MembersPage() {
  return (
    <div className="lb-container py-8">
      <div className="mb-5 lb-section-rule pt-2">
        <h1 className="lb-section-title">Members</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {communityUsers.map((user, index) => (
          <article key={user} className="rounded-[4px] border border-border-muted bg-[#101820] p-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1d2a35] text-sm font-bold text-[#9aa8b5]">
              {user.slice(0, 2).toUpperCase()}
            </span>
            <h2 className="mt-3 text-sm font-semibold text-[#d8e0e8]">{user}</h2>
            <p className="lb-caption">{38 + index * 7} films - {12 + index} reviews</p>
          </article>
        ))}
      </div>
    </div>
  );
}
