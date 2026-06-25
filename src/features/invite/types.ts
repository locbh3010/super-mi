import { Tables } from "@/types/database";

export enum InviteStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	DECLINED = "declined",
	CANCELLED = "cancelled",
}

export type Invite = Omit<Tables<"invitees">, "status"> & {
	status: InviteStatus;
};
