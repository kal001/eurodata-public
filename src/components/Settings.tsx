import { useCallback, useEffect, useState } from "react";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

type Translations = {
  settingsTitle: string;
  settingsCategories: string;
  settingsTags: string;
  settingsAddCategory: string;
  settingsAddTag: string;
  settingsCategoryName: string;
  settingsTagName: string;
  settingsExport: string;
  settingsImport: string;
  settingsExportImport: string;
  settingsExportSuccess: string;
  settingsImportSuccess: string;
  settingsImportError: string;
  settingsImportFileInvalid: string;
  modalCancel: string;
  modalConfirm: string;
  settingsDeleteCategoryTitle: string;
  settingsDeleteTagTitle: string;
  profileSaved: string;
  profileSaveError: string;
};

type Props = {
  token: string;
  apiBase: string;
  t: Translations;
};

export default function Settings({ token, apiBase, t }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editTagValue, setEditTagValue] = useState("");
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<Category | null>(null);
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<Tag | null>(null);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadCategories = useCallback(async () => {
    const response = await fetch(`${apiBase}/api/categories`, { headers });
    if (response.ok) setCategories(await response.json());
  }, [apiBase, token]);

  const loadTags = useCallback(async () => {
    const response = await fetch(`${apiBase}/api/tags`, { headers });
    if (response.ok) setTags(await response.json());
  }, [apiBase, token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!confirmDeleteCategory && !confirmDeleteTag) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmDeleteCategory(null);
        setConfirmDeleteTag(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmDeleteCategory, confirmDeleteTag]);

  const createCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const response = await fetch(`${apiBase}/api/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setNewCategoryName("");
      await loadCategories();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      setToast({ text: data.detail?.toString() || t.profileSaveError, type: "error" });
    }
  };

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const response = await fetch(`${apiBase}/api/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setNewTagName("");
      await loadTags();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      setToast({ text: data.detail?.toString() || t.profileSaveError, type: "error" });
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    const name = editCategoryValue.trim();
    if (!name) return;
    const response = await fetch(`${apiBase}/api/categories/${editingCategory.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setEditingCategory(null);
      setEditCategoryValue("");
      await loadCategories();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      setToast({ text: data.detail?.toString() || t.profileSaveError, type: "error" });
    }
  };

  const updateTag = async () => {
    if (!editingTag) return;
    const name = editTagValue.trim();
    if (!name) return;
    const response = await fetch(`${apiBase}/api/tags/${editingTag.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      setEditingTag(null);
      setEditTagValue("");
      await loadTags();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      setToast({ text: data.detail?.toString() || t.profileSaveError, type: "error" });
    }
  };

  const deleteCategory = async (id: number) => {
    const response = await fetch(`${apiBase}/api/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    if (response.ok) {
      await loadCategories();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const deleteTag = async (id: number) => {
    const response = await fetch(`${apiBase}/api/tags/${id}`, {
      method: "DELETE",
      headers,
    });
    if (response.ok) {
      await loadTags();
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const handleExport = () => {
    const data = {
      categories: categories.map((c) => ({ name: c.name })),
      tags: tags.map((t) => ({ name: t.name })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personalfinance-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast({ text: t.settingsExportSuccess, type: "success" });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as {
        categories?: { name: string }[];
        tags?: { name: string }[];
      };
      const catList = Array.isArray(data.categories) ? data.categories : [];
      const tagList = Array.isArray(data.tags) ? data.tags : [];
      if (catList.length === 0 && tagList.length === 0) {
        setToast({ text: t.settingsImportFileInvalid, type: "error" });
        return;
      }
      let created = 0;
      let skipped = 0;
      for (const item of catList) {
        const name = (item?.name ?? "").toString().trim();
        if (!name) continue;
        const res = await fetch(`${apiBase}/api/categories`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name }),
        });
        if (res.ok) created++;
        else if (res.status === 409) skipped++;
      }
      for (const item of tagList) {
        const name = (item?.name ?? "").toString().trim();
        if (!name) continue;
        const res = await fetch(`${apiBase}/api/tags`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name }),
        });
        if (res.ok) created++;
        else if (res.status === 409) skipped++;
      }
      await loadCategories();
      await loadTags();
      setToast({
        text: t.settingsImportSuccess.replace("{created}", String(created)).replace("{skipped}", String(skipped)),
        type: "success",
      });
    } catch {
      setToast({ text: t.settingsImportError, type: "error" });
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="card">
        <h2 className="card-title">{t.settingsTitle}</h2>
        {toast ? (
          <div className={`mb-4 rounded-lg p-3 text-sm ${toast.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
            {toast.text}
          </div>
        ) : null}

        <h3 className="mt-6 text-lg font-semibold text-slate-700 dark:text-slate-200">
          {t.settingsExportImport}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={handleExport}>
            <i className="fa-solid fa-download mr-1.5"></i>
            {t.settingsExport}
          </button>
          <label className="btn-secondary btn-sm cursor-pointer">
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImport}
            />
            <i className="fa-solid fa-upload mr-1.5"></i>
            {t.settingsImport}
          </label>
        </div>

        <h3 className="mt-8 text-lg font-semibold text-slate-700 dark:text-slate-200">
          {t.settingsCategories}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            className="input max-w-[200px]"
            placeholder={t.settingsCategoryName}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
          />
          <button
            type="button"
            className="p-2 rounded-md border transition-colors"
            style={{
              background: "var(--surface-hover)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            title={t.settingsAddCategory}
            aria-label={t.settingsAddCategory}
            onClick={createCategory}
          >
            <i className="fa-solid fa-plus" />
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
            >
              {editingCategory?.id === c.id ? (
                <>
                  <input
                    className="input flex-1"
                    value={editCategoryValue}
                    onChange={(e) => setEditCategoryValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                  />
                  <button type="button" className="icon-button" onClick={updateCategory} title={t.modalConfirm}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setEditingCategory(null);
                      setEditCategoryValue("");
                    }}
                    title={t.modalCancel}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium">{c.name}</span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className="icon-button text-sm"
                      onClick={() => {
                        setEditingCategory(c);
                        setEditCategoryValue(c.name);
                      }}
                      title={t.modalConfirm}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-button text-sm danger"
                      onClick={() => setConfirmDeleteCategory(c)}
                      title={t.modalConfirm}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-lg font-semibold text-slate-700 dark:text-slate-200">
          {t.settingsTags}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            className="input max-w-[200px]"
            placeholder={t.settingsTagName}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTag()}
          />
          <button
            type="button"
            className="p-2 rounded-md border transition-colors"
            style={{
              background: "var(--surface-hover)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            title={t.settingsAddTag}
            aria-label={t.settingsAddTag}
            onClick={createTag}
          >
            <i className="fa-solid fa-plus" />
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2 dark:border-slate-700"
            >
              {editingTag?.id === tag.id ? (
                <>
                  <input
                    className="input flex-1"
                    value={editTagValue}
                    onChange={(e) => setEditTagValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && updateTag()}
                  />
                  <button type="button" className="icon-button" onClick={updateTag} title={t.modalConfirm}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setEditingTag(null);
                      setEditTagValue("");
                    }}
                    title={t.modalCancel}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium">{tag.name}</span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className="icon-button text-sm"
                      onClick={() => {
                        setEditingTag(tag);
                        setEditTagValue(tag.name);
                      }}
                      title={t.modalConfirm}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-button text-sm danger"
                      onClick={() => setConfirmDeleteTag(tag)}
                      title={t.modalConfirm}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {confirmDeleteCategory ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.settingsDeleteCategoryTitle}</h3>
            <p className="card-description">{confirmDeleteCategory.name}</p>
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
                onClick={() => setConfirmDeleteCategory(null)}
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
                  deleteCategory(confirmDeleteCategory.id);
                  setConfirmDeleteCategory(null);
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDeleteTag ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.settingsDeleteTagTitle}</h3>
            <p className="card-description">{confirmDeleteTag.name}</p>
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
                onClick={() => setConfirmDeleteTag(null)}
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
                  deleteTag(confirmDeleteTag.id);
                  setConfirmDeleteTag(null);
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
