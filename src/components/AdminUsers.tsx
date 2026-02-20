import { useEffect, useState } from "react";

type UserEmail = {
  id: number;
  email: string;
  is_primary: boolean;
  is_verified: boolean;
};

type User = {
  id: number;
  display_name: string | null;
  telegram_chat_id?: string | null;
  status: string;
  is_admin: boolean;
  needs_onboarding: boolean;
  emails: UserEmail[];
};

type Translations = {
  adminTitle: string;
  adminCreate: string;
  adminName: string;
  adminPrimaryEmail: string;
  adminIsAdmin: string;
  adminCreateButton: string;
  adminStatusActive: string;
  adminStatusInactive: string;
  adminMakeAdmin: string;
  adminRemoveAdmin: string;
  adminDeactivate: string;
  adminActivate: string;
  adminInvite: string;
  adminAddEmail: string;
  adminDeleteUser: string;
  adminEmails: string;
  modalCancel: string;
  modalConfirm: string;
  modalDeleteTitle: string;
  adminActions: string;
  inviteEmailSent: string;
  inviteEmailFallback: string;
  inviteEmailRetry: string;
  inviteLinkLabel: string;
  adminSearch: string;
  adminRows: string;
  adminShowing: string;
  adminOf: string;
  adminPrev: string;
  adminNext: string;
  adminEmailVerified: string;
  adminTelegramId: string;
  adminEditTelegram: string;
  adminTelegramModalTitle: string;
  adminTelegramSave: string;
};

type Props = {
  token: string;
  apiBase: string;
  t: Translations;
  showToast?: (message: string, type: "success" | "warning" | "error") => void;
};

