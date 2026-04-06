"use client";
import { useState, useEffect } from "react";
import GameForm from "@/components/GameForm";
import MovieForm from "@/components/MovieForm";
import ShowForm from "@/components/ShowForm";
import { getItems, deleteItem } from "@/actions/item";
import { getPlatforms } from "@/actions/platform";
import { getFormats } from "@/actions/format";
import { CollectionItem, GameItem, MovieItem, ShowItem, Platform, Format } from "@/types/item";
import styles from "@/styles/page.module.css";

type FormMode =
  | null
  | { type: "selectType" }
  | { type: "create"; itemType: "game" | "movie" | "show" }
  | { type: "edit"; item: CollectionItem };

export default function Home() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [formMode, setFormMode] = useState<FormMode>(null);

  async function loadData() {
    const [itemData, platformData, formatData] = await Promise.all([
      getItems(),
      getPlatforms(),
      getFormats(),
    ]);
    setItems(itemData);
    setPlatforms(platformData);
    setFormats(formatData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    await deleteItem(id);
    await loadData();
  }

  const onComplete = () => { setFormMode(null); loadData(); };

  function renderForm() {
    if (formMode === null) return null;

    if (formMode.type === "selectType") {
      return (
        <div className={styles.typeSelectRow}>
          <span className={styles.typeSelectLabel}>Add:</span>
          <button className={styles.typeButton} onClick={() => setFormMode({ type: "create", itemType: "game" })}>Game</button>
          <button className={styles.typeButton} onClick={() => setFormMode({ type: "create", itemType: "movie" })}>Movie</button>
          <button className={styles.typeButton} onClick={() => setFormMode({ type: "create", itemType: "show" })}>Show</button>
          <button className={styles.cancelLink} onClick={() => setFormMode(null)}>Cancel</button>
        </div>
      );
    }

    if (formMode.type === "create") {
      if (formMode.itemType === "game") return <GameForm platforms={platforms} onComplete={onComplete} />;
      if (formMode.itemType === "movie") return <MovieForm formats={formats} onComplete={onComplete} />;
      if (formMode.itemType === "show") return <ShowForm formats={formats} onComplete={onComplete} />;
    }

    if (formMode.type === "edit") {
      const item = formMode.item;
      if (item.type === "game") return <GameForm item={item as GameItem} platforms={platforms} onComplete={onComplete} />;
      if (item.type === "movie") return <MovieForm item={item as MovieItem} formats={formats} onComplete={onComplete} />;
      if (item.type === "show") return <ShowForm item={item as ShowItem} formats={formats} onComplete={onComplete} />;
    }
  }

  function renderItemDetails(item: CollectionItem) {
    if (item.type === "game") return item.platform_name;
    if (item.type === "movie") return item.format_name;
    if (item.type === "show") {
      return item.seasons_owned > 0
        ? `${item.format_name} — ${item.seasons_owned} seasons`
        : item.format_name;
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Caseshelf</h1>
        </div>
      </header>

      <main className={styles.main}>
        {formMode !== null && (
          <div className={styles.formCard}>
            {renderForm()}
            {formMode.type !== "selectType" && (
              <button className={styles.cancelLink} onClick={() => setFormMode(null)}>Cancel</button>
            )}
          </div>
        )}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.itemCount}>{items.length} items</span>
            {formMode === null && (
              <button className={styles.addButton} onClick={() => setFormMode({ type: "selectType" })}>
                + Add Item
              </button>
            )}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Details</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No items yet — add one above</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.cellBold}>{item.title}</td>
                    <td className={`${styles.cellMuted} ${styles.cellCapitalize}`}>{item.type}</td>
                    <td className={styles.cellMuted}>{renderItemDetails(item)}</td>
                    <td>
                      <span className={item.owned ? styles.badgeOwned : styles.badgeWanted}>
                        {item.owned ? "Owned" : "Wanted"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.iconButton} onClick={() => setFormMode({ type: "edit", item })}>
                          Edit
                        </button>
                        <button className={`${styles.iconButton} ${styles.iconButtonDanger}`} onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}