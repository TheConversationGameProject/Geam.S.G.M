"use client";

import { useState } from "react";

export default function SignOutForm({ className = "dispatch-logout" }: { className?: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <button className={className} type="submit" disabled={pending}>
        {pending ? "در حال خروج..." : "خروج از حساب"}
      </button>
    </form>
  );
}
