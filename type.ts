export type EntityType = "location" | "npc" | "faction" | "pc" | "party";

type Id = string;

export interface Relationship {
	value: number;
	note?: string[];
}

export type RelationshipTable = Partial<Record<Id, Relationship>>;

export interface BaseEntity {
	id: Id;
	type: EntityType;
	title: string;
	world: string;
	aliases?: string[];
	tags?: string[];
}

export interface LocationEntity extends BaseEntity {
	type: "location";
	parent?: string | null;
	tier: number;
	coords?: { x: number | null; y: number | null; map: string | null };
	children?: string[];
}

export interface NPCEntity extends BaseEntity {
	type: "npc";
	locaiton_id?: string | null;
	faction_id?: string[];
}

export interface FactionEntity extends BaseEntity {
	type: "faction";
	location_id?: string | null;
}

export interface PCEntity extends BaseEntity {
	type: "pc";
	player_name?: string | null;
	party_id?: Id | null;
	coords?: { x: number | null; y: number | null; map: string | null }; // only should be used if not with party
	relationship_npc?: RelationshipTable;
	relationship_faction?: RelationshipTable;
}

export interface PartyEntity extends BaseEntity {
	type: "party";
	player_id?: Id[];
	coords?: { x: number | null; y: number | null; map: string | null };
	relationship_faction?: RelationshipTable;
}
