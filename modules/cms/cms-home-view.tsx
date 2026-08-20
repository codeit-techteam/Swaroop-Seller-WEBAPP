"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import { OperationsShell } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CmsPreviewFrame } from "@/modules/cms/cms-preview-frame";
import { useCmsStore } from "@/store/cmsStore";
import { CMS_SECTION_LABELS } from "@/types/marketplace-cms";

export function CmsHomeView() {
  const homepage = useCmsStore((s) => s.homepage);
  const previewDevice = useCmsStore((s) => s.previewDevice);
  const setPreviewDevice = useCmsStore((s) => s.setPreviewDevice);
  const setSectionEnabled = useCmsStore((s) => s.setSectionEnabled);
  const reorderSections = useCmsStore((s) => s.reorderSections);
  const setHomepageStatus = useCmsStore((s) => s.setHomepageStatus);
  const [pending, setPending] = useState<"LIVE" | "PAUSED" | "DRAFT" | null>(
    null,
  );
  const sections = [...homepage.sections].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const move = async (id: string, direction: -1 | 1) => {
    const ids = sections.map((row) => row.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const current = copy[index];
    const swap = copy[next];
    if (!current || !swap) return;
    copy[index] = swap;
    copy[next] = current;
    await reorderSections(copy);
  };

  return (
    <OperationsShell
      title="Customer homepage CMS"
      subtitle="Control what Customer WEB and Customer APP render on Home. Publish only after preview."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void setHomepageStatus("DRAFT")}
          >
            Save draft
          </Button>
          <Button
            variant="outline"
            onClick={() => void setHomepageStatus("PREVIEW")}
          >
            Preview
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => setPending("LIVE")}
          >
            Publish
          </Button>
          <Button variant="outline" onClick={() => setPending("PAUSED")}>
            Unpublish
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => void move(section.id, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => void move(section.id, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {CMS_SECTION_LABELS[section.type]}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {section.config.insight ||
                    section.config.cta ||
                    section.title}
                </p>
              </div>
              <Switch
                checked={section.enabled}
                onCheckedChange={(checked) =>
                  void setSectionEnabled(section.id, checked)
                }
              />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Tabs
            value={previewDevice}
            onValueChange={(value) =>
              setPreviewDevice(value as "DESKTOP" | "MOBILE")
            }
          >
            <TabsList>
              <TabsTrigger value="DESKTOP">Desktop WEB</TabsTrigger>
              <TabsTrigger value="MOBILE">Mobile APP</TabsTrigger>
            </TabsList>
          </Tabs>
          <CmsPreviewFrame />
        </div>
      </div>
      <ConfirmActionDialog
        open={Boolean(pending)}
        title={
          pending === "LIVE"
            ? "Publish homepage to customers?"
            : "Change homepage status?"
        }
        description="Customer APP and WEB will read the published snapshot from the marketplace API."
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await setHomepageStatus(pending);
          toast.success(
            pending === "LIVE"
              ? "Homepage published"
              : "Homepage status updated",
          );
          setPending(null);
        }}
      />
    </OperationsShell>
  );
}
