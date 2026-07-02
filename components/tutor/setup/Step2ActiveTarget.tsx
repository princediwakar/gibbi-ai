// Path: components/tutor/setup/Step2ActiveTarget.tsx

import { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TUTOR_CONFIG } from "@/lib/constants/tutor";

interface DomainGroup {
  subject: string;
  domains: string[];
}

interface Step2ActiveTargetProps {
  activeTargets: string[];
  allDomainGroups: DomainGroup[];
  maxTargetsReached: boolean;
  onToggleDomain: (domain: string) => void;
  onRemoveDomain: (domain: string) => void;
}

export function Step2ActiveTarget({
  activeTargets,
  allDomainGroups,
  maxTargetsReached,
  onToggleDomain,
  onRemoveDomain,
}: Step2ActiveTargetProps) {
  const [domainSearch, setDomainSearch] = useState("");

  const filteredDomainGroups = useMemo(() => {
    const q = domainSearch.trim().toLowerCase();
    if (!q) return allDomainGroups;
    return allDomainGroups
      .map((group) => ({
        ...group,
        domains: group.subject.toLowerCase().includes(q)
          ? group.domains
          : group.domains.filter((d) => d.toLowerCase().includes(q)),
      }))
      .filter((group) => group.domains.length > 0);
  }, [allDomainGroups, domainSearch]);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div>
          <Label className="text-sm font-medium">
            What are you studying this week?
          </Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select 1–{TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS} topics you are actively working on.
            This helps us focus your practice on what matters most right now.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search topics..."
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {domainSearch && (
            <button
              type="button"
              onClick={() => setDomainSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Selected chips */}
        {activeTargets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeTargets.map((domain) => (
              <Badge
                key={domain}
                variant="secondary"
                className="gap-1 pr-1 cursor-default"
              >
                {domain}
                <button
                  type="button"
                  onClick={() => onRemoveDomain(domain)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`Remove ${domain}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Domain list grouped by subject */}
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {filteredDomainGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No topics match your search.
              </p>
            ) : (
              filteredDomainGroups.map((group, groupIdx) => (
                <div key={group.subject}>
                  {groupIdx > 0 && (
                    <div className="mx-4 border-t border-border/20" />
                  )}
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 sticky top-0">
                    {group.subject}
                  </div>
                  {group.domains.map((domain) => {
                    const isSelected = activeTargets.includes(domain);
                    const isDisabled = !isSelected && maxTargetsReached;

                    return (
                      <button
                        key={domain}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onToggleDomain(domain)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          "border-b border-border/30 last:border-b-0",
                          "hover:bg-muted/50",
                          isSelected &&
                            "bg-primary/5 hover:bg-primary/10",
                          isDisabled &&
                            "opacity-40 cursor-not-allowed hover:bg-transparent",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span
                          className={cn(
                            "text-left",
                            isSelected && "font-medium text-foreground",
                          )}
                        >
                          {domain}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selection count hint */}
        <p className="text-sm text-muted-foreground text-center">
          {activeTargets.length === 0
            ? "Select at least 1 topic to continue."
            : `${activeTargets.length} of ${TUTOR_CONFIG.ACTIVE_TARGET_MAX_TOPICS} topics selected.`}
        </p>
      </CardContent>
    </Card>
  );
}
