"use client"

import type { InquiryMessage, InquiryStatus } from "@/types"
import MessageThread from "@/components/common/MessageThread"
import MessageComposer from "@/components/common/MessageComposer"
import { Caption } from "@/components/ui/typography"

interface Props {
  messages: InquiryMessage[]
  currentUserId: string
  senderNames: Record<string, string>
  inquiryId: string
  inquiryStatus: InquiryStatus
}

export default function CroInquiryThread({
  messages,
  currentUserId,
  senderNames,
  inquiryId,
  inquiryStatus,
}: Props) {
  const disabledReason =
    inquiryStatus === "open"
      ? "Waiting for the clinic to accept or decline."
      : inquiryStatus === "closed"
      ? "This inquiry was declined."
      : undefined

  return (
    <div className="space-y-4 rounded-2xl border border-primary p-4">
      <Caption className="font-semibold uppercase text-secondary">Messages</Caption>
      <MessageThread
        messages={messages}
        currentUserId={currentUserId}
        senderNames={senderNames}
      />
      <MessageComposer
        inquiryId={inquiryId}
        disabled={inquiryStatus !== "in_progress"}
        disabledReason={disabledReason}
      />
    </div>
  )
}
