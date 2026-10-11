"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Home, Pencil, Trash2 } from "lucide-react";
import AdminPageShell from "@/modules/admin-shell/components/AdminPageShell";
import AdminCard from "@/modules/admin-shell/components/AdminCard";
import AdminAsyncState from "@/modules/admin-shell/components/AdminAsyncState";
import ConfirmModal from "@/modules/admin-shell/components/ConfirmModal";
import FormModal, { type FormFieldDef } from "@/modules/admin-shell/components/FormModal";
import Skeleton from "@/modules/admin-shell/components/Skeleton";
import Toggle from "@/modules/admin-shell/components/Toggle";
import { blackPillButton, dangerIconButtonStyle, iconButtonStyle, softPillButton, whitePillButton } from "@/modules/admin-shell/style-helpers";
import { useAdminFaqs, useDeleteFaq, useDeleteFaqGroup, useReorderFaqGroups, useReorderFaqs, useSaveFaq, useSaveFaqGroup } from "../hooks/useAdminFaqs";
import { FAQ_LIMITS as L, FAQ_PLACEHOLDERS, fillFaqAnswer } from "../constants";
import { useStoreContact } from "@/modules/storefront-shell/hooks/useStoreContact";
import type { AdminFaqGroup, FaqItem, SaveFaqPayload } from "../types/faq.type";

/** Labelled on/off switch - a real button, so it works from the keyboard and reads as a switch. */
function Switch({ label, on, onToggle, disabled }: { label: string; on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-[#555] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Toggle on={on} onClick={() => undefined} />
      {label}
    </button>
  );
}

function MoveButtons({ index, count, label, onMove, disabled }: { index: number; count: number; label: string; onMove: (step: -1 | 1) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-none gap-1.5">
      <button type="button" aria-label={`Move ${label} up`} title="Move up" style={iconButtonStyle} disabled={disabled || index === 0} className="disabled:opacity-40" onClick={() => onMove(-1)}>
        <ArrowUp size={14} />
      </button>
      <button
        type="button"
        aria-label={`Move ${label} down`}
        title="Move down"
        style={iconButtonStyle}
        disabled={disabled || index === count - 1}
        className="disabled:opacity-40"
        onClick={() => onMove(1)}
      >
        <ArrowDown size={14} />
      </button>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <AdminCard key={i} padding="22px">
          <Skeleton className="mb-4 h-5 w-48" />
          {[0, 1, 2].map((j) => (
            <Skeleton key={j} className="mb-2.5 h-14 w-full" />
          ))}
        </AdminCard>
      ))}
    </div>
  );
}

const swap = <T,>(list: T[], i: number, step: -1 | 1) => {
  const next = [...list];
  [next[i + step], next[i]] = [next[i]!, next[i + step]!];
  return next;
};

const payloadOf = (f: FaqItem): SaveFaqPayload => ({ question: f.question, answer: f.answer, groupId: f.groupId, isActive: f.isActive, showOnHome: f.showOnHome });

type GroupModal = { group: AdminFaqGroup | null };
type FaqModal = { faq: FaqItem | null; groupId: string };
type DeleteTarget = { kind: "group"; group: AdminFaqGroup } | { kind: "faq"; faq: FaqItem };

/**
 * Admin FAQ page: groups (the headings on the FAQ page) as cards, each with
 * its questions in order. Everything is reordered with the arrows; switches
 * hide a question or put it on the home page.
 */