export default function AdminUsers({ token, apiBase, t, showToast }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailToAdd, setEmailToAdd] = useState<Record<number, string>>({});
  const [editTelegramUser, setEditTelegramUser] = useState<User | null>(null);
  const [editTelegramValue, setEditTelegramValue] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadUsers = async () => {
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("offset", String(page * pageSize));
    params.set("sort_by", sortBy);
    params.set("sort_dir", sortDir);
    if (search) params.set("q", search);
    const response = await fetch(`${apiBase}/api/admin/users?${params.toString()}`, {
      headers,
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
        setTotal(data.length);
      } else {
        setUsers(data.items ?? []);
        setTotal(data.total ?? 0);
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, search, sortBy, sortDir]);

  const createUser = async () => {
    const response = await fetch(`${apiBase}/api/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        display_name: displayName || null,
        is_admin: isAdmin,
        emails: [{ email, is_primary: true }],
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setDisplayName("");
      setEmail("");
      setIsAdmin(false);
      setErrorMessage("");
      if (data.invite_sent) {
        if (showToast) {
          showToast(t.inviteEmailSent, "success");
          setInviteMessage("");
        } else setInviteMessage(t.inviteEmailSent);
        setInviteLink("");
      } else if (data.invite_detail) {
        if (showToast) {
          showToast(t.inviteEmailRetry, "warning");
          setInviteMessage("");
        } else setInviteMessage(t.inviteEmailRetry);
      }
      await loadUsers();
      return;
    }
    let detail = "Failed to create user.";
    try {
      const data = await response.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch (error) {
      detail = await response.text();
    }
    setErrorMessage(detail);
  };

  const updateUser = async (userId: number, payload: Partial<User>) => {
    const response = await fetch(`${apiBase}/api/admin/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadUsers();
    } else {
      const err = await response.json().catch(() => ({}));
      setErrorMessage(err.detail ?? "Failed to update");
    }
  };

  const saveTelegramId = async () => {
    if (!editTelegramUser) return;
    await updateUser(editTelegramUser.id, {
      telegram_chat_id: editTelegramValue.trim() || null,
    });
    setEditTelegramUser(null);
    setEditTelegramValue("");
    setErrorMessage("");
  };

  const removeUser = async (userId: number) => {
    const response = await fetch(`${apiBase}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers,
    });
    if (response.ok) {
      await loadUsers();
    }
  };

  const addEmail = async (userId: number) => {
    const value = emailToAdd[userId];
    if (!value) return;
    const response = await fetch(`${apiBase}/api/admin/users/${userId}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: value, is_primary: false }),
    });
    if (response.ok) {
      setEmailToAdd((prev) => ({ ...prev, [userId]: "" }));
      await loadUsers();
    }
  };

  const removeEmail = async (userId: number, emailId: number) => {
    const response = await fetch(
      `${apiBase}/api/admin/users/${userId}/emails/${emailId}`,
      { method: "DELETE", headers }
    );
    if (response.ok) {
      await loadUsers();
    }
  };

  const sendInvite = async (userId: number) => {
    const response = await fetch(`${apiBase}/api/admin/users/${userId}/invite`, {
      method: "POST",
      headers,
    });
    if (response.ok) {
      const data = await response.json();
      if (data.sent) {
        if (showToast) {
          showToast(t.inviteEmailSent, "success");
          setInviteMessage("");
        } else setInviteMessage(t.inviteEmailSent);
        setInviteLink("");
      } else if (data.ticket) {
        setInviteMessage(t.inviteEmailFallback);
        setInviteLink(data.ticket);
      }
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t.adminTitle}</h2>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{t.adminCreate}</h3>
          <button
            className="icon-button"
            type="button"
            onClick={createUser}
            title={t.adminCreateButton}
            aria-label={t.adminCreateButton}
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>
        {errorMessage ? (
          <p className="mt-2 text-sm text-rose-500">{errorMessage}</p>
        ) : null}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            className="input"
            placeholder={t.adminName}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <input
            className="input"
            placeholder={t.adminPrimaryEmail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(event) => setIsAdmin(event.target.checked)}
            />
            {t.adminIsAdmin}
          </label>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-xs"
          placeholder={t.adminSearch}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <span>{t.adminRows}</span>
          <select
            className="input"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {inviteMessage ? (
        <div className="card mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {inviteMessage}
          </p>
          {inviteLink ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t.inviteLinkLabel}:{" "}
              <a className="text-blue-600 underline" href={inviteLink}>
                {inviteLink}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="card min-w-0">
        <div className="admin-table-wrapper">
          <div className="admin-table">
          <div className="admin-table-header">
            <button
              className={`table-sort ${sortBy === "name" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                if (sortBy === "name") {
                  setSortDir(sortDir === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("name");
                  setSortDir("asc");
                }
              }}
            >
              {t.adminName}
              <span className="sort-arrows">
                <i className="fa-solid fa-caret-up"></i>
                <i className="fa-solid fa-caret-down"></i>
              </span>
            </button>
            <button
              className={`table-sort ${sortBy === "email" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                if (sortBy === "email") {
                  setSortDir(sortDir === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("email");
                  setSortDir("asc");
                }
              }}
            >
              {t.adminEmails}
              <span className="sort-arrows">
                <i className="fa-solid fa-caret-up"></i>
                <i className="fa-solid fa-caret-down"></i>
              </span>
            </button>
            <button
              className={`table-sort ${sortBy === "status" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                if (sortBy === "status") {
                  setSortDir(sortDir === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("status");
                  setSortDir("asc");
                }
              }}
            >
              {t.adminStatusActive}
              <span className="sort-arrows">
                <i className="fa-solid fa-caret-up"></i>
                <i className="fa-solid fa-caret-down"></i>
              </span>
            </button>
            <button
              className={`table-sort ${sortBy === "admin" ? "is-active" : ""}`}
              type="button"
              onClick={() => {
                if (sortBy === "admin") {
                  setSortDir(sortDir === "asc" ? "desc" : "asc");
                } else {
                  setSortBy("admin");
                  setSortDir("asc");
                }
              }}
            >
              {t.adminIsAdmin}
              <span className="sort-arrows">
                <i className="fa-solid fa-caret-up"></i>
                <i className="fa-solid fa-caret-down"></i>
              </span>
            </button>
            <div>{t.adminTelegramId}</div>
            <div className="text-right">{t.adminActions}</div>
          </div>
          {users.map((user) => (
            <div key={user.id} className="admin-table-row">
              <div className="admin-table-cell admin-table-cell-name" data-label={t.adminName}>
                <span className="font-medium">
                  {user.display_name || user.emails[0]?.email}
                </span>
              </div>
              <div className="admin-table-cell admin-table-cell-emails" data-label={t.adminEmails}>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                  <span className="break-all">{user.emails.map((item) => item.email).join(", ")}</span>
                  {user.emails.some((item) => item.is_verified) ? (
                    <i
                      className="fa-solid fa-envelope-circle-check icon-status shrink-0"
                      title={t.adminEmailVerified}
                    ></i>
                  ) : null}
                </div>
              </div>
              <div className="admin-table-cell" data-label={t.adminStatusActive}>
                {user.status === "active" ? "✓" : "—"}
              </div>
              <div className="admin-table-cell" data-label={t.adminIsAdmin}>
                {user.is_admin ? (
                  <i className="fa-solid fa-shield icon-status" title={t.adminIsAdmin}></i>
                ) : (
                  "—"
                )}
              </div>
              <div className="admin-table-cell admin-table-cell-telegram" data-label={t.adminTelegramId}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300 break-all min-w-0" title={user.telegram_chat_id ?? undefined}>
                    {user.telegram_chat_id || "—"}
                  </span>
                  <button
                    className="icon-button shrink-0"
                    type="button"
                    onClick={() => {
                      setEditTelegramUser(user);
                      setEditTelegramValue(user.telegram_chat_id ?? "");
                      setErrorMessage("");
                    }}
                    title={t.adminEditTelegram}
                    aria-label={t.adminEditTelegram}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              </div>
              <div className="admin-table-cell admin-table-cell-actions" data-label={t.adminActions}>
                <div className="admin-actions">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() =>
                    updateUser(user.id, {
                      is_admin: !user.is_admin,
                    })
                  }
                  title={user.is_admin ? t.adminRemoveAdmin : t.adminMakeAdmin}
                  aria-label={user.is_admin ? t.adminRemoveAdmin : t.adminMakeAdmin}
                >
                  <i className={`fa-solid ${user.is_admin ? "fa-user-shield" : "fa-user-gear"}`}></i>
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() =>
                    updateUser(user.id, {
                      status: user.status === "active" ? "inactive" : "active",
                    })
                  }
                  title={user.status === "active" ? t.adminDeactivate : t.adminActivate}
                  aria-label={user.status === "active" ? t.adminDeactivate : t.adminActivate}
                >
                  <i className={`fa-solid ${user.status === "active" ? "fa-user-slash" : "fa-user-check"}`}></i>
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => sendInvite(user.id)}
                  title={t.adminInvite}
                  aria-label={t.adminInvite}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
                <button
                  className="icon-button danger"
                  type="button"
                  onClick={() => setConfirmDelete(user)}
                  title={t.adminDeleteUser}
                  aria-label={t.adminDeleteUser}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
        <span>
          {t.adminShowing} {page * pageSize + 1}-
          {Math.min((page + 1) * pageSize, total)} {t.adminOf} {total}
        </span>
        <div className="flex gap-2">
          <button
            className="icon-button pagination-icon"
            type="button"
            title={t.adminPrev}
            aria-label={t.adminPrev}
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            className="icon-button pagination-icon"
            type="button"
            title={t.adminNext}
            aria-label={t.adminNext}
            disabled={(page + 1) * pageSize >= total}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {confirmDelete ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.modalDeleteTitle}</h3>
            <p className="card-description">
              {confirmDelete.display_name || confirmDelete.emails[0]?.email}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setConfirmDelete(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--error)",
                  borderColor: "var(--error)",
                  color: "white",
                }}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={() => {
                  removeUser(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editTelegramUser ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.adminTelegramModalTitle}</h3>
            <p className="card-description text-sm text-slate-600 dark:text-slate-300">
              {editTelegramUser.display_name || editTelegramUser.emails[0]?.email}
            </p>
            <label className="mt-4 grid gap-2">
              <span className="font-medium">{t.adminTelegramId}</span>
              <input
                className="input"
                type="text"
                value={editTelegramValue}
                onChange={(e) => setEditTelegramValue(e.target.value)}
                placeholder="123456789"
              />
            </label>
            {errorMessage ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setEditTelegramUser(null);
                  setEditTelegramValue("");
                  setErrorMessage("");
                }}
              >
                {t.modalCancel}
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={saveTelegramId}
              >
                {t.adminTelegramSave}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