export default function FaqPageContent() {
  const { data, isLoading, isError, refetch } = useAdminFaqs();
  const groups = useMemo(() => data?.data ?? [], [data]);
  const saveGroup = useSaveFaqGroup();
  const deleteGroup = useDeleteFaqGroup();
  const saveFaq = useSaveFaq();
  const deleteFaq = useDeleteFaq();
  const reorderGroups = useReorderFaqGroups();
  const reorderFaqs = useReorderFaqs();
  const store = useStoreContact();

  const [search, setSearch] = useState("");
  const [groupModal, setGroupModal] = useState<GroupModal | null>(null);
  const [faqModal, setFaqModal] = useState<FaqModal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const homeCount = groups.reduce((n, g) => n + g.faqs.filter((f) => f.isActive && f.showOnHome).length, 0);
  const term = search.trim().toLowerCase();
  const searching = term.length > 0;
  const visibleGroups = searching
    ? groups
        .map((g) => ({ ...g, faqs: g.faqs.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(term)) }))
        .filter((g) => g.faqs.length > 0)
    : groups;

  const toggleFaq = (f: FaqItem, change: Partial<Pick<FaqItem, "isActive" | "showOnHome">>) => {
    const next = { ...payloadOf(f), ...change };
    if (next.showOnHome && next.isActive && !(f.showOnHome && f.isActive) && homeCount >= L.homeMax) {
      toast.error(`Only ${L.homeMax} questions can show on the home page. Turn one off first.`);
      return;
    }
    saveFaq.mutate({ id: f.id, data: next, silent: true });
  };

  const groupFields: FormFieldDef[] = [
    { key: "name", label: "Group name", type: "text", required: true, maxLength: L.groupName, allowSpecialChars: true, placeholder: "e.g. Orders & Delivery", hint: "The heading this group's questions sit under on the FAQ page." },
  ];

  const faqFields: FormFieldDef[] = [
    { key: "groupId", label: "Group", type: "select", required: true, options: groups.map((g) => ({ label: g.isActive ? g.name : `${g.name} (hidden)`, value: g.id })), placeholder: "Choose a group" },
    { key: "question", label: "Question", type: "text", required: true, maxLength: L.question, allowSpecialChars: true, placeholder: "e.g. How long does delivery take?" },
    {
      key: "answer",
      label: "Answer",
      type: "area",
      rows: 5,
      required: true,
      maxLength: L.answer,
      allowSpecialChars: true,
      placeholder: "Answer in one to three short sentences.",
      hint: `Tip: ${FAQ_PLACEHOLDERS.map((p) => `${p.token} = ${p.meaning}`).join(" · ")}. These fill in from Business Settings automatically.`,
    },
  ];

  return (
    <AdminPageShell title="FAQ" subtitle="Questions for the FAQ page and the home page" search={search} onSearchChange={setSearch} searchPlaceholder="Search questions or answers">
      <AdminAsyncState isLoading={isLoading} isError={isError} onRetry={refetch} skeleton={<PageSkeleton />} errorTitle="FAQs unavailable">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12px] text-[#555]">
            <Home size={13} />
            {homeCount > 0 ? (
              <span>
                Home page shows <b>{homeCount}</b> of {L.homeMax} picked questions
              </span>
            ) : (
              <span>No questions picked - the home page shows the first 5.</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" style={whitePillButton} onClick={() => setGroupModal({ group: null })}>
              + Add group
            </button>
            <button
              type="button"
              style={{ ...blackPillButton, opacity: groups.length ? 1 : 0.5 }}
              disabled={!groups.length}
              title={groups.length ? undefined : "Add a group first"}
              onClick={() => setFaqModal({ faq: null, groupId: groups[0]?.id ?? "" })}
            >
              + Add question
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <AdminCard padding="40px 22px">
            <div className="text-center text-[13px] text-[#8a8a8e]">No groups yet. Add a group (for example &quot;Orders &amp; Delivery&quot;), then add its questions.</div>
          </AdminCard>
        ) : visibleGroups.length === 0 ? (
          <AdminCard padding="40px 22px">
            <div className="text-center text-[13px] text-[#8a8a8e]">No questions match &quot;{search.trim()}&quot;.</div>
          </AdminCard>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleGroups.map((group) => {
              const gi = groups.findIndex((g) => g.id === group.id);
              const full = groups[gi]!;
              return (
                <AdminCard key={group.id} padding="18px">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <MoveButtons index={gi} count={groups.length} label={`group ${full.name}`} disabled={searching} onMove={(step) => reorderGroups.mutate(swap(groups, gi, step).map((g) => g.id))} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-bold">{full.name}</span>
                          {!full.isActive && <span className="flex-none rounded-full bg-[#eeeeec] px-2 py-0.5 text-[10.5px] font-semibold text-[#666]">Hidden</span>}
                        </div>
                        <div className="text-[11.5px] text-[#8a8a8e]">
                          {full.faqs.length} {full.faqs.length === 1 ? "question" : "questions"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Switch label="Visible" on={full.isActive} onToggle={() => saveGroup.mutate({ id: full.id, data: { name: full.name, isActive: !full.isActive } })} />
                      <button type="button" style={softPillButton} onClick={() => setFaqModal({ faq: null, groupId: full.id })}>
                        + Question
                      </button>
                      <button type="button" style={iconButtonStyle} title="Rename" aria-label={`Rename ${full.name}`} onClick={() => setGroupModal({ group: full })}>
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        style={dangerIconButtonStyle}
                        title={full.faqs.length ? "Move or delete its questions first" : "Delete group"}
                        aria-label={`Delete ${full.name}`}
                        disabled={full.faqs.length > 0}
                        className="disabled:opacity-40"
                        onClick={() => setDeleteTarget({ kind: "group", group: full })}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {group.faqs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dcdcd8] px-4 py-5 text-center text-[12px] text-[#8a8a8e]">
                      No questions in this group yet{full.isActive ? " - it stays hidden on the FAQ page until it has one." : "."}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {group.faqs.map((f) => {
                        const fi = full.faqs.findIndex((x) => x.id === f.id);
                        return (
                          <div key={f.id} className={`flex flex-col gap-3 rounded-xl border border-[#ececea] p-3 om:flex-row om:items-center ${f.isActive ? "" : "bg-[#fafaf8]"}`}>
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                              <MoveButtons
                                index={fi}
                                count={full.faqs.length}
                                label="question"
                                disabled={searching}
                                onMove={(step) => reorderFaqs.mutate({ groupId: full.id, ids: swap(full.faqs, fi, step).map((x) => x.id) })}
                              />
                              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setFaqModal({ faq: f, groupId: f.groupId })}>
                                <div className={`text-[13px] font-semibold leading-snug ${f.isActive ? "" : "text-[#8a8a8e]"}`}>{f.question}</div>
                                {/* Preview as customers read it - placeholders filled from Business Settings. */}
                                <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#8a8a8e]">{fillFaqAnswer(f.answer, store)}</div>
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f0ee] pt-2.5 om:flex-none om:justify-end om:border-0 om:pt-0">
                              <div className="flex items-center gap-4">
                                <Switch label="Home" on={f.showOnHome} disabled={!f.isActive} onToggle={() => toggleFaq(f, { showOnHome: !f.showOnHome })} />
                                <Switch label="Visible" on={f.isActive} onToggle={() => toggleFaq(f, { isActive: !f.isActive })} />
                              </div>
                              <div className="flex gap-1.5">
                                <button type="button" style={iconButtonStyle} title="Edit" aria-label="Edit question" onClick={() => setFaqModal({ faq: f, groupId: f.groupId })}>
                                  <Pencil size={14} />
                                </button>
                                <button type="button" style={dangerIconButtonStyle} title="Delete" aria-label="Delete question" onClick={() => setDeleteTarget({ kind: "faq", faq: f })}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AdminCard>
              );
            })}
          </div>
        )}
      </AdminAsyncState>

      {groupModal && (
        <FormModal
          title={groupModal.group ? "Rename group" : "Add group"}
          fields={groupFields}
          initialValues={{ name: groupModal.group?.name ?? "" }}
          saveLabel={groupModal.group ? "Save" : "Add group"}
          onSave={async (v) => {
            await saveGroup.mutateAsync({ id: groupModal.group?.id ?? null, data: { name: String(v.name).trim(), isActive: groupModal.group?.isActive ?? true } });
            setGroupModal(null);
          }}
          onClose={() => setGroupModal(null)}
        />
      )}

      {faqModal && (
        <FormModal
          title={faqModal.faq ? "Edit question" : "Add question"}
          fields={faqFields}
          initialValues={{ groupId: faqModal.groupId, question: faqModal.faq?.question ?? "", answer: faqModal.faq?.answer ?? "" }}
          saveLabel={faqModal.faq ? "Save" : "Add question"}
          onSave={async (v) => {
            await saveFaq.mutateAsync({
              id: faqModal.faq?.id ?? null,
              data: {
                groupId: String(v.groupId),
                question: String(v.question).trim(),
                answer: String(v.answer).trim(),
                isActive: faqModal.faq?.isActive ?? true,
                showOnHome: faqModal.faq?.showOnHome ?? false,
              },
            });
            setFaqModal(null);
          }}
          onClose={() => setFaqModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title={deleteTarget.kind === "group" ? "Delete group?" : "Delete question?"}
          message={
            deleteTarget.kind === "group"
              ? `"${deleteTarget.group.name}" will be removed. It has no questions, so nothing else changes.`
              : `"${deleteTarget.faq.question}" will be removed from the FAQ page${deleteTarget.faq.showOnHome ? " and the home page" : ""}. To hide it for now instead, turn off Visible.`
          }
          confirmLabel="Delete"
          tone="danger"
          onConfirm={async () => {
            if (deleteTarget.kind === "group") await deleteGroup.mutateAsync(deleteTarget.group.id);
            else await deleteFaq.mutateAsync(deleteTarget.faq.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AdminPageShell>
  );
}
